import request from 'settings/axios/index.js';
import vueRouter from 'settings/vue-router/index.js';
import appStore from 'settings/pinia/store/app.js';
import apiStore from 'settings/pinia/store/api.js';
import {isDef, isObject} from 'main/utilities.js';

export const logoutErrors = new Set(['AUTHORIZATION_IS_REQUIRED', 'AUTHORIZATION_UNDEFINED', 'AUTHORIZATION_IS_EXPIRED']);

export function init() {
    const app = appStore();
    const api = apiStore();

    request.defaults.baseURL = api.baseURL;
    
    /**
     * @description Antes de cada solicitud
     * 
     * @return {undefined}
     */
    request.interceptors.request.use(
        async function(config) {
            /*Encabezados*/
            // Inicializar
            if (!isObject(config.headers)) {
                config.headers = {};
            }
            
            // Authorización
            if(app.hasSessionToken() && !isDef(config.headers.Authorization)) {
                config.headers.Authorization = app.getSessionToken();
            }

            /*Otras configuraciones*/
            // Mostrar mensaje
            if (!isDef(config.showMessage)) {
                config.showMessage = true;
            }
            
            return config;
        }
    );
    
    /**
     * @description Despues de cada solicitud
     * 
     * @return {undefined}
     */
    request.interceptors.response.use(
        // En caso de exito
        function(response) {
            if (response.config.showMessage && typeof response?.data?.messages?.success == 'string') {
                app.setSnackbar({text: response.data.messages.success, template: '<success>'});
            }
    
            return response;
        },
        // En caso de error
        function(error) {
            if (error.response?.data) {
                // Error: mensaje
                if(error.config.showMessage && typeof error.response.data.messages?.error == 'string') {
                    app.setSnackbar({text: error.response.data.messages.error, icon: {name: 'mdi-cloud-alert'}, template: '<error>'});
                }
    
                // Error: Acción
                if (logoutErrors.has(error.response.data.error)) {
                    app.reset();
                    setTimeout(() => {
                        vueRouter.push({name: 'login'});
                    }, 2500);
                }
            }
            
            return Promise.reject(error);
        }
    );
}

export default {init};