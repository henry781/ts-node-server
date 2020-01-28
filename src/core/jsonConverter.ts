import {JsonConverter as Converter} from 'tipify';

export const jsonConverter = new Converter({tryParse: true, keepObjectFieldValues: true});
