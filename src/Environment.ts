export const Environment = {
    PORT: parseInt(process.env.PORT, 10) || 2000,
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    MONGO_DB: process.env.MONGO_DB || 'main',
    AUTH_JWT_CERTIFICATE: process.env.AUTH_JWT_CERTIFICATE || '',
    AUTH_BASIC_LOGIN: process.env.AUTH_BASIC_LOGIN || 'login',
    AUTH_BASIC_PASSWORD: process.env.AUTH_BASIC_PASSWORD || 'password',
};
