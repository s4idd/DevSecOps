import React, { useState, useEffect } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import MovieGrid from "./components/MovieGrid";
import MovieModal from "./components/MovieModal";
import AuthForm from "./components/AuthForm";
import MovieSkeleton from "./components/MovieSkeleton";
import Toast from "./components/Toast";
import HeroBanner from "./components/HeroBanner";

const API_URL = "http://localhost:8000";

const AVATAR_OPTIONS = [
  { id: "avatar1", url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Avery" },
  { id: "avatar2", url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Riley" },
  { id: "avatar3", url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Wyatt" },
  { id: "avatar4", url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Robert" },
  { id: "avatar5", url: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Sarah" },
];

const GENRES = ["Action", "Aventure", "Animation", "Comédie", "Drame", "Horreur", "Science-Fiction", "Thriller"];

function App() {
  const [isLaunching, setIsLaunching] = useState(true);
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "null"));
  const [view, setView] = useState(localStorage.getItem("token") ? "home" : "login");
  const [selectedMovie, setSelectedMovie] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [favAnim, setFavAnim] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const [registerForm, setRegisterForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLaunching(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const showNotification = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const resetSession = () => {
    localStorage.clear();
    setToken("");
    setUser(null);
    setFavorites([]);
    setMovies([]);
    setView("login");
  };

  const triggerFavAnim = () => {
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 400);
  };

  const fetchMovies = async (query = "", genre = "") => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    setLoading(true);
    setMovies([]);

    try {
      const params = new URLSearchParams();

      if (query) params.append("q", query);
      if (genre) params.append("genre", genre);

      params.append("limit", "200");
      params.append("offset", "0");

      const url = `${API_URL}/movies${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        resetSession();
        showNotification("Session expirée, reconnecte-toi.", "error");
        return;
      }

      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showNotification("Erreur lors du chargement des films", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    const currentToken = localStorage.getItem("token");
    if (!currentToken) return;

    try {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });

      if (res.status === 401) {
        resetSession();
        showNotification("Session expirée, reconnecte-toi.", "error");
        return;
      }

      if (res.ok) {
        setFavorites(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user || isLaunching) return;

    const timer = setTimeout(() => {
      fetchMovies(searchTerm, selectedGenre);
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedGenre, user, isLaunching]);

  const completeLogin = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.access_token);
    setUser(data.user);
    setView("home");

    showNotification(`Bienvenue, ${data.user.username} !`);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerForm),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.detail || "Erreur inscription", "error");
        return;
      }

      completeLogin(data);
    } catch (err) {
      showNotification("Erreur serveur", "error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });

      const data = await res.json();

      if (!res.ok) {
        showNotification(data.detail || "Erreur connexion", "error");
        return;
      }

      completeLogin(data);
    } catch (err) {
      showNotification("Erreur serveur", "error");
    }
  };

  const logout = () => {
    resetSession();
    showNotification("Déconnexion réussie", "info");
  };

  const changeAvatar = async (avatarId) => {
    try {
      const res = await fetch(`${API_URL}/me/avatar?avatar_name=${avatarId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        resetSession();
        showNotification("Session expirée, reconnecte-toi.", "error");
        return;
      }

      if (res.ok) {
        const updatedUser = { ...user, avatar: avatarId };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        showNotification("Avatar mis à jour !");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addToFavorites = async (id) => {
    try {
      const res = await fetch(`${API_URL}/favorites/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        resetSession();
        showNotification("Session expirée, reconnecte-toi.", "error");
        return;
      }

      if (res.ok) {
        triggerFavAnim();
        fetchFavorites();
        showNotification("Ajouté aux favoris ❤️");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromFavorites = async (id) => {
    try {
      const res = await fetch(`${API_URL}/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        resetSession();
        showNotification("Session expirée, reconnecte-toi.", "error");
        return;
      }

      if (res.ok) {
        triggerFavAnim();
        fetchFavorites();
        showNotification("Retiré des favoris", "info");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLaunching) {
    return (
      <div className="splash-screen">
        <h1 className="splash-logo">CINESTREAM</h1>
      </div>
    );
  }

  const heroMovie = movies[0] || null;

  return (
    <div className="app">
      <Navbar
        user={user}
        setView={setView}
        view={view}
        onSearch={setSearchTerm}
        token={token}
        favAnim={favAnim}
        avatarOptions={AVATAR_OPTIONS}
        genres={GENRES}
        selectedGenre={selectedGenre}
        onGenreSelect={(g) => {
          setSelectedGenre(g);
          setView("home");
        }}
      />

      <div className="container">
        {view === "home" && user && (
          <>
            {!selectedGenre && !searchTerm && heroMovie && !loading && (
              <HeroBanner
                movie={heroMovie}
                isFavorite={favorites.some((f) => f.id === heroMovie.id)}
                onAddFav={addToFavorites}
                onRemoveFav={removeFromFavorites}
                onDetails={setSelectedMovie}
              />
            )}

            <div className="genre-bar">
              <button
                className={!selectedGenre ? "active" : ""}
                onClick={() => setSelectedGenre("")}
              >
                Tous les films
              </button>

              {GENRES.map((g) => (
                <button
                  key={g}
                  className={selectedGenre === g ? "active" : ""}
                  onClick={() => setSelectedGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>

            <h2>
              {selectedGenre
                ? `Films ${selectedGenre}`
                : searchTerm
                ? `Résultats pour "${searchTerm}"`
                : "À la une"}
            </h2>

            {loading ? (
              <div className="movie-grid">
                {[...Array(8)].map((_, i) => (
                  <MovieSkeleton key={i} />
                ))}
              </div>
            ) : (
              <MovieGrid
                movies={movies}
                favorites={favorites}
                user={user}
                onSelect={setSelectedMovie}
                onAddFav={addToFavorites}
                onRemoveFav={removeFromFavorites}
              />
            )}
          </>
        )}

        {(view === "login" || view === "register") && !user && (
          <AuthForm
            view={view}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            onRegister={handleRegister}
            onLogin={handleLogin}
            setView={setView}
          />
        )}

        {view === "profile" && user && (
          <div className="profile-container">
            <div className="profile-header">
              <div className="avatar-wrapper">
                <img
                  src={AVATAR_OPTIONS.find((a) => a.id === user.avatar)?.url || AVATAR_OPTIONS[0].url}
                  className="profile-avatar-main"
                  alt="Avatar"
                />
                <div className="online-indicator"></div>
              </div>

              <h1>{user.username}</h1>

              <p className="member-since">
                {user.created_at
                  ? `Membre depuis le ${new Date(user.created_at).toLocaleDateString()}`
                  : "Membre depuis aujourd'hui"}
              </p>
            </div>

            <div className="profile-stats">
              <div className="stat-card" onClick={() => setView("favorites")}>
                <span className="material-symbols-outlined">favorite</span>
                <div className="stat-info">
                  <h3>
                    {favorites.length} {favorites.length > 1 ? "favoris" : "favori"}
                  </h3>
                </div>
              </div>

              <div className="stat-card">
                <span className="material-symbols-outlined">verified_user</span>
                <div className="stat-info">
                  <h3>Statut compte : Premium</h3>
                </div>
              </div>
            </div>

            <div className="profile-settings">
              <div className="settings-section">
                <h3>
                  <span className="material-symbols-outlined">person</span> Mon Compte
                </h3>
                <div className="info-row">
                  <label>Email</label>
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="settings-section">
                <h3>
                  <span className="material-symbols-outlined">palette</span> Choisir un Avatar
                </h3>

                <div className="avatar-selection-grid">
                  {AVATAR_OPTIONS.map((av) => (
                    <div
                      key={av.id}
                      className={`avatar-item ${user.avatar === av.id ? "active" : ""}`}
                      onClick={() => changeAvatar(av.id)}
                    >
                      <img src={av.url} alt="option" />

                      {user.avatar === av.id && (
                        <div className="check-badge">
                          <span className="material-symbols-outlined">check</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="logout-action-btn" onClick={logout}>
              <span className="material-symbols-outlined">logout</span> Déconnexion
            </button>
          </div>
        )}

        {view === "favorites" && user && (
          <>
            <h2>Mes films favoris ❤️</h2>

            {favorites.length === 0 ? (
              <p className="no-fav">Aucun favori pour le moment.</p>
            ) : (
              <MovieGrid
                movies={favorites}
                favorites={favorites}
                user={user}
                onSelect={setSelectedMovie}
                onAddFav={addToFavorites}
                onRemoveFav={removeFromFavorites}
              />
            )}
          </>
        )}
      </div>

      <MovieModal
        movie={selectedMovie}
        user={user}
        favorites={favorites}
        onClose={() => setSelectedMovie(null)}
        onAddFav={addToFavorites}
        onRemoveFav={removeFromFavorites}
      />

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}

export default App;
