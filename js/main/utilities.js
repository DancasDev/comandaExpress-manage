/**
 * @description Crear key codificado para el local localStorage o sessionStorage
 * 
 * @param {String} key
 * 
 * @returns {String}
 * 
 * */
function encodeKey(key) {
	return window.btoa(key + '_@_' + location.host);
}

/**
 * @description Codificar valor
 * 
 * @param {String} value
 * 
 * @returns {String}
 * */
function encodeValue(value) {
	return window.btoa(String(value));
}

/**
 * @description descodificar valor
 * 
 * @param {String} value
 * 
 * @returns {String}
 * 
 * */
function decodeValue(value) {
	return window.atob(value);
}

/**
 * @description Establecer un valor en localStorage o sessionStorage
 * 
 * @param {String} type - Tipo de almacenamiento (local, session)
 * @param {String} key - Clave con la que se almacenara
 * @param {String} value - Valor a almacenar
 * 
 */
export function setStorage(type, key, value) {
    key = encodeKey(key);
    value = encodeValue(value);
    // almacanar
    return (type == 'local') ? localStorage.setItem(key,value) : sessionStorage.setItem(key,value);
}

/**
 * @description Obtener un valor de localStorage o sessionStorage
 * 
 * @param {String} type - Tipo de almacenamiento (local, session)
 * @param {String} key Clave a buscar
 * @param {String} format Formato deseado en caso de ser encontrado
 * 
 * @returns {Boolean|String|undefined}
 */
export function getStorage(type, key, format) {
    key = encodeKey(key);

    // obtener valor
    let value = (type == 'local') ? localStorage.getItem(key) : sessionStorage.getItem(key);
    
    // formatear
    if (isDef(value)) {
        value = decodeValue(value);
        // Convertir
        if (format == 'boolean') {
            if(value == 'false' || value == '0') {
                value = false;
            }
            else {
                value = Boolean(value);
            }
        }
        else if(format == 'object') {
            try {
                value = JSON.parse(value);
            } catch (error) {
                localStorage.removeItem(key);
                value = undefined;
            }
        }
        else if(format == 'number') {
            value = Number(value);
            if (isNaN(value)) {
                localStorage.removeItem(key);
                value = undefined;
            }
        }
    }

    return value;
}

/**
 * @description validar existencia de un key en el localStorage o sessionStorage
 * 
 * @param {String} type - Tipo de almacenamiento (local, session)
 * @param {String} key - Clave a buscar
 * 
 * @return {Boolean}
 */
export function hasStorage(type, key) {
    key = encodeKey(key);
    return (type == 'local') ? localStorage.hasOwnProperty(key) : sessionStorage.hasOwnProperty(key);
}

/**
 * @description Remover un valor en localStorage
 * 
 * @param {String} type - Tipo de almacenamiento (local, session)
 * @param {String} key Clave a buscar
 * 
 */
export function removeStorage(type, key) {
    key = encodeKey(key);
    return (type == 'local') ? localStorage.removeItem(key) : sessionStorage.removeItem(key);
}

/**
 * @description Valida si los valores pasado son de tipo Object
 * 
 * @param {*} params
 * 
 * @return {boolean}
 */
export function isObject(...params) {
    let response = true;
    if (params.length > 0) {
        for (let i = 0; i < params.length; i++) {
            if (params[i] === null || typeof params[i] != 'object') {
                response = false;
                break;
            }
        }
    }
    else {
        response = false;
    }
    return response;
}

/**
 * @description Valida si los valores pasado están definidos
 * 
 * @param {*} params
 * 
 * @return {boolean}
 */
export function isDef (...params) {
    let response = true;
    if (params.length > 0) {
        for (let i = 0; i < params.length; i++) {
            if (params[i] === undefined || params[i] === null) {
                response = false;
                break;
            }
        }
    }
    else {
        response = false;
    }
    return response;
}

/**
 * @description Valida si los valores pasado coinciden con el patron de una url
 * 
 * @param {*} params
 * 
 * @return {boolean}
 */
export function isUrl(...params) {
    let response = true;
    if (params.length > 0) {
        for (let i = 0; i < params.length; i++) {
            if (typeof params[i] != 'string' || !/^(https|http):\/\/[-a-z0-9+&@#\/%?=~_|!:,.;]*$/i.test(params[i])) {
                response = false;
                break;
            }
        }
    }
    else {
        response = false;
    }
    return response;
}

/**
 * @description Copiar texto al portapapeles
 * 
 * @param {string} text - Texto a copiar
 * 
 * @return {promise}
 */
export function copyToClipboard(text) {
    return new Promise((resolve, reject) => {
        if (navigator.clipboard && window.isSecureContext) {
            // Usa la API moderna de Clipboard si está disponible y el contexto es seguro (HTTPS)
            navigator.clipboard.writeText(text)
                .then(() => resolve())
                .catch(err => reject(err));
        } else {
            // Fallback para navegadores antiguos o contextos no seguros (HTTP)
            // También funciona para iOS, que a veces tiene problemas con la API de Clipboard directamente
            let textarea = document.createElement('textarea');
            textarea.value = text;
            // Evita que el textarea sea visible y que el usuario pueda interactuar con él
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            textarea.style.top = '-9999px';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (err) {
                reject(err);
            } finally {
                document.body.removeChild(textarea);
            }
        }
    });
}

/**
 * @description Dar formato a numero
 * 
 * @param {Number} value - numero a dar formato
 * @param {number} [minimumFraction=2] - minimo de fracción
 * @param {number} maximumFraction - maximo de fracción
 * @param {string} lang - lenguaje
 * 
 * @returns {string}
 */
export function numberFormat(value, minimumFraction, maximumFraction, lang) {
    let options = {};

    // Opciones: mínimo de fracción
    if (typeof minimumFraction == 'number') {
        options.minimumFractionDigits = minimumFraction;
    }

    // Opciones: máximo de fracción
    if (typeof maximumFraction == 'number') {
        options.maximumFractionDigits = maximumFraction;
    }

    return value.toLocaleString(lang, options);
}

export function dateFormat(format, date) {
    // Convertimos la date a un objeto Date si es una cadena
    if (isDef(date) && !(date instanceof Date)) {
      date = new Date(date);
    }
    else if(!(date instanceof Date)) {
      date = new Date();
    }
  
    const tokens = {
      'Y': date.getFullYear(),
      'm': ('0' + (date.getMonth() + 1)).slice(-2),
      'd': ('0' + date.getDate()).slice(-2),
      'H': ('0' + date.getHours()).slice(-2),
      'i': ('0' + date.getMinutes()).slice(-2),
      's': ('0' + date.getSeconds()).slice(-2)
    };
  
    return format.replace(/[YmdHis]/g, match => tokens[match]);
}

export default {setStorage, getStorage, hasStorage, removeStorage, isObject, isDef, isUrl, copyToClipboard, numberFormat, dateFormat};