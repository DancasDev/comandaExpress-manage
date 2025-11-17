import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';

export const component = {
    components: {},
    emits: ['update:modelValue','update:loading'],
    props: {
        modelValue: {
            type: Boolean,
            default: true
        },
        loading: {
            type: Boolean,
            default: false
        },
        persistent: {
            type: Boolean,
            default: false
        },
        maxWidth: {
            type: [String,Number],
            default: '850'
        },
        maxHeight: {
            type: String,
            default: '400px'
        },
        titleText: {
            type: String,
            default: 'Titulo'
        },
        titleActionShow: {
            type: Boolean,
            default: false
        },
        titleActionTooltip: {
            type: String,
            default: 'Tooltip'
        },
        titleActionIcon: {
            type: String,
            default: 'mdi-reload'
        },
        titleActionCallback: {
            type: Function,
            default: () => {}
        },
        footerShow: {
            type: Boolean,
            default: true
        },
        footerBtnCancelShow: {
            type: Boolean,
            default: true
        },
        footerBtnCancelCallback: {
            type: Function,
            default: null
        },
        footerBtnCancelText: {
            type: String,
            default: 'Cerrar'
        },
        footerBtnCancelColor: {
            type: String,
            default: null
        },
        footerBtnCancelDisabled: {
            type: Boolean,
            default: false
        },
        footerBtnAcceptShow: {
            type: Boolean,
            default: true
        },
        footerBtnAcceptCallback: {
            type: Function,
            default: null
        },
        footerBtnAcceptText: {
            type: String,
            default: 'Aceptar'
        },
        footerBtnAcceptColor: {
            type: String,
            default: 'primary'
        },
        footerBtnAcceptDisabled: {
            type: Boolean,
            default: false
        }
    },
    template: /*html*/`
        <v-dialog 
            v-model="value" 
            scrollable
            :persistent="persistent || loadingValue"
            :max-width="maxWidth"
            style="backdrop-filter: blur(3px);"
            transition="slide-y-transition">
            <v-card :loading="loadingValue" :disabled="loadingValue">
                <!--Carga-->
                <template v-slot:loader="{ isActive }">
                    <v-progress-linear
                    :active="isActive"
                    :color="footerBtnAcceptColor"
                    height="4"
                    indeterminate
                    ></v-progress-linear>
                </template>
                <!--Titulo-->
                <v-card-title class="d-flex">
                    <slot name="title">
                        <span class="my-auto"><slot name="title-text" :title-text="titleText">{{titleText}}</slot></span>
                        <v-spacer></v-spacer>
                        <slot
                            v-if="titleActionShow"
                            name="title-action"
                            :loading="loadingValue"
                            :icon="titleActionIcon"
                            :callback="titleActionCallback">
                            <v-tooltip :text="titleActionTooltip" location="bottom">
                                <template v-slot:activator="{ props }">
                                    <v-slide-y-transition>
                                        <v-btn
                                            v-show="!loadingValue"
                                            v-bind="props"
                                            variant="text"
                                            :icon="titleActionIcon"
                                            @click="titleActionCallback">
                                        </v-btn>
                                    </v-slide-y-transition>
                                </template>
                            </v-tooltip>
                        </slot>
                    </slot>
                </v-card-title>
                <!--Body-->
                <v-card-text class="pa-0" :style="{'max-height': maxHeight}">
                    <slot></slot>
                </v-card-text>
                <!--Footer-->
                <template v-if="footerShow">
                    <v-divider></v-divider>
                    <v-card-actions>
                        <slot name="footer">
                            <slot v-if="footerBtnCancelShow" name="footer-btn-cancel">
                                <v-btn variant="text" :color="footerBtnCancelColor" @click="cancelCallback" :disabled="footerBtnCancelDisabled">{{footerBtnCancelText}}</v-btn>
                            </slot>
                            <v-spacer></v-spacer>
                            <slot v-if="footerBtnAcceptShow" name="footer-btn-accept">
                                <v-btn variant="text" :color="footerBtnAcceptColor" @click="acceptCallback" :disabled="footerBtnAcceptDisabled">{{footerBtnAcceptText}}</v-btn>
                            </slot>
                        </slot>
                    </v-card-actions>
                </template>
            </v-card>
        </v-dialog>
    `,
    setup(props, { emit }) {
        /* Data */
        const valueCache = ref(props.modelValue);
        const loadingCache = ref(props.loading);

        /* Computed */
        const value = computed({
            // getter
            get() {
                return valueCache.value;
            },
            // setter
            set(newValue) {
                // almacenar cache 
                valueCache.value = newValue;
                // Emitir
                emit('update:modelValue', newValue);
            }
        });
        const loadingValue = computed({
            get() {
                return loadingCache.value;
            },
            set(newValue) {
                loadingCache.value = newValue;
                emit('update:loading', newValue);
            }
        });

        /* Watch */
        watch(() => props.modelValue, value => {
            valueCache.value = value;
        });
        watch(() => props.loading, value => {
            loadingCache.value = value;
        });
        
        /* Methods */
        function cancelCallback() {
            if (typeof props.footerBtnCancelCallback == 'function') {
                props.footerBtnCancelCallback();
            }
            else {
                value.value = false;
            }
        }
        function acceptCallback() {
            if (typeof props.footerBtnAcceptCallback == 'function') {
                props.footerBtnAcceptCallback();
            }
            else {
                value.value = false;
            }
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data

            // Computed
            value, loadingValue,

            // Methods
            cancelCallback, acceptCallback
        };
    }
};

export default component;