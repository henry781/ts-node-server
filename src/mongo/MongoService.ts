import {inject, injectable} from 'inversify';
import mixin from 'mixin-deep';
import {
    CollectionInsertOneOptions,
    Db,
    FindOneOptions,
    InsertOneWriteOpResult,
    Logger as MongoLogger,
    MongoClient,
    MongoError,
} from 'mongodb';
import {Logger} from 'pino';
import {JsonConverter} from '../json/JsonConverter';
import {Types} from '../Types';
import {MONGO_COLLECTION} from './collection.decorator';
import {MongoOptions} from './MongoOptions';

const DEFAULT_MONGO_OPTIONS: MongoOptions = {
    uri: process.env.MONGO_URL || 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB || 'main',
    client: {
        reconnectTries: 60,
        reconnectInterval: 1000,
        useNewUrlParser: true,
    },
};

export interface MongoIsMasterResult {
    ismaster: boolean;
    readOnly: boolean;
    ok: number;
}

@injectable()
export class MongoService {

    /**
     * Get collection for a type
     * @param type
     * @returns {string}
     */
    public static getCollectionForType(type: any): string {
        return Reflect.getMetadata(MONGO_COLLECTION, type.prototype);
    }

    /**
     *
     * @param obj
     * @returns {string}
     */
    public static getCollection(obj: any): string {
        return MongoService.getCollectionForType(obj.constructor);
    }

    private logger: Logger;

    private client: MongoClient;
    private db: Db;
    private error: Error;

    /**
     * Constructor
     * @param {P.Logger} logger
     */
    constructor(@inject(Types.Logger) logger: Logger) {
        this.logger = logger.child({module: 'MongoService'});
    }

    /**
     * Connect to mongodb
     * @param {MongoOptions} options
     * @returns {Promise<void>}
     */
    public async connect(options: MongoOptions): Promise<void> {

        const logger = this.logger.child({method: 'connect'});

        options = mixin(DEFAULT_MONGO_OPTIONS, options);

        MongoLogger.setCurrentLogger((msg, state) => {
            this.logger.debug(msg, state);
        });

        try {
            this.client = await MongoClient.connect(options.uri, options.client);
            this.db = this.client.db(options.dbName);
            logger.info('connected to mongodb successfully');
        } catch (err) {
            logger.error('failed to connect to mongodb', err);
            this.error = err;
        }
    }

    /**
     * Do something wrapper
     * @param {() => T} action
     * @returns {T}
     */
    public doAction<T>(action: () => T): T {

        if (this.error) {
            throw this.error;

        } else if (!this.client || !this.db) {
            throw new MongoError('database is not ready');

        } else {
            return action();
        }
    }

    /**
     * Is mongo master
     * @returns {Promise<MongoIsMasterResult>}
     */
    public isMaster(): Promise<MongoIsMasterResult> {

        return this.doAction(
            () => this.db.command({isMaster: 1}));
    }

    /**
     * Find one document
     * @param type
     * @param {object} query
     * @param {FindOneOptions} options
     * @returns {Promise<T>}
     */
    public findOne<T>(type: any, query?: object, options?: FindOneOptions): Promise<T> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this.db.collection(collection).findOne(query, options))
            .then((json) => JsonConverter.deserialize<T>(json, type));
    }

    /**
     * Insert one document
     * @param obj
     * @param {CollectionInsertOneOptions} options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    public insertOne(obj: any, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult> {

        const json = JsonConverter.serialize(obj);
        const collection = MongoService.getCollection(obj);

        return this.doAction(
            () => this.db.collection(collection).insertOne(json, options));
    }

    public close() {
        return this.client.close();
    }
}
