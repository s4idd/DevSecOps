import React, { useState } from "react";

const MovieModal = ({
  movie,
  user,
  favorites = [],
  onClose,
  onAddFav,
  onRemoveFav,
}) => {
  const [showTrailer, setShowTrailer] = useState(false);

  if (!movie) return null;

  const isFavorite = favorites.some((fav) => fav.id === movie.id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content big-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>

        {!showTrailer ? (
          <>
            <img
              src={movie.poster_path}
              alt={movie.title}
              className="modal-img"
            />

            <div className="modal-info">
              <h2>{movie.title}</h2>

              {movie.genre && (
                <span className="movie-genre-badge">{movie.genre}</span>
              )}

              <p>{movie.description}</p>

              <div className="modal-actions">
                {movie.trailer_key && (
                  <button
                    className="action-btn trailer-btn"
                    onClick={() => setShowTrailer(true)}
                  >
                    🎬 Bande annonce
                  </button>
                )}

                {user && (
                  <button
                    className={"action-btn " + (isFavorite ? "remove-btn" : "")}
                    onClick={() =>
                      isFavorite
                        ? onRemoveFav(movie.id)
                        : onAddFav(movie.id)
                    }
                  >
                    {isFavorite
                      ? "🗑️ Retirer des favoris"
                      : "❤️ Ajouter aux favoris"}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="trailer-wrapper">
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1`}
              title="Trailer"
              allowFullScreen
            ></iframe>

            <button
              className="action-btn"
              onClick={() => setShowTrailer(false)}
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;
