import {injectable, multiInject, optional} from 'inversify';
import {controller} from '../plugins/common/controller/api';
import {httpGet} from '../plugins/common/method/api';
import {httpReply} from '../plugins/common/param/api';
import {Reply, types} from '../types';
import {Healthcheck} from './Healthcheck';

@injectable()
@controller('/healthcheck')
export class HealthcheckController {

    /**
     * Constructor
     * @param {Healthcheck[]} healthchecks
     */
    constructor(@multiInject(types.Healthcheck) @optional() private  healthchecks: Healthcheck[] = []) {
    }

    /**
     * Check service is healthy
     * @param {Reply} reply
     * @returns {Promise<fastify.FastifyReply<HttpResponse>>}
     */
    @httpGet()
    public async check(@httpReply() reply: Reply) {

        const result = {
            checks: {},
            healthy: true,
        };

        const checks = Promise.all(
            this.healthchecks.map((check) =>
                check.check()
                    .then((checkResult) => {
                        result.checks[check.getName()] = {
                            healthy: true,
                            result: checkResult,
                        };
                    })
                    .catch((err) => {
                        result.healthy = false;
                        result.checks[check.getName()] = {
                            error: err.message,
                            healthy: false,
                        };
                    })));

        await checks;

        const status = result.healthy ? 200 : 500;

        return reply.status(status).send(result);
    }
}
