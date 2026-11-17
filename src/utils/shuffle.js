/** Fisher-Yates shuffle, trả về mảng mới (không thay đổi mảng gốc). */
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/** Loại bỏ phần tử trùng theo id, giữ phần tử xuất hiện đầu tiên. */
function uniqueById(items) {
    return [...new Map(items.map((item) => [item.id, item])).values()];
}

module.exports = { shuffle, uniqueById };
