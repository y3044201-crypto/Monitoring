export type NavTab = 
  | 'dashboard'
  | 'monitoring'
  | 'project'
  | 'volume'
  | 'gis'
  | 'asbuilt'
  | 'boq'
  | 'report'
  | 'users'
  | 'settings'
  | 'loading';

export interface FiberProject {
  id: string;
  projectName: string;
  location: string;
  status: 'In Progress' | 'Completed' | 'Planning' | 'Maintenance' | 'On Hold';
  progress: number; // 0 - 100
  dueDate: string;
  contractor?: string;
  budget?: number;
  coresCount?: number;
}

export interface FiberNode {
  id: string;
  name: string;
  type: 'POP' | 'Hub' | 'Splice Box' | 'Subsea Landing' | 'Client Terminal';
  location: string;
  coords: { x: number; y: number }; // Percentage on SVG Map (0-100)
  status: 'Online' | 'Warning' | 'Critical' | 'Maintenance';
  attenuationDb: number; // e.g. 0.24 dB/km
  activeCores: number;
  totalCores: number;
  bandwidthGbps: number;
  connectedTo: string[]; // Node IDs
}

export interface BoqItem {
  id: string;
  itemCode: string;
  description: string;
  category: 'Fiber Cable' | 'Splice Enclosure' | 'OLT / ONT' | 'Patch Cord' | 'ODF Cabinet' | 'Civil Hardware';
  quantity: number;
  unit: 'Meter' | 'Pcs' | 'Set' | 'Roll' | 'Unit';
  unitPrice: number;
  totalPrice: number;
  status: 'In Stock' | 'Allocated' | 'Procurement' | 'Depleted';
}

export interface TrafficDataPoint {
  time: string;
  avgTrafficGbps: number;
  totalInTb: number;
  totalOutTb: number;
  packetLossPercent: number;
  latencyMs: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'fiber_splice' | 'otdr_alert' | 'boq_update' | 'project_milestone' | 'user_access';
  status: 'success' | 'warning' | 'error' | 'info';
  user: string;
}

export interface AppsScriptConfig {
  webAppUrl: string;
  sheetName: string;
  mode: 'simulated' | 'live';
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST';
  action: 'READ' | 'CREATE' | 'UPDATE' | 'DELETE' | 'TEST';
  url: string;
  payload?: any;
  status: 'SUCCESS' | 'ERROR' | 'PENDING';
  statusCode?: number;
  durationMs?: number;
  message?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}
