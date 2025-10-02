import { useState, useEffect } from 'react';
import { mockFaultReports } from '../mocks/faultReportMocks';

// Types - DAHA SPESİFİK
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
}

const useFaultReports = () => {
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tüm arızaları getir
  const fetchFaultReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: API entegrasyonu yapılınca burayı aç
      // const response = await api.get('/fault-reports');
      // setFaultReports(response.data);
      
      // Şimdilik mock verileri kullan
      await new Promise(resolve => setTimeout(resolve, 1000)); // Loading simülasyonu
      setFaultReports(mockFaultReports);
      
    } catch (err) {
      setError('Veriler yüklenirken hata oluştu');
      console.error('Error fetching fault reports:', err);
      // Hata durumunda da mock verileri göster
      setFaultReports(mockFaultReports);
    } finally {
      setLoading(false);
    }
  };

  // ID'ye göre arıza getir
  const getFaultReportById = (id: number): FaultReport | undefined => {
    return faultReports.find(report => report.id === id);
  };

  // Yeni arıza ekle
  const addFaultReport = async (newReport: Omit<FaultReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const report: FaultReport = {
        ...newReport,
        id: Math.max(0, ...faultReports.map(r => r.id)) + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // TODO: API entegrasyonu
      // await api.post('/fault-reports', report);
      
      setFaultReports(prev => [report, ...prev]);
      return report;
    } catch (err) {
      setError('Arıza eklenirken hata oluştu');
      throw err;
    }
  };

  // Arıza durumu güncelle
  const updateFaultReportStatus = async (id: number, status: FaultReport['status'], assignedTo?: string) => {
    try {
      // TODO: API entegrasyonu
      // await api.patch(`/fault-reports/${id}`, { status, assignedTo });
      
      setFaultReports(prev =>
        prev.map(report =>
          report.id === id
            ? {
                ...report,
                status,
                assignedTo,
                updatedAt: new Date().toISOString(),
                ...(status === 'completed' && { completedAt: new Date().toISOString() })
              }
            : report
        )
      );
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
      
      setFaultReports(prev => prev.filter(report => report.id !== id));
    } catch (err) {
      setError('Arıza silinirken hata oluştu');
      throw err;
    }
  };

  // Filtreleme fonksiyonları
  const getPendingReports = () => faultReports.filter(report => report.status === 'pending');
  const getInProgressReports = () => faultReports.filter(report => report.status === 'in_progress');
  const getCompletedReports = () => faultReports.filter(report => report.status === 'completed');

  // Önceliğe göre filtrele
  const getReportsByPriority = (priority: FaultReport['priority']) => {
    return faultReports.filter(report => report.priority === priority);
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
  };
};

export default useFaultReports;