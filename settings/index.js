import {createApp, nextTick, defineAsyncComponent} from 'vue';

/* Configuraciones a integrar */
import vuetify from 'settings/vuetify/index.js';
import vueRouter from 'settings/vue-router/index.js';
import pinia from 'settings/pinia/index.js';
import navigationGuards from 'settings/vue-router/navigation-guards.js';
import interceptors from 'settings/axios/interceptors.js';
import appStore from 'store/app.js';

/* Componentes */
import overlayLoader from 'sections/overlay-loader/index.js';
/*import navigationDrawer from 'sections/navigation-drawer/index.js';
import bar from 'sections/bar/index.js';*/
import snackbar from 'sections/snackbar/index.js';


/* Inicializar */
const vueApp = createApp({
    components: {
        'overlay-loader': overlayLoader,
        /*'navigation-drawer': navigationDrawer,
        'bar': bar,*/
        'snackbar': snackbar
    },
    data: () => ({}),
    computed: {},
    methods: {},
    watch: {},
    beforeCreate() {
        interceptors.init();
        navigationGuards.init();
    },
    mounted() {
        let app = appStore();

        nextTick(() => {
            app.initialized = true;
        });
    }
}).use(vuetify).use(vueRouter).use(pinia);

vueApp.mount('#app');
