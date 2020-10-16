import {createNamespace} from 'cls-hooked';
import {FastifyInstance} from 'fastify';

const clsNamespace = createNamespace('app');

export function loggerContextPlugin(fastify: FastifyInstance, options, done) {
    fastify.addHook('preHandler', (request, reply, d) => {
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
}
