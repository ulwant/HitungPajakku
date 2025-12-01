// Gemmini / AI service disabled — provide safe stubs to avoid runtime errors.
export const generateTaxAdviceStream = async function* (
  prompt: string,
  context: string
): AsyncGenerator<string, void, unknown> {
  // Feature disabled: yield a single user-friendly message and exit.
  yield "Fitur Asisten AI telah dinonaktifkan pada build ini. Fitur konsultasi AI tidak tersedia.";
  return;
};

export const generateTaxLetter = async function* (
  letterType: string,
  userData: { name: string; npwp: string; address: string },
  recipient: string,
  keyFacts: string
): AsyncGenerator<string, void, unknown> {
  // Feature disabled: yield an informative fallback so callers still receive text.
  const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const city = (userData.address || 'Jakarta').split(' ')[0];
  const fallback = `${city}, ${today}

Yth. ${recipient || 'Kepala KPP Pratama Terkait'},

Perihal: ${letterType}

Saya yang bertanda tangan di bawah ini:
Nama : ${userData.name}
NPWP : ${userData.npwp || '-' }
Alamat: ${userData.address || '-' }

Dengan ini menyampaikan ringkasan alasan berikut:
${keyFacts || '(Tidak ada detail diberikan)'}

Catatan: Fitur pembuatan surat otomatis berbasis AI saat ini dinonaktifkan. Mohon gunakan draft di aplikasi sebagai referensi dan sesuaikan sebelum dikirim. 

Hormat saya,
${userData.name}
`;
  yield fallback;
  return;
};
