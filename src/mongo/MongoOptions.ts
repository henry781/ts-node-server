import {MongoClientOptions} from 'mongodb';
import {environment} from '../core/environment';

export const DEFAULT_MONGO_OPTIONS: MongoOptions = {
    client: {
        reconnectInterval: 1000,
        reconnectTries: 60,
        useNewUrlParser: true,
    },
    dbName: environment.MONGO_DB,
    uri: environment.MONGO_URL,
};

export interface MongoOptions {
    uri?: string;
    dbName?: string;
    client?: MongoClientOptions;
}
