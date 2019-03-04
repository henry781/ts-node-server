import {AuthOptions} from '../plugins/common/method/AuthOptions';

export interface AdminOptions {
    auth: string | string[] | { [provider: string]: AuthOptions };
    inspectorPort?: number;
    inspectorHost?: string;
}
