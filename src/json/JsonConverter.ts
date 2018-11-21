import {JsonConverter as Converter} from 'tipify';

export class JsonConverter {

    public static CONVERTER = new Converter();


    public static serialize(obj: any): any {
        return this.CONVERTER.serialize(obj);
    }

    public static deserialize<T>(json: any, type: any): T {

        try {
            return this.CONVERTER.deserialize<T>(json, type);
        } catch (err) {

            let error = err;
            while (error) {
                console.log(error);
                error = error.parent;
            }

            throw err;
        }
    }

    public static deserializeArray<T>(json: any, type: any): T[] {
        return this.CONVERTER.deserialize<T[]>(json, [type]);
    }
}