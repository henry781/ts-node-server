import {FastifyInstance} from 'fastify';
import {JsonConverter} from '../../json/JsonConverter';
import * as _flatstr from 'flatstr';

const flatstr = _flatstr;

export class Serializer {

    /**
     * Json serializer
     * @param obj
     * @returns {string}
     */
    public static jsonSerializer(obj: any): string {
        const json = JSON.stringify(JsonConverter.serialize(obj));
        return flatstr(json);
    }

    /**
     * Serializer plugin
     * @param {fastify.FastifyInstance} instance
     * @param {{}} opts
     * @param {(err?: Error) => void} next
     */
    public static getPlugin(instance: FastifyInstance, opts: {}, next: (err?: Error) => void) {

        instance.addHook('preHandler', (request, reply, done) => {
            reply.type('application/json');
            reply.serializer(Serializer.jsonSerializer);
            done();
        });

        next();
    }
}

Serializer.getPlugin[Symbol.for('skip-override')] = true;