import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['update:page', 'update:itemsPerPage', 'update:sortBy'],
    props: {
        headers: {
            type: Array,
            default: () => ([])
        },
        page: {
            type: Number,
            default: 1
        },
        itemsPerPage: {
            type: Number,
            default: 25
        },
        sortBy: {
            type: Array,
            default: []
        },
        filterPrimary: {
            type: [Array, Object],
            default: null
        },
        filterSecondary: {
            type: [Array, Object],
            default: null
        },
        callback: {
            type: Function,
            default: () => Promise.reject('the table callback is not defined')
        }
    },
    template: /*html*/`
        <v-data-table-server
            v-model:page="pageValue"
            v-model:items-per-page="itemsPerPageValue"
            v-model:sort-by="sortByValue"
            :headers="headersValue"
            :items-length="itemsTotal"
            :items="items"
            :loading="loading"
            :items-per-page-options="paginationOptions"
            @update:options="updateOptions">
            <!--Carga-->
            <template v-slot:loader="{ isActive }">
                <v-progress-linear
                :active="isActive"
                color="primary"
                height="4"
                indeterminate
                ></v-progress-linear>
            </template>
            <template v-slot:item="{index, columns, internalItem, item }">
                <tr> 
                    <td  v-for="(header, key) in headers">
                        <slot
                            :name="'item.' + header.key"
                            :column="columns[key]"
                            :index="index"
                            :internalItem="internalItem"
                            :item="item"
                            :value="internalItem.columns[header.key] ?? null">
                            {{internalItem.columns[header.key] ?? null}}
                        </slot>
                    </td>
                </tr>
            </template>
        </v-data-table-server>
    `,
    setup(props, { emit }) {

        /* Data */
        const loading = ref(false);
        const isInitRequest = ref(true);
        const items = ref([]);
        const itemsTotal = ref(0);
        const headersCache = ref(props.headers);
        const pageCache = ref(props.page);
        const itemsPerPageCache = ref(props.itemsPerPage);
        const sortByCache = ref(props.sortBy);
        const paginationOptions = ref([
            {value: 10, title: '10'},
            {value: 25, title: '25'},
            {value: 50, title: '50'},
            {value: 100, title: '100'}
        ]);

        /* Computed */
        const headersValue = computed({
            get() {
                return headersCache.value;
            },
            set(newValue) {
                headersCache.value = newValue;
                emit('update:page', newValue);
            }
        });

        const pageValue = computed({
            get() {
                return pageCache.value;
            },
            set(newValue) {
                pageCache.value = newValue;
                emit('update:page', newValue);
            }
        });
        
        const itemsPerPageValue = computed({
            get() {
                return itemsPerPageCache.value;
            },
            set(newValue) {
                itemsPerPageCache.value = newValue;
                emit('update:itemsPerPage', newValue);
            }
        });
        
        const sortByValue = computed({
            get() {
                return sortByCache.value;
            },
            set(newValue) {
                sortByCache.value = newValue;
                emit('update:sortBy', newValue);
            }
        });

        const sortByString = computed(() => {
            let response = {};
            if (sortByValue.value.length) {
                for (let i = 0; i < sortByValue.value.length; i++) {
                    response[sortByValue.value[i].key] = sortByValue.value[i].order;
                }
                response = JSON.stringify(response);
            }
            else {
                response = '';
            }

            return response;
        });

        const filters = computed(() => {
            let response = {};
            
            if (isDef(props.filterPrimary, props.filterSecondary)) {
                response = {
                    group1: props.filterPrimary,
                    group2: props.filterSecondary
                };
            }
            else if (isDef(props.filterPrimary)) {
                response = props.filterPrimary;
            }
            else if (isDef(props.filterSecondary)) {
                response = props.filterSecondary;
            }
            else {
                return '';
            }

            return JSON.stringify(response);
        });
        
        /* Watch */
        watch(() => props.headers, value => {
            headersCache.value = value;
        });
        watch(() => props.page, value => {
            pageCache.value = value;
        });
        watch(() => props.sortBy, value => {
            sortByCache.value = value;
        });
        watch(() => props.itemsPerPage, value => {
            itemsPerPageCache.value = value;
        });
        watch(filters, value => {
            reload({page: 1});
        });
        
        /* Methods */
        /**
         * @description Solicitar data del servidor
         * 
         * @returns {Promise}
         */
        function getDataFromServer() {
            // Modo carga
            if(loading.value) return Promise.reject('Table is loading');
            loading.value = true;

            // Configuración de consulta
            let params = {
                fields: '*', // todos por defecto
                itemsPerPage: itemsPerPageValue.value
            };
            
            if (pageValue.value > 1) {
                params.page = pageValue.value;
            }
            if (sortByString.value.length) {
                params.order = sortByString.value;
            }
            if (filters.value.length) {
                params.filters = filters.value;
            }

            // Realizar solicitud
            return props.callback(params).then(r => {

                // Almacenar
                items.value = [...r.data.data];
                itemsTotal.value = r.data.count;

                return r;
            }).catch(e => {
                items.value = [];
                itemsTotal.value = 0;

                return Promise.reject(e);
            }).finally(() => {
                loading.value = false;
            });
        }

        /**
         * @description Funcion a ejecutar cuando se actualizan las opciones de la tabla
         *  - campos: page, itemsPerPage, sortBy, groupBy, search
         *  - comportamiento: Se evita atender la primera invocación de la función, ya que este se ejcuta apenas se crea el componente y lo que se busca es atender una invocación inicial desde donde se instancia el componente
         *  
         * @returns {undefined}
         */
        function updateOptions() {
            if (isInitRequest.value) {
                isInitRequest.value = false;
                return undefined;
            }

            nextTick(() => {
                getDataFromServer();
            });
        }
        
        /**
         * @description Reiniciar tabla
         * 
         * @param {object} [setting={}] - Configuración por defecto
         * 
         * @returns {undefined}
         */
        function reload(setting = {}) {
            let isAutomaticUpdate = false; // Evita solapar el llamado de la función "getDataFromServer" por motivo de "updateOptions"

            // Pagina
            if (setting.page && setting.page !== pageValue.value) {
                isAutomaticUpdate = true; 
                pageValue.value = setting.page;
            }

            // items por pagina
            if (setting.itemsPerPage && setting.itemsPerPage !== itemsPerPageValue.value) {
                isAutomaticUpdate = true; 
                itemsPerPageValue.value = setting.itemsPerPage;
            }

            // Orden
            if (setting.sortBy && setting.sortBy !== sortByValue.value) {
                isAutomaticUpdate = true; 
                sortByValue.value = setting.sortBy;
            }

            // Validar si se llamara el metodo "getDataFromServer"
            if (!isAutomaticUpdate) {
                getDataFromServer();
            }
        }

        /**
         * @description Actualizar un item de los ya precargados
         * 
         * @param {string} searchBy - campo por el cual se buscara
         * @param {string|number} value - Valor a buscar
         * @param {object} data - nueva data
         * 
         * @return {boolean}
         */
        function updateItem(searchBy, value, data) {
            let index = items.value.findIndex(item => item[searchBy] === value);
            if (index === -1) {
                return false;
            }

            for (let key in data) {
                if (items.value[index].hasOwnProperty(key)) {
                    items.value[index][key] = data[key];
                }
            }

            return true;
        }

        /**
         * @description Eliminar un item de los ya precargados
         * 
         * @param {string} searchBy - campo por el cual se buscara
         * @param {string|number} value - Valor a buscar
         * 
         * @return {boolean}
         */
        function deleteItem(searchBy, value) {
            let index = items.value.findIndex(item => item[searchBy] === value);
            if (index === -1) {
                return false;
            }

            items.value.splice(index, 1);

            return true;
        }
         
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            loading, isInitRequest,
            items, itemsTotal, paginationOptions,

            // Computed
            headersValue, pageValue, itemsPerPageValue, sortByValue,  

            // Methods
            getDataFromServer, updateOptions, reload,
            updateItem, deleteItem
        };
    }
};

export default component;