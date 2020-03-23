import {JsonConverter as Converter} from 'tipify';

export const jsonConverter = new Converter({unsafe: true}, {tryParse: true, keepObjectFieldValues: true});
