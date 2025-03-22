const cleanMarkdown = (markdown) => {
  // Jika ingin membatasi sintaks Markdown tertentu, gunakan regex atau logika sederhana
  // Misalnya: hapus gambar atau tautan tertentu yang tidak diizinkan
  let cleaned = markdown;

  // Contoh: Batasi tautan hanya ke http/https
  // Sintaks tautan di Markdown: [text](url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return match; // Biarkan tautan yang valid
    }
    return `[${text}]([Tautan Tidak Diizinkan])`; // Ganti tautan tidak valid
  });

  // Contoh: Batasi kode blok yang mungkin berbahaya (opsional)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, (match) => {
    // Misalnya, hanya izinkan kode blok sederhana tanpa karakter aneh
    if (match.includes('<script>')) {
      return '```[Kode Dihapus]```';
    }
    return match;
  });

  return cleaned;
};

module.exports = { cleanMarkdown };