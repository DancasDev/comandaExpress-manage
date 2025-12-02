import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';

export const component = {
    components: {},
    emits: [],
    props: {
        items: {
            type: Array,
            default: () => []
        }
    },
    template: /*html*/`
        <v-slide-group class="text-h6" :model-value="items.length - 1" center-active>
            <v-slide-group-item v-for="(item, index) in items" :key="index" :value="index" v-slot="{ isSelected }">
                <v-breadcrumbs-divider v-if="index > 0 && index < items.length">
                    /
                </v-breadcrumbs-divider>
                <v-breadcrumbs-item v-bind="item" active-color="primary"></v-breadcrumbs-item>
            </v-slide-group-item>
        </v-slide-group>
    `,
    setup(props, { emit }) {

        /* Data */

        /* Computed */

        /* Watch */
        
        /* Methods */
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data

            // Computed

            // Methods
        };
    }
};

export default component;