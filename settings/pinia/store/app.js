import {ref,computed,nextTick} from 'vue';
import {defineStore} from 'pinia';
import request from 'settings/axios/index.js';
import {setStorage,getStorage,hasStorage,removeStorage,isObject} from 'main/utilities.js';

export const ksSessionToken = 'app-session-token';
export const ksSessionExpires = 'app-session-expires';
export const ksUserType = 'app-user-type';
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
    const user = ref({id: null, firstName: null, lastName: null, sex: null,});
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
    
    function getSessionToken() {
        return getStorage('local', ksSessionToken);
    }
    
    function setSessionToken(value) {
        setStorage('local', ksSessionToken, value);
    };
    
    function removeSessionToken() {
        removeStorage('local', ksSessionToken);
    };
    
    function hasSessionToken() {
        return hasStorage('local', ksSessionToken);
    }
    
    function getSessionExpires() {
        return getStorage('local', ksSessionExpires);
    }
    
    function setSessionExpires(value) {
        setStorage('local', ksSessionExpires, value);
    };
    
    function removeSessionExpires() {
        removeStorage('local', ksSessionExpires);
    };

    function hasSessionExpires() {
        return hasStorage('local', ksSessionExpires);
    }

    function getUserType() {
        return getStorage('local', ksUserType);
    }

    function setUserType(value) {
        return setStorage('local', ksUserType, value);
    }

    function removeUserType() {
        removeStorage('local', ksUserType);
    }

    function hasUserType() {
        return hasStorage('local', ksUserType);
    }

    /**
     * @description Obtener datos del usuario
     * 
     * @returns {promise}
     */
    function getUserDataFromServer(params) {
        let userType = (getUserType() === '2') ? 'client' : 'user';
        if (!isObject(params)) {
            params = {
                person: 'true',
                role: 'true',
                permission: 'true'
            };
        }
        
        return request({
            url: '/auth/' + userType,
            method: 'get',
            params
        }).then(r => {
            // Almacenar datos
            if (userType == 'client') {
                alert('todo: Implementa esta monda (almacenamiento de la data del cliente)');
            }
            else {
                if ('person' in r.data.data) {
                    user.value.id = r.data.data.person.user_id;
                    user.value.firstName = r.data.data.person.first_name;
                    user.value.lastName = r.data.data.person.last_name;
                    user.value.sex = r.data.data.person.sex;
                }
            }
            if ('role' in r.data.data) {
                userRoles.value = [...r.data.data.role];
            }
            if ('permission' in r.data.data) {
                setUserPermissions(r.data.data.permission);
            }
        });
    }

    /**
     * @description Cerrar sesión
     * 
     * @return {Promise}
     */
    function logout() {
        let userType = (getUserType() === '2') ? 'client' : 'user';

        return request({
            url: '/auth/' + userType,
            method: 'delete'
        }).then(r => {
            nextTick(() => {
                reset();
            });

            return r;
        });
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
                    module_is_developing: (values[i].module_is_developing == '1'),
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
        removeSessionExpires();
        removeUserType();
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
        setStatus,setTitle,setSnackbar,getSessionToken,setSessionToken,removeSessionToken,hasSessionToken,getSessionExpires,setSessionExpires,removeSessionExpires,hasSessionExpires, getUserType,setUserType,removeUserType,hasUserType,getUserDataFromServer,logout,setUserPermissions,reset
    };
});

export default appStore;