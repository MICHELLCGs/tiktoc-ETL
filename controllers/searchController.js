const SearchServices = require("../services/searchServices");
const elasticsearch = require("../config/elasticsearch");

class SearchController {
  async fetchAndStore({ type, query, language, page }) {
    try {
      let data;

      // Validar el tipo de búsqueda (movie/person)
      if (type === "movie") {
        data = await SearchServices.searchMovies(query, language, page);
      } else if (type === "person") {
        data = await SearchServices.searchPersons(query, language, page);
      } else {
        throw new Error("Invalid type. Use 'movie' or 'person'.");
      }

      // Filtrar duplicados en Elasticsearch
      const uniqueData = [];
      for (const item of data) {
        const exists = await elasticsearch.exists({
          index: "tmdb",
          id: `${item.type}_${item.id}`,
        });
        if (!exists) uniqueData.push(item);
      }

      // Almacenar los datos únicos en Elasticsearch
      for (const item of uniqueData) {
        await elasticsearch.index({
          index: "tmdb",
          id: `${item.type}_${item.id}`,
          body: item,
        });
      }

      return { message: "Data stored in Elasticsearch", uniqueData };
    } catch (error) {
      console.error("Error in fetchAndStore:", error.message);
      throw error;
    }
  }
}

module.exports = new SearchController();
