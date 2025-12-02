import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useDate } from 'vuetify';
import request from 'request/index.js';
import dataDictionaryStore from 'store/data-dictionary.js';

export const component = {
    components: {},
    emits: ['action'],
    props: {

    },
    template: /*html*/`
        <d-data-iterator
            ref="component"
            v-model:page="page"
            v-model:items-per-page="itemsPerPage"
            v-model:sort-by="sortBy"
            :callback="callback">
            <template #default="{items}">
                <v-container fluid>
                    <v-row>
                        <v-col v-for="(item, key) in items" :key="key" cols="12" sm="6" lg="4">
                            <v-card class="mx-auto">
                                <v-img
                                    class="d-flex"
                                    height="200px"
                                    src="/medias/images/image_placeholder.webp"
                                    cover>
                                    <div class="w-100 d-flex pt-2 px-2">
                                        <v-chip
                                            :color="$attrs['filter-secondary'] ? 'primary' : undefined"
                                            prepend-icon="mdi-label-outline"
                                            size="small"
                                            variant="flat">
                                            {{item.product_category_name}}
                                        </v-chip>
                                        <v-spacer></v-spacer>
                                        <v-btn
                                            :id="'product_options_' + item.id"
                                            @click="menuOpen(item)"
                                            variant="text"
                                            size="small"
                                            icon="mdi-dots-vertical">
                                        </v-btn>
                                    </div>
                                </v-img>
                                <v-card-title class="d-flex">
                                    <span>{{item.name}}</span>
                                    <v-spacer></v-spacer>
                                    <span class="text-primary">{{item.price}}</span>
                                </v-card-title>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-container>
                <!--Menú-->
                <v-menu v-model="menu.show" :activator="menu.activatorId" transition="slide-y-transition">
                    <v-list nav>
                        <v-list-item
                            title="Detalles"
                            subtitle="Ver detalles del producto"
                            prepend-icon="mdi-information-variant-circle-outline"
                            @click="action('read', menu.item)">
                        </v-list-item>
                        <v-list-item
                            title="Actualizar"
                            subtitle="Actualizar datos del producto"
                            prepend-icon="mdi-circle-edit-outline"
                            @click="action('update', menu.item)">
                        </v-list-item>
                        <v-divider class="my-1 border-opacity-25"></v-divider>
                        <v-list-item
                            title="Eliminar"
                            subtitle="Eliminar producto"
                            prepend-icon="mdi-delete-circle-outline"
                            base-color="red"
                            @click="action('delete', menu.item)">
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>
        </d-data-iterator>
    `,
    setup(props, { emit }) {
        const date = useDate();
        const dataDictionary = dataDictionaryStore();

        /* Data */
        const component = ref(null);
        const page = ref(1);
        const itemsPerPage = ref(10);
        const sortBy = ref([{ key: 'name', order: 'desc' }]);
        const menu = ref({
            show: false,
            item: null,
            activatorId: null
        });


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
            params.fields = 'id,product_category_name,name,price';

            return request({
                url: '/tenants/{{tenant_id}}/products',
                method: 'get',
                params,
            });
        }

        function menuOpen(item) {
            menu.value.show = false;
            menu.value.activatorId = null;
            menu.value.item = {...item};

            nextTick(() => {
                menu.value.show = true;
                menu.value.activatorId = '#product_options_' + item.id;
            });
        }

        function action(type, data) {
            emit('action', {type, data});
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            component, page, itemsPerPage, sortBy, menu,

            // Computed

            // Methods
            getDataFromServer, reload, callback, menuOpen, action
        };
    }
};

export default component;