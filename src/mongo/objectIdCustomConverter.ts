import {ObjectId} from 'bson';
import {CustomConverter, JsonConverterError} from 'tipify';

export const objectIdCustomConverter: CustomConverter<ObjectId> = {

    deserialize(obj: any): ObjectId {
        if (!obj || obj instanceof ObjectId) {
            return obj;
        } else if (typeof (obj) === 'string') {
            return new ObjectId(obj);
        } else {
            throw new JsonConverterError('cannot deserialize to object id');
        }
    },

    serialize(obj: ObjectId): any {
        if (!obj) {
            return obj;
        } else if (typeof (obj) === 'string') {
            return obj;
        } else {
            return obj.toHexString();
        }
    },
};
