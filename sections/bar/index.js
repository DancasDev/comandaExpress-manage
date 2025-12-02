import { ref, computed, watch, nextTick, onMounted, defineAsyncComponent } from 'vue';

import appStore from 'store/app.js';
import { useDisplay } from 'vuetify';

export const component = {
    components: {
        'menu-user': defineAsyncComponent(() => import('../menu/user.js')),
    },
    emits: [],
    props: {},
    template: /*html*/`
        <v-app-bar color="background">
            <template v-slot:prepend>
                <v-app-bar-nav-icon v-show="sidebarShow" @click="sidebarOpen"></v-app-bar-nav-icon>
            </template>
            <template v-slot:append>
                <menu-user v-if="hasUser"></menu-user>
            </template>
        </v-app-bar>
    `,
    setup(props, { emit }) {
        const app = appStore();
        const display = useDisplay();
        
        /* Data */

        /* Computed */
        const hasUser = computed(() => app.hasUser);
        const sidebarShow = computed(() => display.mdAndDown.value);


        /* Watch */
        
        /* Methods */
        function sidebarOpen() {
            app.sidebar.show = true;
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data

            // Computed
            hasUser, sidebarShow,

            // Methods
            sidebarOpen
        };
    }
};

export default component;