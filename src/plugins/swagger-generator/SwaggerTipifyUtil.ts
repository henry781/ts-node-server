import {JsonConverterMapper} from 'tipify';
import {OpenApiSchema} from './models/OpenApiSchema';

export class SwaggerTipifyUtil {

    public static buildOpenApiSchema(type: any, schemas: { [name: string]: OpenApiSchema }): OpenApiSchema {

        if (type === String) {
            return {type: 'string'};

        } else if (type === Number) {
            return {type: 'number'};

        } else if (type === Boolean) {
            return {type: 'boolean'};

        } else if (Array.isArray(type)) {
            return {
                items: SwaggerTipifyUtil.buildOpenApiSchema(type[0], schemas),
                type: 'array',
            };

        } else {

            const mapping = JsonConverterMapper.getMappingForType(type);

            if (mapping) {

                if (!schemas[type.name]) {

                    const schema: OpenApiSchema = {
                        properties: {},
                        required: [],
                        type: 'object',
                    };

                    for (const property of mapping.properties) {
                        schema.properties[property.serializedName] = SwaggerTipifyUtil.buildOpenApiSchema(property.type, schemas);
                    }

                    if (!mapping.parent) {
                        schemas[mapping.type.name] = schema;

                    } else {
                        const parent = mapping.parent.type;
                        schema[mapping.type.name] = {
                            allOf: [
                                {
                                    $ref: `#components/schemas/${parent.name}`,
                                },
                                schema,
                            ],
                        };
                        SwaggerTipifyUtil.buildOpenApiSchema(parent, schemas);
                    }
                }

                return {$ref: `#components/schemas/${type.name}`};

            } else {
                return {type: 'object'};
            }
        }
    }

}
