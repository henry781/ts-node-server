import {interfaces} from 'inversify';
import {Instantiable} from 'tipify';
import ServiceIdentifier = interfaces.ServiceIdentifier;

const PROVIDES = Symbol.for('ts-node-server.provides');

const globalSymbols = Object.getOwnPropertySymbols(global);
const providesInitialized = (globalSymbols.indexOf(PROVIDES) > -1);

if (!providesInitialized) {
    global[PROVIDES] = [];
}

export function listProviders(): ProvidesOptions<any>[] {
    return global[PROVIDES];
}

export function provides<T>(options?: ProvidesOptions<T>) {

    return (target: any) => {

        if (!options) {
            options = {};
        }

        if (!options.bind) {
            options.bind = target;
        }

        options.cls = target;
        global[PROVIDES].push(options);
    };
}

export interface ProvidesOptions<T> {
    bind?: ServiceIdentifier<T>;
    cls?: Instantiable<T>;
    targetNamed?: string;
}
