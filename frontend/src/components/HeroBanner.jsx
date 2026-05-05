import React from "react";

const HeroBanner = ({ movie, isFavorite, onAddFav, onRemoveFav, onDetails }) => {
  if (!movie) return null;

  const trailerUrl =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(movie.title + " bande annonce officielle");

  return (
    <div
      className="hero-banner"
      style={{ backgroundImage: "url(" + movie.poster_path + ")" }}
    >
      <div className="hero-overlay">
        <div className="hero-content">
          <p className="hero-label">🎬 Film du moment</p>
          <h1 className="hero-title">{movie.title}</h1>
          <p className="hero-desc">
            {movie.description ? movie.description.slice(0, 200) + "..." : ""}
          </p>

          <div className="hero-actions">
            <button
              className="hero-btn hero-btn-primary"
              onClick={() => onDetails(movie)}
            >
              Plus d'infos
            </button>

            <button
              className="hero-btn hero-btn-trailer"
              onClick={() => onDetails(movie)}
            >
              Bande annonce
            </button>

            <button
              className={"hero-btn " + (isFavorite ? "hero-btn-remove" : "hero-btn-fav")}
              onClick={() => {
                if (isFavorite) {
                  onRemoveFav(movie.id);
                } else {
                  onAddFav(movie.id);
                }
              }}
            >
              {isFavorite
                ? "🗑️ Retirer des favoris"
                : "❤️ Ajouter aux favoris"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
