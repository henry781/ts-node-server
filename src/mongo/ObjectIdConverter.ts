import {JsonCustomConverter, jsonCustomConverter, JsonConverterError} from 'tipify';
import {ObjectId} from 'bson';

@jsonCustomConverter()
export class ObjectIdConverter extends JsonCustomConverter<ObjectId> {

    public deserialize(obj: any): ObjectId {
        if (!obj || obj instanceof ObjectId) {
            return obj;
        } else if (typeof(obj) === 'string') {
            return new ObjectId(obj);
        } else {
            throw new JsonConverterError('cannot deserialize to object id');
        }
    }

    public serialize(obj: ObjectId): any {
        if (!obj) {
            return obj;
        } else {
            obj.toHexString();
        }
    }
}
