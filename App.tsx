import React, { useState, useEffect } from 'react';
import { 
  Menu, X, ChevronRight, ChevronDown, 
  Briefcase, Banknote, Ship, PenTool, Siren, Building2, Gem, History as HistoryIcon 
} from './components/Icons';
// NextPrevScroller bisa dihapus jika tidak digunakan lagi di tempat lain, 
// tapi saya biarkan di import jaga-jaga kalau Anda mau pakai di mobile nanti.
import NextPrevScroller from './components/NextPrevScroller'; 

import CalculatorPPH21 from './components/CalculatorPPH21';
import CalculatorPPH23 from './components/CalculatorPPH23';
import CalculatorFinal from './components/CalculatorFinal';
import CalculatorPPN from './components/CalculatorPPN';
import CalculatorPPNBM from './components/CalculatorPPNBM';
import CalculatorBeaCukai from './components/CalculatorBeaCukai';
import CalculatorNPPN from './components/CalculatorNPPN';
import CalculatorSanksi from './components/CalculatorSanksi';
import { SplashScreen } from './components/SplashScreen';
import AboutPage from './components/AboutPage';
import HistoryPage from './components/HistoryPage';
import { syncRemoteToLocal } from './services/historyService';
import { getCurrentUser } from './services/auth';
import Auth from './components/Auth';

// Type for Active Tab
type Tab = 'PPH21' | 'PPH23' | 'FINAL' | 'PPNBM' | 'BEACUKAI' | 'NPPN' | 'SANKSI' | 'PPN' | 'HISTORY' | 'ABOUT';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState<Tab>('PPH21');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contextData, setContextData] = useState<string>('');
  const [showNav, setShowNav] = useState(true);
  
  // State untuk kontrol menu Dropdown
  const [showOverflow, setShowOverflow] = useState(false);

  // Lock Body Scroll when Mobile Menu is Open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      setShowNav(true); 
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  // Sync History
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await getCurrentUser();
        if (!mounted) return;
        try { await (await import('./services/historyService')).claimLocalHistoryForUser(); } catch (e) { /* non-fatal */ }
        await syncRemoteToLocal();
      } catch (err) {
        console.warn('Initial history sync failed', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Handle Scroll to Hide/Show Nav
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (mobileMenuOpen) {
        setShowNav(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY < 20) {
        setShowNav(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else if (currentScrollY < lastScrollY) {
        setShowNav(true);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileMenuOpen]);

  const tabs = [
    { id: 'PPH21', label: 'PPh 21', fullLabel: 'Karyawan & Pribadi', icon: <Briefcase size={18} /> },
    { id: 'NPPN', label: 'Freelancer', fullLabel: 'Pekerja Bebas', icon: <PenTool size={18} /> },
    { id: 'SANKSI', label: 'Sanksi', fullLabel: 'Hitung Denda Telat', icon: <Siren size={18} /> },
    { id: 'HISTORY', label: 'Riwayat', fullLabel: 'Riwayat Hitungan', icon: <HistoryIcon size={18} /> },
    { id: 'PPH23', label: 'PPh 23', fullLabel: 'Jasa & Royalti', icon: <Building2 size={18} /> },
    { id: 'FINAL', label: 'PPh Final', fullLabel: 'Sewa & UMKM', icon: <Banknote size={18} /> },
    { id: 'PPNBM', label: 'PPNBM', fullLabel: 'Barang Mewah', icon: <Gem size={18} /> },
    { id: 'BEACUKAI', label: 'Bea Cukai', fullLabel: 'Impor Barang', icon: <Ship size={18} /> },
    { id: 'PPN', label: 'PPN', fullLabel: 'Pertambahan Nilai', icon: <Briefcase size={18} /> },
  ];

  // --- LOGIKA UTAMA ROLLED DOWN MENU ---
  // Kita set 4 atau 5 tab utama agar muat di layar
  const MAX_MAIN_TABS = 4; 
  const mainTabs = tabs.slice(0, MAX_MAIN_TABS);
  const overflowTabs = tabs.slice(MAX_MAIN_TABS);

  const renderMobileMenuItem = (id: Tab, label: string, subLabel: string, icon: React.ReactNode, delayIndex: number) => {
    const isActive = activeTab === id;
    return (
      <button
        key={id}
        onClick={() => {
          setActiveTab(id);
          setMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        style={{ transitionDelay: `${delayIndex * 30}ms` }}
        className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all duration-500 transform ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
          } ${isActive
            ? 'bg-blue-50 text-blue-900 shadow-sm ring-1 ring-blue-100'
            : 'text-slate-600 hover:bg-slate-50'
          } group relative overflow-hidden`}
      >
        {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
        <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-blue-500 group-hover:shadow-sm'}`}>
          {icon}
        </div>
        <div className="flex flex-col">
          <span className={`font-bold text-sm ${isActive ? 'text-blue-900' : 'text-slate-700'}`}>{label}</span>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">{subLabel}</span>
        </div>
        {isActive && <ChevronRight size={16} className="ml-auto text-blue-500" />}
      </button>
    );
  };

  return (
    <>
      {isLoading && <SplashScreen onFinish={() => setIsLoading(false)} />}

      <div className={`min-h-screen font-sans text-slate-900 relative overflow-x-hidden selection:bg-blue-500 selection:text-white ${isLoading ? 'hidden' : 'block animate-enter'}`}>

        {/* Ambient Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden no-print">
          <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating Navigation */}
        <div className={`fixed top-6 left-0 right-0 z-50 flex justify-center px-4 no-print transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${showNav ? 'translate-y-0' : '-translate-y-32'}`}>

          {/* Navigation Bar Container */}
          <nav className="relative flex items-center justify-between p-1.5 gap-2 md:gap-4 max-w-7xl w-full rounded-[2rem] border border-white/40 bg-white/30 backdrop-blur-3xl backdrop-saturate-150 shadow-2xl shadow-blue-900/10 ring-1 ring-white/40 ring-inset">

            {/* Brand - Left */}
            <div className="flex-shrink-0 cursor-pointer select-none group pl-4 relative z-10" onClick={() => setActiveTab('ABOUT')}>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-black tracking-tight text-slate-800 group-hover:opacity-80 transition-opacity">
                  HitungPajakku
                </span>
              </div>
            </div>

            {/* Middle: Desktop Tabs (Fixed Logic) */}
            <div className="hidden md:flex flex-1 justify-center px-2 overflow-visible relative z-10">
              {/* Kapsul Menu */}
              <div className="bg-slate-400/10 rounded-full pl-1.5 pr-3 py-1.5 border border-white/10 shadow-[inset_0_2px_6px_rgba(0,0,0,0.06)] flex items-center gap-1.5 backdrop-blur-md overflow-visible w-fit leading-none">

                
                {/* Render 5 Tab Utama */}
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`relative h-9 px-3 lg:px-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap shrink-0 leading-none ${activeTab === tab.id
                      ? 'text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] shadow-md'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                      }`}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full -z-10"></div>
                    )}
                    <span className="shrink-0 relative z-10 drop-shadow-sm">{tab.icon}</span>
                    <span className="relative z-10 drop-shadow-sm pt-0.5">{tab.label}</span>
                  </button>
                ))}

                {/* Tombol Rolldown (... Lainnya) */}
                {overflowTabs.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowOverflow(!showOverflow)}
                      className={`relative h-9 px-3 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1 whitespace-nowrap shrink-0 leading-none 
                        ${showOverflow || overflowTabs.some(t => t.id === activeTab)
                          ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                        }`}
                    >
                      <span className="relative z-10 drop-shadow-sm">... Lainnya</span>
                      <ChevronDown size={14} className={`transition-transform duration-300 ${showOverflow ? 'rotate-180' : 'rotate-0'}`} />
                    </button>

                    {/* Isi Dropdown Menu */}
                    {showOverflow && (
                      <div 
                        className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-fade-up origin-top-right ring-1 ring-black/5"
                        onMouseLeave={() => setShowOverflow(false)}
                      >
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kalkulator Lainnya</div>
                        {overflowTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as Tab);
                              setShowOverflow(false);
                            }}
                            className={`w-full text-left flex items-center gap-3 p-2.5 rounded-xl text-xs font-bold transition-all mb-1 last:mb-0 ${activeTab === tab.id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === tab.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                              {tab.icon}
                            </div>
                            <div className="flex flex-col">
                              <span>{tab.label}</span>
                              <span className="text-[9px] font-normal text-slate-400 opacity-80">{tab.fullLabel}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center gap-3 ml-auto pr-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50/80 backdrop-blur px-3 py-1.5 rounded-full border border-blue-100 shadow-sm truncate max-w-[120px]">
                {tabs.find(t => t.id === activeTab)?.label || activeTab}
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-3 rounded-full transition-all duration-300 shadow-lg border border-white/20 ${mobileMenuOpen ? 'bg-slate-100 text-slate-900 rotate-90' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Right Action - Auth (desktop) */}
            <div className="hidden md:flex items-center gap-3 pr-4 flex-shrink-0">
              <Auth />
            </div>
          </nav>
        </div>

        {/* MOBILE FULLSCREEN MENU OVERLAY */}
        <div className={`fixed inset-0 z-40 bg-white/95 backdrop-blur-3xl transition-all duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="h-[100dvh] overflow-y-auto pt-32 pb-40 px-6 overscroll-contain">
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-1">Kalkulator Utama</h3>
                <div className="space-y-2">
                  {tabs.map((tab, idx) => renderMobileMenuItem(tab.id as Tab, tab.label, tab.fullLabel, tab.icon, idx))}
                </div>
              </div>

              <div className="pt-4">
                <Auth />
              </div>

              <div className="pt-6 text-center">
                <p className="text-xs text-slate-400 font-medium">Versi 3.5.0 &bull; HitungPajakku</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="pt-32 px-4 pb-32 relative z-10">
          <div key={activeTab} className="max-w-6xl mx-auto animate-apple-enter will-change-transform">

            {/* Hero Header */}
            <div className="text-center mb-8 md:mb-12 no-print">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                {activeTab === 'ABOUT' && 'Tentang HitungPajakku'}
                {activeTab === 'PPH21' && 'Kalkulator PPh 21 Karyawan'}
                {activeTab === 'PPH23' && 'Kalkulator PPh 23'}
                {activeTab === 'FINAL' && 'Kalkulator PPh Final'}
                {activeTab === 'PPN' && 'Kalkulator PPN'}
                {activeTab === 'PPNBM' && 'Kalkulator PPnBM'}
                {activeTab === 'BEACUKAI' && 'Kalkulator Bea Cukai & Impor'}
                {activeTab === 'NPPN' && 'Kalkulator Pajak Freelancer'}
                {activeTab === 'SANKSI' && 'Kalkulator Sanksi Pajak'}
              </h1>
              <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
                {activeTab === 'ABOUT' && 'Ringkasan aplikasi, fitur, dan bagaimana data dikelola.'}
                {activeTab === 'PPH21' && 'Hitung estimasi pajak penghasilan (PPh 21) karyawan tetap dengan metode terbaru TER 2024 dan tarif progresif UU HPP.'}
                {activeTab === 'PPH23' && 'Hitung potongan pajak atas jasa, sewa harta, dividen, royalti, dan hadiah sesuai tarif Pasal 23.'}
                {activeTab === 'FINAL' && 'Hitung pajak bersifat final untuk sewa tanah/bangunan, jasa konstruksi, dan UMKM (PP 23).'}
                {activeTab === 'PPN' && 'Hitung Pajak Pertambahan Nilai (PPN) 11% dari Dasar Pengenaan Pajak (DPP).'}
                {activeTab === 'PPNBM' && 'Hitung Pajak Penjualan atas Barang Mewah untuk kendaraan, hunian, dan barang eksklusif lainnya.'}
                {activeTab === 'BEACUKAI' && 'Estimasi Bea Masuk, PPN, dan PPh Impor untuk barang kiriman luar negeri sesuai PMK 199/2019.'}
                {activeTab === 'NPPN' && 'Hitung pajak untuk Dokter, Notaris, Freelancer dan Pekerjaan Bebas menggunakan Norma Penghitungan (NPPN).'}
                {activeTab === 'SANKSI' && 'Cek estimasi denda bunga dan sanksi administrasi akibat keterlambatan setor atau lapor pajak.'}
              </p>
            </div>

            {/* Content Renderer */}
            {activeTab === 'PPH21' && <CalculatorPPH21 onContextUpdate={setContextData} />}
            {activeTab === 'PPH23' && <CalculatorPPH23 onContextUpdate={setContextData} />}
            {activeTab === 'FINAL' && <CalculatorFinal onContextUpdate={setContextData} />}
            {activeTab === 'PPN' && <CalculatorPPN onContextUpdate={setContextData} />}
            {activeTab === 'PPNBM' && <CalculatorPPNBM onContextUpdate={setContextData} />}
            {activeTab === 'BEACUKAI' && <CalculatorBeaCukai onContextUpdate={setContextData} />}
            {activeTab === 'NPPN' && <CalculatorNPPN onContextUpdate={setContextData} />}
            {activeTab === 'SANKSI' && <CalculatorSanksi onContextUpdate={setContextData} />}
            {activeTab === 'HISTORY' && <HistoryPage />}
            {activeTab === 'ABOUT' && <AboutPage />}
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-8 pb-8 px-4 no-print">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white/40 via-white/30 to-white/20 backdrop-blur-3xl backdrop-saturate-150 shadow-xl shadow-blue-900/10 ring-1 ring-white/40 ring-inset p-6">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-400/20 rounded-full blur-3xl"></div>
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-col items-center md:items-start gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tracking-tight bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      HitungPajakku
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-600 rounded-full border border-blue-200/50">
                      v3.5.0
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 text-center md:text-left">
                    © {new Date().getFullYear()} HitungPajakku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
};

export default App;
