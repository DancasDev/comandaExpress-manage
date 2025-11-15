import { ref, computed, watch, nextTick, onMounted } from 'vue';

/**
 * Esquelo para formularios
 */
export const component = {
    components: {},
    emits: ['update:loading'],
    props: {
        loading: {
            type: Boolean,
            default: false
        },
        items: {
            type: Array,
            default: () => ([])
        },
        callback: {
            type: Function,
            default:() => Promise.reject('The form callback has not been defined.')
        },
        titleProps: {
            type: Object,
            default: () => ({
                cols: 12,
                sm: 4,
                md: 3
            })
        },
        inputCols: {
            type: Object,
            default: () => ({
                cols: 12,
                sm: 6
            })
        }
    },
    template: /*html*/`
        <v-form ref="form" v-model="isValid" validate-on="lazy input" @submit.prevent="submit" :disabled="loadingValue">
            <v-container fluid>
                <v-row>
                    <template v-for="(item, index) in itemsFormatted.list" :key="index">
                        <template v-if="item.type == 'title'">
                            <v-col cols="12">
                                <v-container fluid class="pa-0">
                                    <v-row>
                                        <v-col v-bind="titleProps">
                                            <h4 class="text-subtitle-2">{{item.label}}</h4>
                                        </v-col>
                                        <v-col  :class="dividerClass">
                                            <v-divider class="border-opacity-25 my-auto"></v-divider>
                                        </v-col>
                                    </v-row>
                                </v-container>
                            </v-col>
                        </template>
                        <template v-else>
                            <v-col v-bind="item.colProps">
                                <slot :name="item.slotName" v-bind="{props: {...item.props, label: (item.props.required ? '* ' : '') + item.props.label}, on: item.on}">
                                    {{item.slotName}}
                                </slot>
                            </v-col>
                        </template>
                    </template>
                </v-row>
            </v-container>
        </v-form>
    `,
    setup(props, { emit }) {
        /* Data */
        const loadingCache = ref(props.loading);
        const form = ref(false);
        const isValid = ref(false);
        const colList = ref(['cols','xs','sm','md','lg','xl','xxl']);

        /* Computed */
        const loadingValue = computed({
            get() {
                return loadingCache.value;
            },
            set(newValue) {
                loadingCache.value = newValue;
                emit('update:loading', newValue);
            }
        });

        const itemsFormatted = computed(() => {
            let response = {
                input: {}, // Acceso rápido a campos de formulario por key
                title: {}, // Acceso rápido a títulos por key
                list: []   // Lista ordenada para el v-for
            };
            
            let item;
            for(let i = 0; i < props.items.length; i++) {
                item = {type: null, key: props.items[i].key ?? i};
                if ((props.items[i].isTitle ?? false) === true) {
                    item.type = 'title';
                    item.label = props.items[i].label ?? ('Title index: ' + i);
                }
                else {
                    item.type = 'input';
                    item.slotName = 'item.' + item.key;
                    item.colProps = {...(props.inputCols ?? {}), ...props.items[i].colProps};
                    item.on = props.items[i].on ?? {};
                    item.defaultValue = props.items[i].defaultValue ?? null;

                    // Crea una copia de las props originales, luego elimina las que ya se separaron
                    item.props = {...props.items[i]};

                    // Depurar/eliminar propiedades que no deben pasarse como props directas al input
                    delete item.props.isTitle;
                    delete item.props.slotName;
                    delete item.props.colProps;
                    delete item.props.defaultValue;
                    delete item.props.on;
                }
                
                response[item.type][item.key] = {...item};
                response.list.push(response[item.type][item.key]);
            }

            return response;
        });

        const itemsOnlyInput = computed(() => Object.values(itemsFormatted.value.input))

        const dividerClass = computed(() => {
            let response = ['pl-0'];

            colList.value.forEach(key => {
                if (key == 'xs' || key == 'cols') {
                    if (!response.includes('d-none') && !response.includes('d-flex')) {
                        response.push(props.titleProps[key] == 12 ? ('d-none') : ('d-flex'));
                    }
                }
                else {
                    response.push(props.titleProps[key] == 12 ? ('d-' + key + '-none') : ('d-' + key + '-flex'));
                }
            });

            return response;
        });

        /* Watch */
        
        /* Methods */
        /**
         * Submit para el envio de la data
         * 
         * @return {promise}
         */
        async function submit() {
            if (loadingValue.value) return Promise.reject('The form callback is still executing.');

            // Validar que todo este bien en el formulario
            let { valid } = await form.value.validate();
            if (!valid) return Promise.reject('The form has errors.');

            // Estado de carga
            loadingValue.value = true;

            // Envio de la información
            return props.callback().finally(() => {
                loadingValue.value = false;
            })
        }
        
        /**
         * @description Reiniciar campos
         * 
         * @return {undefined}
         */
        function reset() {
            form.value.reset();
        }

        /**
         * @description Validar formulario
         * 
         * @returns {}
         */
        function validate() {
            return form.value.validate();
        }
        
        /* Exponer estado */
        return {
            // Data
            form, isValid,

            // Computed
            loadingValue, itemsFormatted, itemsOnlyInput, dividerClass,

            // Methods
            submit, reset, validate
        };
    }
};

export default component;