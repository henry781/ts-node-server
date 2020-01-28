import {ObjectId} from 'bson';
import {CustomConverter, JsonConverterError} from 'tipify';
import {jsonConverter} from '../core/jsonConverter';

export class ObjectIdConverter extends CustomConverter<ObjectId> {

    /**
     * Deserialize an object id
     * @param obj
     * @returns {ObjectID}
     */
    public deserialize(obj: any): ObjectId {
        if (!obj || obj instanceof ObjectId) {
            return obj;
        } else if (typeof (obj) === 'string') {
            return new ObjectId(obj);
        } else {
            throw new JsonConverterError('cannot deserialize to object id');
        }
    }

    /**
     * Serialize an object id
     * @param {ObjectID} obj
     * @returns {any}
     */
    public serialize(obj: ObjectId): any {
        if (!obj) {
            return obj;
        } else if (typeof (obj) === 'string') {
            return obj;
        } else {
            return obj.toHexString();
        }
    }
}

jsonConverter.registerConverter(ObjectIdConverter);
