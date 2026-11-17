/**
 * Wrapper chuẩn cho mọi response của API.
 *
 * Response thường:
 * {
 *   "status": 200,
 *   "success": true,
 *   "message": "Success",
 *   "data": { ... }
 * }
 *
 * Response phân trang (thêm "pagination"):
 * {
 *   "status": 200,
 *   "success": true,
 *   "message": "Success",
 *   "data": [ ... ],
 *   "pagination": {
 *     "page": 2, "limit": 10, "totalItems": 53, "totalPages": 6,
 *     "hasNext": true, "hasPrev": true, "nextPage": 3, "prevPage": 1,
 *     "next": "/api/playlist/getAllPlaylist?page=3&limit=10",
 *     "prev": "/api/playlist/getAllPlaylist?page=1&limit=10"
 *   }
 * }
 *
 * Response lỗi:
 * { "status": 404, "success": false, "message": "Song not found", "data": null }
 */
class ApiResponse {
    static send(res, { status = 200, message = 'Success', data = null, pagination, errors }) {
        const body = {
            status,
            success: status < 400,
            message,
            data,
        };
        if (pagination) body.pagination = pagination;
        if (errors !== undefined) body.errors = errors;
        return res.status(status).json(body);
    }

    static ok(res, data = null, message = 'Success') {
        return ApiResponse.send(res, { status: 200, message, data });
    }

    static created(res, data = null, message = 'Created successfully') {
        return ApiResponse.send(res, { status: 201, message, data });
    }

    static error(res, status = 500, message = 'Internal server error', errors) {
        return ApiResponse.send(res, { status, message, data: null, errors });
    }

    /**
     * Trả về danh sách có phân trang.
     * @param {import('express').Request} req   dùng để dựng link next/prev
     * @param {import('express').Response} res
     * @param {{ items: any[], total: number }} result
     * @param {{ page: number, limit: number }} pagination
     * @param {string} [message]
     */
    static paged(req, res, { items, total }, pagination, message = 'Success') {
        return ApiResponse.send(res, {
            status: 200,
            message,
            data: items,
            pagination: buildPaginationMeta(req, total, pagination),
        });
    }

    /**
     * Dùng cho các endpoint danh sách hỗ trợ phân trang tuỳ chọn:
     * - client gửi ?page / ?limit  -> response có "pagination"
     * - không gửi                   -> trả toàn bộ danh sách như response thường
     */
    static list(req, res, result, pagination, message = 'Success') {
        if (pagination) return ApiResponse.paged(req, res, result, pagination, message);
        return ApiResponse.ok(res, result.items, message);
    }
}

function buildPaginationMeta(req, totalItems, { page, limit }) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    const nextPage = hasNext ? page + 1 : null;
    const prevPage = hasPrev ? Math.min(page - 1, totalPages) : null;

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNext,
        hasPrev,
        nextPage,
        prevPage,
        next: nextPage ? buildPageUrl(req, nextPage, limit) : null,
        prev: prevPage ? buildPageUrl(req, prevPage, limit) : null,
    };
}

function buildPageUrl(req, page, limit) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
        if (key === 'page' || key === 'limit') continue;
        if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
        else if (value !== undefined) params.append(key, value);
    }
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `${req.baseUrl}${req.path}?${params.toString()}`;
}

module.exports = ApiResponse;
