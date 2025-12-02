import {createVuetify} from 'vuetify';
import es from './locale/es.js'

export const vuetify = createVuetify({
    defaults: {},
    locale: {
        locale: 'es',
        messages: { es },
    },
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    background: '#e2e2e2',
                    'background-secondary': '#e8e8e8'
                }
            },
            dark: {}
        }
    }
});

export default vuetify;