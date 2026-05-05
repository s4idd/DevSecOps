import React, { useState } from "react";

const MovieCard = ({ movie, favorites = [], user, onSelect, onAddFav, onRemoveFav }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const isAlreadyFavorite = favorites.some((fav) => fav.id === movie.id);

  const trailerUrl =
    "https://www.youtube.com/results?search_query=" +
    encodeURIComponent(movie.title + " bande annonce officielle");

  return (
    <div
      className={"movie-card " + (isFlipped ? "flipped" : "")}
      onClick={() => setIsFlipped(!isFlipped)}
      onDoubleClick={() => onSelect && onSelect(movie)}
    >
      <div className="movie-card-inner">

        {/* FACE AVANT */}
        <div className="movie-card-front">
          <img src={movie.poster_path} alt={movie.title} className="movie-img" />
          <div className="movie-title-overlay">
            <h3>{movie.title}</h3>
          </div>
        </div>

        {/* FACE ARRIÈRE */}
        <div className="movie-card-back">
          <h3>{movie.title}</h3>

          {movie.genre && (
            <span className="movie-genre-badge">{movie.genre}</span>
          )}

          <p className="movie-desc-full">{movie.description}</p>

          <div className="card-actions">
            <button
              className="action-btn trailer-btn"
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(movie);
              }}
            >
              🎬 Bande annonce
            </button>

            {user && (
              <button
                className={"action-btn " + (isAlreadyFavorite ? "remove-btn" : "")}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAlreadyFavorite) {
                    onRemoveFav(movie.id);
                  } else {
                    onAddFav(movie.id);
                  }
                }}
              >
                {isAlreadyFavorite
                  ? "🗑️ Retirer des favoris"
                  : "❤️ Ajouter aux favoris"}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MovieCard;
