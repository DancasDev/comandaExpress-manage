import {createRouter, createWebHashHistory} from 'vue-router';

/* Rutas */
export const routes =  [
    {
		path: '/',
		name: 'dashboard',
		component: () => import('views/dashboard/index.js'),
		meta: {
            title: 'Panel informativo'
        }
	},
    {
		path: '/login',
		name: 'login',
		component: () => import('views/login/index.js'),
		meta: {
			requiresLogout: true,
			renderSidebar: false,
			renderBar: false,
        }
	}
];

/**
 * Instancial libreria
 * */
export const vueRouter = createRouter({
	history: createWebHashHistory(),
	routes
});

export default vueRouter;