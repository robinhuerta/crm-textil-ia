import { Contact, Machine, Shipment, InventoryItem, Invoice } from './types';

export const SAMPLE_MACHINERY: Machine[] = [
  {
    id: 'm1',
    model: 'CMS 530',
    brand: 'Stoll',
    serial: 'SN-9981-A',
    installDate: '2023-01-15',
    lastMaintenance: '2024-02-10',
    nextMaintenance: '2024-05-10',
    status: 'operational',
  },
  {
    id: 'm2',
    model: 'Mayer MCP 1.6',
    brand: 'Mayer & Cie',
    serial: 'MY-4422-Z',
    installDate: '2022-06-20',
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-04-10',
    status: 'warning',
  },
  {
    id: 'm3',
    model: 'OVJA 1.6 E',
    brand: 'Mayer & Cie',
    serial: 'MY-1122-B',
    installDate: '2021-11-05',
    lastMaintenance: '2023-12-15',
    nextMaintenance: '2024-03-30',
    status: 'down',
  }
];

export const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Alberto Morales',
    company: 'Textil Huánuco',
    role: 'Gerente General',
    status: 'opportunity',
    lastContact: '2024-03-25',
    email: 'amorales@textilhuanuco.com',
    phone: '+51 987 654 321',
    segments: ['Tejido Punto', 'Alto Valor'],
    machinery: [SAMPLE_MACHINERY[0], SAMPLE_MACHINERY[2]],
    insights: [
      'Interesado en ampliar planta en Q3',
      'Prefiere comunicación por WhatsApp',
      'Crítico con tiempos de entrega de repuestos'
    ],
    activities: [
      { id: 'a1', date: '2024-03-25', type: 'call', content: 'Llamada de seguimiento sobre cotización de repuestos.', userId: 'user1' },
      { id: 'a2', date: '2024-03-20', type: 'meeting', content: 'Visita presencial a planta. Revisión técnica de Stoll CMS 530.', userId: 'user1' }
    ]
  },
  {
    id: 'c2',
    name: 'Elena Rodríguez',
    company: 'Confecciones del Sur',
    role: 'Jefa de Producción',
    status: 'customer',
    lastContact: '2024-03-28',
    email: 'erodriguez@confesur.pe',
    phone: '+51 912 345 678',
    segments: ['Exportación', 'Prenda Terminada'],
    machinery: [SAMPLE_MACHINERY[1]],
    activities: [
      { id: 'a3', date: '2024-03-28', type: 'email', content: 'Envío de factura mensual de suministros.', userId: 'user1' }
    ]
  }
];

export const SAMPLE_SHIPMENTS: Shipment[] = [
  {
    id: 's1',
    trackingNumber: 'MSC-9283741',
    item: '4 Telares Picanol OmniPlus',
    origin: 'Amberes, Bélgica',
    eta: '2024-04-15',
    status: 'in-transit',
    docs: ['BL-92837', 'Invoice-882', 'PL-882']
  },
  {
    id: 's2',
    trackingNumber: 'DHL-3342110',
    item: 'Agujas Groz-Beckert (10k pcs)',
    origin: 'Albstadt, Alemania',
    eta: '2024-04-02',
    status: 'customs',
    docs: ['AWB-33421', 'Invoice-991']
  }
];

export const SAMPLE_INVENTORY: InventoryItem[] = [
  { id: 'i1', sku: 'GB-VO71', name: 'Agujas VO 71.52 G03', category: 'needles', stock: 1250, minStock: 2000, unit: 'pcs', price: 1.25 },
  { id: 'i2', sku: 'KL-OIL-T5', name: 'Aceite Klüber Silvertex T4', category: 'oil', stock: 45, minStock: 20, unit: 'litros', price: 18.50 },
  { id: 'i3', sku: 'SL-530-CP', name: 'Cam Lock Stoll 530', category: 'parts', stock: 4, minStock: 5, unit: 'pcs', price: 340.00 }
];

export const SAMPLE_INVOICES: Invoice[] = [
  { id: 'f-1022', customerName: 'Textil Huánuco', amount: 4500.00, date: '2024-03-01', dueDate: '2024-03-31', status: 'overdue' },
  { id: 'f-1025', customerName: 'Fibras Pro', amount: 12500.00, date: '2024-03-15', dueDate: '2024-04-15', status: 'pending' },
  { id: 'f-1020', customerName: 'Cotton S.A.', amount: 3200.00, date: '2024-02-25', dueDate: '2024-03-25', status: 'paid' }
];
