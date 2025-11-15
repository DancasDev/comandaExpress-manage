import {ref,watch} from 'vue';
import {defineStore} from 'pinia';
import request from 'settings/axios/index.js';
import {setStorage,getStorage,hasStorage,removeStorage,isObject} from 'main/utilities.js';

export const ksApiUrlBase = 'api-url-base';
export const ksTenantId = 'api-tenant-id';
export const ksBranchId = 'api-branch-id';


export const apiStore  = defineStore('api', () => {
    /**
     * State
     */
    const urlBase = ref(getStorage('local', ksApiUrlBase) ?? null);
    const tenantId = ref(getStorage('local', ksTenantId) ?? null);
    const branchId = ref(getStorage('local', ksBranchId) ?? null);

    /**
     * Watcheres
     */
    watch(urlBase, (value) => {
        setStorage('local', ksApiUrlBase, value);
        
        console.log(request);
    });
    watch(tenantId, (value) => {
        setStorage('local', ksTenantId, value);
    });
    watch(branchId, (value) => {
        setStorage('local', ksBranchId, value);
    });

    return {
        urlBase,tenantId,branchId
    };
});

export default apiStore;