import {Container} from 'inversify';
import 'reflect-metadata';
import urlJoin from 'url-join';
import {Types} from '../../Types';
import {Controller} from './controller/api';
import {ROUTE_CONTROLLER, ControllerOptions} from './controller/api';
import {ROUTE_METHOD, MethodOptions} from './method/api';
import {ROUTE_PARAMS, ParamOptions} from './param/api';

export interface ExploredMethod {
    controller: object;
    controllerOptions: ControllerOptions;
    method: string;
    methodOptions: MethodOptions;
    paramsOptions: ParamOptions[];
    url: string;
}

export class CommonUtil {

    public static exploreMethods(
        container: Container,
        callback: (exploredMethod: ExploredMethod) => void) {

        const controllers = container.getAll<Controller>(Types.Controller);

        controllers.forEach((controller) => {
            const methods = Object.getOwnPropertyNames(controller.constructor.prototype);

            methods.forEach((method) => {

                const controllerOptions = Reflect.getMetadata(ROUTE_CONTROLLER, controller) as ControllerOptions;
                const methodOptions = Reflect.getMetadata(ROUTE_METHOD, controller, method) as MethodOptions;

                if (!methodOptions) {
                    return;
                }

                const paramsOptions = Reflect.getMetadata(ROUTE_PARAMS, controller, method) as ParamOptions[];
                const url = CommonUtil.buildUrl(controllerOptions, methodOptions);

                callback({
                    controller,
                    controllerOptions,
                    method,
                    methodOptions,
                    paramsOptions,
                    url,
                });
            });
        });
    }

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
}
