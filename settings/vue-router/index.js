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
            title: 'Iniciar sesión',
			requiresLogout: true,
			renderSidebar: false,
			renderBar: false,
        }
	},
    {
		path: '/menu/categories',
		name: 'menu_categories',
		component: () => import('views/menu/categories/index.js'),
		meta: {
            title: 'Menú / Categorías'
        }
	},
    {
		path: '/menu/products',
		name: 'menu_products',
		component: () => import('views/menu/products/index.js'),
		meta: {
            title: 'Menú / Productos'
        }
	},
];

/**
 * Instancial libreria
 * */
export const vueRouter = createRouter({
	history: createWebHashHistory(),
	routes
});

export default vueRouter;