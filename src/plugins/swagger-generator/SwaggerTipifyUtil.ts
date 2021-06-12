import {
    arrayConverter,
    ArrayConverterArgs,
    booleanConverter,
    JsonConverterMapper,
    normalizeConverterAndArgs,
    numberConverter,
    objectConverter,
    ObjectConverterArgs,
    stringConverter,
    TypeOrConverter,
} from 'tipify';
import {OpenApiSchema} from './models/OpenApiSchema';

export class SwaggerTipifyUtil {

    public static buildOpenApiSchema(type: TypeOrConverter,
                                     schemas: { [name: string]: OpenApiSchema }): OpenApiSchema {

        const c = normalizeConverterAndArgs(type);

        if (c.converter === stringConverter) {
            return {type: 'string'};

        } else if (c.converter === numberConverter) {
            return {type: 'number'};

        } else if (c.converter === booleanConverter) {
            return {type: 'boolean'};

        } else if (c.converter === arrayConverter) {
            if (!c.args) {
                return {type: 'array'};
            }

            const args = (c.args as ArrayConverterArgs);
            return {
                items: SwaggerTipifyUtil.buildOpenApiSchema(
                    {converter: args.itemConverter, args: args.itemConverterArgs},
                    schemas),
                type: 'array',
            };

        } else if (c.converter === objectConverter) {

            if (!c.args) {
                return {type: 'object'};
            }

            const objectType = (c.args as ObjectConverterArgs).type;
            const mapping = JsonConverterMapper.getMappingForType(objectType);

            if (!mapping) {
                return {type: 'object'};
            }

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
                    schema.properties[property.serializedName] = SwaggerTipifyUtil.buildOpenApiSchema(
                        {converter: property.converter, args: property.args},
                        schemas);
                }
            }

            return {$ref: `#/components/schemas/${objectType.name}`};
        }
    }

}
