require('dotenv').config();

/**
 * Cấu hình tập trung từ biến môi trường.
 * Các layer khác chỉ đọc cấu hình qua module này, không đọc process.env trực tiếp.
 */
const env = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT) || 3000,
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:8080',

    db: {
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        host: process.env.DB_HOST,
    },

    jwt: {
        accessSecret: process.env.JWT_SECRET_KEY,
        refreshSecret: process.env.JWT_REFRESH_SECRET,
        accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '4h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
    },
};

env.isProduction = env.nodeEnv === 'production';

module.exports = env;
