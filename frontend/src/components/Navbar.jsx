import React, { useState } from "react";

const Navbar = ({
  user,
  setView,
  view,
  onSearch,
  token,
  favAnim,
  avatarOptions,
  genres,
  onGenreSelect,
  selectedGenre,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileGenres, setShowMobileGenres] = useState(false);

  const currentView = view ? view.toLowerCase() : "";

  const userAvatarUrl = user
    ? avatarOptions.find((a) => a.id === user.avatar)?.url || avatarOptions[0].url
    : null;

  const navigateTo = (targetView) => {
    setView(targetView);
    setIsMenuOpen(false);
    setShowMobileGenres(false);
  };

  // Le logo fait office de bouton Accueil et réinitialise les filtres
  const handleLogoClick = () => {
    if (token) {
      onSearch(""); // Vide la recherche
      onGenreSelect(""); // Réinitialise le genre
      navigateTo("home");
    } else {
      navigateTo("login");
    }
  };

  return (
    <nav className="navbar">
      {/* LOGO (Bouton Accueil invisible) */}
      <div className="logo" onClick={handleLogoClick}>
        <span className="logo-desktop">CINESTREAM</span>
        <span className="logo-mobile">CineS</span>
      </div>

      {/* BARRE DE RECHERCHE */}
      {user && (
        <input
          type="text"
          placeholder="Rechercher un film..."
          className="search-bar"
          onChange={(e) => {
            onSearch(e.target.value);
            if (view !== "home") setView("home");
          }}
        />
      )}

      <div className="nav-right">
        {!user ? (
          /* BOUTONS CONNEXION / INSCRIPTION */
          <div className="auth-btns">
            {currentView !== "login" && (
              <button className="nav-btn" onClick={() => navigateTo("login")}>
                Connexion
              </button>
            )}
            {currentView !== "register" && (
              <button className="nav-btn" onClick={() => navigateTo("register")}>
                Inscription
              </button>
            )}
          </div>
        ) : (
          <>
            {/* VERSION DESKTOP : Uniquement Favoris et Avatar */}
            <div className="nav-desktop-content">
              <button
                className={`fav-icon-btn ${favAnim ? "pulse" : ""}`}
                onClick={() => navigateTo("favorites")}
                title="Mes Favoris"
              >
                <span className="material-symbols-outlined">favorite</span>
              </button>

              <div 
                className="profile-badge" 
                onClick={() => navigateTo("profile")}
                title="Mon Profil"
              >
                <img src={userAvatarUrl} alt="Avatar" />
              </div>
            </div>

            {/* BOUTON BURGER (Mobile) */}
            <button className="burger-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <span className="material-symbols-outlined">
                {isMenuOpen ? "close" : "menu"}
              </span>
            </button>

            {/* MENU DÉROULANT MOBILE */}
            {isMenuOpen && (
              <div className="mobile-dropdown">
                <div className="mobile-item" onClick={() => navigateTo("favorites")}>
                  <span className="material-symbols-outlined">favorite</span> Mes Favoris
                </div>

                <div className="mobile-item" onClick={() => setShowMobileGenres(!showMobileGenres)}>
                  <span className="material-symbols-outlined">grid_view</span> Catégories
                  <span className="material-symbols-outlined arrow">
                    {showMobileGenres ? 'expand_less' : 'expand_more'}
                  </span>
                </div>

                {showMobileGenres && (
                  <div className="mobile-submenu">
                    <div
                      className={`submenu-item ${!selectedGenre ? "active" : ""}`}
                      onClick={() => { onGenreSelect(""); navigateTo("home"); }}
                    >
                      Tous les films
                    </div>
                    {genres.map((g) => (
                      <div
                        key={g}
                        className={`submenu-item ${selectedGenre === g ? "active" : ""}`}
                        onClick={() => { onGenreSelect(g); navigateTo("home"); }}
                      >
                        {g}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mobile-item" onClick={() => navigateTo("profile")}>
                  <span className="material-symbols-outlined">person</span> Mon Profil
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;