const AppError = require('../utils/AppError');
const songArtistRepository = require('../repositories/songArtist.repository');

const getAll = async (pagination) => {
    const result = await songArtistRepository.findAll(pagination);
    if (result.total === 0) throw AppError.notFound('No artist found');
    return result;
};

module.exports = { getAll };
