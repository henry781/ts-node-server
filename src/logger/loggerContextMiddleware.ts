import {createNamespace} from 'cls-hooked';

const clsNamespace = createNamespace('app');

export function loggerContextMiddleware(request, reply, next) {
    // req and res are event emitters. We want to access CLS context inside of their event callbacks
    clsNamespace.bind(request);
    clsNamespace.bind(reply);

    clsNamespace.run(() => {
        clsNamespace.set('log', request.log);
        clsNamespace.set('reqId', request.id);
        next();
    });
}
