import {OpenApiPath} from './OpenApiPath';
import {OpenApiSchema} from './OpenApiSchema';

export interface OpenApiConf {
    openapi?: '3.0.0';

    info?: {
        version: string,
        title: string,
        license: { [name: string]: string },
    };

    servers?: Array<{
        url: string,
    }>;

    paths?: { [name: string]: OpenApiPath };

    components?: {
        schemas: { [name: string]: OpenApiSchema };
    };
}
