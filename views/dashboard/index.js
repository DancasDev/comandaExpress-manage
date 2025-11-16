import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';

/* Componente */
export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-container fluid>
            <v-row>
                <v-btn variant="text" @click="test">Cerrar sesión</v-btn>
            </v-row>
        </v-container>
    `,
    setup(props, { emit }) {
        let app = appStore();

        /* Data */

        /* Computed */

        /* Watch */
        
        /* Methods */
        function test() {
            app.logout();
        }
        
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
            test
        };
    }
};

export default component;