const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError, DatabaseError } = require('sequelize');
const ApiResponse = require('../utils/ApiResponse');
const AppError = require('../utils/AppError');
const env = require('../config/env');

/** 404 cho route không tồn tại. */
const notFoundHandler = (req, res) => {
    ApiResponse.error(res, 404, `Route ${req.method} ${req.originalUrl} not found`);
};

/** Error handler tập trung: mọi lỗi từ controller/service đều đi qua đây. */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return ApiResponse.error(res, err.statusCode, err.message, err.errors);
    }

    if (err instanceof UniqueConstraintError) {
        return ApiResponse.error(res, 409, 'Resource already exists', err.errors?.map((e) => e.message));
    }

    if (err instanceof ValidationError) {
        return ApiResponse.error(res, 400, 'Validation error', err.errors?.map((e) => e.message));
    }

    if (err instanceof ForeignKeyConstraintError) {
        return ApiResponse.error(res, 400, 'Related resource does not exist');
    }

    // JSON body không hợp lệ (express.json)
    if (err.type === 'entity.parse.failed') {
        return ApiResponse.error(res, 400, 'Invalid JSON body');
    }

    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

    const isDbError = err instanceof DatabaseError;
    return ApiResponse.error(
        res,
        500,
        'Internal server error',
        env.isProduction ? undefined : (isDbError ? err.parent?.sqlMessage || err.message : err.message),
    );
};

module.exports = { notFoundHandler, errorHandler };
