import {ControllerOptions} from './controller/ControllerOptions';
import {MethodOptions} from './method/MethodOptions';
import {Container} from 'inversify';
import {Controller} from './controller/Controller';
import {Types} from '../Types';
import {ParamOptions} from './param/ParamOptions';
import {ROUTE_PARAMS} from './param/param.decorator';
import {ROUTE_CONTROLLER} from './controller/controller.decorator';
import {ROUTE_METHOD} from './method/http.decorator';
import * as urlJoin from 'url-join';

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

        controllers.forEach(controller => {
            const methods = Object.getOwnPropertyNames(controller.constructor.prototype);

            methods.forEach(method => {

                const controllerOptions = <ControllerOptions> Reflect.getMetadata(ROUTE_CONTROLLER, controller);
                const methodOptions = <MethodOptions> Reflect.getMetadata(ROUTE_METHOD, controller, method);

                if (!methodOptions) {
                    return;
                }

                const paramsOptions = <ParamOptions[]>Reflect.getMetadata(ROUTE_PARAMS, controller, method);
                const url = ServerUtil.buildUrl(controllerOptions, methodOptions);

                callback({
                    controller: controller,
                    controllerOptions: controllerOptions,
                    method: method,
                    methodOptions: methodOptions,
                    paramsOptions: paramsOptions,
                    url: url
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