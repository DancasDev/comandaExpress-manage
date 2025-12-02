import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';

import viewTable from './table.js';
import viewDialogCreate from './dialog-create.js';
import viewDialogRead from './dialog-read.js';
import viewDialogUpdate from './dialog-update.js';
import viewDialogDelete from './dialog-delete.js';

export const component = {
    components: {
        'view-table': viewTable,
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
                        label="Buscar por nombre de la categoría"
                        :filter-field="filterTextFields"
                        @submit="value => filterPrimary = value">
                    </d-filter-text-field>
                </v-col>
                <v-col class="d-flex py-1">
                    <v-tooltip text="Recargar tabla" location="bottom">
                        <template v-slot:activator="{ props }">
                            <v-btn
                                class="ml-auto mt-2"
                                v-bind="props"
                                variant="text"
                                icon="mdi-reload"
                                @click="table.getDataFromServer()">
                            </v-btn>
                        </template>
                    </v-tooltip>
                </v-col>
                <!--Sección Tres-->
                <v-col cols="12">
                    <view-table
                        ref="table"
                        :filter-primary="filterPrimary"
                        @action="v => dialogOpen(v.type, v.data)">
                    </view-table>
                </v-col>
            </v-row>
            <!--Dialogos-->
            <view-dialog-create
                v-model="dialogs.create"
                @success="item => dialogSuccess('create', item)">
            </view-dialog-create>
            <view-dialog-read
                v-model="dialogs.read"
                :record="tableItemSelected"
                @read="item => refreshItem(item)">
            </view-dialog-read>
            <view-dialog-update
                v-model="dialogs.update"
                :record="tableItemSelected"
                @read="item => refreshItem(item)"
                @success="item => dialogSuccess('update', item)">
            </view-dialog-update>
            <view-dialog-delete
                v-model="dialogs.delete"
                :record="tableItemSelected"
                @success="item => dialogSuccess('delete', item)">
            </view-dialog-delete>
        </v-container>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */
        const breadcrumbsItems = ref([
            {title: 'Menú'},
            {title: 'Categorías', to: '/menu/categories'},
        ]);
        const dialogs = ref({create: false, read: false, update: false, delete: false});
        const table = ref(null);
        const tableItemSelected = ref(null);
        const filterPrimary = ref(null);
        const filterTextValue = ref(null);
        const filterTextFields = ref(['name']);
        
        /* Computed */

        /* Watch */
        
        /* Methods */
        function dialogOpen(type, data = {}) {
            tableItemSelected.value = {...data};

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
                    table.value.reload({page: 1});
                }
                else if(type == 'update') {
                    refreshItem(data);
                }
                else if(type == 'delete') {
                    table.value.component.deleteItem('id', tableItemSelected.value.id);
                }
            });
        }

        function refreshItem(item) {
            table.value.component.updateItem('id', tableItemSelected.value.id, item);
        }
        
        /* Ciclo de vida */
        onMounted(() => {
            nextTick(() => {
                app.setStatus('running').then(() => {
                    table.value.getDataFromServer();
                });
            });
        });

        /* Exponer estado */
        return {
            // Data
            breadcrumbsItems, dialogs, table, tableItemSelected,
            filterPrimary, filterTextValue, filterTextFields,
            
            // Computed

            // Methods
            dialogOpen, dialogSuccess, refreshItem
        };
    }
};

export default component;