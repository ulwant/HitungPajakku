import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <section className="max-w-4xl mx-auto bg-white/60 backdrop-blur rounded-2xl p-8 shadow-lg">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-2xl font-black">HP</div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Tentang HitungPajakku</h2>
          <p className="text-slate-600 mb-4">HitungPajakku adalah aplikasi web ringan untuk membantu Anda menghitung berbagai jenis pajak di Indonesia dengan cepat dan akurat. Dirancang untuk pengguna pribadi, freelancer, dan pelaku usaha kecil yang membutuhkan estimasi pajak tanpa perlu memasuki aturan teknis yang rumit.</p>

          <h3 className="text-lg font-bold text-slate-800 mt-4">Fitur Utama</h3>
          <ul className="list-disc list-inside text-slate-600 mt-2 space-y-2">
            <li><strong>Kalkulator PPh 21</strong> untuk karyawan dan perhitungan bulanan/tahunan.</li>
            <li><strong>Kalkulator Freelancer (NPPN)</strong> untuk pekerja bebas dengan norma penghitungan.</li>
            <li><strong>PPh 23, PPh Final, PPN, PPNBM</strong> dan estimasi Bea Cukai untuk impor.</li>
            <li><strong>Simulasi Sanksi</strong> untuk menghitung denda keterlambatan dan bunga administrasi.</li>
            <li><strong>Riwayat</strong> lokal dengan sinkronisasi opsional ke Supabase (jika dikonfigurasi).</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-800 mt-4">Privasi & Data</h3>
          <p className="text-slate-600">Semua perhitungan disimpan di perangkat Anda (localStorage) untuk pengalaman yang cepat. Jika Anda mengaktifkan integrasi Supabase, riwayat dapat disinkronkan ke backend Anda—pastikan membaca kebijakan privasi Supabase dan mengatur RLS jika perlu.</p>

          <h3 className="text-lg font-bold text-slate-800 mt-4">Untuk Pengembang</h3>
          <p className="text-slate-600">Proyek ini dibangun dengan React + Vite. Kode sumber tersedia dalam repo ini. Jika Anda ingin men-deploy tanpa Cloudflare Turnstile, cukup hapus konfigurasi Turnstile atau jangan set environment key.</p>

          <div className="mt-6 flex gap-3">
            <a href="#" onClick={(e)=>{e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'})}} className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:brightness-105">Mulai Menghitung</a>
            <a href="#" onClick={(e)=>{e.preventDefault(); alert('Kontak: ulwanterry@gmail.com')}} className="inline-block px-4 py-2 border border-slate-200 text-slate-700 rounded-lg">Hubungi Kami</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
