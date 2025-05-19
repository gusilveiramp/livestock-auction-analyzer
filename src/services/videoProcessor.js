// src/services/youtubeCapture.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
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

async function captureFrame(youtubeUrl) {
  const timestamp = Date.now();
  const basePath = `/app/frames`;
  const videoPath = `${basePath}/yt-capture-${timestamp}.mp4`;
  const framePrefix = `${basePath}/frame-${timestamp}`;
  const framePattern = `${framePrefix}-%03d.png`;

  // 📥 Baixar vídeo
  console.log(`▶️ Baixando vídeo...`);
  await execPromise(`yt-dlp -f best -o "${videoPath}" "${youtubeUrl}"`);
  console.log(`✅ Baixado: ${videoPath}`);

  // 🎞️ Extrair frames com mudanças de cena (somente rodapé)
  const ffmpegCmd = `ffmpeg -i "${videoPath}" -vf "select='gt(scene,0.3)',crop=iw:ih/3:0:2*ih/3,scale=640:-1" -vsync vfr "${framePattern}"`;
  console.log("🎬 Extraindo frames...");
  await execPromise(ffmpegCmd);

  // 📸 Lista os frames extraídos
  const frames = fs
    .readdirSync(basePath)
    .filter((f) => f.startsWith(`frame-${timestamp}`) && f.endsWith(".png"))
    .map((f) => path.join(basePath, f));

  if (frames.length === 0) throw new Error("Nenhum frame extraído!");

  let fullText = "";

  for (const frame of frames) {
    const processedPath = frame.replace(/\.png$/, "-processed.png");

    try {
      const stat = fs.statSync(frame);
      if (stat.size === 0) {
        console.warn(`⚠️ Frame vazio: ${frame}`);
        continue;
      }

      // 🧠 Pré-processamento com sharp
      await sharp(frame)
        .grayscale() // Mantém só o canal de luminosidade
        .resize({ width: 1280 }) // Upscale suave
        .modulate({ brightness: 1.1 }) // Aumenta levemente o brilho
        // .threshold(180) // Use um valor maior (180–200) para evitar o estouro
        .sharpen() // Apenas um leve realce
        .toFile(processedPath);

      const imageBuffer = fs.readFileSync(processedPath);

      // 🔁 Enviar para OCR Service
      const response = await axios.post(
        "http://ocr-service:8000/ocr",
        imageBuffer,
        { headers: { "Content-Type": "application/octet-stream" } }
      );

      const text = response.data.text?.trim();
      if (text) {
        fullText += `\n[${frame}]:\n${text}\n`;
      } else {
        console.warn(`🚫 Nenhum texto encontrado em ${frame}`);
      }
    } catch (err) {
      console.error(`❌ Erro ao processar ${frame}:`, err.message);
    }
  }

  return fullText.trim();
}

module.exports = {
  captureFrame,
};
