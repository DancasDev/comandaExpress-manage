import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';
import { useDisplay } from 'vuetify';


export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-navigation-drawer v-model="sidebar.show" image="..." theme="dark" :expand-on-hover="showRail" :rail="showRail">
            <!--Imagen-->
            <template #image>
                <v-img
                    :src="sidebarImage"
                    height="100%"
                    width="100%"
                    style="filter: blur(2px);"
                    gradient="rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)">
                </v-img>
            </template>
            <!--Encabezado-->
            <template #prepend>
                <v-list>
                    <v-list-item nav density="compact" :title="appName">
                        <template #prepend>
                            <v-avatar image="medias/images/logotipo.png" rounded="0" size="45"></v-avatar>
                        </template>
                        <v-list-item-subtitle class="text-capitalize">
                            {{appName}} V 0.0.1
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-list>
                <v-divider ></v-divider>
            </template>
            <!--Modulos-->
            <v-list density="compact" nav :disabled="loading">
                <!-- Panel informativo -->
                <v-list-item title="Dashboard" prepend-icon="mdi-view-dashboard" to="/" color="primary"></v-list-item>
                <!-- Menu-->
                <v-list-group value="Academy" fluid>
                    <template #activator="{ props }">
                        <v-list-item v-bind="props" title="Menú" prepend-icon="mdi-food"></v-list-item>
                    </template>
                    <v-divider  class="my-2 mr-10"></v-divider>
                    <v-list-item
                        title="Categorías"
                        prepend-icon="mdi-shape"
                        to="/menu/categories"
                        color="primary">
                    </v-list-item>
                    <v-list-item
                        title="Productos"
                        prepend-icon="mdi-hamburger"
                        to="/menu/products"
                        color="primary">
                    </v-list-item>
                </v-list-group>
                <!-- group test 
                <v-list-group v-if="renderList.group.academy?.render" value="Academy" fluid>
                    <template #activator="{ props }">
                        <v-list-item v-bind="props" title="Academia" prepend-icon="mdi-school"></v-list-item>
                    </template>
                    <v-divider  class="my-2 mr-10"></v-divider>
                    <-- Egresados ->
                    <v-list-item
                        v-if="renderList.module.academyGraduates?.render"
                        :disabled="renderList.module.academyGraduates?.disabled"
                        title="Egresados"
                        prepend-icon="mdi-book-education"
                        to="/academy/graduates"
                        color="primary">
                    </v-list-item>
                    <v-divider  class="my-2 mr-10"></v-divider>
                </v-list-group>-->
            </v-list>
            <!--Pie-->
            <template #append>
                <v-divider ></v-divider>
                <div class="px-1">
                    <div class="d-block text-center">
                        <v-tooltip text="Recargar accesos" location="top">
                            <template #activator="{ props }">
                                <v-btn
                                    v-bind="props"
                                    class="ml-auto my-auto"
                                    icon="mdi-reload"
                                    variant="text"
                                    @click="reloadAccess"
                                    :loading="loading">
                                </v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </div>
            </template>
        </v-navigation-drawer>
    `,
    setup(props, { emit }) {
        const app = appStore();
        const disblay = useDisplay();

        /* Data */
        const showRail = ref(false);
        const loading = ref(false);
        const renderList = ref({group: {}, module: {}});
        const module = ref([
            {name: 'academyGraduates', access: 'md-admin-egresados', group: 'academy'},
        ]);

        /* Computed */
        const appName = computed(() => app.name.short);
        const sidebar = computed(() => app.sidebar);
        const sidebarImage = computed(() => {
            let response = 'medias/images/sidebar.jpg';
            return response;
        });

        /* Watch */
        watch(() => app.userPermissions, () => {
            buildRenderList();
        });
        watch(disblay.mdAndDown, value => {
            app.sidebar.show = !value;
            showRail.value = !value;
        }, {immediate: true});
        
        /* Methods */
        /**
         * @description Recargar accesos
         * 
         * @returns {Promise}
         */
        function reloadAccess() {
            if (loading.value) return Promise.reject('It is not possible to consult accesses while it is running.');

            // Modo carga
            loading.value = true;

            // consultar
            return app.getUserDataFromServer().finally(() => {
                loading.value = false;
            });
        }

        /**
         * @description construir listado a renderizar
         * 
         * -- se modifica la variable: renderList
         *  
         * @returns {undefined}
         */
        function buildRenderList() {
            let moduleList = {}, groupList = {}, addGroup = false;

            // Recorrer listado de modulos
            for (let i = 0; i < module.value.length; i++) {
                addGroup = (typeof module.value[i].group == 'string' && !(module.value[i].group in groupList));
                // Inicializar
                moduleList[module.value[i].name] = {render: Boolean(props.renderType), isDisabled: true};
                if (addGroup) {
                    groupList[module.value[i].group] = {render: Boolean(props.renderType), isDisabled: true};
                }

                // Validar accesso
                try {
                    if (!app.userPermissions.has(module.value[i].access)) {
                        continue;
                    }

                    // Cambiar valores
                    moduleList[module.value[i].name] = {render: true, isDisabled: false};
                    if (addGroup) {
                        groupList[module.value[i].group] = {render: true, isDisabled: false};
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            // Almacenar valores
            renderList.value = Object.assign({}, {group: groupList, module: moduleList});
        }
        
        /* Ciclo de vida */
        onMounted(() => {
            buildRenderList();
        });

        /* Exponer estado */
        return {
            // Data
            loading, renderList, module, 

            // Computed
            appName,sidebar,showRail,sidebarImage,

            // Methods
            reloadAccess
        };
    }
};

export default component;