import {decorate, injectable} from 'inversify';
import 'reflect-metadata';
import {types} from '../../../types';
import {provides} from '../provides.decorator';
import {ControllerOptions} from './ControllerOptions';

export const ROUTE_CONTROLLER = Symbol('route:controller');

/**
 * Controller decorator
 * @param {string | ControllerOptions} options
 * @returns {(target: any) => void}
 */
export function controller(options?: string | ControllerOptions) {

    return (target: any) => {

        decorate(injectable(), target);

        if (!options) {
            options = {};

        } else if (typeof (options) === 'string') {
            options = {
                url: options as string,
            };
        }

        if (options.provides !== false) {
            decorate(provides({bind: types.Controller}), target);
        }

        Reflect.defineMetadata(ROUTE_CONTROLLER, options, target.prototype);
    };
}
