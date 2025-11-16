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

    return {
        baseURL,tenantId,branchId
    };
});

export default apiStore;