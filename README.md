# HitungPajakku

**Aplikasi kalkulator pajak profesional**

---

## Deskripsi

Aplikasi PWA untuk menghitung berbagai jenis pajak Indonesia dengan cepat dan akurat.

---

## Fitur Utama

### Kalkulator Pajak
- **PPh 21** - Pajak karyawan dengan PTKP otomatis & tarif progresif
- **PPh 23** - Dividen, royalti, jasa (tarif 2% & 15%)
- **PPh Final** - UMKM & sewa properti
- **PPN** - Pajak Pertambahan Nilai 11%
- **PPnBM** - Pajak Barang Mewah (10%-95%)

### Fitur Lainnya
-  **Asisten AI** - Konsultasi pajak dengan Google Gemini
-  **Kalender Pajak** - Pengingat deadline
-  **Riwayat** - Simpan perhitungan
-  **Print-Friendly** - Export ke PDF
-  **Responsive** - Optimal di semua device

---

## Instalasi

### Prasyarat
- Node.js 16+
- pnpm

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd HitungPajakku

# Install dependencies
pnpm install

# Setup environment
cp .env .env.local
# Edit .env.local dan tambahkan:
# - VITE_SUPABASE_API_KEY dari supabase
# - VITE_VITE)_SUPABASE_URL (opsional, sudah ada default untuk development)

# Jalankan aplikasi
pnpm dev
```

Aplikasi akan berjalan di `http://localhost:3004`


**Konfigurasi:**

**Development (Default):**
- Sudah dikonfigurasi dengan test key yang selalu pass
- Tidak perlu setup tambahan untuk development lokal
- Test key: `1x00000000000000000000AA`


## Teknologi

- **React 19** + **TypeScript 5.8** + **Vite 6**
- **Tailwind CSS** - Styling
- **SUPABASE API** - Persistensi data

---

## Logika Perhitungan

### PPh 21

```
Penghasilan Bruto = (Gaji + Tunjangan) × 12 + Bonus
Biaya Jabatan = min(Bruto × 5%, Rp 6.000.000)
Penghasilan Neto = Bruto - Biaya Jabatan
PKP = Neto - PTKP
```

**Tarif Progresif:**
- 0-60 juta: 5%
- 60-250 juta: 15%
- 250-500 juta: 25%
- 500 juta-5 miliar: 30%
- >5 miliar: 35%

**PTKP:**
- TK/0: Rp 54 juta
- K/0: Rp 58,5 juta
- K/1: Rp 63 juta
- K/2: Rp 67,5 juta
- K/3: Rp 72 juta

---

## Keamanan & Privacy

- ✅ No backend - semua perhitungan di browser
- ✅ Data tersimpan lokal (LocalStorage)
- ✅ Tidak ada tracking
- ⚠️ Hasil bersifat estimasi - konsultasikan dengan konsultan pajak profesional

---

## License



---



---

<div align="center">

</div>
