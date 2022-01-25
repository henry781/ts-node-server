import * as chai from 'chai';
import {Container} from 'inversify';
import * as sinon from 'sinon';
import {ControllerTest} from '../test/ControllerTest';
import {types} from '../types';
import {Healthcheck} from './Healthcheck';
import {HealthcheckController} from './HealthcheckController';
import chaiHttp from 'chai-http';

chai.use(chaiHttp);

describe('HealthcheckController', () => {

    class TrueHealthcheck implements Healthcheck {
        public check(): Promise<any> {
            return undefined;
        }

        public getName(): string {
            return '';
        }
    }

    const container = new Container();

    const healthcheck1 = sinon.createStubInstance(TrueHealthcheck);
    healthcheck1.getName.returns('check1');

    const healthcheck2 = sinon.createStubInstance(TrueHealthcheck);
    healthcheck2.getName.returns('check2');

    container.bind(types.Controller).to(HealthcheckController).inSingletonScope();
    container.bind(types.Healthcheck).toConstantValue(healthcheck1);
    container.bind(types.Healthcheck).toConstantValue(healthcheck2);

    const test = new ControllerTest(container);

    /**
     * Check
     */
    describe('check', () => {

        it('should return 200 when all checks are ok', () => {

            healthcheck1.check.resolves('ok1');

            healthcheck2.check.resolves('ok2');

            return chai.request(test.server)
                .get('/healthcheck')
                .send()
                .then((res) => {
                    chai.expect(res.status).equal(200);
                    chai.expect(res.body.healthy).to.be.true;
                    chai.expect(res.body.checks).deep.equal({
                        check1: {
                            healthy: true,
                            result: 'ok1',
                        },
                        check2: {
                            healthy: true,
                            result: 'ok2',
                        },
                    });
                })
                .catch((err) => {
                    throw err;
                });
        });

        it('should return 500 when one check is nok', () => {

            healthcheck1.check.resolves('ok1');

            healthcheck2.check.rejects(new Error('error'));

            return chai.request(test.server)
                .get('/healthcheck')
                .send()
                .then((res) => {
                    chai.expect(res.status).equal(500);
                    chai.expect(res.body.healthy).to.be.false;
                    chai.expect(res.body.checks).deep.equal({
                        check1: {
                            healthy: true,
                            result: 'ok1',
                        },
                        check2: {
                            error: 'error',
                            healthy: false,
                        },
                    });
                })
                .catch((err) => {
                    throw err;
                });
        });
    });

});
