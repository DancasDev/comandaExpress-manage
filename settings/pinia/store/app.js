import {ref,computed} from 'vue';
import {defineStore} from 'pinia';
import {setStorage,getStorage,hasStorage,removeStorage,isObject} from 'main/utilities.js';

export const ksSessionToken = 'app-session-token';
export const ksSessionExpires = 'app-session-expires';
export const appStore  = defineStore('app', () => {
    /**
     * State
     */
    const initialized = ref(false);
    const name = ref({
		short: 'ComandaExpress',
		full: 'ComandaExpress.net'
	});
    const status = ref('initializing');
	const statusOptions = ref({
        available: new Set(['initializing', 'running', 'loading', 'disabled']),
        lastChangeAt: new Date(),
        waitingTime: 1000,
        initializationTime: 1500
    });
    const bar = ref({render: false, height: 64});
    const sidebar = ref({render: false, show: false});
    const snackbar = ref({show: false, text: null, timeout: null, icon: {name: null, color: null}, template: null, params: null});
    const user = ref({type: null, id: null, firstName: null, lastName: null, sex: null,});
    const userRoles = ref([]);
    const userPermissions = ref(new Map());
    
    
    /**
     * Getters
     */
    const hasUser = computed(() => Boolean(user.value.id));
    const hasUserPermissions = computed(() => Boolean(userPermissions.value.size));
    const userShortName = computed(() => {
        let response = '',
            firstName = user.value.firstName?.split(' ')[0] ?? '',
            lastName = user.value.lastName?.split(' ')[0] ?? '';
            
        if (firstName.length) {
            response += firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
        }
        
        if (lastName.length) {
            response += ' ' + lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
        }
        
        return response;
    });
    const userNameInitials = computed(() => {
        return (user.value.firstName?.substr(0,1).toUpperCase() ?? '') + (user.value.lastName?.substr(0,1).toUpperCase() ?? '');
    });
    
    /**
     * Actions
     */
    /**
     * @description Cambiar estado de la aplicación
     *
     * @param {string} value - Nuevo estado a aplicar
     *
     * @return {promise} 
     * */
    function setStatus(value) {
        return new Promise((resolve,reject) => {
            let dateCurrent = new Date();
            let saveChange = () => {
                statusOptions.value.lastChangeAt = dateCurrent;
                status.value = value;
                
                resolve(value);
            };
            /* Validación */
            // Nuevo estado este enlistado
            if (!statusOptions.value.available.has(value)) {
                reject(`Invalid application status: "${value}".`);
                return undefined;
            }
            // Estado igual al actual
            else if (value === status.value) {
                resolve(value);
                return undefined;
            }

            /* Cambio de estado */
            let isDirectChange = false;
            // Cargando o Inhabilitado
            if (value == 'loading' || value == 'disabled') {
                isDirectChange = true;
            }
            // Corriendo
            else if (value == 'running') {
                // Estado que requiere tiempo de carga
                if (['loading','initializing'].includes(status.value)) {
                    let difference = (dateCurrent - statusOptions.value.lastChangeAt);
                    if (status.value == 'initializing') {
                        difference = statusOptions.value.initializationTime - difference;
                    }
                    else {
                        difference = statusOptions.value.waitingTime - difference;
                    }
                    
                    // Cumplir ciclo de espera
                    if (difference > 0) {
                        setTimeout(saveChange, difference);
                    }
                    else {
                        isDirectChange = true;
                    }
                }
            }
            
            /* Almacenar cambio */
            if (isDirectChange) {
                saveChange();
            }
        });
    }

    /**
     * @description Cambiar el titulo de la APP (ventana)
     *
     * @param {string|Null} title Nuevo titlo a aplicar
     *
     * @return {string} 
     * */
    function setTitle(value) {
        let result;
        // Establecer titulo
        result = (typeof value === 'string') ? (value + ' | ' +  name.short) : (name.full);
        
        // Ventana
        document.title = result;

        return result;
    }

    /**
     * @description Mostrar notificación
     * 
     * @param {Array} setting Configuración de la notificación
     * 
     * @return {boolean} 
     * */
    function setSnackbar(setting) {
        snackbar.value.show = false;
        // configuración
        if (isObject(setting)) {
            snackbar.value.timeout = setting.timeout ?? 7000;
            snackbar.value.text = setting.text ?? null;
            snackbar.value.icon.name = setting.icon?.name ?? null;
            snackbar.value.icon.color = setting.icon?.color ?? null;
            // Plantillas
            if (typeof setting.template == 'string') {
                if (setting.template == '<success>') {
                    snackbar.value.text =  snackbar.value.text ?? 'éxito';
                    snackbar.value.icon.name =  snackbar.value.icon.name ?? 'mdi-check-circle-outline';
                    snackbar.value.icon.color = 'success';
                    snackbar.value.timeout = setting.timeout ?? 5000;
                }
                else if (setting.template == '<info>') {
                    snackbar.value.text =  snackbar.value.text ?? '';
                    snackbar.value.icon.name =  snackbar.value.icon.name ?? 'mdi-information-outline';
                    snackbar.value.icon.color = 'info';
                    snackbar.value.timeout = setting.timeout ?? 5000;

                }
                else if (setting.template == '<warning>') {
                    snackbar.value.text =  snackbar.value.text ?? '';
                    snackbar.value.icon.name =  snackbar.value.icon.name ?? 'mdi-alert-outline';
                    snackbar.value.icon.color = 'warning';
                    snackbar.value.timeout = setting.timeout ?? 5000;

                }
                else if(setting.template == '<error>') {
                    snackbar.value.text =  snackbar.value.text ?? '';
                    snackbar.value.icon.name =  snackbar.value.icon.name ?? 'mdi-alert-circle-outline';
                    snackbar.value.icon.color = '#F44336';
                    snackbar.value.timeout = setting.timeout ?? 5000;
                }
            }
            // Mostrar
            setTimeout(() => {
                snackbar.value.show = true;
            }, 160);

            return true;
        }
        else {
            return false;
        }
    }

    /**
     * @description Obtener token de la sesión actual
     * 
     * @return {string}
     */
    function getSessionToken() {
        return getStorage('local', ksSessionToken);
    }

    /**
     * @description Establecer token de autorización
     * 
     * @param {string} value - Valor a establecer
     * 
     * @return {undefined}
     */
    function setSessionToken(value) {
        setStorage('local', ksSessionToken, value);
    };

    /**
     * @description Remover token de autorización
     * 
     * @return {undefined}
     */
    function removeSessionToken() {
        removeStorage('local', ksSessionToken);
    };
    
    /**
     * @description Validar existencia del token de autorización
     * 
     * @return {boolean}
     * 
     */
    function hasSessionToken() {
        return hasStorage('local', ksSessionToken);
    }
    
    /**
     * @description Obtener vencimiento de la sesión actual
     * 
     * @return {string}
     */
    function getSessionExpires() {
        return getStorage('local', ksSessionExpires);
    }

    /**
     * @description Establecer vencimiento de autorización
     * 
     * @param {string} value - Valor a establecer
     * 
     * @return {undefined}
     */
    function setSessionExpires(value) {
        setStorage('local', ksSessionExpires, value);
    };

    /**
     * @description Remover vencimiento de autorización
     * 
     * @return {undefined}
     */
    function removeSessionExpires() {
        removeStorage('local', ksSessionExpires);
    };

    /**
     * @description Validar existencia del vencimiento de autorización
     * 
     * @return {boolean}
     * 
     */
    function hasSessionExpires() {
        return hasStorage('local', ksSessionExpires);
    }

    /**
     * @description Obtener datos del usuario
     * 
     * @returns {promise}
     */
    function getUserDataFromServer() {
        return Promise.reject('Undefined callback');
    }

    /**
     * @description Cerrar sesión
     * 
     * @return {Promise}
     */
    function logout() {
        return Promise.reject('Undefined callback');
    }

    /**
     * @description Almacenar accesos del usuario
     * 
     * @param {Object} values - access lista
     * 
     * @return {undefined}
     */
    function setUserPermissions(values) {
        let result = new Map();

        if (isObject(values)) {
            for (let i in values) {
                if (values[i].is_disabled !== '0') {
                    continue;
                }

                result.set(i, {
                    id: values[i].id,
                    module_id: values[i].module_id,
                    level: values[i].level,
                    create: values[i].feature.includes('0'),
                    read: values[i].feature.includes('1'),
                    update: values[i].feature.includes('2'),
                    delete: values[i].feature.includes('3'),
                    trash: values[i].feature.includes('4'),
                    development: values[i].feature.includes('5')
                });                
            }
        }
        
        userPermissions.value = result;
    }

    /**
     * @description Reiniciar valores
     * 
     * @return {boolean}
     */
    function reset() {
        removeSessionToken();
        /* Usuario */
        for(let key in user.value) {
            user.value[key] = null;
        }
        userRoles.value = [];
        userPermissions.value = new Map();
        
        return true;
    }

    return {
        initialized,name,status,statusOptions,bar,sidebar,snackbar,user,userRoles,userPermissions,
        hasUser,hasUserPermissions,userShortName,userNameInitials,
        setStatus,setTitle,setSnackbar,getSessionToken,setSessionToken,removeSessionToken,hasSessionToken,getSessionExpires,setSessionExpires,removeSessionExpires,hasSessionExpires,getUserDataFromServer,logout,setUserPermissions,reset
    };
});

export default appStore;