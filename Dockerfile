FROM node:24-slim

RUN apt-get update && apt-get install -y \
  ffmpeg \
  python3 \
  curl \
  tesseract-ocr \
  tesseract-ocr-por \
  build-essential \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p frames

EXPOSE 3333
CMD ["npm", "start"]
