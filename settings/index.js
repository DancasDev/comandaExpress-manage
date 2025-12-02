import {createApp, nextTick, defineAsyncComponent} from 'vue';
import {mapState} from 'pinia';

/* Configuraciones a integrar */
import vuetify from 'settings/vuetify/index.js';
import vueRouter from 'settings/vue-router/index.js';
import pinia from 'settings/pinia/index.js';
import navigationGuards from 'settings/vue-router/navigation-guards.js';
import interceptors from 'settings/axios/interceptors.js';
import appStore from 'store/app.js';

/* Componentes */
import overlayLoader from 'sections/overlay-loader/index.js';
import navigationDrawer from 'sections/navigation-drawer/index.js';
import bar from 'sections/bar/index.js';
import snackbar from 'sections/snackbar/index.js';
import dialogExtendSession from 'sections/dialog/extend-session.js';


/* Inicializar */
const vueApp = createApp({
    components: {
        'overlay-loader': overlayLoader,
        'bar': bar,
        'navigation-drawer': navigationDrawer,
        'snackbar': snackbar,
        'dialog-extend-session': dialogExtendSession
    },
    data: () => ({
        sidebarRender: false,
        barRender: false
    }),
    computed: {
        ...mapState(appStore,['sidebar','bar']),

        viewHeight() {
            let response = this.$vuetify.display.height;
            if (this.bar.render) {
                response -= this.bar.height;
            }
            
            return response;
        }
    },
    methods: {},
    watch: {
        'sidebar.render': {
            handler(value) {
                this.sidebarRender = value;
            }
        },
        'bar.render': {
            handler(value) {
                this.barRender = value;
            }
        }
    },
    beforeCreate() {
        interceptors.init();
        navigationGuards.init();
    },
    mounted() {
        const app = appStore();

        nextTick(() => {
            app.initialized = true;
        });
    }
}).use(vuetify).use(vueRouter).use(pinia);


vueApp.component('d-form', defineAsyncComponent(() => import('components/form/index.js')));
vueApp.component('d-data-table', defineAsyncComponent(() => import('components/data-table/index.js')));
vueApp.component('d-data-iterator', defineAsyncComponent(() => import('components/data-iterator/index.js')));
vueApp.component('d-filter-text-field', defineAsyncComponent(() => import('components/data-filter/text-field.js')));
vueApp.component('d-filter-slide-group', defineAsyncComponent(() => import('components/data-filter/slide-group.js')));
vueApp.component('d-read-text-field', defineAsyncComponent(() => import('components/input-read/text-field.js')));
vueApp.component('d-read-textareas', defineAsyncComponent(() => import('components/input-read/textareas.js')));
vueApp.component('d-dialog', defineAsyncComponent(() => import('sections/dialog/index.js')));
vueApp.component('d-breadcrumbs', defineAsyncComponent(() => import('sections/breadcrumbs/index.js')));
vueApp.component('d-status-development', defineAsyncComponent(() => import('sections/status/development.js')));

vueApp.mount('#app');
