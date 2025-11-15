import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';

export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-container fluid>
            <v-row>
                prueba
            </v-row>
        </v-container>
    `,
    setup(props, { emit }) {
        let app = appStore();

        /* Data */

        /* Computed */

        /* Watch */
        
        /* Methods */
        
        /* Ciclo de vida */
        onMounted(() => {
            nextTick(() => {
                app.setStatus('running');
            });
        });

        /* Exponer estado */
        return {
            // Data

            // Computed

            // Methods
        };
    }
};

export default component;