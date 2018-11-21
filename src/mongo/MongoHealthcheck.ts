import {inject, injectable} from 'inversify';
import {Types} from '../Types';
import {MongoIsMasterResult, MongoService} from './MongoService';
import {HealthcheckResult, Healthcheck} from '../healthcheck/api';

@injectable()
export class MongoHealthcheck implements Healthcheck {

    constructor(@inject(Types.MongoService) private mongoService: MongoService) {
    }

    public getName(): string {
        return 'mongodb';
    }

    public check(): Promise<HealthcheckResult> {

        return this.mongoService.isMaster()

            .catch(err => {
                return {
                    healthy: false,
                    error: err
                };
            })

            .then((result: MongoIsMasterResult) => {
                const healthy = result.ismaster && !result.readOnly;
                return {
                    healthy,
                    result
                };
            });
    }

}
