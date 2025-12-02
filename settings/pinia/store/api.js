import {ref,watch} from 'vue';
import {defineStore} from 'pinia';
import request from 'settings/axios/index.js';
import {setStorage,getStorage,isDef} from 'main/utilities.js';

export const ksApiBaseUrl = 'api-url-base';
export const ksTenantId = 'api-tenant-id';
export const ksBranchId = 'api-branch-id';


export const apiStore  = defineStore('api', () => {
    /**
     * State
     */
    const baseURL = ref(getStorage('local', ksApiBaseUrl) ?? null);
    const tenantId = ref(getStorage('local', ksTenantId) ?? null);
    const branchId = ref(getStorage('local', ksBranchId) ?? null);

    /**
     * Watcheres
     */
    watch(baseURL, (value) => {
        setStorage('local', ksApiBaseUrl, value);

        request.defaults.baseURL = value;
    });
    watch(tenantId, (value) => {
        setStorage('local', ksTenantId, value);
    });
    watch(branchId, (value) => {
        setStorage('local', ksBranchId, value);
    });

    /**
     * Actions
     */
    /**
     * Construir filtro para la api
     * 
     */
    /**
     * @description Construir filtro de consulta
     * 
     * @param {string} field - Campo a consultar
     * @param {string} relationalOperator - Operador relacional
     * @param {string} value - Valor a buscar
     * @param {string} logicalOperator - Operador lógico
     * 
     * @return {array}
     */
    function filterToArray(field, relationalOperator, value, logicalOperator) {
        let response = [];
        let isLike = ['like1','like2','like3'].includes(relationalOperator);
        let isLikeBoth = (relationalOperator == 'like2');
        let isOrd = (logicalOperator?.toLowerCase() == 'or');

        // Campo
        response.push(field);

        // Valor
        response.push(value);
        
        // Operador relacional
        if (isLike) {
            response.push('like');
        }
        else if (isOrd || relationalOperator != '=') {
            response.push(relationalOperator);
        }

        // Operador lógico
        if ((isLike && !isLikeBoth) || isOrd) {
            response.push(isOrd ? 'or' : 'and');
        }

        // formato de like
        if ((isLike && !isLikeBoth)) {
            response.push((relationalOperator == 'like1') ? 'after' : 'before');
        }
        
        return response;
    }

    return {
        baseURL,tenantId,branchId,
        filterToArray
    };
});

export default apiStore;