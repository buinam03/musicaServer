const AppError = require('../utils/AppError');

const DEEZER_GENRE_URL = 'https://api.deezer.com/genre';
const PROVINCES_URL = 'https://provinces.open-api.vn/api/';

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new AppError(502, `Upstream service error (${response.status})`);
    }
    return response.json();
}

/** Danh sách thể loại nhạc từ Deezer. */
const getGenres = async () => {
    const body = await fetchJson(DEEZER_GENRE_URL);
    return body.data || [];
};

/** Danh sách tỉnh/thành Việt Nam. */
const getProvinces = () => fetchJson(PROVINCES_URL);

module.exports = { getGenres, getProvinces };
