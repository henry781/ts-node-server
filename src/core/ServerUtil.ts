import {Container} from 'inversify';
import 'reflect-metadata';
import urlJoin from 'url-join';
import {Types} from '../Types';
import {Controller} from './controller/Controller';
import {ROUTE_CONTROLLER} from './controller/controller.decorator';
import {ControllerOptions} from './controller/ControllerOptions';
import {ROUTE_METHOD} from './method/http.decorator';
import {MethodOptions} from './method/MethodOptions';
import {ROUTE_PARAMS} from './param/param.decorator';
import {ParamOptions} from './param/ParamOptions';

export interface ExploredMethod {
    controller: object;
    controllerOptions: ControllerOptions;
    method: string;
    methodOptions: MethodOptions;
    paramsOptions: ParamOptions[];
    url: string;
}

export class ServerUtil {

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
                const url = ServerUtil.buildUrl(controllerOptions, methodOptions);

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
