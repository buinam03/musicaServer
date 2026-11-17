/**
 * findAll có phân trang tuỳ chọn.
 * Luôn trả về { items, total } để service/controller xử lý thống nhất.
 */
async function findPaged(Model, options, pagination) {
    if (!pagination) {
        const items = await Model.findAll(options);
        return { items, total: items.length };
    }

    const { rows, count } = await Model.findAndCountAll({
        ...options,
        limit: pagination.limit,
        offset: pagination.offset,
        distinct: true,
    });
    return { items: rows, total: count };
}

module.exports = { findPaged };
