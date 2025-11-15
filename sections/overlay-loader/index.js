import { ref, computed, watch, nextTick, onMounted } from 'vue';
import appStore from 'store/app.js';

/* Componente */
export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <div class="v-overlay-container">
            <v-fade-transition>
                <div v-show="show" class="v-overlay v-theme--light align-center justify-center" style="z-index: 2000; backdrop-filter: blur(4px);">
                    <div class="v-overlay__scrim bg-background"  :style="{'opacity': backgroundOpacity}"></div>
                    <div class="v-overlay__content">
                        <v-progress-circular
                            color="primary"
                            indeterminate
                            size="150">
                            <v-img
                                class="mt-3"
                                :width="80"
                                cover
                                src="medias/images/logotipo.png">
                            </v-img>    
                        </v-progress-circular>
                    </div>
                </div>
            </v-fade-transition>
        </div>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */
        const show = ref(true);
        const type = ref(0);

        /* Computed */
        const backgroundOpacity = computed(() => {
            // Inicializando
            if (type.value == 0) {
                return 1;
            }
            else {
                return 0.75;
            }
        })

        /* Watch */
        watch(() => app.status, value => {
            // Overlay: tipo
            type.value = (value == 'initializing') ? 0 : 1;
            nextTick(() => {
                show.value = ['initializing','loading'].includes(value);
            });
        });
        
        /* Methods */
        
        /* Exponer estado */
        return {
            // Data
            show, type,

            // Computed
            backgroundOpacity

            // Methods
        };
    }
};

export default component;