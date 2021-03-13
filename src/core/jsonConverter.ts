import {DeserializeOptions, JsonConverter as Converter, SerializeOptions} from 'tipify';

export const deserializeOptions: DeserializeOptions = {tryParse: true, keepObjectFieldValues: false};
export const serializeOptions: SerializeOptions = {unsafe: true};

export const jsonConverter = new Converter({
    deserialize: deserializeOptions,
    serialize: serializeOptions,
});
