import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';

import form from 'components/form/index.js';
import apiStore from 'store/api.js';
import rulesStore from 'store/rules.js';
import {isDef} from 'main/utilities.js';

export const component = {
    components: {
        'l-form': form
    },
    emits: [],
    props: {},
    template: /*html*/`
        <v-dialog v-model="dialogShow" max-width="500">
            <template v-slot:activator="{ props: dialogActivatorProps }">
                <v-tooltip :text="title">
                    <template v-slot:activator="{ props: tooltipActivatorProps }">
                        <v-btn
                            v-bind="{...dialogActivatorProps, ...tooltipActivatorProps}"
                            icon="mdi-office-building-cog"
                            variant="text"
                        ></v-btn>
                    </template>
                </v-tooltip>
            </template>
            <template v-slot:default="{ isActive }">
                <v-card
                    :title="title"
                    :disabled="formLoading"
                    :loading="formLoading">
                    <template v-slot:loader="{ isActive }">
                        <v-progress-linear
                            :active="isActive"
                            color="primary"
                            height="4"
                            indeterminate
                        ></v-progress-linear>
                    </template>
                    <v-card-text>
                        <l-form
                            ref="form"
                            v-model:loading="formLoading"
                            type="formType"
                            :items="formItems"
                            :callback="formCallback"
                            :callback-read="formCallbackRead">
                        </l-form>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions>
                        <v-btn text="Cerrar" @click="isActive.value = false"></v-btn>
                        <v-spacer></v-spacer>
                        <v-btn text="Guardar" color="primary" :disabled="formDisabled" @click="form.submit()"></v-btn>
                    </v-card-actions>
                </v-card>
            </template>
        </v-dialog>
    `,
    setup(props, { emit }) {
        let api = apiStore();
        let rules = rulesStore();
        
        /* Data */
        const title = ref('Configuración de conexión');
        const dialogShow = ref(false);
        const form = ref(null);
        const formLoading = ref(false);
        const formType = ref('update');
        const formItems = ref([
            {
                isTitle: true,
                label: 'Servidor',
            },
            {
                key: 'urlBase',
                type: 'text',
                label: 'URL base',
                color: 'primary',
                rules: [rules.required, rules.url],
                colProps: {
                    cols: 12,
                    sm: 12
                }
            },
            {
                isTitle: true,
                label: 'Arrientario',
            },
            {
                key: 'tenantId',
                type: 'text',
                label: 'Arrientario Id',
                color: 'primary',
                rules: [rules.required, rules.numberOnly],
            },
            {
                key: 'branchId',
                type: 'text',
                label: 'Sucursal Id',
                color: 'primary',
                rules: [rules.required, rules.numberOnly],
            }
        ]);
        
        /* Computed */
        const formDisabled = computed(() => {
            let response = null;

            if (isDef(form.value?.isValid)) {
                response = !form.value.isValid;
            }

            return response;
        });
        
        /* Watch */
        watch(dialogShow, value => {
            if (value) {
                nextTick(() => {
                    form.value.getDataFromServer();
                });
            }
        });
        
        /* Methods */
        function formCallback(data) {
            console.log(data)
            if (data._affected) {
                nextTick(() => {
                    dialogShow.value = false;
                });
                return Promise.reject(data._text);
            }

            for(let field in data) {
                api[field] = data[field];
            }

            return Promise.resolve({});
        }

        function formCallbackRead(fields) {
            let data = {};

            for(let i = 0; i < fields.length; i++) {
                data[fields[i]] = api[fields[i]];
            }

            return Promise.resolve(data);
        }

        /* Ciclo de vida */        

        /* Exponer estado */
        return {
            // Data
            title, dialogShow, form, formType, formLoading, formItems,

            // Computed
            formDisabled,

            // Methods
            formCallback, formCallbackRead
        };
    }
};

export default component;