import vueRouter from 'settings/vue-router/index.js';
import appStore from 'settings/pinia/store/app.js';
import {isDef} from 'main/utilities.js';

export function init() {
    const app = appStore();
    
    /**
     * @description Antes de acceder a la ruta
     * 
     * @return {boolean|object}
     */
    vueRouter.beforeEach(async function (to, from) {
        /* Inicializando */
        if (!app.initialized) {
            // Esperar que la app se monte
            await new Promise((resolve) => {
                let intervalKey = setInterval(() => {
                    if (app.initialized) {
                        resolve();
                        clearInterval(intervalKey);
                    }
                }, 350);
            });
        }
        
        if(!app.hasUser && app.hasSessionToken()) {
            await app.getUserDataFromServer().catch(e => null);
        }

        /*Validación de ruta*/
        // Existencia de la ruta
        if (!to.matched.length) {
            app.setSnackbar({text: 'La ruta a la que intenta acceder no existe.', template: '<warning>' });
            if (from.matched.length) {
                return from;
            }
            else {
                return {name: 'dashboard'};
            }
        }
            
        // Estado de la aplicación
        if (app.status == 'disabled' || app.status == 'loading') {
            app.setSnackbar({text: 'Por favor sea paciente.', template: '<info>'});
            return false;
        }
        
        // Rutas que requieren que no haya una sesión iniciada
        if(isDef(to.meta.requiresLogout) && to.meta.requiresLogout) {
            // Validar que no haya una sesión iniciada
            if (app.hasUser) {
                app.setSnackbar({text: 'Cierra la sesión actual para continuar.', template: '<info>'});
                if (from.matched.length) {
                    return from;
                }
                else {
                    return {name: 'dashboard'};
                }
            }
        }
        // Rutas que necesitan una sesión iniciada
        else if ((!isDef(to.meta.requiresLogin) || to.meta.requiresLogin)) {
            if (!app.hasUser) {
                app.setSnackbar({text: 'Es necesario iniciar sesión para continuar.', timeout: 3000, template: '<warning>'});
                app.reset();
                
                return {name: 'login'};
            }
        }
    
        /*Avanzar*/
        if (to.matched.length && app.status == 'running' && from.name != to.name) {
            app.setStatus('loading'); // Ciclo de carga
        }

        return true;
    });
    
    /**
     * @description Despues de acceder a la ruta
     * 
     * @return {undefined}
     */
    vueRouter.afterEach(async function (to) {
        app.sidebar.render = !isDef(to.meta.renderSidebar) ? true : to.meta.renderSidebar;
        app.bar.render = !isDef(to.meta.renderBar) ? true : to.meta.renderBar;
    });
}

export default {init};