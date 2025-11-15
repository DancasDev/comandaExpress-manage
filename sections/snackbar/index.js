import { ref, computed, watch, nextTick, onMounted } from 'vue';
import appStore from 'store/app.js';

/* Componente */
export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <v-snackbar
            v-model="snackbar.show"
            :timeout="snackbar.timeout"
            transition="slide-y-reverse-transition">
            <v-icon 
                v-if="snackbar.icon.name != null"
                :icon="snackbar.icon.name"
                :color="snackbar.icon.color">
            </v-icon>
            <span class="ml-2" v-html="snackbar.text">
            </span>

            <template v-slot:actions>
                <v-btn color="red" icon @click="snackbar.show = false">
                    <v-icon icon="mdi-close"></v-icon>
                </v-btn>
            </template>
        </v-snackbar>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */

        /* Computed */
        const snackbar = computed(() => app.snackbar);

        /* Watch */
        
        /* Methods */
        
        /* Exponer estado */
        return {snackbar};
    }
};

export default component;