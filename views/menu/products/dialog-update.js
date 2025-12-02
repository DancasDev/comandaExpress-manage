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
            title-text="Actualizar producto"
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
        const firstOpen = ref(true);
        const form = ref(null);
        const formLoading = ref(false);
        const formItems = ref([
            {
                key: 'name',
                type: 'text',
                label: 'Nombre',
                color: 'primary',
                rules: [rules.required, v => rules.stringRange(v, 4, 100)]
            },
            {
                key: 'price',
                type: 'number',
                label: 'Precio',
                color: 'primary',
                rules: [rules.required, rules.numberOnly, v => rules.numberRange(v, 0.01)]
            },
            {
                key: 'product_category_id',
                type: 'select',
                label: 'Categoría',
                color: 'primary',
                rules: [rules.required],
                items: [],
                'item-value': 'id',
                'item-title': 'name'
            },
            {
                key: 'is_prepared',
                type: 'select',
                label: 'Es preparado',
                color: 'primary',
                rules: [rules.required],
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
            return new Promise(async (resolve, reject) => {
                if (!isDef(props.record.id)) {
                    return reject('Record.id not found');
                }
                if (firstOpen.value) {
                    await initData();
                }
                
                request({
                    url: '/tenants/{{tenant_id}}/products/' + props.record.id,
                    method: 'get',
                    params: {
                        fields: fields.join(',')
                    }
                }).then(r => {
                    resolve(r.data);
                }).catch(e => {
                    reject(e);
                });
            });
        }

        function formCallback({affected, message, data}) {
            if (affected) {
                return request({
                    url: '/tenants/{{tenant_id}}/products/' + props.record.id,
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
        
        async function initData() {
            await request({
                url: '/tenants/{{tenant_id}}/products/categories',
                method: 'get',
                params: {
                    fields: 'id,name',
                    order: JSON.stringify({name: 'asc'})
                }
            }).then(r => {
                formItems.value[2].items = [{name: 'Seleccione una opción', id: null}, ...r.data.data];
            });

            firstOpen.value = false;
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