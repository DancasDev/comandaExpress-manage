import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import request from 'request/index.js';
import appStore from 'store/app.js';

import viewDataIterator from './data-iterator.js';
import viewDialogCreate from './dialog-create.js';
import viewDialogRead from './dialog-read.js';
import viewDialogUpdate from './dialog-update.js';
import viewDialogDelete from './dialog-delete.js';



export const component = {
    components: {
        'view-data-iterator': viewDataIterator,
        'view-dialog-create': viewDialogCreate,
        'view-dialog-read': viewDialogRead,
        'view-dialog-update': viewDialogUpdate,
        'view-dialog-delete': viewDialogDelete
    },
    emits: [],
    props: {},
    template: /*html*/`
        <v-container fluid>
            <v-row>
                <!--Sección uno-->
                <v-col class="pb-0" cols="7" md="9">
                    <d-breadcrumbs :items="breadcrumbsItems"></d-breadcrumbs>
                </v-col>
                <v-col class="d-flex" cols="5" md="3">
                    <v-spacer></v-spacer>
                    <v-tooltip text="Agregar nueva categoría" location="bottom">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                v-bind="props"
                                color="primary"
                                prepend-icon="mdi-plus-circle-outline"
                                @click="dialogOpen('create')">
                                Agregar
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-col>
                <!--Sección dos-->
                <v-col class="pb-0" cols="10" md="8">
                    <d-filter-text-field
                        v-model="filterTextValue"
                        label="Buscar por nombre del producto"
                        :filter-field="filterTextFields"
                        @submit="value => filterPrimary = value">
                    </d-filter-text-field>
                </v-col>
                <!--Sección tres-->
                <v-col cols="10" md="11">
                    <v-slide-y-transition>
                        <d-filter-slide-group
                            v-show="filterGroupItems.length > 0"
                            v-model="filterGroupValue"
                            :items="filterGroupItems"
                            item-value="id"
                            item-title="name"
                            :filter-field="filterGroupField"
                            @submit="value => filterSecondary = value">
                            <template v-slot:item._all_="{ isSelected, toggle, disabled, item }">
                                <v-btn 
                                    class="mr-3 mb-3 mt-1"
                                    rounded
                                    :color="isSelected ? 'primary' : undefined"
                                    :disabled="disabled"
                                    @click="toggle">
                                    {{item.title}}
                                </v-btn>
                            </template>
                        </d-filter-slide-group>
                    </v-slide-y-transition>
                </v-col>
                <v-col class="d-flex py-1" cols="2" md="1">
                    <v-tooltip text="Recargar tabla" location="bottom">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                class="ma-auto"
                                v-bind="props"
                                variant="text"
                                icon="mdi-reload"
                                @click="dataIterator.getDataFromServer()">
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-col>
                <!--Sección cuatro-->
                <v-col cols="12">
                    <view-data-iterator
                        ref="dataIterator"
                        :filter-primary="filterPrimary"
                        :filter-secondary="filterSecondary"
                        @action="v => dialogOpen(v.type, v.data)">
                    </view-data-iterator>
                </v-col>
            </v-row>
            <!--Dialogos-->
            <view-dialog-create
                v-model="dialogs.create"
                @success="item => dialogSuccess('create', item)">
            </view-dialog-create>
            <view-dialog-read
                v-model="dialogs.read"
                :record="dataIteratorItemSelected"
                @read="item => refreshItem(item)">
            </view-dialog-read>
            <view-dialog-update
                v-model="dialogs.update"
                :record="dataIteratorItemSelected"
                @read="item => refreshItem(item)"
                @success="item => dialogSuccess('update', item)">
            </view-dialog-update>
            <view-dialog-delete
                v-model="dialogs.delete"
                :record="dataIteratorItemSelected"
                @success="item => dialogSuccess('delete', item)">
            </view-dialog-delete>
        </v-container>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */
        const breadcrumbsItems = ref([
            {title: 'Menú'},
            {title: 'Productos', to: '/menu/products'},
        ]);
        const dialogs = ref({create: false, read: false, update: false, delete: false});
        const dataIterator = ref(null);
        const dataIteratorItemSelected = ref(null);
        const filterPrimary = ref(null);
        const filterSecondary = ref(null);
        const filterTextValue = ref(null);
        const filterTextFields = ref(['name']);
        const filterGroupValue = ref('_all_');
        const filterGroupField = ref('product_category_id');
        const filterGroupItems = ref([]);

        /* Computed */

        /* Watch */
        watch(filterSecondary, value => {
            console.log(value)
        });
        
        /* Methods */
        function filterGroupItemsBuild() {
            return request({
                url: '/tenants/{{tenant_id}}/products/categories',
                method: 'get',
                params: {
                    fields: 'id,name',
                    itemsPerPage: 100,
                    order: JSON.stringify({name: 'asc'})
                },
            }).then(r => {
                filterGroupItems.value = [{id: '_all_', name: 'Todas'}, ...r.data.data];
                return r;
            }).catch(e => {
                return Promise.reject(e);
            });
        }

        function dialogOpen(type, data = {}) {
            dataIteratorItemSelected.value = {...data};

            // Cerrar posible dialogo abierto
            Object.keys(dialogs.value).forEach(field => {
                dialogs.value[field] = false;
            });
            
            nextTick(() => {
                if (type in dialogs.value) {
                    dialogs.value[type] = true;
                }
            });
        }
        
        function dialogSuccess(type, data = {}) {
            if (type in dialogs.value) {
                dialogs.value[type] = false;
            }

            nextTick(() => {
                if (type == 'create') {
                    dataIterator.value.reload({page: 1});
                }
                else if(type == 'update') {
                    refreshItem(data);
                }
                else if(type == 'delete') {
                    dataIterator.value.component.deleteItem('id', dataIteratorItemSelected.value.id);
                }
            });
        }

        function refreshItem(item) {
            dataIterator.value.component.updateItem('id', dataIteratorItemSelected.value.id, item);
        }
        
        /* Ciclo de vida */
        onMounted(() => {
            nextTick(async () => {
                await app.setStatus('running');
                await dataIterator.value.getDataFromServer();
                filterGroupItemsBuild();
            });
        });

        /* Exponer estado */
        return {
            // Data
            breadcrumbsItems, dialogs, dataIterator, dataIteratorItemSelected,
            filterPrimary, filterSecondary, filterTextValue, filterTextFields, filterGroupValue, filterGroupField, filterGroupItems,
            
            // Computed

            // Methods
            dialogOpen, dialogSuccess, refreshItem
        };
    }
};

export default component;