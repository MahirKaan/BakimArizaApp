import { FaultReport } from '../hooks/useFaultReports';

export const mockFaultReports: FaultReport[] = [
  {
    id: 1,
    title: "Klima Arızası",
    description: "Ofis katındaki klima çalışmıyor, hava sıcaklığı çok yükseldi. AC ünitesinden anormal ses geliyor.",
    status: "pending",
    priority: "high",
    location: "A Blok - 3. Kat - Oda 301",
    reportedBy: "Mehmet Demir",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "" // Boş bırak - atanmamış
  },
  {
    id: 2,
    title: "Su Kaçağı",
    description: "Mutfağın altından su sızıntısı var, zemin ıslak. Su saatinden sonra 5L/saat kayıp var.",
    status: "in_progress",
    priority: "medium",
    location: "B Blok - Zemin Kat - Mutfak",
    reportedBy: "Ayşe Kaya",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 saat önce
    assignedTo: "Teknisyen Ali"
  },
  {
    id: 3,
    title: "Elektrik Kesintisi",
    description: "Koridordaki aydınlatma çalışmıyor. Elektrik panosunda sigorta atması mevcut.",
    status: "completed",
    priority: "critical", // KRİTİK yap daha gerçekçi olsun
    location: "C Blok - 2. Kat - Ana Koridor",
    reportedBy: "Can Öztürk",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
    assignedTo: "Teknisyen Veli",
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    title: "Asansör Arızası",
    description: "A Blok asansörü 2. katta sıkışmış durumda. Acil müdahale gerekiyor.",
    status: "pending",
    priority: "critical",
    location: "A Blok - Asansör 1",
    reportedBy: "Zeynep Şahin",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 saat önce
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignedTo: "" // Acil ama atanmamış - dashboard'da gözüksün
  },
  {
    id: 5,
    title: "Kamera Sistemi Arızası",
    description: "Güvenlik kameralarının 3 tanesi çalışmıyor. Güvenlik açığı oluşmuş durumda.",
    status: "in_progress",
    priority: "high",
    location: "Ana Bina - Güvenlik Odası",
    reportedBy: "Güvenlik Görevlisi",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 saat önce
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
    assignedTo: "Teknisyen Mehmet"
  }
];

export const mockFaultCategories = [
  { id: 1, name: "Elektrik", count: 2 },
  { id: 2, name: "Su Tesisatı", count: 1 },
  { id: 3, name: "Isıtma/Soğutma", count: 1 },
  { id: 4, name: "Asansör", count: 1 },
  { id: 5, name: "Güvenlik Sistemleri", count: 1 },
  { id: 6, name: "Diğer", count: 0 }
];