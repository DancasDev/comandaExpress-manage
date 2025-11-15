import {defineStore} from 'pinia';
import { isDef, isObject } from 'main/utilities.js';

export const rulesStore  = defineStore('rules', () => {
    /**
     * @description Validar campos requeridos
     *
     * @param {String} value - Valor a analizar
     *
     * @return {Boolean|String} 
     * */
    function required(value) {
        let response = true;
        if (
            !isDef(value)
            || ((typeof value == 'string' || Array.isArray(value)) && value.length == 0)
            || (isObject(value) && Object.keys(value).length == 0)
        ) {
            response = 'El campo es requerido';
        }

        return response;
    }

    /**
     * @description Validar campos donde se requieran correos electrónicos
     *
     * @param {String} value - Valor a analizar
     *
     * @return {Boolean|String} 
     * */
    function email(value) {
        let response = true, pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (typeof value == 'string' && value.length > 0 && !pattern.test(value)) {
            response = 'El campo debe ser un correo electrónico';
        }
        return response
    }

    /**
     * @description Validar campos donde se requieran números de telefonos (ejemplo: +58 4241234567)
     *
     * @param {String} value - Valor a analizar
     * @param {RegExp} pattern - Patron solicitado
     *
     * @return {Boolean|String} 
     * */
    function phone(value, pattern = /^\+[0-9]{1,3}[\s]{0,1}[0-9]{9,16}$/i) {
        let response = true;
        if (typeof value == 'string' && value.length > 0 && !pattern.test(value)) {
            response = 'El campo debe ser un número de teléfono válido';
        }
        return response
    }

    /**
     * @description Validar campos donde se requiran una url
     * 
     * @param {String} value - Valor a analozar
     * 
     * @return {Boolean|String} 
     */
    function url(value, pattern) {
        let response = true
        pattern ??= /^(https|http):\/\/[-a-z0-9+&@#\/%?=~_|!:,.;]*$/i;
        if (typeof value == 'string' && value.length > 0 && !pattern.test(value)) {
            response = 'El campo debe ser una url válida';
        }
        return response
    }


    /**
     * @description Validar si la logitud de un string esta entre un rango
     *
     * @param {String} value - String a validar
     * @param {Number} min - Longitud mínima
     * @param {Number|Undefined} max - Longitud máxima
     *
     * @return {Boolean|String} 
     * */
    function stringRange(value, min, max) {
        let response = true;
        if(typeof value == 'string'  && value.length > 0) {
            if (isDef(min) && value.length < min) {
                response = 'El campo debe tener al menos ' + min + ' caracteres';
            }
            else if (isDef(max) && value.length > max) {
                response = 'El campo debe tener como máximo ' + max + ' caracteres';
            }
        }
        return response;
    }

    /**
     * @description Comparar dos fechas en base a un operador lógico
     * @param {String} valueX - String principal
     * @param {String} valueY - String secundario
     * @param {String} logicalOperator - Operador lógico (==,!=)
     * 
     * @return {String|Boolean}
     */
    function stringCompare(valueX, valueY, logicalOperator) {
        let response = true;
        if (typeof valueY == 'string' && valueY.length > 0) {
            if (logicalOperator == '===') {
                response = (valueX === valueY) ? 'El texto ingresado no es válido' : true;
            }
            else if (logicalOperator == '==') {
                response = (valueX == valueY) ? 'El texto ingresado no es válido' : true;
            }
            else if (logicalOperator == '!=') {
                response = (valueX != valueY) ? 'El texto ingresado no es válido' : true;
            }
            else if (logicalOperator == '!==') {
                response = (valueX !== valueY) ? 'El texto ingresado no es válido' : true;
            }
            else {
                console.error('rules -> stringCompare:', 'The logical operator "' + logicalOperator + '" is not valid');
            }
        }
        return response;
    }

    /**
     * @description Solo texto
     * 
     * @param {*} value - Valor a validar
     * 
     * @return {String|Boolean}
     */
    function stringOnly(value) {
        let response = true;
        
        if (typeof value == 'string' && value.length > 0 && !/^[a-záéíóúñü\s]+$/i.test(value)) {
            response = 'Este campo solo permite letras';
        }
    
        return response;
    }

    /**
     * @description Validar si un número esta entre un rango
     *
     * @param {String|Number} value - Número a validar
     * @param {Number} min - Rango mínimo
     * @param {Number|Undefined} max - Rango máximo
     *
     * @return {String|Boolean}
     * */
    function numberRange(value, min, max) {
        let response = true, vInt;
        if(typeof value == 'string' && value.length > 0) {
            vInt = Number(value);
            if (isDef(min) && vInt < min) {
                response = 'El campo debe de contener un número mayor o igual a ' + min;
            }
            else if (isDef(max) && vInt > max) {
                response = 'El campo debe de contener un número menor o igual a ' + max;
            }
        }
        return response;
    }

    /**
     * @description Solo numeros
     * 
     * @param {*} value - Valor a validar
     * 
     * @return {String|Boolean}
     */
    function numberOnly(value) {
        let response = true;
        if (typeof value == 'string' && value.length > 0 && !/^[0-9]+$/.test(value)) {
            response = 'Este campo solo permite números';
        }
    
        return response;
    }

    /**
     * @description Comparar dos fechas en base a un operador lógico
     * @param {String|Number} valueX - Fecha principal
     * @param {String|Number} valueY - Fecha secundaria
     * @param {String} logicalOperator - Operador lógico
     * 
     * @return {String|Boolean}
     */
    function dateCompare(valueX, valueY, logicalOperator) {
        let response = true, acceptedType = ['string', 'number'];
    
        if (acceptedType.includes(typeof valueX) && acceptedType.includes(typeof valueY)) {
            // Transformar a time UNIX
            valueX = new Date(valueX).getTime();
            valueY = new Date(valueY).getTime();
    
            // según el operador logico aplicar comparación
            if (logicalOperator === '<') {
                if (valueX < valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else if (logicalOperator === '<=') {
                if (valueX <= valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else if (logicalOperator === '>') {
                if (valueX > valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else if (logicalOperator === '>=') {
                if (valueX >= valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else if (logicalOperator === '==') {
                if (valueX == valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else if (logicalOperator === '!=') {
                if (valueX != valueY) {
                    response = 'La fecha ingresada no es valida';
                }
            }
            else {
                console.error('rules -> dateCompare:', 'The logical operator "' + logicalOperator + '" is not valid');
            }
        }
    
        return response;
    }

    
    /* Exponer datos */
    return {
        // State
        
        // Getters

        // Actions
        required, email, phone, url, stringRange, stringCompare, stringOnly, numberRange, numberOnly, dateCompare
    };
});

export default rulesStore;