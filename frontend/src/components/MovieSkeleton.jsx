import React from 'react';

const MovieSkeleton = () => {
  return (
    <div className="movie-card skeleton-card">
      <div className="skeleton-img shimmer"></div>
      <div className="skeleton-info">
        <div className="skeleton-title shimmer"></div>
        <div className="skeleton-btn shimmer"></div>
      </div>
    </div>
  );
};

export default MovieSkeleton;