import {CoreOptions} from 'request';
import {Principal} from '../auth/Principal';

type converter = (obj: any) => any;

export interface RequestOptions<T> {

    principal?: Principal;
    token?: string;
    httpOptions?: CoreOptions;
    serializer?: boolean | converter;
    deserializer?: boolean | converter;
    body?: any;
    expectedStatus?: number;
    deserializeType?: any;
}
