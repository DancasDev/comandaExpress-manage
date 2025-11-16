import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import appStore from 'store/app.js';
import rulesStore from 'store/rules.js';
import request from 'settings/axios/index.js';
import {isDef} from 'main/utilities.js';

import tenantConfig from 'sections/tenant-config/index.js';

/* Componente */
export const component = {
    components: {
        'tenant-config': tenantConfig
    },
    emits: [],
    props: {},
    template: /*html*/`
        <v-container class="pa-3" fluid>
            <v-row>
                <v-col class="bg-grey-lighten-4 pa-0" cols="12">
                    <v-card class="h-100 bg-grey-lighten-4" border="0" elevation="0" :loading="loading">
                        <!--Carga-->
                        <template v-slot:loader="{ isActive }">
                            <v-progress-linear
                            :active="isActive"
                            color="primary"
                            height="5"
                            indeterminate
                            ></v-progress-linear>
                        </template>
                        <v-card-text style="overflow-y: auto; height: 100dvh;">
                            <v-container class="h-100" fluid>
                                <v-row class="d-flex h-100 align-center justify-center">
                                    <v-col cols="12" class="d-flex align-center" style="height: 65px;">
                                        <span class="text-overline">ComandaExpress</span>
                                        <v-spacer></v-spacer>
                                        <tenant-config></tenant-config>
                                    </v-col>
                                    <v-col cols="12" class="mt-10 mt-md-auto text-center">
                                        <h6 class="text-h6">Bienvenido de nuevo</h6>
                                        <p>Inicia sesión con tu cuenta para continuar</p>
                                    </v-col>
                                    <v-col cols="12" md="6" class="mt-5 mt-md-10">
                                        <l-form
                                            v-model:loading="loading"
                                            ref="form"
                                            type="create"
                                            :callback="callback"
                                            :items="items">
                                            <template #item.password="{props, on}">
                                                <v-text-field
                                                    v-bind="props"
                                                    v-on="on"
                                                    :append-inner-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                                                    :type="passwordShow ? 'text' : 'password'"
                                                    @click:appendInner="passwordShow = !passwordShow">
                                                </v-text-field>
                                            </template>
                                        </l-form>
                                        <div class="d-flex mt-10 justify-center">
                                            <v-btn @click="submit" color="primary" :disabled="submitDisabled">
                                                Iniciar sesión
                                            </v-btn>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup(props, { emit }) {
        let app = appStore();
        let rules = rulesStore();
        let router = useRouter();

        /* Data */
        const loading = ref(false);
        const form = ref(null);
        const passwordShow = ref(false);
        const items = ref([
            {
                label: 'Usuario',
                key: 'username',
                rules: [rules.required],
                'prepend-icon': 'mdi-account',
                autocomplete: 'off',
                required: true,
                colProps: {
                    cols: 12,
                    sm: 12
                }
            },
            {
                label: 'Contraseña',
                key: 'password',
                rules: [rules.required],
                'prepend-icon': 'mdi-key',
                autocomplete: 'off',
                required: true,
                colProps: {
                    cols: 12,
                    sm: 12
                }
            }
        ]);

        /* Computed */
        const submitDisabled = computed(() => {
            let response = false;
            if (isDef(form.value?.isValid)) {
                response = !form.value.isValid;
            }
            return response;
        });

        /* Watch */
        
        /* Methods */
        /**
         * @description Ejecutar submit
         * 
         * @return promise
         */
        function submit() {
            form.value.submit()
        }
        /**
         * @description Callback para enviarda data
         * 
         * @return {Promise}
         */
        function callback({data}) {
            return request({
                url: '/auth/user',
                method: 'post',
                data
            }).then(r => {
                app.setSessionToken(r.data.data.token);
                app.setSessionExpires(new Date(r.data.data.expires_at * 1000).getTime());
                app.setUserType('1');

                nextTick(() => {
                    router.push('/');
                });

                return r;
            });
        }
        
        /* Ciclo de vida */
        onMounted(() => {
            nextTick(() => {
                app.setStatus('running');
            });
        });
        
        /* Exponer estado */
        return {
            // Data
            loading, form, passwordShow,

            // Computed
            items, submitDisabled,

            // Methods
            submit, callback,
        };
    }
};

export default component;