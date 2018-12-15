import {Util} from './Util';

export const environment = {
    AUTH_BASIC_LOGIN: process.env.AUTH_BASIC_LOGIN || 'login',
    AUTH_BASIC_PASSWORD: process.env.AUTH_BASIC_PASSWORD || 'password',
    AUTH_JWT_CERTIFICATE: process.env.AUTH_JWT_CERTIFICATE || '',
    LOG_LEVEL: process.env.LOG_LEVEL || 'trace',
    LOG_PRETTY: Util.isTrue(process.env.LOG_PRETTY),
    MONGO_DB: process.env.MONGO_DB || 'main',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    PORT: parseInt(process.env.PORT, 10) || 2000,
};
