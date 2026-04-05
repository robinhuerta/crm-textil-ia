export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  status: 'lead' | 'opportunity' | 'customer' | 'inactive';
  lastContact: string;
  email?: string;
  phone?: string;
  segments: string[];
  machinery?: Machine[];
  insights?: string[];
  activities?: Activity[];
}

export interface Machine {
  id: string;
  model: string;
  brand: string;
  serial: string;
  installDate: string;
  lastMaintenance: string;
  nextMaintenance: string;
  status: 'operational' | 'warning' | 'down';
}

export interface Activity {
  id: string;
  date: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'maintenance';
  content: string;
  userId: string;
}

export interface LeadCaptureData {
  name: string;
  company: string;
  role?: string;
  email?: string;
  phone?: string;
  machineryInterests?: string[];
  summary: string;
  nextSteps: string[];
  priority: 'high' | 'medium' | 'low';
}

export interface ActNowAction {
  id: string;
  type: 'urgent' | 'followup' | 'maintenance';
  target: string;
  description: string;
  due: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  item: string;
  origin: string;
  eta: string;
  status: 'in-transit' | 'customs' | 'delivered';
  docs: string[];
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'needles' | 'oil' | 'parts' | 'other';
  stock: number;
  minStock: number;
  unit: string;
  price: number;
}

export interface Invoice {
  id: string;
  customerName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}
