import {JsonConverter as Converter} from 'tipify';

export const jsonConverter = new Converter({
    deserialize: {tryParse: true, keepObjectFieldValues: true},
    serialize: {unsafe: true},
});
