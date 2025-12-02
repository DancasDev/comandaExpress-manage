import { ref, computed, watch, nextTick, onMounted, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import appStore from 'store/app.js';

export const component = {
    components: {},
    emits: [],
    props: {},
    template: /*html*/`
        <d-dialog
            v-model="dialogShow"
            persistent
            max-width="400px"
            title-text="Extender sesión"
            footer-btn-cancel-text="No, cerrar"
            footer-btn-cancel-color="red"
            :footer-btn-cancel-callback="logout"
            footer-btn-accept-text="Sí, extender"
            :footer-btn-accept-callback="extenderSesion">
            <p class="px-4 pb-4">Su sesión esta apunto de expirar ¿desea extenderla?</p>
        </d-dialog>
    `,
    setup(props, { emit }) {
        const app = appStore();
        const router = useRouter();


        /* Data */
        const dialogShow = ref(false);
        const loading = ref(false);
        const timeOutId = ref(null);
        const sessionExpiresDiff = ref(null);

        /* Computed */

        /* Watch */
        watch(sessionExpiresDiff, value => {
            if (value <= 0) {
                dialogShow.value = false;

                app.reset();
                
                nextTick(() => {
                    router.push('/login');
                });
            }
        });
        watch(() => app.hasUser, value => {
            if (value) {
                validSessionExpires();
            }
            else {
                clearTimeout(timeOutId.value);
                dialogShow.value = false;
            }
        });
        
        /* Methods */
        function isExpired() {
            sessionExpiresDiff.value = app.getSessionExpiresDiff(); // no eliminar (necesario para la logica en el watch)

            return (sessionExpiresDiff.value <= 0) ? true : false;
        }

        function validSessionExpires() {
            let limit = 300000;

            if (isExpired()) {
                return;
            }

            // Sesión a punto de expirar
            if (sessionExpiresDiff.value <= limit) {
                dialogShow.value = true;
            }
            // sesion aun con vida
            else {
                clearTimeout(timeOutId.value);
                timeOutId.value = setTimeout(() => {
                    validSessionExpires();
                }, sessionExpiresDiff.value - limit);
            }
        }

        function logout() {
            if (isExpired()) {
                return;
            }

            // Acción
            loading.value = true;
            app.logout().then(() => {
                dialogShow.value = false;
                nextTick(() => {
                    router.push('/login');
                });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                loading.value = false;
            });
        }
        function extenderSesion() {
            if (isExpired()) {
                return;
            }
            
            // Acción
            loading.value = true;
            app.refreshSession().then(() => {
                dialogShow.value = false;
                nextTick(() => {
                    validSessionExpires();
                });
            }).catch(err => {
                console.log(err);
            }).finally(() => {
                loading.value = false;
            })
        }
        
        /* Ciclo de vida */

        /* Exponer estado */
        return {
            // Data
            dialogShow, loading,

            // Computed

            // Methods
            logout, extenderSesion
        };
    }
};

export default component;