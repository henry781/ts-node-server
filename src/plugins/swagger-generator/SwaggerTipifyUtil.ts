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

                if (!schemas[mapping.type.name]) {

                    const schema: OpenApiSchema = {
                        properties: {},
                        type: 'object',
                    };

                    if (!mapping.parent) {
                        schemas[mapping.type.name] = schema;

                    } else {
                        const parent = mapping.parent.type;
                        schemas[mapping.type.name] = {
                            allOf: [
                                {
                                    $ref: `#/components/schemas/${parent.name}`,
                                },
                                schema,
                            ],
                        };
                        SwaggerTipifyUtil.buildOpenApiSchema(parent, schemas);
                    }

                    for (const property of mapping.properties) {
                        schema.properties[property.serializedName] = SwaggerTipifyUtil.buildOpenApiSchema(property.type, schemas);
                    }
                }

                return {$ref: `#/components/schemas/${type.name}`};

            } else {
                return {type: 'object'};
            }
        }
    }

}
