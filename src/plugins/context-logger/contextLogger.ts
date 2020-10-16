import {createNamespace} from 'cls-hooked';
import {FastifyInstance} from 'fastify';
import fp from 'fastify-plugin';

const clsNamespace = createNamespace('app');

export const contextLogger = fp((fastify: FastifyInstance, options, done) => {
    fastify.addHook('onRequest', (request, reply, d) => {
        // req and res are event emitters. We want to access CLS context inside of their event callbacks
        clsNamespace.bind(request);
        clsNamespace.bind(reply);

        clsNamespace.run(() => {
            clsNamespace.set('log', request.log);
            clsNamespace.set('reqId', request.id);
            d();
        });
    });
    done();
});
