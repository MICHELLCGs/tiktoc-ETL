// THE MOVIE DATABASE (TMDB)
const axios = require('axios');

const tmdbAPI = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: {
    api_key: process.env.TMDB_API_KEY,
  },
});

module.exports = tmdbAPI;
