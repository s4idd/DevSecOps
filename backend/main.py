import os
import time
import requests
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import OperationalError
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt, JWTError

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
SECRET_KEY = os.getenv("SECRET_KEY", "secret-dev")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))
ALGORITHM = "HS256"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(Text)
    poster_path = Column(String(255))
    genre = Column(String(100))
    trailer_key = Column(String(255))


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar = Column(String(255), default="avatar1")
    created_at = Column(DateTime, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movies.id"), nullable=False)


class RegisterSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


for i in range(5):
    try:
        Base.metadata.create_all(bind=engine)
        break
    except OperationalError:
        time.sleep(2)


app = FastAPI()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],       
    allow_credentials=True,
    allow_methods=["*"],             # Autorise GET, POST, OPTIONS, etc.
    allow_headers=["*"],             # Autorise tous les headers (Authorization, Content-Type)
    expose_headers=["*"]
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def clean_password(password: str):
    return password.encode("utf-8")[:72]


def hash_password(password: str):
    return bcrypt.hashpw(
        clean_password(password),
        bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(password: str, hashed_password: str):
    return bcrypt.checkpw(
        clean_password(password),
        hashed_password.encode("utf-8")
    )

def create_access_token(user_id: int):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalide ou expiré",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if user_id is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()

    if not user:
        raise credentials_exception

    return user


GENRE_MAP = {
    28: "Action",
    12: "Aventure",
    16: "Animation",
    35: "Comédie",
    80: "Crime",
    99: "Documentaire",
    18: "Drame",
    10751: "Famille",
    14: "Fantastique",
    36: "Histoire",
    27: "Horreur",
    10402: "Musique",
    9648: "Mystère",
    10749: "Romance",
    878: "Science-Fiction",
    53: "Thriller",
    10752: "Guerre",
    37: "Western",
}


def seed_database(db: Session):
    if db.query(Movie).first():
        return

    for page in range(1, 11):
        url = (
            "https://api.themoviedb.org/3/movie/popular"
            f"?api_key={TMDB_API_KEY}&language=fr-FR&page={page}"
        )

        response = requests.get(url)
        data = response.json()

        for item in data.get("results", []):
            genre_id = item.get("genre_ids")[0] if item.get("genre_ids") else None
            genre_name = GENRE_MAP.get(genre_id, "Inconnu")

            tmdb_id = item.get("id")
            trailer_key = None

            if tmdb_id:
                videos_url = (
                    f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos"
                    f"?api_key={TMDB_API_KEY}&language=fr-FR"
                )

                videos_response = requests.get(videos_url)
                videos_data = videos_response.json()

                trailer = next(
                    (
                        video for video in videos_data.get("results", [])
                        if video.get("site") == "YouTube"
                        and video.get("type") == "Trailer"
                    ),
                    None,
                )

                if not trailer:
                    videos_url = (
                        f"https://api.themoviedb.org/3/movie/{tmdb_id}/videos"
                        f"?api_key={TMDB_API_KEY}&language=en-US"
                    )

                    videos_response = requests.get(videos_url)
                    videos_data = videos_response.json()

                    trailer = next(
                        (
                            video for video in videos_data.get("results", [])
                            if video.get("site") == "YouTube"
                            and video.get("type") == "Trailer"
                        ),
                        None,
                    )

                trailer_key = trailer.get("key") if trailer else None

            new_movie = Movie(
                title=item.get("title"),
                description=item.get("overview"),
                poster_path=(
                    f"https://image.tmdb.org/t/p/w500{item.get('poster_path')}"
                    if item.get("poster_path")
                    else None
                ),
                genre=genre_name,
                trailer_key=trailer_key,
            )

            db.add(new_movie)

    db.commit()


@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/movies")
def get_movies(
    genre: str = None,
    q: str = None,
    limit: int = 40,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Movie)

    if q:
        query = query.filter(Movie.title.ilike(f"%{q}%"))

    if genre:
        query = query.filter(Movie.genre == genre)

    return query.offset(offset).limit(limit).all()


@app.get("/movies/search")
def search(
    q: str,
    genre: str = None,
    limit: int = 40,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    query = db.query(Movie).filter(Movie.title.ilike(f"%{q}%"))

    if genre:
        query = query.filter(Movie.genre == genre)

    return query.offset(offset).limit(limit).all()


@app.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.email == data.email) | (User.username == data.username)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email ou nom d'utilisateur déjà utilisé",
        )

    new_user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id)

    return {
        "message": "Compte créé avec succès",
        "access_token": token,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "avatar": new_user.avatar,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        },
    }


@app.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token(user.id)

    return {
        "access_token": token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar": user.avatar,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    }


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "avatar": current_user.avatar,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
    }


@app.put("/me/avatar")
def update_avatar(
    avatar_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.avatar = avatar_name
    db.commit()

    return {"message": "Avatar mis à jour", "avatar": avatar_name}


@app.get("/favorites")
def get_favorites(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorites = (
        db.query(Movie)
        .join(Favorite, Favorite.movie_id == Movie.id)
        .filter(Favorite.user_id == current_user.id)
        .all()
    )

    return favorites


@app.post("/favorites/{movie_id}")
def add_favorite(
    movie_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    movie = db.query(Movie).filter(Movie.id == movie_id).first()

    if not movie:
        raise HTTPException(status_code=404, detail="Film introuvable")

    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.movie_id == movie_id,
    ).first()

    if existing_favorite:
        return {"message": "Film déjà dans les favoris"}

    favorite = Favorite(user_id=current_user.id, movie_id=movie_id)

    db.add(favorite)
    db.commit()

    return {"message": "Film ajouté aux favoris"}


@app.delete("/favorites/{movie_id}")
def remove_favorite(
    movie_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.movie_id == movie_id,
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Favori introuvable")

    db.delete(favorite)
    db.commit()

    return {"message": "Film retiré des favoris"}
