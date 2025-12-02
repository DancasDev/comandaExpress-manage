import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import request from 'request/index.js';
import rulesStore from 'store/rules.js';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['success'],
    props: {},
    template: /*html*/`
        <d-dialog
            v-model:loading="formLoading"
            max-width="600px"
            title-text="Agregar categoría"
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
        const formDisabled = computed(() => {
            let response = null;

            if (isDef(form.value?.isValid)) {
                response = !form.value.isValid;
            }

            return response;
        });

        /* Watch */
        
        /* Methods */
        function formSubmit() {
            form.value.submit();
        }

        function formCallback({data}) {
            return request({
                url: '/tenants/{{tenant_id}}/products/categories',
                method: 'post',
                data
            }).then(r => {
                emit('success', {id: r.data.data.id, ...data});
                return r;
            });
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            form, formLoading, formItems,

            // Computed
            formDisabled,

            // Methods
            formSubmit, formCallback,
        };
    }
};

export default component;