import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['update:page', 'update:itemsPerPage', 'update:sortBy'],
    props: {
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
            default: () => Promise.reject('the data-interador callback is not defined')
        }
    },
    template: /*html*/`
        <v-sheet style="position: relative;" color="transparent" elevation="0">
            <slot name="default" :items="items" >
                <v-sheet color="transparent" elevation="0">
                    {{items}}
                    <br>
                    <v-btn @click="reload()" color="primary">Hello World!</v-btn>
                </v-sheet>
            </slot>
            <slot v-if="loading" name="loader">
                <v-sheet elevation="0" position="absolute" style="background: rgba(var(--v-theme-background), 0.3) !important; z-index: 1; top: 0; left: 0; width: 100%; height: 100%;">
                    <v-progress-linear color="primary" indeterminate :height="3"></v-progress-linear>
                </v-sheet>
            </slot>
            <v-sheet color="transparent" elevation="0">
                <slot name="footer" :page-count="pageCount" :page="pageValue" :items-per-page="itemsPerPageValue">
                    <v-pagination v-model="pageValue" :length="pageCount" rounded="circle"></v-pagination>
                </slot>
            </v-sheet>
        </v-sheet>
    `,
    setup(props, { emit }) {

        /* Data */
        const loading = ref(false);
        const items = ref([]);
        const itemsTotal = ref(0);
        const pageCache = ref(props.page);
        const itemsPerPageCache = ref(props.itemsPerPage);
        const sortByCache = ref(props.sortBy);

        /* Computed */
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

        const pageCount = computed(() => {
            return Math.ceil(itemsTotal.value / itemsPerPageValue.value);
        });

        /* Watch */
        watch(() => props.page, value => {
            pageCache.value = value;
        });
        watch(() => props.sortBy, value => {
            sortByCache.value = value;
        });
        watch(() => props.itemsPerPage, value => {
            itemsPerPageCache.value = value;
        });

        watch([pageValue, itemsPerPageValue, sortByValue], () => {
            reload();
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
         * @description Reiniciar tabla
         * 
         * @param {object} [setting={}] - Configuración por defecto
         * 
         * @returns {undefined}
         */
        function reload(setting = {}) {
            let isAutomaticUpdate = false; // Evita solapar el llamado de la función "getDataFromServer"

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
            loading,
            items, itemsTotal,

            // Computed
            pageValue, itemsPerPageValue, sortByValue, pageCount, 

            // Methods
            getDataFromServer, reload,
            updateItem, deleteItem
        };
    }
};

export default component;