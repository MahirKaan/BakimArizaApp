import { FaultReport } from '../hooks/useFaultReports';

export const arizaFiltreleri = {
  // KRİTİK: priority "critical" ve status "pending" veya "in_progress" olanlar
  kritik: (arizalar: FaultReport[]) => 
    arizalar.filter(a => a.priority === "critical" && a.status !== "completed"),
  
  // AKTİF: status "pending" veya "in_progress" olanlar (tamamlanmamışlar)
  aktif: (arizalar: FaultReport[]) => 
    arizalar.filter(a => a.status !== "completed"),
  
  // BUGÜNKÜ: bugün oluşturulanlar
  bugunku: (arizalar: FaultReport[]) => {
    const today = new Date().toDateString();
    return arizalar.filter(a => new Date(a.createdAt).toDateString() === today);
  },
  
  // ATANMIŞ: assignedTo dolu olanlar
  atanmis: (arizalar: FaultReport[]) => 
    arizalar.filter(a => a.assignedTo && a.assignedTo !== ""),
  
  // TAMAMLANAN: status "completed" olanlar
  tamamlanan: (arizalar: FaultReport[]) => 
    arizalar.filter(a => a.status === "completed")
};

// Dashboard sayıları için
export const getDashboardCounts = (arizalar: FaultReport[]) => ({
  kritik: arizaFiltreleri.kritik(arizalar).length,
  aktif: arizaFiltreleri.aktif(arizalar).length,
  bugunku: arizaFiltreleri.bugunku(arizalar).length,
  atanmis: arizaFiltreleri.atanmis(arizalar).length,
  tamamlanan: arizaFiltreleri.tamamlanan(arizalar).length
});