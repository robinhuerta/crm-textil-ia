export type DealStage = 'new_lead' | 'quote' | 'negotiation' | 'logistics' | 'closed_won';

export interface Deal {
  id: string;
  customerName: string;
  productName: string;
  value: number;
  stage: DealStage;
  priority: 'low' | 'medium' | 'high';
  lastActivity: string;
  machineryDetails?: {
    brand: string;
    model: string;
    year?: number;
  };
  logisticsStatus?: string;
}

export interface Column {
  id: DealStage;
  title: string;
  icon: string;
}

export interface ContactActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'maintenance';
  date: string;
  content: string;
  user: string;
}

export interface InstalledMachine {
  id: string;
  brand: string;
  model: string;
  year: number;
  serialNumber?: string;
  lastMaintenance?: string;
  status: 'operational' | 'down' | 'maintenance_required';
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
  email: string;
  phone: string;
  avatar?: string;
  aiSummary?: string;
  lastInteraction: string;
  activities: ContactActivity[];
  machines: InstalledMachine[];
  dealCount: number;
  totalDealValue: number;
}

export interface ActNowAction {
  id: string;
  type: 'urgent' | 'followup' | 'opportunity';
  title: string;
  description: string;
  targetId: string; // Deal ID or Contact ID
  targetName: string;
  score: number;
  reason: string;
}

export interface Shipment {
  id: string;
  dealId: string;
  productName: string;
  origin: string;
  destination: string;
  eta: string;
  status: 'at_origin' | 'in_transit' | 'customs' | 'delivered';
  currentLocation: string;
  vesselName?: string;
  documents: { name: string; url: string }[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'needles' | 'yarn' | 'spare_parts' | 'oil';
  stock: number;
  minStock: number;
  unit: string;
  price: number;
  isCustomOrder?: boolean;
}

export interface Invoice {
  id: string;
  number: string;
  dealId: string;
  clientName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'factura' | 'boleta' | 'nota_credito';
}
