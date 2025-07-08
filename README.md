Aplikasi web kuis interaktif yang dirancang untuk membantu mahasiswa berlatih menghadapi Ujian Akhir Semester (UAS) dalam mata kuliah Konsep Basis Data. Aplikasi ini menyajikan berbagai paket soal dengan batas waktu, penilaian otomatis, dan fitur untuk meninjau kembali jawaban.

## 🚀 Live Demo

Coba aplikasinya langsung di sini: **[superlative-pothos-2638e8.netlify.app](https://superlative-pothos-2638e8.netlify.app/)**

## ✨ Fitur Utama

  - **Beberapa Mode Latihan**: Pengguna dapat memilih dari berbagai paket soal yang telah ditentukan, termasuk "Paket A", "Paket B", "Paket P15", "Paket 1", "Paket 2", atau mengacak semua 183 soal yang tersedia.
  - **Sesi Kuis Berwaktu**: Setiap paket soal memiliki durasi waktu pengerjaan yang berbeda untuk menyimulasikan kondisi ujian yang sebenarnya.
  - **Navigasi Soal yang Fleksibel**: Pengguna dapat maju ke soal berikutnya atau kembali ke soal sebelumnya untuk meninjau atau mengubah jawaban.
  - **Penyimpanan Sesi Otomatis**: Jika pengguna secara tidak sengaja menutup tab atau browser, sesi kuis yang sedang aktif (soal, jawaban, sisa waktu) akan tersimpan dan dapat dilanjutkan kembali.
  - **Penilaian Otomatis**: Setelah kuis selesai (atau waktu habis), aplikasi akan secara otomatis menghitung skor, menampilkannya dalam bentuk persentase, dan memberikan umpan balik visual.
  - **Pembahasan Jawaban**: Pengguna dapat meninjau semua soal setelah kuis selesai, melihat jawaban yang mereka pilih, dan membandingkannya dengan jawaban yang benar.
  - **Ulangi Soal Salah**: Terdapat fitur khusus untuk mengulang latihan hanya pada soal-soal yang sebelumnya dijawab salah, memungkinkan pembelajaran yang lebih fokus.
  - **Histori Latihan**: Aplikasi menyimpan riwayat 20 sesi latihan terakhir, lengkap dengan nama paket, skor, persentase, dan tanggal pengerjaan.
  - **Desain Responsif**: Antarmuka yang modern dan ramah pengguna, dibangun dengan TailwindCSS agar nyaman diakses melalui perangkat desktop maupun mobile.

## 💻 Tumpukan Teknologi

  - **HTML5**: Untuk struktur dan konten halaman web.
  - **CSS3**: Untuk penataan gaya kustom.
  - **TailwindCSS**: Kerangka kerja CSS untuk membangun antarmuka dengan cepat.
  - **JavaScript (ES6)**: Untuk semua logika interaktif, manajemen status kuis, dan manipulasi DOM.
  - **JSON**: Sebagai format untuk menyimpan dan memuat semua pertanyaan kuis.

## 📂 Struktur File

```
.
├── index.html          # File utama HTML (antarmuka pengguna)
├── script.js           # Logika aplikasi (manajemen kuis, state, event)
├── style.css           # Gaya kustom tambahan
└── public/
    └── questions.json  # Basis data semua soal dan jawaban kuis
```

## 👤 Kredit

Dibuat Oleh Darell Rangga.
