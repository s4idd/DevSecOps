FROM python:3.11-alpine
WORKDIR /app

# Mise à jour des paquets système pour corriger les CVE comme xz-libs
RUN apk update && apk upgrade --no-cache

# Installation des dépendances pour bcrypt/postgres
RUN apk add --no-cache gcc musl-dev postgresql-dev libffi-dev

RUN adduser -D appuser

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown -R appuser:appuser /app
USER appuser

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]