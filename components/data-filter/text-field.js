import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import apiStore from 'store/api.js';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['update:modelValue', 'submit'],
    props: {
        modelValue: {
            type: [String,Number],
            default: null
        },
        label: {
            type: String,
            default: 'Label'
        },
        filterField: {
            type: Array,
            default: () => ([]),
        },
        filterOperador: {
            type: String,
            validator: val => ['=', '!=', '>', '>=', '<', '<=', 'like1', 'like2', 'like3'].includes(val),
            default: 'like2',
        },
        filterValueDebug: {
            type: Function,
            default: (v) => v
        }
    },
    template: /*html*/`
        <v-text-field
            v-model="value"
            type="search"
            :label="label"
            :hint="value?.length ? hint : label"
            prepend-inner-icon="mdi-magnify"
            variant="solo"
            density="comfortable"
            single-line
            clearable
            flat
            @keyup.enter="filterBuild"
            @click:clear="filterBuild">
        </v-text-field>
    `,
    setup(props, { emit }) {
        const api = apiStore();
        
        /* Data */
        const valueCache = ref(props.modelValue);

        /* Computed */
        const value = computed({
            get() {
              return valueCache.value;
            },
            set(newValue) {
                valueCache.value = newValue;
                emit('update:modelValue', newValue);
            }
        });
        

        const hint = computed(() => {
            let response = '';
            
            if(props.filterOperador == '=') {
                response = 'Presione enter para buscar registros que sean iguales a "'+ value.value +'"';
            }
            else if(props.filterOperador == '!=') {
                response = 'Presione enter para buscar registros que sean diferentes a "'+ value.value +'"';
            }
            else if(props.filterOperador == '>') {
                response = 'Presione enter para buscar registros que sean mayor a "'+ value.value +'"';
            }
            else if(props.filterOperador == '>=') {
                response = 'Presione enter para buscar registros que sean mayor o igual a "'+ value.value +'"';
            }
            else if(props.filterOperador == '<') {
                response = 'Presione enter para buscar registros que sean menor a "'+ value.value +'"';
            }
            else if(props.filterOperador == '<=') {
                response = 'Presione enter para buscar registros que sean menor o igual a "'+ value.value +'"';
            }
            else if(props.filterOperador == 'like1') {
                response = 'Presione enter para buscar registros que comiencen por "'+ value.value +'"';
            }
            else if (props.filterOperador == 'like2') {
                response = 'Presione enter para buscar registros que coincidan con "'+ value.value +'"';
            }
            else if(props.filterOperador == 'like3') {
                response = 'Presione enter para buscar registros que terminen en "'+ value.value +'"';
            }

            return response;
        });


        /* Watch */
        watch(() => props.modelValue, value => {
            valueCache.value = value;
            
            // En caso de ser un cambio foraneo
            if (value != valueCache.value) {
                nextTick(() => {
                    filterBuild();
                });
            }
        });
        
        /* Methods */
        /**
         * @description Construir filtro
         * 
         * @return {array|null}
         */
        function filterBuild() {
            let response = [], result, value;
            if (isDef(valueCache.value) && valueCache.value.length) {
                // depurar
                value = props.filterValueDebug(valueCache.value);
                // construir
                if (props.filterOperador == '!=') {
                    for (let i = 0; i < props.filterField.length; i++) {
                        result = api.filterToArray(props.filterField[i],props.filterOperador, value);
                        response.push(result);
                    }
                }
                else {
                    for (let i = 0; i < props.filterField.length; i++) {
                        result = api.filterToArray(props.filterField[i],props.filterOperador, value, (i ? 'or' : 'and'));
                        response.push(result);
                    }
                }
            }
            else {
                response = null;
            }

            emit('submit', response);
            return response;
        }
        
        /* Ciclo de vida */
        onBeforeMount(() => {
            if (isDef(value.value) && value.value?.length) {
                filterBuild();
            }
        });

        /* Exponer estado */
        return {
            // Data

            // Computed
            value, hint,

            // Methods
            filterBuild
        };
    }
};

export default component;