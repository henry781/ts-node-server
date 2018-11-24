import {injectable, multiInject} from 'inversify';
import {controller} from '../plugins/common/controller/api';
import {httpGet} from '../plugins/common/method/api';
import {httpReply} from '../plugins/common/param/api';
import {Reply, Types} from '../Types';
import {Healthcheck} from './Healthcheck';

@injectable()
@controller('/healthcheck')
export class HealthcheckController {

    /**
     * Constructor
     * @param {Healthcheck[]} healthchecks
     */
    constructor(@multiInject(Types.Healthcheck) private  healthchecks: Healthcheck[]) {
    }

    /**
     * Check service is healthy
     * @param {Reply} reply
     * @returns {Promise<fastify.FastifyReply<HttpResponse>>}
     */
    @httpGet()
    public async check(@httpReply() reply: Reply) {

        const result = {
            healthy: true,
            checks: {},
        };

        const checks = Promise.all(
            this.healthchecks.map((check) =>
                check.check()
                    .catch((err) => {
                        result.checks[check.getName()] = {
                            healthy: false,
                            error: err,
                        };
                    })
                    .then((checkResult) => {
                        result.checks[check.getName()] = checkResult;

                    })));

        await checks;

        const status = result.healthy ? 200 : 500;

        return reply.status(status).send(result);
    }
}
