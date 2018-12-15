import {environment} from '../core/environment';

export const DEFAULT_BASIC_AUTH_PROVIDER_OPTIONS: BasicAuthProviderOptions = {
    [environment.AUTH_BASIC_LOGIN]: {
        password: environment.AUTH_BASIC_PASSWORD,
    },
};

export interface BasicAuthProviderOptions {
    [login: string]: {
        password: string;
        roles?: string[];
    };
}
