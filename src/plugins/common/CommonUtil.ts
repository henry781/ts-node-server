import {Container} from 'inversify';
import 'reflect-metadata';
import * as _urlJoin from 'url-join';
import {types} from '../../types';
import {Controller, ControllerOptions, ROUTE_CONTROLLER} from './controller/api';
import {MethodOptions, ROUTE_METHOD} from './method/api';
import {ParamOptions, ROUTE_PARAMS} from './param/api';

const urlJoin = _urlJoin;

export interface WireupEndpoint {
    controller: object;
    controllerOptions: ControllerOptions;
    method: string;
    methodOptions: MethodOptions;
    paramsOptions: ParamOptions[];
    url: string;
}

export class CommonUtil {

    /**
     * Build url
     * @param {ControllerOptions} controllerOptions
     * @param {MethodOptions} methodOptions
     * @returns {string}
     */
    public static buildUrl(controllerOptions: ControllerOptions, methodOptions: MethodOptions): string {

        if (controllerOptions.url && methodOptions.url) {
            return urlJoin(controllerOptions.url, methodOptions.url);
        } else if (methodOptions.url) {
            return methodOptions.url;
        } else if (controllerOptions.url) {
            return controllerOptions.url;
        } else {
            return '';
        }
    }

    /**
     * Get all endpoints
     * @param {Container} container
     * @returns {any[]}
     */
    public static getAllEndpoints(container: Container): WireupEndpoint[] {

        const endpoints = [];

        const controllers = container.getAll<Controller>(types.Controller);

        controllers.forEach((controller) => {
            const methods = Object.getOwnPropertyNames(controller.constructor.prototype);

            methods.forEach((method) => {

                const controllerOptions = Reflect.getMetadata(ROUTE_CONTROLLER, controller) as ControllerOptions;
                const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controller, method) as MethodOptions;

                if (!methodOptions) {
                    return;
                }

                const paramsOptions = Reflect.getMetadata(ROUTE_PARAMS, controller, method) as ParamOptions[] || [];
                const url = CommonUtil.buildUrl(controllerOptions, methodOptions);

                endpoints.push({
                    controller,
                    controllerOptions,
                    method,
                    methodOptions,
                    paramsOptions,
                    url,
                });
            });
        });

        return endpoints;
    }
}
