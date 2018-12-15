import {environment} from '../core/environment';

export const DEFAULT_JWT_AUTH_PROVIDER_OPTIONS: JwtAuthProviderOptions = {
    certificate: environment.AUTH_JWT_CERTIFICATE,
};

export interface JwtAuthProviderOptions {
    certificate?: string;
    authorizationUrl?: string;
}
