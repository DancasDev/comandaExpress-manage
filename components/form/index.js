import { ref, computed, watch, nextTick, onMounted, defineAsyncComponent } from 'vue';
import appStore from 'store/app.js';
import { isDef, isObject } from 'main/utilities.js';
import formSkeleton from 'components/form/skeleton.js';

export const component = {
    components: {
        'form-skeleton': formSkeleton
    },
    emits: ['update:loading'],
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        items:{
            type: Array,
            default: () => ([])
        },
        type: {
            type: String,
            default: 'read',
            validator: value => ['create', 'read', 'update'].includes(value)
        },
        returnAll: {
            type: Boolean,
            default: false
        },
        callback: {
            type: Function,
            default: () => null
        },
        callbackRead: {
            type: Function,
            default: () => (Promise.reject('The callback to get the "data-update" data has not been started.'))
        }
    },
    template: /*html*/`
        <form-skeleton v-model:loading="loadingValue" ref="formSkeleton" :callback="callback" :items="items">
            <template v-for="(item, key) in itemsOnlyInput" :key="item.index" #[item.slotName]="{props, on}">
                <slot
                    :name="item.slotName"
                    v-bind="{
                        props: {
                            ...props,
                            'model-value': recordData[item.key].after,
                            'error-messages': recordData[item.key].error
                        },
                        on: {
                            ...on,
                            'update:modelValue': value => recordData[item.key].after = value,
                            'update:focused': v => v ? (recordData[item.key].error = '') : null
                        }
                    }">
                    <template v-if="props.type == 'textareas'">
                        <v-textarea
                            v-model="recordData[item.key].after"
                            v-bind="{...props, type: 'text'}"
                            v-on="on"
                            :error-messages="recordData[item.key].error"
                            @update:focused="v => v ? (recordData[item.key].error = '') : null">
                        </v-textarea>
                    </template>
                    <template v-else-if="props.type == 'select'">
                        <v-select
                            v-model="recordData[item.key].after"
                            v-bind="{...props, type: 'text'}"
                            v-on="on"
                            :error-messages="recordData[item.key].error"
                            @update:focused="v => v ? (recordData[item.key].error = '') : null">
                        </v-select>
                    </template>
                    <!--template v-else-if="props.type == 'data-autocomplete'">
                        <data-autocomplete
                            v-model="recordData[item.key].after"
                            v-bind="{...props, type: 'text'}"
                            v-on="on"
                            :error-messages="recordData[item.key].error"
                            @update:focused="v => v ? (recordData[item.key].error = '') : null">
                        </data-autocomplete>
                    </template-->
                    <template v-else>
                        <v-text-field
                            v-model="recordData[item.key].after"
                            v-bind="{...props}"
                            v-on="on"
                            :error-messages="recordData[item.key].error"
                            @update:focused="v => v ? (recordData[item.key].error = '') : null">
                        </v-text-field>
                    </template>
                </slot>
            </template>
        </form-skeleton>
    `,
    setup(props, { emit }) {
        const app = appStore();
        
        /* Data */
        const loadingCache = ref(props.loading);
        const formSkeleton = ref(null);
        const recordData = ref({});

        /* Computed */
        const loadingValue = computed({
            get() {
                return loadingCache.value;
            },
            set(newValue) {
                loadingCache.value = newValue;
                emit('update:loading', newValue);
            }
        });

        const isValid = computed(() => formSkeleton.value?.isValid ?? null);

        const itemsOnlyInput = computed(() => formSkeleton.value?.itemsOnlyInput ?? []);

        const fieldKeys = computed(() => itemsOnlyInput.value.map(item => item.key));
        
        /* Watch */
        watch(() => props.loading, value => {
            loadingCache.value = value;
        });
        
        /* Methods */
        /**
         * @description Construir estructura de recordaData
         * 
         * @return {undefined}
         */
        function recordDataBuild() {
            let result = {};

            fieldKeys.value.forEach(field => {
                result[field] = {
                    before: null,
                    after: null,
                    error: ''
                };
            });
                
            recordData.value = {...result};
        }

        /**
         * @description Obtener data del servidor
         * 
         * @return {Promise}
         */
        function getDataFromServer() {
            // Modo carga
            if (loadingValue.value) return Promise.reject('The callback function to get the data in "form" is still running.');
            loadingValue.value = true;
            
            // Realizar solicitud
            return props.callbackRead([...fieldKeys.value]).then(r => {
                let value;
                fieldKeys.value.forEach(field => {
                    value = r[field] ?? r.data?.[field] ?? r.data?.data?.[field] ?? null;
                    
                    recordData.value[field].before = value;
                    recordData.value[field].after = value;
                });

                return r;
            }).finally(() => {
                loadingValue.value = false;
            });
        }

        /**
         * @description Ejecutar formulario
         * 
         * @return {promise}
         */
        function submit() {
            return formSkeleton.value.submit();
        }

        /**
         * Realizar envio de la data
         * 
         * info: El estado de "loadingValue" se maneja en skeleton.js
         * 
         * @return {promise}
         */
        function callback() {
            let result = {affected: true, message: null, data: {}};
            
            if (props.type == 'create' || props.type == 'read') {
                fieldKeys.value.forEach(field => {
                    result.data[field] = recordData.value[field].after;
                });
            }
            else {
                fieldKeys.value.forEach(field => {
                    if (props.returnAll || recordData.value[field].after !== recordData.value[field].before) {
                        result.data[field] = recordData.value[field].after;
                    }
                });
                
                if (!Object.keys(result.data).length) {
                    let text = 'No se detectaron cambios para aplicar.';
                    loadingValue.value = false;
                    app.setSnackbar({text, template: '<info>'});

                    result.affected = false;
                    result.message = text;
                }
            }

            
            // Realizar solicitud
            return props.callback(result).then(r => {
                Object.keys(result.data).forEach(field => {
                    recordData.value[field].before = result.data[field];
                    recordData.value[field].after = result.data[field];
                });
                
                return r;
            }).catch(e => {
                if (e.response?.data?.error == 'FAIL_VALIDATION') {
                    Object.keys(e.response.data.messages).forEach(field => {
                        if (field in recordData.value) {
                            recordData.value[field].error = e.response.data.messages[field];
                        }
                    })
                }
                
                return Promise.reject(e);
            });
        }

        /**
         * @description Restablecer campos
         * 
         * @return {undefined}
         */
        function restore() {
            Object.keys(recordData.value).forEach(field => {
                recordData.value[field].after = recordData.value[field].before;
            });
        }

        /**
         * @description Validar formulario
         * 
         * @return {promise}
         */
        function validate() {
            return formSkeleton.value.validate();
        }
        
        /* Ciclo de vida */
        onMounted(() => {
            recordDataBuild();
        });
        
        /* Exponer estado */
        return {
            // Data
            formSkeleton, recordData,

            // Computed
            loadingValue, itemsOnlyInput, isValid,

            // Methods
            getDataFromServer, submit, callback, restore, validate
        };
    }
};

export default component;