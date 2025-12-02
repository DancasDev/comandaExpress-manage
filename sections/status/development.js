import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';

export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-empty-state
            icon="mdi-account-hard-hat"
            title="¡Estamos trabajando en esto!"
            text="Esta sección está en desarrollo y estará disponible próximamente."
            size="350"
        ></v-empty-state>
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