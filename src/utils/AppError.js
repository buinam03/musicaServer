/**
 * Lỗi nghiệp vụ có kèm HTTP status.
 * Service ném AppError, error middleware chuyển thành ApiResponse.error.
 */
class AppError extends Error {
    constructor(statusCode, message, errors) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errors = errors;
    }

    static badRequest(message = 'Bad request', errors) {
        return new AppError(400, message, errors);
    }

    static unauthorized(message = 'Unauthorized') {
        return new AppError(401, message);
    }

    static forbidden(message = 'Forbidden') {
        return new AppError(403, message);
    }

    static notFound(message = 'Not found') {
        return new AppError(404, message);
    }

    static conflict(message = 'Conflict') {
        return new AppError(409, message);
    }
}

module.exports = AppError;
