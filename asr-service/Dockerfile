FROM python:3.10-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y ffmpeg libsndfile1 && rm -rf /var/lib/apt/lists/*

# Instala Python packages
RUN pip install --upgrade pip
RUN pip install faster-whisper fastapi uvicorn

# Copia o código da aplicação
COPY app /app
WORKDIR /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
