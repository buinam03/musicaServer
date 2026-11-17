/**
 * Bọc controller async để mọi lỗi được chuyển tới error middleware,
 * thay vì phải viết try/catch ở từng controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
