import React from 'react';

const AuthForm = ({ view, registerForm, setRegisterForm, loginForm, setLoginForm, onRegister, onLogin }) => {
  return (
    <div className="form-box">
      {view === "register" ? (
        <>
          <h2>Inscription</h2>
          <form onSubmit={onRegister} className="form">
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <button type="submit" className="nav-btn">Créer un compte</button>
          </form>
        </>
      ) : (
        <>
          <h2>Connexion</h2>
          <form onSubmit={onLogin} className="form">
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button type="submit" className="nav-btn">Se connecter</button>
          </form>
        </>
      )}
    </div>
  );
};

export default AuthForm;