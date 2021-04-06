import {tryParseBoolean} from 'tipify';

export const environment = {
    AUTH_BASIC_LOGIN: process.env.AUTH_BASIC_LOGIN || 'login',
    AUTH_BASIC_PASSWORD: process.env.AUTH_BASIC_PASSWORD || 'password',
    AUTH_JWT_APPLICATION: process.env.AUTH_JWT_APPLICATION || '',
    AUTH_JWT_AUTHORIZATION_URL: process.env.AUTH_JWT_AUTHORIZATION_URL || '',
    AUTH_JWT_CERTIFICATE: process.env.AUTH_JWT_CERTIFICATE || '',
    AUTH_JWKS_URI: process.env.AUTH_JWKS_URI || '',
    LOG_LEVEL: process.env.LOG_LEVEL || 'trace',
    LOG_PRETTY: process.env.LOG_PRETTY ? tryParseBoolean(process.env.LOG_PRETTY) : false,
    MONGO_DB: process.env.MONGO_DB || 'main',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    PORT: parseInt(process.env.PORT, 10) || 2000,
    SWAGGER_PATH: process.env.SWAGGER_PATH,
};
