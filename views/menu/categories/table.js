import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useDate } from 'vuetify';
import request from 'request/index.js';
import dataDictionaryStore from 'store/data-dictionary.js';

export const component = {
    components: {},
    emits: ['action'],
    props: {},
    template: /*html*/`
        <d-data-table
            ref="component"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="sortBy"
            :callback="callback"
            :headers="headers"
            multi-sort>
            <template #item._action_="{item}">
                <v-menu transition="slide-y-transition">
                    <template v-slot:activator="{ props }">
                        <v-btn 
                            v-bind="props"
                            variant="text"
                            icon="mdi-dots-vertical">
                        </v-btn>
                    </template>
                    <v-list nav>
                        <v-list-item
                            title="Detalles"
                            subtitle="Ver detalles de registro"
                            prepend-icon="mdi-information-variant-circle-outline"
                            @click="action('read', item)">
                        </v-list-item>
                        <v-list-item
                            title="Actualizar"
                            subtitle="Actualizar datos del registro"
                            prepend-icon="mdi-circle-edit-outline"
                            @click="action('update', item)">
                        </v-list-item>
                        <v-divider class="my-1 border-opacity-25"></v-divider>
                        <v-list-item
                            title="Eliminar"
                            subtitle="Eliminar registro"
                            prepend-icon="mdi-delete-circle-outline"
                            base-color="red"
                            @click="action('delete', item)">
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </d-data-table>
    `,
    setup(props, { emit }) {
        const date = useDate();
        const dataDictionary = dataDictionaryStore();

        /* Data */
        const component = ref(null);
        const page = ref(1);
        const itemsPerPage = ref(10);
        const sortBy = ref([{ key: 'created_at', order: 'desc' }]);
        const headers = ref([
            {
                title: 'Nombre',
                key: 'name'
            },
            {
                title: 'Inhabilitado',
                key: 'is_disabled',
                value: item => dataDictionary.getLabel('boolean', item.is_disabled)
            },
            {
                title: 'Fecha de creación',
                key: 'created_at',
                value: item => date.format(new Date(Number(item.created_at) * 1000), 'fullDateTime12h')
            },
            {
                title: 'Acciones',
                key: '_action_',
                sortable: false
            }
        ]);

        /* Computed */

        /* Watch */
        
        /* Methods */
        function getDataFromServer() {
            return component.value.getDataFromServer();
        }

        function reload(setting) {
            component.value.reload(setting);
        }
        
        function callback(params) {
            params.fields = 'id,name,is_disabled,created_at';

            return request({
                url: '/tenants/{{tenant_id}}/products/categories',
                method: 'get',
                params,
            });
        }

        function action(type, data) {
            emit('action', {type, data});
        }
        
        /* Ciclo de vida */
        /* Exponer estado */
        return {
            // Data
            component, page, itemsPerPage, sortBy, headers,

            // Computed

            // Methods
            getDataFromServer, reload, callback, action
        };
    }
};

export default component;