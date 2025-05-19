const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const axios = require("axios");

function execPromise(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Erro:", stderr || err.message);
        return reject(new Error(stderr || err.message));
      }
      resolve(stdout);
    });
  });
}

async function transcribeAudio(youtubeUrl) {
  const timestamp = Date.now();
  const basePath = `/app/frames`;
  const subtitlePath = path.join(basePath, `asr-${timestamp}.srt`);
  const audioPath = path.join(basePath, `asr-${timestamp}.mp3`);

  // 1️⃣ Tentar baixar legenda automática (auto-generated captions)
  console.log("📝 Tentando baixar legenda automática...");
  try {
    await execPromise(
      `yt-dlp --write-auto-sub --sub-lang pt --skip-download --output "${basePath}/asr-${timestamp}.%(ext)s" "${youtubeUrl}"`
    );

    const subtitleExists = fs.existsSync(subtitlePath);
    if (subtitleExists) {
      console.log("✅ Legenda encontrada, carregando...");

      const srtContent = fs.readFileSync(subtitlePath, "utf-8");
      const text = srtContent
        .replace(/\d+\n/g, "") // remove números das legendas
        .replace(/\d{2}:\d{2}:\d{2},\d{3} --> .*/g, "") // remove timestamps
        .replace(/\r/g, "")
        .replace(/\n{2,}/g, "\n") // remove quebras duplicadas
        .trim();

      return text;
    }
  } catch (err) {
    console.warn("⚠️ Legenda automática não disponível:", err.message);
  }

  // 2️⃣ Se não tiver legenda automática, baixa o áudio e envia para o ASR Python
  console.log("🔊 Baixando áudio para transcrição...");
  await execPromise(
    `yt-dlp -x --audio-format mp3 -o "${audioPath}" "${youtubeUrl}"`
  );

  const audioBuffer = fs.readFileSync(audioPath);

  console.log("📡 Enviando áudio para o ASR Service...");
  const response = await axios.post(
    "http://asr-service:8002/transcribe",
    audioBuffer,
    {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    }
  );

  return response.data.text?.trim() || "";
}

module.exports = {
  transcribeAudio,
};
