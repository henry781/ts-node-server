import {Healthcheck} from '../healthcheck/Healthcheck';
import {inject, injectable} from 'inversify';
import {MongoService} from './MongoService';
import {Types} from '../../Types';

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