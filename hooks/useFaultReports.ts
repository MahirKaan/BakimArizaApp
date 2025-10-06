// hooks/useFaultReports.ts - TAM GÜNCELLENMİŞ
import { useState, useEffect } from 'react';
import { mockFaultReports } from '../mocks/faultReportMocks';

// Types - FOTOĞRAF ALANI EKLENDİ
export interface FaultReport {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  reportedBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  completedAt?: string;
  photos?: string[]; // YENİ: Fotoğraf alanı eklendi
}

// GLOBAL STATE - tüm component'ler aynı state'i kullansın
let globalFaultReports: FaultReport[] = [...mockFaultReports];
let globalListeners: Array<(reports: FaultReport[]) => void> = [];

const notifyAllListeners = () => {
  globalListeners.forEach(listener => listener([...globalFaultReports]));
};

const useFaultReports = () => {
  const [faultReports, setFaultReports] = useState<FaultReport[]>(globalFaultReports);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listener ekle - global state değişikliklerini dinle
  useEffect(() => {
    const listener = (reports: FaultReport[]) => {
      setFaultReports(reports);
    };
    
    globalListeners.push(listener);
    return () => {
      globalListeners = globalListeners.filter(l => l !== listener);
    };
  }, []);

  // Tüm arızaları getir
  const fetchFaultReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API entegrasyonu yapılınca burayı aç
      // const response = await api.get('/fault-reports');
      // globalFaultReports = response.data;
      
      // Şimdilik mock verileri kullan
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFaultReports([...globalFaultReports]);
      
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error fetching fault reports:', err);
      setFaultReports([...globalFaultReports]);
    } finally {
      setLoading(false);
    }
  };

  // ID'ye göre arıza getir
  const getFaultReportById = (id: number): FaultReport | undefined => {
    return globalFaultReports.find(report => report.id === id);
  };

  // Yeni arıza ekle
  const addFaultReport = async (newReport: Omit<FaultReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const report: FaultReport = {
        ...newReport,
        id: Math.max(0, ...globalFaultReports.map(r => r.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: API entegrasyonu
      // await api.post('/fault-reports', report);
      
      // GLOBAL STATE'i güncelle ve tüm listener'lara bildir
      globalFaultReports = [report, ...globalFaultReports];
      notifyAllListeners();
      
      return report;
    } catch (err) {
      setError('Arıza eklenirken hata oluştu');
      throw err;
    }
  };

  // Arıza durumu güncelle
  const updateFaultReportStatus = async (
    id: number, 
    status: FaultReport['status'], 
    assignedTo?: string
  ) => {
    try {
      // TODO: API entegrasyonu
      // await api.patch(`/fault-reports/${id}`, { status, assignedTo });
      
      // GLOBAL STATE'i güncelle ve tüm listener'lara bildir
      globalFaultReports = globalFaultReports.map(report =>
        report.id === id
          ? {
              ...report,
              status,
              assignedTo: assignedTo !== undefined ? assignedTo : report.assignedTo,
              updatedAt: new Date().toISOString(),
              ...(status === 'completed' && { completedAt: new Date().toISOString() })
            }
          : report
      );
      notifyAllListeners();
    } catch (err) {
      setError('Arıza güncellenirken hata oluştu');
      throw err;
    }
  };

  // Arıza sil
  const deleteFaultReport = async (id: number) => {
    try {
      // TODO: API entegrasyonu
      // await api.delete(`/fault-reports/${id}`);
      
      // GLOBAL STATE'i güncelle ve tüm listener'lara bildir
      globalFaultReports = globalFaultReports.filter(report => report.id !== id);
      notifyAllListeners();
    } catch (err) {
      setError('Arıza silinirken hata oluştu');
      throw err;
    }
  };

  // Filtreleme fonksiyonları - global state'i kullan
  const getPendingReports = () => globalFaultReports.filter(report => report.status === 'pending');
  const getInProgressReports = () => globalFaultReports.filter(report => report.status === 'in_progress');
  const getCompletedReports = () => globalFaultReports.filter(report => report.status === 'completed');

  // Önceliğe göre filtrele
  const getReportsByPriority = (priority: FaultReport['priority']) => {
    return globalFaultReports.filter(report => report.priority === priority);
  };

  // Bugünkü bildirimler - YENİ EKLENDİ
  const getTodaysReports = () => {
    const today = new Date().toDateString();
    return globalFaultReports.filter(report => 
      new Date(report.createdAt).toDateString() === today
    );
  };

  // Atanmış işler - YENİ EKLENDİ
  const getAssignedReports = () => {
    return globalFaultReports.filter(report => 
      report.assignedTo && report.assignedTo.trim() !== ''
    );
  };

  // İstatistikler için yardımcı fonksiyonlar
  const getStats = () => {
    const total = globalFaultReports.length;
    const pending = getPendingReports().length;
    const inProgress = getInProgressReports().length;
    const completed = getCompletedReports().length;
    const critical = getReportsByPriority('critical').length;
    const today = getTodaysReports().length;
    const assigned = getAssignedReports().length;

    return {
      total,
      pending,
      inProgress,
      completed,
      critical,
      today,
      assigned
    };
  };

  // Arama fonksiyonu
  const searchFaultReports = (query: string) => {
    const lowerQuery = query.toLowerCase();
    return globalFaultReports.filter(report =>
      report.title.toLowerCase().includes(lowerQuery) ||
      report.description.toLowerCase().includes(lowerQuery) ||
      report.location.toLowerCase().includes(lowerQuery) ||
      report.reportedBy.toLowerCase().includes(lowerQuery)
    );
  };

  // Teknisyene göre filtrele
  const getReportsByTechnician = (technicianName: string) => {
    return globalFaultReports.filter(report => 
      report.assignedTo?.toLowerCase().includes(technicianName.toLowerCase())
    );
  };

  // İlk yükleme
  useEffect(() => {
    fetchFaultReports();
  }, []);

  return {
    // State
    faultReports,
    loading,
    error,
    
    // Actions
    fetchFaultReports,
    getFaultReportById,
    addFaultReport,
    updateFaultReportStatus,
    deleteFaultReport,
    
    // Filters
    getPendingReports,
    getInProgressReports,
    getCompletedReports,
    getReportsByPriority,
    getTodaysReports, // YENİ
    getAssignedReports, // YENİ
    
    // Utility functions
    getStats,
    searchFaultReports,
    getReportsByTechnician,
  };
};

export default useFaultReports;