import {inject, injectable} from 'inversify';
import {Healthcheck} from '../healthcheck/api';
import {types} from '../types';
import {MongoIsMasterResult, MongoService} from './MongoService';

@injectable()
export class MongoHealthcheck implements Healthcheck {

    /**
     * Constructor
     * @param {MongoService} mongoService
     */
    constructor(@inject(types.MongoService) private mongoService: MongoService) {
    }

    /**
     * Get healthcheck name
     * @returns {string}
     */
    public getName(): string {
        return 'mongodb';
    }

    /**
     * Check
     * @returns {Promise<any>}
     */
    public check(): Promise<any> {

        return this.mongoService.isMaster()

            .then((result: MongoIsMasterResult) => {

                if (!result.ismaster) {
                    throw new Error('db is not master');
                }

                if (!result.readOnly) {
                    throw new Error('db is readonly');
                }

                return result;
            });
    }
}
