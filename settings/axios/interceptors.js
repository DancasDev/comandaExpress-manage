import request from 'settings/axios/index.js';
import vueRouter from 'settings/vue-router/index.js';
import appStore from 'settings/pinia/store/app.js';
import apiStore from 'settings/pinia/store/api.js';
import {isDef, isObject} from 'main/utilities.js';

export const logoutErrors = new Set(['AUTHORIZATION_IS_REQUIRED', 'AUTHORIZATION_UNDEFINED', 'AUTHORIZATION_IS_EXPIRED']);

export function rejectTenantIdUndefined(app) {
    app.setSnackbar({text: 'Por favor seleccione una tienda para continuar con la solicitud.', icon: {name: 'mdi-cloud-alert'}, template: '<error>'});
    return Promise.reject('Tenant ID is not defined for the request.');
}

export function rejectBranchIdUndefined(app) {
    app.setSnackbar({text: 'Por favor seleccione una sucursal para continuar con la solicitud.', icon: {name: 'mdi-cloud-alert'}, template: '<error>'});
    return Promise.reject('Branch ID is not defined for the request.');
}

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
            /* URL */
            if (config.url.includes('{{tenant_id}}')) {
                if (!api.tenantId) {
                    return rejectTenantIdUndefined(app);
                }
                config.url = config.url.replace('{{tenant_id}}', api.tenantId);
            }

            if (config.url.includes('{{branch_id}}')) {
                if (!api.branchId) {
                    return rejectBranchIdUndefined(app);
                }
                config.url = config.url.replace('{{branch_id}}', api.branchId);
            }
            
            /*Encabezados*/
            // Inicializar
            if (!isObject(config.headers)) {
                config.headers = {};
            }
            
            // Authorización
            if(app.hasSessionToken() && !isDef(config.headers.Authorization)) {
                config.headers.Authorization = app.getSessionToken();
            }

            // lenguaje
            if (!isDef(config.headers['Accept-Language'])) {
                config.headers['Accept-Language'] = 'es-ES';
            }
            
            /* Data */
            if (isDef(config.data) && isObject(config.data)) {
                if (config.data.hasOwnProperty('{{tenant_id}}')) {
                    if (!api.tenantId) {
                        return rejectTenantIdUndefined();
                    }

                    config.data['tenant_id'] = api.tenantId;
                    delete config.data['{{tenant_id}}'];
                }
                if (config.data.hasOwnProperty('{{branch_id}}')) {
                    if (!api.branchId) {
                        return rejectBranchIdUndefined(app);
                    }
                    
                    config.data['branch_id'] = api.branchId;
                    delete config.data['{{branch_id}}'];
                }
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
            let text = response?.data?.messages?.success ?? response?.data?.messages ?? null;
            if (response.config.showMessage && typeof text == 'string') {
                app.setSnackbar({text, template: '<success>'});
            }
    
            return response;
        },
        // En caso de error
        function(error) {
            if (error.response?.data) {
                // Error: mensaje
                if(typeof error.response.data.messages?.error == 'string') {
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