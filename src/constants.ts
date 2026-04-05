import { Deal, Column, Contact, Shipment, InventoryItem, Invoice } from './types';

export const STAGES: Column[] = [
  { id: 'new_lead', title: 'Nuevo Lead', icon: 'UserPlus' },
  { id: 'quote', title: 'Cotización Maquinaria', icon: 'FileText' },
  { id: 'negotiation', title: 'Negociación', icon: 'Handshake' },
  { id: 'logistics', title: 'Importación en Progreso', icon: 'Ship' },
  { id: 'closed_won', title: 'Ganado', icon: 'Trophy' }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: '1',
    customerName: 'Textil Huánuco',
    productName: 'Cotización Telar Circular',
    value: 45000,
    stage: 'quote',
    priority: 'high',
    lastActivity: 'Hace 2 días',
    machineryDetails: { brand: 'Stoll', model: 'CMS 530' }
  },
  {
    id: '2',
    customerName: 'Tejidos del Centro',
    productName: 'Repuestos de Ganchos',
    value: 1200,
    stage: 'negotiation',
    priority: 'medium',
    lastActivity: 'Hoy'
  },
  {
    id: '3',
    customerName: 'Maquila Industrial',
    productName: 'Mantenimiento Jacquard',
    value: 800,
    stage: 'new_lead',
    priority: 'low',
    lastActivity: 'Ayer'
  },
  {
    id: '4',
    customerName: 'Fibras del Norte',
    productName: 'Importación de Agujas de Tejer',
    value: 5500,
    stage: 'logistics',
    priority: 'medium',
    lastActivity: 'Hace 3 días',
    logisticsStatus: 'En Aduanas'
  },
  {
    id: '5',
    customerName: 'Inversiones Textiles',
    productName: 'Nueva Línea de Producción',
    value: 150000,
    stage: 'negotiation',
    priority: 'high',
    lastActivity: 'Hace 1 hora',
    machineryDetails: { brand: 'Picanol', model: 'OmniPlus-i' }
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Ing. Alberto Morales',
    role: 'Gerente de Producción',
    companyId: 'comp1',
    companyName: 'Textil Huánuco',
    email: 'amorales@textilhuanuco.com',
    phone: '+51 984 555 123',
    avatar: 'AM',
    aiSummary: 'Interesado en modernización de planta. Valora mucho el soporte técnico posventa.',
    lastInteraction: 'Hace 2 días',
    dealCount: 2,
    totalDealValue: 45000,
    machines: [
      { id: 'm1', brand: 'Stoll', model: 'CMS 530', year: 2018, status: 'operational' },
      { id: 'm2', brand: 'Stoll', model: 'CMS 530', year: 2019, status: 'maintenance_required' }
    ],
    activities: [
      { id: 'a1', type: 'call', date: '2026-04-03', content: 'Consulta sobre repuestos para telar circular.', user: 'Robin Huerta' },
      { id: 'a2', type: 'note', date: '2026-04-01', content: 'Visitó el showroom para ver el nuevo modelo Jacquard.', user: 'Robin Huerta' }
    ]
  },
  {
    id: 'c2',
    name: 'Mariana Vega',
    role: 'Jefa de Compras',
    companyId: 'comp2',
    companyName: 'Tejidos del Centro',
    email: 'mvega@tejidoscentro.pe',
    phone: '+51 912 334 556',
    avatar: 'MV',
    aiSummary: 'Enfoque en consumibles (agujas, hilos). Compra recurrente mensual.',
    lastInteraction: 'Hoy',
    dealCount: 1,
    totalDealValue: 1200,
    machines: [
      { id: 'm3', brand: 'Brother', model: 'KE-430HX', year: 2021, status: 'operational' }
    ],
    activities: [
      { id: 'a3', type: 'email', date: '2026-04-04', content: 'Envió orden de compra para 500 agujas.', user: 'Robin Huerta' }
    ]
  }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 's1',
    dealId: '1',
    productName: 'Telar Circular Stoll CMS 530',
    origin: 'Puerto de Hamburgo, Alemania',
    destination: 'Puerto del Callao, Perú',
    eta: '2026-04-15',
    status: 'in_transit',
    currentLocation: 'Atlántico Norte - Cerca de Azores',
    vesselName: 'Ever Given II',
    documents: [
      { name: 'Bill of Lading', url: '#' },
      { name: 'Factura Comercial', url: '#' }
    ]
  },
  {
    id: 's2',
    dealId: '4',
    productName: 'Lote de Agujas Groz-Beckert',
    origin: 'Albstadt, Alemania',
    destination: 'Lima, Perú',
    eta: '2026-04-10',
    status: 'customs',
    currentLocation: 'Aduana del Callao',
    documents: [
      { name: 'Certificado de Origen', url: '#' }
    ]
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    sku: 'GB-N-1234',
    name: 'Agujas de Tejer Groz-Beckert',
    category: 'needles',
    stock: 2500,
    minStock: 5000,
    unit: 'unidades',
    price: 0.85
  },
  {
    id: 'i2',
    sku: 'MA-O-5L',
    name: 'Aceite de Tejeduría Mayer&Cie 5L',
    category: 'oil',
    stock: 120,
    minStock: 50,
    unit: 'bidones',
    price: 45.00
  },
  {
    id: 'i3',
    sku: 'SP-H-99',
    name: 'Hilo de Poliéster 40/2',
    category: 'yarn',
    stock: 850,
    minStock: 200,
    unit: 'conos',
    price: 2.10
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  { id: 'inv1', number: 'F001-2026', dealId: '1', clientName: 'Textil Huánuco', amount: 15000, date: '2026-03-20', dueDate: '2026-04-20', status: 'pending', type: 'factura' },
  { id: 'inv2', number: 'B001-2026', dealId: '2', clientName: 'Tejidos del Centro', amount: 450, date: '2026-03-15', dueDate: '2026-04-15', status: 'paid', type: 'boleta' },
  { id: 'inv3', number: 'F002-2026', dealId: '5', clientName: 'Inversiones Textiles', amount: 50000, date: '2026-02-10', dueDate: '2026-03-10', status: 'overdue', type: 'factura' },
  { id: 'inv4', number: 'F003-2026', dealId: '4', clientName: 'Fibras del Norte', amount: 2750, date: '2026-04-01', dueDate: '2026-05-01', status: 'pending', type: 'factura' }
];
