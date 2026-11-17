const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Đọc ?page & ?limit từ query.
 * Trả về null nếu client không yêu cầu phân trang (giữ tương thích với frontend cũ).
 *
 * @returns {{ page: number, limit: number, offset: number } | null}
 */
function parsePagination(query = {}, { defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT } = {}) {
    if (query.page === undefined && query.limit === undefined) return null;

    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));

    return { page, limit, offset: (page - 1) * limit };
}

/**
 * Phân trang một mảng đã có sẵn trong bộ nhớ (dùng khi dữ liệu phải xử lý sau query).
 */
function paginateArray(array, pagination) {
    if (!pagination) return { items: array, total: array.length };
    return {
        items: array.slice(pagination.offset, pagination.offset + pagination.limit),
        total: array.length,
    };
}

module.exports = { parsePagination, paginateArray };
