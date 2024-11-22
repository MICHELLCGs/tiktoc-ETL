const tmdbAPI = require("../config/tmdb");
const { MovieModel, PersonModel } = require("../models/searchModel");

class SearchServices {
  async searchMovies(query, language = "es-PE", page = 1) {
    const data = await this.fetchFromTMDB("movie", query, language, page);
    return data.map((item) => new MovieModel(item));
  }

  async searchPersons(query, language = "es-PE", page = 1) {
    const data = await this.fetchFromTMDB("person", query, language, page);
    return data.map((item) => new PersonModel(item));
  }

  async fetchFromTMDB(type, query, language, page) {
    try {
      const response = await tmdbAPI.get(`/search/${type}`, {
        params: { query, language, page },
      });
      return response.data.results;
    } catch (error) {
      console.error(`Error fetching ${type} from TMDB:`, error);
      throw error;
    }
  }
}

module.exports = new SearchServices();
