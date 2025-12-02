import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useDate } from 'vuetify';
import {isDef} from 'main/utilities.js';
import request from 'request/index.js';
import dataDictionaryStore from 'store/data-dictionary.js';


export const component = {
    components: {},
    emits: ['update:modelValue', 'read'],
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
            title-text="Detalles de la categoría"
            title-action-show
            title-action-tooltip="Recargar"
            :title-action-callback="reload"
            :footer-btn-accept-show="false">
                <d-form
                    ref="form"
                    v-model:loading="formLoading"
                    type="read"
                    :items="formItems"
                    :callback-read="formCallbackRead">
                </d-form>
        </d-dialog>
    `,
    setup(props, { emit }) {
        const date = useDate();
        const dataDictionary = dataDictionaryStore();

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
                key: 'id',
                label: 'ID',
                color: 'primary'
            },
            {
                key: 'is_disabled',
                type: 'text',
                label: 'Inhabilitado',
                color: 'primary',
                format: item => dataDictionary.getLabel('boolean', item.is_disabled)
            },
            {
                key: 'created_at',
                type: 'text',
                label: 'Fecha de creación',
                color: 'primary',
                format: item => date.format(new Date(Number(item.created_at) * 1000), 'fullDateTime12h')
            },
            {
                key: 'updated_at',
                type: 'text',
                label: 'Última actualización',
                color: 'primary',
                format: item => isDef(item.updated_at) ? date.format(new Date(Number(item.updated_at) * 1000), 'fullDateTime12h') : null
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
                emit('read', r.data.data);
                return r.data;
            });
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            form, formLoading, formItems,

            // Computed
            value,

            // Methods
            formCallbackRead, reload
        };
    }
};

export default component;