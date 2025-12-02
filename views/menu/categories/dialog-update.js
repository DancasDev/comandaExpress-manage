import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import {isDef} from 'main/utilities.js';
import request from 'request/index.js';
import appStore from 'store/app.js';
import rulesStore from 'store/rules.js';

export const component = {
    components: {},
    emits: ['update:modelValue','success'],
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
        record: {
            type: Object,
            default: () => ({})
        }
    },
    template: /*html*/`
        <d-dialog
            v-model="value"
            v-model:loading="formLoading"
            max-width="600px"
            title-text="Actualizar categoría"
            title-action-show
            title-action-tooltip="Recargar"
            :title-action-callback="reload"
            :footer-btn-accept-callback="formSubmit"
            :footer-btn-accept-disabled="formDisabled">
                <d-form
                    ref="form"
                    v-model:loading="formLoading"
                    type="update"
                    :items="formItems"
                    :callback="formCallback"
                    :callback-read="formCallbackRead">
                </d-form>
        </d-dialog>
    `,
    setup(props, { emit }) {
        const app = appStore();
        const rules = rulesStore();

        /* Data */
        const valueCache = ref(props.modelValue);
        const form = ref(null);
        const formLoading = ref(false);
        const formItems = ref([
            {
                key: 'name',
                type: 'text',
                label: 'Nombre',
                color: 'primary',
                rules: [rules.required, v => rules.stringRange(v, 4, 60)],
                colProps: {
                    cols: 12,
                    sm: 12
                }
            },
            {
                isTitle: true,
                label: 'Registro',
            },
            {
                key: 'is_disabled',
                type: 'select',
                label: 'Inhabilitado',
                color: 'primary',
                rules: [rules.required],
                colProps: {
                    cols: 12,
                    sm: 12
                },
                value: '0',
                items: [
                    {
                        title: 'Seleccione una opción',
                        value: null
                    },
                    {
                        title: 'Si',
                        value: '1'
                    },
                    {
                        title: 'No',
                        value: '0'
                    }
                ]
            }
        ]);

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
        const formDisabled = computed(() => {
            let response = null;

            if (isDef(form.value?.isValid)) {
                response = !form.value.isValid;
            }

            return response;
        });

        /* Watch */
        watch(() => props.modelValue, value => {
            valueCache.value = value;
        });

        watch(value, value => {
            if (value) {
                reload();
            }
            else {
                nextTick(() => form.value.reset());
            }
        });
        
        /* Methods */
        async function reload() {
            await new Promise(resolve => {
                let interval = setInterval(() => {
                    if (form.value) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 50);
            });
            
            nextTick(() => {
                form.value.getDataFromServer();
            });
        }

        function formSubmit() {
            form.value.submit();
        }
        
        function formCallbackRead(fields) {
            if (!isDef(props.record.id)) {
                return Promise.reject('Record.id not found');
            }

            return request({
                url: '/tenants/{{tenant_id}}/products/categories/' + props.record.id,
                method: 'get',
                params: {
                    fields: fields.join(',')
                }
            }).then(r => {
                return r.data;
            });
        }

        function formCallback({affected, message, data}) {
            if (affected) {
                return request({
                    url: '/tenants/{{tenant_id}}/products/categories/' + props.record.id,
                    method: 'put',
                    data
                }).then(r => {
                    emit('success', data);
                    app.setSnackbar({text: 'Cambios aplicados con éxito.', template: '<success>'});
                    return r;
                });
            }
            else {
                nextTick(() => {
                    value.value = false;
                });
                return Promise.reject(message);
            }
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            form, formLoading, formItems,

            // Computed
            value, formDisabled,

            // Methods
            reload, formSubmit, formCallbackRead, formCallback, 
        };
    }
};

export default component;