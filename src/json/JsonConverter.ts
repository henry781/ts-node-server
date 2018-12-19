import {JsonConverter as Converter, JsonConverterMapper} from 'tipify';

export class JsonConverter {

    public static CONVERTER = new Converter();

    public static serialize(obj: any): any {
        return this.CONVERTER.serialize(obj);
    }

    public static safeSerialize(obj: any): any {

        if (!obj) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map((e: any) => JsonConverter.safeSerialize(e));

        } else if (obj === Object(obj)) {
            const isMapped = JsonConverterMapper.getMappingForType(obj.constructor);
            if (isMapped) {
                return JsonConverter.serialize(obj);
            } else {
                const result = {};
                for (const key of Object.keys(obj)) {
                    result[key] = JsonConverter.safeSerialize(obj[key]);
                }
                return result;
            }

        } else {
            return obj;
        }
    }

    public static deserialize<T>(json: any, type: any): T {

        try {
            return this.CONVERTER.deserialize<T>(json, type);
        } catch (err) {

            let error = err;
            while (error) {
                error = error.parent;
            }

            throw err;
        }
    }

    public static deserializeArray<T>(json: any, type: any): T[] {
        return this.CONVERTER.deserialize<T[]>(json, [type]);
    }
}
