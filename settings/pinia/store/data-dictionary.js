import { defineStore } from 'pinia';
import { ref, reactive, computed, watch, nextTick } from 'vue';


/* Definir tienda */
export const dataDictionaryStore  = defineStore('dataDictionary', () => {
    /**
     * Getters
     */
    const sex = computed(() => new Map([
        ['0', 'Masculino'],
        ['1', 'Femenino']
    ]));
    const boolean = computed(() => new Map([
        ['0', 'No'],
        ['1', 'Sí']
    ]));
    
    
    /**
     * Actions
     */
    /**
     * @description Obtener titulo
     * 
     * @param {string} key 
     * @param {string|number} value
     * 
     * @return {string|number}
     */
    function getLabel(key, value) {
        let response = value;
        if (!this.hasOwnProperty(key) || !(this[key] instanceof Map) || !this[key].has(value)) {
            return response;
        }

        return this[key].get(value);
    }
    
    /* Exponer datos */
    return {
        // State
        
        // Getters
        sex, boolean,

        // Actions
        getLabel
    };
});

export default dataDictionaryStore;