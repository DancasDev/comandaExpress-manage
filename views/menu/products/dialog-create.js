import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import request from 'request/index.js';
import rulesStore from 'store/rules.js';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['update:modelValue','success'],
    props: {
        modelValue: {
            type: Boolean,
            default: false
        },
    },
    template: /*html*/`
        <d-dialog
            v-model="value"
            v-model:loading="formLoading"
            max-width="600px"
            title-text="Agregar producto"
            footer-btn-accept-text="Agregar"
            :footer-btn-accept-callback="formSubmit"
            :footer-btn-accept-disabled="formDisabled">
                <d-form
                    ref="form"
                    v-model:loading="formLoading"
                    type="create"
                    :items="formItems"
                    :callback="formCallback">
                </d-form>
        </d-dialog>
    `,
    setup(props, { emit }) {
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
            if (value && firstOpen.value) {
                initData();
            }
        });
        
        /* Methods */
        function formSubmit() {
            form.value.submit();
        }

        function formCallback({data}) {
            return request({
                url: '/tenants/{{tenant_id}}/products',
                method: 'post',
                data
            }).then(r => {
                emit('success', {id: r.data.data.id, ...data});
                return r;
            });
        }
        
        async function initData() {
            formLoading.value = true;
            try {
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
            } catch (error) {
                console.error(error);
            } finally {
                formLoading.value = false;
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
            formSubmit, formCallback,
        };
    }
};

export default component;