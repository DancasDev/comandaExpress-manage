import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import request from 'request/index.js';
import appStore from 'store/app.js';

export const component = {
    components: {},
    emits: ['success'],
    props: {
        record: {
            type: Object,
            default: () => ({})
        }
    },
    template: /*html*/`
        <d-dialog
            v-model:loading="loading"
            max-width="400px"
            title-text="Eliminar producto"
            footer-btn-cancel-text="No, cerrar"
            footer-btn-accept-text="Sí, eliminar"
            footer-btn-accept-color="red"
            :footer-btn-accept-callback="callback">
            <p class="px-4 pb-4">¿Está seguro que desea eliminar el producto <b>{{record.product_category_name}} / {{record.name}}</b>?</p>
        </d-dialog>
    `,
    setup(props, { emit }) {
        const app = appStore();
        
        /* Data */
        const loading = ref(false);

        /* Computed */

        /* Watch */
        
        /* Methods */
        function callback() {
            if (loading.value) return Promise.reject('The "dialog-delete" callback is still executing.');
            loading.value = true;

            return request({
                url: '/tenants/{{tenant_id}}/products/' + props.record.id,
                method: 'delete',
                showMessage: false
            }).then(r => {
                emit('success', props.record);

                app.setSnackbar({text: 'Producto eliminado correctamente.', template: '<success>'});
                return r;
            }).finally(() => {
                loading.value = false;
            });
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            loading,

            // Computed

            // Methods
            callback
        };
    }
};

export default component;