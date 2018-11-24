import {OpenApiMethod} from './OpenApiMethod';

export interface OpenApiPath {
    get?: OpenApiMethod;
    post?: OpenApiMethod;
    patch?: OpenApiMethod;
    delete?: OpenApiMethod;
    put?: OpenApiMethod;
}
