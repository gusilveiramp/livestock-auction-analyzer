# 🐂 Livestock Auction Analyzer – Video OCR + Audio ASR (Multi-Platform)

This project is a robust microservice-based system that extracts and analyzes livestock auction data from **video sources**, including YouTube, Vimeo, and others. It combines **OCR** (image-based text detection) and **ASR** (audio transcription) pipelines to extract useful insights such as lot numbers, cattle weight, price, auction house, and more.

---

## 🚀 Features

### ✅ **Video OCR Pipeline**

- Downloads videos from multiple platforms via [`yt-dlp`](https://github.com/yt-dlp/yt-dlp)
- Extracts keyframes using `ffmpeg` on **scene changes**
- Applies preprocessing with `sharp` (resize, grayscale, sharpen, etc.)
- Sends processed frames to an OCR microservice (`FastAPI + EasyOCR`)
- Aggregates the detected text for future NLP parsing

### 🎙 **Audio ASR Pipeline**

- Retrieves audio captions from the video **(if available)**
- If unavailable, extracts audio and transcribes it locally using **Whisper ASR**
- Returns clean, structured transcript for analysis

### ⚙️ **Microservice Queue System**

- Built on **BullMQ + Redis**
- Two separate queues:
  - `ocr-processing` → For frame-to-text analysis
  - `asr-processing` → For audio transcription
- Each queue has its own worker (runs in Docker)
- Future-ready for scaling with **worker pools**

### 📦 **Extensible Platform Support**

This system is compatible with:

- **YouTube**
- **Vimeo**
- **Facebook Video**
- **Dailymotion**
- Any platform supported by `yt-dlp` or local MP4 uploads

---

## 🧱 Architecture Overview

src/
├── app.js # Main Express API
├── routes/ # HTTP route handlers
│ ├── video.routes.js # Start OCR pipeline
│ ├── audio.routes.js # Start ASR pipeline
│ ├── job.routes.js # Track job status / results
│ └── routes.js # Route registration
├── services/
│ ├── processVideo.js # Extract frames, call OCR microservice
│ └── asrProcessor.js # Extract audio, get transcription
├── queues/
│ ├── index.js # Registers OCR + ASR queues
│ ├── ocrQueue.js # OCR job dispatcher
│ ├── asrQueue.js # ASR job dispatcher
│ └── jobs/
│ ├── index.js # Generic worker bootstrap
│ └── workers/
│ ├── ocrWorker.js
│ └── asrWorker.js
├── config/
│ └── redisClient.js # Redis BullMQ client
└── frames/ # Output of processed frames (shared volume)

---

## 🧪 How It Works

1. A user sends a video URL to the system (e.g. `/video/process?url=...`)
2. Two jobs are created in parallel:
   - One job to process video frames (OCR)
   - Another job to process audio (ASR)
3. Each worker:
   - Downloads the video
   - Extracts and preprocesses content (frame or audio)
   - Sends content to a microservice
   - Receives the transcription and stores the result
4. Output can be stored or sent to a **future NLP analyzer** for cattle data parsing

---

## 🛠 Requirements

- Node.js 18+
- Docker + Docker Compose
- Python 3.10+ (for OCR and ASR microservices)
- `ffmpeg` and `yt-dlp` included in Docker images

---

## 📄 License

[MIT License](LICENSE)

---

## 🤖 Coming Soon

- NLP microservice to extract:
  - Auction lot number
  - Price and value per kg
  - Cattle type and weight
  - Auction house, date, and time
- Dashboard and admin panel
- Access control + multi-tenant support
