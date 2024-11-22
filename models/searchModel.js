class MovieModel {
  constructor(data) {
    this.id = data.id;
    this.title = data.title || data.original_title;
    this.overview = data.overview;
    this.release_date = data.release_date;
    this.genre_ids = data.genre_ids;
    this.popularity = data.popularity;
    this.poster_path = data.poster_path;
    this.vote_average = data.vote_average;
    this.vote_count = data.vote_count;
    this.type = "movie"; // Identificador para Elasticsearch
    this.status = "pending"; // Inicialmente pendiente para extracción detallada
  }
}

class PersonModel {
  constructor(data) {
    this.id = data.id;
    this.name = data.name || data.original_name;
    this.known_for_department = data.known_for_department;
    this.popularity = data.popularity;
    this.profile_path = data.profile_path;
    this.known_for = data.known_for.map((item) => ({
      id: item.id,
      title: item.title || item.original_title,
      overview: item.overview,
      release_date: item.release_date,
      media_type: item.media_type,
    }));
    this.type = "person"; // Identificador para Elasticsearch
    this.status = "pending"; // Inicialmente pendiente para extracción detallada
  }
}

module.exports = { MovieModel, PersonModel };
