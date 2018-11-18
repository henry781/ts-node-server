import {SwaggerMethodConf} from "./SwaggerMethodConf";

export interface SwaggerPathConf {
    get?: SwaggerMethodConf;
    post?: SwaggerMethodConf;
    patch?: SwaggerMethodConf;
    delete?: SwaggerMethodConf;
    put?: SwaggerMethodConf;
}