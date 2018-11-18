import {SwaggerPathConf} from './SwaggerPathConf';

export interface SwaggerConf {
    openapi?: '3.0.0';

    info?: {
        version: string,
        title: string,
        license: { [name: string]: string },
    };

    servers?: Array<{
        url: string,
    }>;

    paths?: { [name: string]: SwaggerPathConf };

    components?: {};
}
