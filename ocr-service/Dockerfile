FROM python:3.10-slim

# Instala dependências do sistema
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
 && rm -rf /var/lib/apt/lists/*

# Instala pacotes Python
RUN pip install --upgrade pip
RUN pip install easyocr fastapi uvicorn

# Copia os arquivos da API
COPY app /app
WORKDIR /app

# Comando para rodar o servidor FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
