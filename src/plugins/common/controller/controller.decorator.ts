import 'reflect-metadata';
import {ControllerOptions} from './ControllerOptions';

export const ROUTE_CONTROLLER = Symbol('route:controller');

/***
 * Controller decorator
 * @param {string | ControllerOptions} options
 * @returns {(target: any) => void}
 */
export function controller(options?: string | ControllerOptions) {

    return (target: any) => {

        if (!options) {
            options = {};

        } else if (typeof(options) === 'string') {
            options = {
                url: options as string,
            };
        }

        Reflect.defineMetadata(ROUTE_CONTROLLER, options, target.prototype);
    };
}
