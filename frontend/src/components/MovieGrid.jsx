import React from "react";
import MovieCard from "./MovieCard";

const MovieGrid = ({ movies, favorites = [], user, onSelect, onAddFav, onRemoveFav }) => {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          favorites={favorites}
          user={user}
          onSelect={onSelect}
          onAddFav={onAddFav}
          onRemoveFav={onRemoveFav}
        />
      ))}
    </div>
  );
};

export default MovieGrid;
