import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import appStore from 'store/app.js';
import apiStore from 'store/api.js';
import rulesStore from 'store/rules.js';
import {isDef} from 'main/utilities.js';

export const component = {
    components: {},
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
                    <v-card-title class="d-flex">
                        <span class="my-auto">{{title}}</span>
                        <v-spacer></v-spacer>
                        <v-menu>
                            <template v-slot:activator="{ props: menuActivadorProps }">
                                <v-btn variant="text" icon="mdi-dots-vertical" v-bind="menuActivadorProps">
                                </v-btn>
                            </template>
                            <v-list class="py-0" density="compact" slim>
                                <v-list-item prepend-icon="mdi-file-upload-outline" title="Subir configuración" @click="uploadFileClick"></v-list-item>
                            </v-list>
                        </v-menu>
                    </v-card-title>
                    <v-card-text>
                        <l-form
                            ref="form"
                            v-model:loading="formLoading"
                            type="formType"
                            :items="formItems"
                            :callback="formCallback"
                            :callback-read="formCallbackRead">
                        </l-form>
                        <!--Input-->
                        <input type="file" ref="uploadFileInput" class="d-none" accept="application/json" @change="uploadFileEvent">
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
        let app = appStore();
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
                key: 'baseURL',
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
        const uploadFileInput = ref(null);
        
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
        function formCallback({affected, message, data}) {
            if (affected) {
                for(let field in data) {
                    api[field] = data[field];
                }

                nextTick(() => {
                    dialogShow.value = false;
                });

                app.setSnackbar({text: 'Cambios aplicados con éxito.', template: '<success>'});

                return Promise.resolve(data);
            }
            else {
                nextTick(() => {
                    dialogShow.value = false;
                });

                return Promise.reject(message);
            }
        }

        function formCallbackRead(fields) {
            let data = {};

            for(let i = 0; i < fields.length; i++) {
                data[fields[i]] = api[fields[i]];
            }

            return Promise.resolve(data);
        }

        function uploadFileClick() {
            console.log(uploadFileInput.value)
            uploadFileInput.value.click();
        }

        function uploadFileEvent(event) {
            let file = event.target.files[0];
            if (!file) {
                return;
            }

            let reader = new FileReader();
            reader.onload = (e) => {
                try {
                    let config = JSON.parse(e.target.result);
                    let dataToUpdate = {};

                    dataToUpdate.baseURL = config.baseURL ?? null;
                    dataToUpdate.tenantId = config.tenantId ?? null;
                    dataToUpdate.branchId = config.branchId ?? null;
                    
                    for (let key in dataToUpdate) {
                        if (form.value.recordData[key]) {
                            form.value.recordData[key].after = dataToUpdate[key];
                        }
                    }

                    app.setSnackbar({ text: 'Configuración cargada con éxito.', template: '<success>' });
                } catch (error) {
                    console.error('Error parsing JSON file:', error);
                    app.setSnackbar({ text: 'Error al leer el archivo JSON.', template: '<error>' });
                } finally {
                    event.target.value = '';
                }
            };
            reader.readAsText(file);
        }
        

        /* Ciclo de vida */        

        /* Exponer estado */
        return {
            // Data
            title, dialogShow, form, formType, formLoading, formItems,
            uploadFileInput,

            // Computed
            formDisabled,

            // Methods
            formCallback, formCallbackRead,
            uploadFileClick, uploadFileEvent
        };
    }
};

export default component;