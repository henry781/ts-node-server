import {JsonConverterMapper} from 'tipify';
import {OpenApiSchema} from './models/OpenApiSchema';

export class SwaggerTipifyUtil {

    public static buildOpenAPISchema(type: any, schema?: { [name: string]: OpenApiSchema }): { [name: string]: OpenApiSchema } {

        const mapping = JsonConverterMapper.getMappingForType(type);

        if (!mapping) {
            return schema;
        }

        schema = schema || {};

        const objectSchema: OpenApiSchema = {
            type: 'object',
            required: [],
            properties: {},
        };

        for (const property of mapping.properties) {

            if (property.type === String) {
                objectSchema.properties[property.serializedName] = {type: 'string'};

            } else if (property.type === Number) {
                objectSchema.properties[property.serializedName] = {type: 'number'};

            } else if (property.type === Boolean) {
                objectSchema.properties[property.serializedName] = {type: 'boolean'};

            } else if (Array.isArray(property.type)) {
                schema = SwaggerTipifyUtil.buildOpenAPISchema(property.type[0], schema);
                objectSchema.properties[property.serializedName] = {$ref: `#components/schemas/${property.type[0].name}`};
            }
        }

        if (!mapping.parent) {
            schema[mapping.type.name] = objectSchema;

        } else {
            const parent = mapping.parent.type;
            schema[mapping.type.name] = {
                allOf: [
                    {
                        $ref: `#components/schemas/${parent.name}`,
                    },
                    objectSchema,
                ],
            };
            SwaggerTipifyUtil.buildOpenAPISchema(parent, schema);
        }
        return schema;
    }

}
