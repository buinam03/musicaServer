const AppError = require('./AppError');

const isEmpty = (value) => value === undefined || value === null || value === '';

/** Ném 400 nếu thiếu bất kỳ field nào trong `fields`. */
function requireFields(source, fields) {
    const missing = fields.filter((field) => isEmpty(source?.[field]));
    if (missing.length > 0) {
        throw AppError.badRequest(`Missing required fields: ${missing.join(', ')}`, { missing });
    }
}

/** Chuyển giá trị sang id số nguyên dương, ném 400 nếu không hợp lệ. */
function toId(value, name = 'id') {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
        throw AppError.badRequest(`Invalid ${name}`);
    }
    return id;
}

/** Bỏ các key có giá trị undefined (tránh ghi đè cột bằng undefined khi update). */
function compact(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

module.exports = { isEmpty, requireFields, toId, compact };
