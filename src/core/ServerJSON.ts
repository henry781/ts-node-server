import {JsonConverter} from 'tipify';

export class ServerJSON {

    private static _tipify = new JsonConverter();


    public static serialize(object: any): any {

        try {
            return ServerJSON.serialize(object);
        } catch (err) {

        }
    }

    public static deserialize<T>(json: any, type: any): T {

    }
}