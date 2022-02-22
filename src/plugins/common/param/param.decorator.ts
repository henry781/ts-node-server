import 'reflect-metadata';
import {ParamOptions} from './ParamOptions';

export const ROUTE_PARAMS = Symbol('route:params');

/**
 * Param decorator
 * @param {ParamOptions} options
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
function param(options: ParamOptions) {

    return (target: object, propertyKey: string, parameterIndex: number) => {

        if (!options.paramType) {
            const paramTypes = Reflect.getMetadata('design:paramtypes', target, propertyKey);
            options.paramType = paramTypes[parameterIndex];
        }

        const params = Reflect.getOwnMetadata(ROUTE_PARAMS, target, propertyKey) || [];
        params[parameterIndex] = options;

        Reflect.defineMetadata(ROUTE_PARAMS, params, target, propertyKey);
    };
}

/**
 * PathParam decorator
 * @param {string} name
 * @param {string} description
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function pathParam(name: string, description?: string) {
    return param({
        description,
        name,
        type: 'path',
    });
}

/**
 * QueryParam decorator
 * @param {string} name
 * @param {string} description
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function queryParam(name: string, description?: string) {
    return param({
        description,
        name,
        type: 'query',
    });
}

/**
 * QuerySearch decorator
 */
export function querySearch() {
    return param({
        type: 'search',
    });
}

/**
 * AuthService decorator
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function auth() {
    return param({
        type: 'auth',
    });
}

/**
 * HttpRequest decorator
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function httpRequest() {
    return param({
        type: 'httpRequest',
    });
}

/**
 * HttpReply decorator
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function httpReply() {
    return param({
        type: 'httpReply',
    });
}

/**
 * Body decorator
 * @param paramType
 * @returns {(target: object, propertyKey: string, parameterIndex: number) => void}
 */
export function body(paramType?: any) {
    return param({
        paramType,
        type: 'body',
    });
}

export function logger() {
    return param({
        type: 'logger',
    });
}

export function instanceLogger() {
    return param({
        type: 'instanceLogger',
    });
}
