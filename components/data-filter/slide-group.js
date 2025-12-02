import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import apiStore from 'store/api.js';
import { isDef } from 'main/utilities.js';

export const component = {
    components: {},
    emits: ['update:modelValue', 'submit'],
    props: {
        modelValue: {
            type: [String,Number,Object],
            default: null
        },
        items: {
            type: Array,
            default: () => ([])
        },
        itemValue: {
            type: String,
            default: 'value'
        },
        itemTitle: {
            type: String,
            default: 'title'
        },
        itemValueIgnores: {
            type: Array,
            default: () => (['_all_'])
        },
        filterField: {
            type: String,
            default: null,
        },
        filterValueDebug: {
            type: Function,
            default: (v) => v
        }
    },
    template: /*html*/`
        <v-slide-group v-model="value" show-arrows mandatory>
            <slot name="prepend"></slot>
            <v-slide-group-item v-for="(item, index) in itemsCache" :key="index" :value="item.value" v-slot="{ isSelected, toggle }">
                <slot
                    :name="'item.' + item.value"
                    :item="item"
                    :isSelected="isSelected"
                    :toggle="toggle"
                    :disabled="$attrs.disabled"
                >
                    <v-btn 
                        class="mr-1 mb-3 mt-1"
                        rounded
                        :color="isSelected ? 'primary' : undefined"
                        :disabled="$attrs.disabled"
                        @click="toggle">
                        {{item.title}}
                    </v-btn>
                </slot>
            </v-slide-group-item>
            <slot name="append"></slot>
        </v-slide-group>
    `,
    setup(props, { emit }) {
        const api = apiStore();

        /* Data */
        const valueCache = ref(props.modelValue);

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

                // emitir filtro
                nextTick(() => {
                    filterBuild();
                });
            }
        });
        
        const itemsCache = computed(() => {
            let response = [];
            for (let i = 0; i < props.items.length; i++) {
                response.push({
                    title: getItemTitle(props.items[i]),
                    value: getItemValue(props.items[i])
                });
            }

            return response;
        });

        /* Watch */
        watch(() => props.modelValue, value => {
            let foreignChange = (value != valueCache.value);
            // Almacenar
            valueCache.value = value;
            
            // En caso de ser un cambio foraneo
            if (foreignChange) {
                nextTick(() => {
                    filterBuild();
                });
            }
        });
        
        /* Methods */
        /**
         * @description Obtener valor de un item
         * 
         * @param {object|string|number} item
         * 
         * @return {string|number}
         */
        function getItemValue(item) {
            return item[props.itemValue] ?? item;
        }

        /**
         * @description Obtener titulo de un item
         * 
         * @param {object|string|number} item
         * 
         * @return {string|number}
         */
        function getItemTitle(item) {
            return item[props.itemTitle] ?? item;
        }

        /**
         * @description Construir filtros
         * 
         * @return {array|null}
         */
        function filterBuild() {
            let response = [], result;
            if (!props.itemValueIgnores.includes(valueCache.value)) {
                // depurar
                result = props.filterValueDebug(valueCache.value);
                // construir
                result = api.filterToArray(props.filterField,'=', result);
                // almacenar
                response = result;
            }
            else {
                response = null;
            }

            emit('submit', response);
            return response;
        }
        
        /* Ciclo de vida */
        onBeforeMount(() => {
            if (isDef(value.value)) {
                filterBuild();
            }
        });

        /* Exponer estado */
        return {
            // Data

            // Computed
            value, itemsCache,

            // Methods
        };
    }
};

export default component;