import {QuerySearch} from '@henry781/querysearch';
import {inject, injectable} from 'inversify';
import {
    CollectionAggregationOptions,
    CollectionInsertManyOptions,
    CollectionInsertOneOptions,
    Db,
    DeleteWriteOpResultObject,
    FindOneOptions,
    InsertOneWriteOpResult,
    InsertWriteOpResult,
    Logger as MongoLogger,
    MongoClient,
    MongoClientOptions,
    MongoCountPreferences,
    MongoError,
    ReplaceOneOptions,
    ReplaceWriteOpResult,
    UpdateManyOptions,
    UpdateOneOptions,
    UpdateWriteOpResult,
} from 'mongodb';
import {Logger} from 'pino';
import {arrayOf, DeserializeOptions, SerializeOptions} from 'tipify';
import {environment} from '../core/environment';
import {deserializeOptions, jsonConverter, serializeOptions} from '../core/jsonConverter';
import {types} from '../types';
import {MONGO_COLLECTION} from './collection.decorator';

export interface MongoIsMasterResult {
    ismaster: boolean;
    readOnly: boolean;
    ok: number;
}

const mongoDeserializeOptions: DeserializeOptions = {...deserializeOptions, context: 'mongo'};
const mongoSerializeOptions: SerializeOptions = {...serializeOptions, context: 'mongo'};

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
    private error: Error;

    private _db: Db;

    get db(): Db {
        return this._db;
    }

    /**
     * Constructor
     * @param {P.Logger} logger
     */
    constructor(@inject(types.Logger) logger: Logger) {
        this.logger = logger.child({module: 'MongoService'});
    }

    /**
     * Connect to mongodb
     * @param {MongoOptions} options
     * @returns {Promise<void>}
     */
    public async connect(options = DEFAULT_MONGO_OPTIONS): Promise<void> {

        const logger = this.logger.child({method: 'connect'});

        MongoLogger.setCurrentLogger((msg, state) => {
            this.logger.debug(msg, state);
        });

        try {
            this.client = await MongoClient.connect(options.uri, options.client);
            this._db = this.client.db(options.dbName);
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

        } else if (!this.client || !this._db) {
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
            () => this._db.command({isMaster: 1}));
    }

    /**
     * Find one document
     * @param type
     * @param {object} query
     * @param {FindOneOptions} options
     * @returns {Promise<T>}
     */
    public findOne<T>(type: any, query?: object, options?: FindOneOptions<T>): Promise<T> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).findOne<any>(query, options))
            .then((json) => jsonConverter.deserialize<T>(json, type, mongoDeserializeOptions));
    }

    /**
     * Insert one document
     * @param obj
     * @param {CollectionInsertOneOptions} options
     * @returns {Promise<InsertOneWriteOpResult>}
     */
    public insertOne(obj: any, options?: CollectionInsertOneOptions): Promise<InsertOneWriteOpResult<any>> {

        const json = jsonConverter.serialize(obj, undefined, mongoSerializeOptions);
        const collection = MongoService.getCollection(obj);

        return this.doAction(
            () => this._db.collection(collection).insertOne(json, options));
    }

    /**
     * Insert many
     * @param type
     * @param obj
     * @param {CollectionInsertManyOptions} options
     * @returns {Promise<InsertWriteOpResult>}
     */
    public insertMany(type: any, obj: any, options?: CollectionInsertManyOptions): Promise<InsertWriteOpResult<any>> {

        const json = jsonConverter.serialize(obj, undefined, mongoSerializeOptions);
        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).insertMany(json, options));
    }

    /**
     * Find documents
     * @param type
     * @param query
     * @param sort
     * @param limit
     * @param offset
     */
    public find<T>(type: any, query: object = {}, sort: object = {}, limit?: number, offset?: number): Promise<T[]> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => {
                const cursor = this._db.collection(collection)
                    .find(query)
                    .sort(sort);

                if (limit !== undefined) {
                    cursor.limit(limit);
                }

                if (offset !== undefined) {
                    cursor.skip(offset);
                }

                return cursor.toArray();
            })
            .then((json) => jsonConverter.deserialize<T[]>(json, arrayOf(type), mongoDeserializeOptions));
    }

    /**
     * Aggregate documents
     * @param type
     * @param pipeline
     * @param options
     * @param outputType
     */
    public aggregate<T>(type: any,
                        pipeline?: object[],
                        options?: CollectionAggregationOptions,
                        outputType = type): Promise<T[]> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => {
                const cursor = this._db.collection(collection)
                    .aggregate(pipeline, options);

                return cursor.toArray();
            })
            .then((json) => outputType ? jsonConverter.deserialize<T[]>(json, arrayOf(outputType), mongoDeserializeOptions) : json);
    }

    /**
     * Search documents
     * @param type
     * @param search
     */
    public search<T>(type: any, search: QuerySearch): Promise<T[]> {

        return this.find<T>(type, search.filter, search.sort, search.limit, search.offset);
    }

    /**
     * Delete one
     * @param type
     * @param {object} query
     * @returns {Promise<DeleteWriteOpResultObject>}
     */
    public deleteOne(type: any, query: object = {}): Promise<DeleteWriteOpResultObject> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).deleteOne(query));
    }

    /**
     * Delete many
     * @param type
     * @param query
     */
    public deleteMany(type: any, query: object = {}): Promise<DeleteWriteOpResultObject> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).deleteMany(query));
    }

    /**
     * Replace one
     * @param type
     * @param query
     * @param obj
     * @param options
     */
    public replaceOne(type: any, query: object = {}, obj: object = {}, options?: ReplaceOneOptions): Promise<ReplaceWriteOpResult> {

        const collection = MongoService.getCollectionForType(type);
        const document = jsonConverter.serialize(obj, undefined, serializeOptions);

        return this.doAction(
            () => this._db.collection(collection).replaceOne(query, document, options));
    }

    /**
     * Update one
     * @param type
     * @param {object} query
     * @param {object} update
     * @param {UpdateOneOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    public updateOne(type: any, query: object = {}, update: object = {}, options?: UpdateOneOptions): Promise<UpdateWriteOpResult> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).updateOne(query, update, options));
    }

    /**
     * Update many
     * @param type
     * @param {object} query
     * @param {object} update
     * @param {UpdateManyOptions} options
     * @returns {Promise<UpdateWriteOpResult>}
     */
    public updateMany(type: any, query: object = {}, update: object = {}, options?: UpdateManyOptions): Promise<UpdateWriteOpResult> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).updateMany(query, update, options));
    }

    /**
     * Count documents
     * @param type
     * @param {object} query
     * @param {MongoCountPreferences} options
     * @returns {Promise<number>}
     */
    public count(type: any, query: object = {}, options ?: MongoCountPreferences): Promise<number> {

        const collection = MongoService.getCollectionForType(type);

        return this.doAction(
            () => this._db.collection(collection).countDocuments(query, options));
    }

    public close() {
        return this.client.close();
    }
}

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
