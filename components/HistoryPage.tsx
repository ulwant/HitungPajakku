// File: components/HistoryPage.tsx

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
// Import fungsi ASYNC yang baru
import { getHistoryItems, clearHistory, deleteHistoryItem, startRealtimeHistorySync, stopRealtimeHistorySync } from '../services/historyService'; 
import { HistoryItem } from '../types';
import { formatCurrency } from '../services/taxLogic';
import { getCurrentUser } from '../services/auth'; // Import untuk mendapatkan user ID
import { History, Trash2, Clock, X, Printer, Calculator, FileText, RefreshCw, AlertCircle, Check } from './Icons';

const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 1. Fetch data dan kelola koneksi Realtime
  useEffect(() => {
    let mounted = true;
    
    // Fungsi untuk memuat riwayat dan mengaktifkan sync
    const loadHistoryAndSync = async () => {
      setIsLoading(true);
      const user = await getCurrentUser();
      const currentUserId = user?.id ?? null;
      
      if (mounted) setUserId(currentUserId);
      if (!currentUserId) {
        if (mounted) {
            setHistory([]); 
            setIsLoading(false);
        }
        return;
      }
      
      // Ambil data pertama kali
      const initialHistory = await getHistoryItems(currentUserId);
      if (mounted) {
        setHistory(initialHistory);
        setIsLoading(false);
      }
      
      // Mulai sinkronisasi Realtime
      await startRealtimeHistorySync(currentUserId, async (items) => {
        if (mounted) setHistory(items);
      });
    };

    loadHistoryAndSync();

    // Cleanup: hentikan sync saat keluar dan reset overflow body
    return () => { 
        mounted = false; 
        stopRealtimeHistorySync().catch(() => {});
        document.body.style.overflow = 'unset';
    };
  }, []); 

  // Toggle body scroll saat modal dibuka
  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedItem]);
  
  // Fungsi ASYNC untuk menghapus item
  const handleDelete = async (e: React.MouseEvent | null, id: string) => {
    if (e) e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus riwayat ini?')) {
        await deleteHistoryItem(id);
        if (selectedItem?.id === id) setSelectedItem(null);
        // Refresh data dari server
        setHistory(await getHistoryItems(userId));
    }
  };

  // Fungsi ASYNC untuk menghapus semua
  const handleClearAll = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat? Tindakan ini tidak dapat dibatalkan.')) {
      await clearHistory();
      setHistory([]);
      setSelectedItem(null);
    }
  };

  // Fungsi ASYNC untuk refresh manual
  const handleRefresh = async () => {
      setIsLoading(true);
      setHistory(await getHistoryItems(userId));
      setIsLoading(false);
  }

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  };
  
  const getThemeColor = (type: string) => {
     if (type === 'PPH21') return 'text-blue-600 bg-blue-100 border-blue-200';
     if (type === 'PPN') return 'text-orange-600 bg-orange-100 border-orange-200';
     if (type === 'PPNBM') return 'text-rose-600 bg-rose-100 border-rose-200';
     return 'text-purple-600 bg-purple-100 border-purple-200';
  };
  
  const renderDetailsContent = (detailsRaw: string | undefined) => {
    if (!detailsRaw) return <p className="text-slate-400 italic text-center py-4">Tidak ada rincian tambahan.</p>;

    const lines = detailsRaw.split('\n');
    
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden text-sm">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return null;
          
          if (trimmed.includes('----')) {
            return <div key={idx} className="h-px bg-slate-200 my-0"></div>;
          }

          const separatorIndex = trimmed.indexOf(':');
          if (separatorIndex !== -1) {
             const label = trimmed.substring(0, separatorIndex).trim();
             const value = trimmed.substring(separatorIndex + 1).trim();
             
             return (
               <div key={idx} className="flex justify-between items-center py-2.5 px-4 border-b last:border-0 border-slate-100 even:bg-slate-50 hover:bg-blue-50/30 transition-colors">
                 <span className="text-slate-500 font-medium text-xs md:text-sm">{label}</span>
                 <span className="text-slate-900 font-bold text-xs md:text-sm text-right">{value}</span>
               </div>
             );
          }

          return (
            <div key={idx} className="py-2 px-4 bg-slate-50 font-bold text-slate-900 text-xs md:text-sm border-b border-slate-100">
               {trimmed}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 pb-12">
      
      {/* Toolbar Actions */}
      <div className="flex justify-between items-center no-print">
         <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <History size={24} className="text-blue-600"/>
            Riwayat Saya
         </h3>
         
         <div className="flex items-center gap-2">
            {/* Refresh Button */}
            {userId && (
                <button 
                    onClick={handleRefresh} 
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 disabled:opacity-50"
                    disabled={isLoading}
                >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''}/>
                    {isLoading ? 'Memuat...' : 'Refresh'}
                </button>
            )}
            
            {/* Hapus Semua Button */}
            {history.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 rounded-xl transition-colors text-sm font-bold"
              >
                <Trash2 size={16} />
                Hapus Semua
              </button>
            )}
         </div>
      </div>
      
      {/* Loading State */}
      {isLoading && userId && (
          <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm px-4">
              <RefreshCw size={32} className="text-blue-500 mx-auto mb-4 animate-spin"/>
              <p className="text-sm text-slate-500">Memuat riwayat dari server Supabase...</p>
          </div>
      )}

      {/* Not Logged In State */}
      {!userId && !isLoading && (
        <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm px-4">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-4"/>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Login Diperlukan</h3>
          <p className="text-sm md:text-base text-slate-500">Riwayat Anda kini sepenuhnya disimpan di server. Silakan **Masuk** (Login) untuk melihat dan menyimpan riwayat Anda.</p>
        </div>
      )}
      
      {/* Empty State */}
      {history.length === 0 && !isLoading && userId && (
        <div className="text-center py-16 md:py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm px-4">
          <Clock size={32} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Belum ada riwayat</h3>
          <p className="text-sm md:text-base text-slate-500">Lakukan perhitungan pajak dan klik "Simpan" (Save) untuk melihatnya disini.</p>
        </div>
      )}
      
      {/* List Riwayat */}
      {history.length > 0 && !isLoading && (
         <div className="grid grid-cols-1 gap-3 md:gap-4">
            {history.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative overflow-hidden cursor-pointer active:scale-[0.98]"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 relative z-10">
                  <div className="flex items-start gap-3 md:gap-5 w-full md:w-auto">
                     <div className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl shrink-0 border ${getThemeColor(item.type)}`}>
                       <Clock size={20} className="md:w-6 md:h-6" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-1 mb-1">
                         <h4 className="font-bold text-slate-900 text-base md:text-lg truncate">{item.title}</h4>
                         <span className="text-[9px] md:text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider whitespace-nowrap">
                           {formatDate(item.timestamp)}
                         </span>
                       </div>
                       <p className="text-slate-500 text-xs md:text-sm font-medium truncate pr-8">{item.summary}</p>
                     </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 mt-1 md:mt-0 pl-12 md:pl-0 border-t md:border-0 border-slate-50 pt-3 md:pt-0">
                     <div className="text-left md:text-right flex-1 md:flex-none">
                       <span className="block text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Nominal Pajak</span>
                       <span className="text-lg md:text-xl font-extrabold text-slate-800">{formatCurrency(item.resultAmount)}</span>
                     </div>
                     
                     <button 
                       onClick={(e) => handleDelete(e, item.id)}
                       className="p-2 md:p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0 no-print"
                       title="Hapus"
                     >
                       <Trash2 size={18} className="md:w-5 md:h-5" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
       )}

       {/* Sisa kode modal, dll. */ }
       {selectedItem && createPortal(
          <div className="fixed inset-0 z-[100] flex items-start justify-center py-4 sm:py-8 px-4 animate-enter modal-container overflow-y-auto bg-slate-900/60 backdrop-blur-sm">
             
             {/* Clickable Backdrop */}
             <div 
               className="fixed inset-0 transition-opacity"
               onClick={() => setSelectedItem(null)}
             ></div>
             
             {/* Document Card */}
             <div className="relative w-full max-w-3xl bg-white rounded-2xl md:rounded-xl shadow-2xl flex flex-col animate-fade-up receipt-modal my-auto">
                
                {/* Document Content */}
                <div className="flex-1 p-6 md:p-12 bg-white text-slate-900 overflow-y-auto custom-scrollbar max-h-[75vh] md:max-h-[80vh]">
                    
                    {/* Document Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 md:pb-6 mb-6 md:mb-8">
                        <div className="flex flex-col">
                           <div className="flex items-center gap-2 md:gap-3 mb-2">
                              <div className="bg-blue-600 text-white p-1.5 md:p-2 rounded-lg">
                                 <Calculator size={16} className="md:w-5 md:h-5" />
                              </div>
                              <span className="font-black text-lg md:text-2xl tracking-tight text-slate-900">HitungPajakku</span>
                           </div>
                           <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wide">Platform HitungPajakku</p>
                        </div>
                        <div className="text-right">
                           <h2 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Dokumen ID</h2>
                           <p className="font-bold text-[10px] md:text-xs text-slate-600 mb-2">{selectedItem.id.toUpperCase().substring(0, 12)}</p>
                           <h2 className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Tanggal Cetak</h2>
                           <p className="font-bold text-xs md:text-sm text-slate-900">{new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                       <div>
                          <span className="block text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Jenis Perhitungan</span>
                          <h1 className="text-2xl md:text-3xl font-black text-slate-900">{selectedItem.title}</h1>
                       </div>
                       <div className="bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-slate-600 text-xs md:text-sm font-medium border border-slate-200 w-fit">
                          {formatDate(selectedItem.timestamp)}
                       </div>
                    </div>

                    {/* Summary Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                       <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-2 mb-2 md:mb-3 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                             <FileText size={12} className="md:w-[14px] md:h-[14px]"/>
                             Data Input
                          </div>
                          <p className="font-medium text-base md:text-lg text-slate-900 leading-relaxed">{selectedItem.summary}</p>
                       </div>
                       <div className="bg-slate-900 text-white p-4 md:p-6 rounded-xl shadow-lg flex flex-col justify-center">
                          <div className="flex items-center gap-2 mb-1 md:mb-2 text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                             <Check size={12} className="md:w-[14px] md:h-[14px]"/>
                             Total Estimasi Pajak
                          </div>
                          <p className="font-bold text-2xl md:text-4xl tracking-tight">{formatCurrency(selectedItem.resultAmount)}</p>
                       </div>
                    </div>

                    {/* Details Section - Structured View */}
                    <div className="mb-8 md:mb-12">
                       <h3 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 md:mb-4 pb-2 flex items-center gap-2 border-b border-slate-100">
                          Rincian Lengkap
                       </h3>
                       {renderDetailsContent(selectedItem.details)}
                    </div>

                    {/* Footer Disclaimer */}
                    <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-4 md:pt-6 leading-relaxed">
                       <p>Dokumen ini dihasilkan secara otomatis oleh sistem HitungPajakku berdasarkan data yang dimasukkan pengguna.</p>
                       <p>Hasil perhitungan merupakan estimasi dan bukan bukti potong pajak resmi yang diakui oleh Direktorat Jenderal Pajak.</p>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl flex flex-col md:flex-row justify-end gap-3 no-print z-10">
                    <button 
                       onClick={() => setSelectedItem(null)}
                       className="px-4 md:px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors text-sm md:text-base order-3 md:order-1"
                    >
                       Tutup
                    </button>
                    <button 
                       onClick={(e) => handleDelete(null, selectedItem.id)}
                       className="px-4 md:px-6 py-3 rounded-xl bg-red-50 text-red-500 font-bold border border-red-100 hover:bg-red-100 transition-colors text-sm md:text-base order-2"
                    >
                       Hapus
                    </button>
                    <button 
                       onClick={() => window.print()}
                       className="px-4 md:px-6 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:scale-105 transition-all flex items-center justify-center gap-2 text-sm md:text-base order-1 md:order-3"
                    >
                       <Printer size={18}/>
                       Cetak Dokumen
                    </button>
                </div>

             </div>
          </div>,
          document.body
       )}
    </div>
  );
};

export default HistoryPage;
