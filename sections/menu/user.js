import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import appStore from 'store/app.js';

export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-menu rounded :close-on-content-click="false" transition="slide-x-transition">
            <template v-slot:activator="{ props: menu }">
                <v-tooltip location="bottom" :disabled="menu['aria-expanded'] == 'true'">
                    <template v-slot:activator="{ props: tooltip }">
                        <v-btn icon v-bind="{...menu, ...tooltip}">
                            <v-avatar :image="profilePicture" color="primary">
                                <span class="text-subtitle-2" style="margin-right: 1px; margin-top: 1px;">
                                    {{nameInitials}}
                                </span>
                            </v-avatar>
                        </v-btn>
                    </template>
                    <span>Cuenta de usuario</span>
                </v-tooltip>
            </template>
            <v-card min-width="260px" max-width="400px">
                <v-img height="150" src="https://cdn.vuetifyjs.com/images/cards/docks.jpg" cover>
                    <div class="fill-height text-white py-3" style="background: rgba(0,0,0,0); background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%); backdrop-filter: blur(2px);">
                        <div class="d-flex">
                            <v-avatar class="mx-auto" :image="profilePicture" color="primary" size="70">
                                <span class="text-h5" style="margin-right: 1px; margin-top: 1px;">
                                    {{nameInitials}}
                                </span>
                            </v-avatar>
                        </div>
                        <v-card-title class="text-center pb-0">{{shortName}}</v-card-title>
                        <v-card-subtitle class="text-center mt-n1">{{roleName}}</v-card-subtitle>
                    </div>
                </v-img>
                <v-card-text class="pa-0">
                    <v-list nav>
                        <v-list-item
                            title="Perfil"
                            subtitle="Configuración de mi perfil"
                            color="primary"
                            prepend-icon="mdi-account-circle"
                            disabled>
                        </v-list-item>
                        <v-list-item
                            title="Bandeja de entrada"
                            subtitle="Ver mi bandeja de entrada"
                            color="primary"
                            prepend-icon="mdi-inbox"
                            disabled>
                        </v-list-item>
                    </v-list>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn
                        class="mx-auto"
                        color="red"
                        prepend-icon="mdi-logout"
                        variant="text"
                        @click="logout">
                            Cerrar sesión
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-menu>
    `,
    setup(props, { emit }) {
        const app = appStore();
        const router = useRouter();

        /* Data */

        /* Computed */
        const profilePicture = computed(() => app.user.profile_picture ?? null);
        const shortName = computed(() => app.userShortName);
        const nameInitials = computed(() => app.userNameInitials);
        const roleName = computed(() => app.userRoles.map(r => r.name).join(', '));

        /* Watch */
        
        /* Methods */
        /**
         * @description Cerrar sesión
         * 
         * @returns {Promise}
         */
        function logout() {
            app.logout().then(() => {
                nextTick(() => {
                    router.push('/login');
                });
            });
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data

            // Computed
            profilePicture, shortName, nameInitials, roleName,

            // Methods
            logout
        };
    }
};

export default component;