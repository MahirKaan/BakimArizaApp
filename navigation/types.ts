// navigation/types.ts - TYPE TANIMLARI
export type RootStackParamList = {
  Login: undefined;
  Dashboard: undefined;
  FaultReport: undefined;
  FaultList: undefined;
  FaultDetail: { faultId: string };
  Map: undefined;
  Analytics: undefined;
  Inventory: undefined;
  Profile: undefined;
  Settings: undefined;
  TeamManagement: undefined;
  UserManagement: undefined;
  TimeTracking: undefined;
  Reports: undefined;
  CostAnalysis: undefined;
  SystemSettings: undefined;
  Backup: undefined;
};

// Declare global types for TypeScript
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}