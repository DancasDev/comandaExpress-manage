import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';
import { isDef, copyToClipboard } from 'main/utilities.js';

export const component = {
    components: {},
    emits: [],
    props: {
        value: {
            type: [Number, String],
            default: null
        },
        label: {
            type: String,
            default: null
        },
        copyDisabled: {
            type: Boolean,
            default: false
        },
        prefix: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: null
        }
    },
    template: /*html*/`
        <div @mouseenter="inputHover = true" @mouseleave="inputHover = false">
            <v-text-field
                :props="$attrs"
                :label="label"
                :prefix="prefix"
                :placeholder="value === null ? 'N/A' : undefined"
                :color="color"
                variant="outlined"
                density="comfortable"
                persistent-placeholder
                hide-details
                readonly
                @focus="inputFocus = true"
                @blur="inputFocus = false">
                <template v-if="copyShow" #append-inner="">
                    <v-tooltip text="Copiar" location="bottom">
                        <template v-slot:activator="{ props }">
                            <v-slide-y-transition>
                                <v-btn
                                    v-show="inputHover"
                                    v-bind="props"
                                    :color="inputFocus ? color : undefined"
                                    density="compact"
                                    variant="text"
                                    icon="mdi-content-copy"
                                    @click="copy">
                                </v-btn>
                            </v-slide-y-transition>
                        </template>
                    </v-tooltip>
                </template>
                <slot name="default" :value="value">
                    {{value}}
                </slot>
            </v-text-field>
        </div>
    `,
    setup(props, { emit }) {
        const app = appStore();

        /* Data */
        const inputHover = ref(false);
        const inputFocus = ref(false);

        /* Computed */
        const copyShow = computed(() => (props.copyDisabled == true || !isDef(props.value)) ? false : true);

        /* Watch */
        
        /* Methods */
        /**
         * @description Copiar valor del input al portapapeles
         * 
         * @returns {promise}
         */
        function copy() {
            return copyToClipboard(String(props.value)).then(v => {
                app.setSnackbar({
                    text: 'Texto copiado al portapapeles',
                    template: '<success>'
                });

                return v;
            }).catch(e => {
                app.setSnackbar({
                    text: 'Error al copiar el texto al portapapeles',
                    template: '<error>'
                });

                return e;
            });
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            inputHover, inputFocus,

            // Computed
            copyShow,

            // Methods
            copy
        };
    }
};

export default component;