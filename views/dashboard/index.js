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
                <v-col class="pb-0" cols="12">
                    <d-breadcrumbs :items="breadcrumbsItems"></d-breadcrumbs>
                </v-col>
                <v-col cols="12">
                    <d-status-development></d-status-development>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */
        const breadcrumbsItems = ref([
            {title: 'Dashboard', disabled: false, to: '/'}
        ]);

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
            breadcrumbsItems,
            
            // Computed

            // Methods
            
        };
    }
};

export default component;