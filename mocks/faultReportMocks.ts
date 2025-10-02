import { FaultReport } from '../hooks/useFaultReports';

export const mockFaultReports: FaultReport[] = [
  {
    id: 1,
    title: "Klima Arızası",
    description: "Ofis katındaki klima çalışmıyor, hava sıcaklığı çok yükseldi.",
    status: "pending",
    priority: "high",
    location: "A Blok - 3. Kat",
    reportedBy: "Mehmet Demir",
    createdAt: "2024-01-15T10:30:00",
    updatedAt: "2024-01-15T10:30:00"
  },
  {
    id: 2,
    title: "Su Kaçağı",
    description: "Mutfağın altından su sızıntısı var, zemin ıslak.",
    status: "in_progress",
    priority: "medium",
    location: "B Blok - Zemin Kat",
    reportedBy: "Ayşe Kaya",
    createdAt: "2024-01-14T14:20:00",
    updatedAt: "2024-01-15T09:15:00",
    assignedTo: "Teknisyen Ali"
  },
  {
    id: 3,
    title: "Elektrik Kesintisi",
    description: "Koridordaki aydınlatma çalışmıyor.",
    status: "completed",
    priority: "low",
    location: "C Blok - 2. Kat",
    reportedBy: "Can Öztürk",
    createdAt: "2024-01-13T16:45:00",
    updatedAt: "2024-01-14T11:30:00",
    assignedTo: "Teknisyen Veli",
    completedAt: "2024-01-14T11:30:00"
  }
];

export const mockFaultCategories = [
  { id: 1, name: "Elektrik" },
  { id: 2, name: "Su Tesisatı" },
  { id: 3, name: "Isıtma/Soğutma" },
  { id: 4, name: "Diğer" }
];