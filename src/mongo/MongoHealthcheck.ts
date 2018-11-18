import {inject, injectable} from 'inversify';
import {Healthcheck} from '../healthcheck/Healthcheck';
import {Types} from '../Types';
import {MongoService} from './MongoService';

@injectable()
export class MongoHealthcheck implements Healthcheck {

    constructor(@inject(Types.MongoService) private mongoService: MongoService) {
    }

    public async check(): Promise<{ healthy: true; content?: object }> {
        return {healthy: true};
    }

    public getName(): string {
        return 'mongodb';
    }
}
