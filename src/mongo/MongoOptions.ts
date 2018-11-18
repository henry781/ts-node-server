import {MongoClientOptions} from 'mongodb';

export interface MongoOptions {
    uri?: string;
    dbName?: string;
    client?: MongoClientOptions;
}
