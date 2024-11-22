const axios = require('axios');
require('dotenv').config();

if (!process.env.TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is not defined in environment variables.');
}

const tmdbAPI = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
});

// Middleware para incluir siempre la API key
tmdbAPI.interceptors.request.use(config => {
  config.params = config.params || {};
  config.params.api_key = process.env.TMDB_API_KEY; // Agrega la API key a los parámetros
  return config;
});

module.exports = tmdbAPI;
