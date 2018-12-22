import {environment} from '../core/environment';

export const DEFAULT_JWT_AUTH_PROVIDER_OPTIONS: JwtAuthProviderOptions = {
    application: environment.AUTH_JWT_APPLICATION,
    authorizationUrl: environment.AUTH_JWT_AUTHORIZATION_URL,
    certificate: environment.AUTH_JWT_CERTIFICATE,
};

export interface JwtAuthProviderOptions {
    certificate: string;
    authorizationUrl: string;
    application: string;
}
