import {OpenApiPath} from './OpenApiPath';
import {OpenApiSchema} from './OpenApiSchema';

export const OPENAPI_DEFAULT_CONFIGURATION: OpenApiConf = {
    openapi: '3.0.0',
};

export interface OpenApiConf {
    openapi?: '3.0.0';

    info?: {
        contact?: {
            name?: string,
            email?: string,
            url?: string,
        },
        description?: string,
        version?: string,
        title?: string,
        license?: { [name: string]: string },
    };

    servers?: {
        url: string,
    }[];

    paths?: { [name: string]: OpenApiPath };

    components?: {
        schemas?: { [name: string]: OpenApiSchema };
        securitySchemes?: object;
    };
}
