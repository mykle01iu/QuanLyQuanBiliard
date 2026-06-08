import { User, PoolTable, Service, Invoice, TableSession } from './types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Nguyễn Văn Admin',
    email: 'admin@billiards.com',
    phone: '0912345678',
    role: 'admin',
    salary: 0,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'Trần Thị Hoa',
    email: 'hoa@billiards.com',
    phone: '0912345679',
    role: 'staff',
    salary: 50000,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    name: 'Lê Văn Minh',
    email: 'minh@billiards.com',
    phone: '0912345680',
    role: 'staff',
    salary: 50000,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '4',
    name: 'Phạm Thị Linh',
    email: 'linh@billiards.com',
    phone: '0912345681',
    role: 'staff',
    salary: 50000,
    createdAt: new Date('2024-02-01'),
  },
];

// Mock Pool Tables
export const mockPoolTables: PoolTable[] = [
  {
    id: 'table-1',
    name: 'Bàn 1',
    status: 'available',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
  {
    id: 'table-2',
    name: 'Bàn 2',
    status: 'in-use',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
  {
    id: 'table-3',
    name: 'Bàn 3',
    status: 'available',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
  {
    id: 'table-4',
    name: 'Bàn 4',
    status: 'maintenance',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
  {
    id: 'table-5',
    name: 'Bàn 5',
    status: 'available',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
  {
    id: 'table-6',
    name: 'Bàn 6',
    status: 'in-use',
    pricePerHour: 50000,
    lastUpdate: new Date(),
  },
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: 'service-1',
    name: 'Coca Cola',
    category: 'drink',
    price: 10000,
    description: 'Nước ngọt',
  },
  {
    id: 'service-2',
    name: 'Nước cam',
    category: 'drink',
    price: 15000,
    description: 'Nước cam tươi',
  },
  {
    id: 'service-3',
    name: 'Bia Tiger',
    category: 'drink',
    price: 25000,
    description: 'Bia lạnh',
  },
  {
    id: 'service-4',
    name: 'Phở',
    category: 'food',
    price: 50000,
    description: 'Phở bò',
  },
  {
    id: 'service-5',
    name: 'Cơm tấm',
    category: 'food',
    price: 45000,
    description: 'Cơm tấm sườn',
  },
  {
    id: 'service-6',
    name: 'Combo 1',
    category: 'combo',
    price: 150000,
    description: 'Combo: 2 bia + 2 phở',
  },
  {
    id: 'service-7',
    name: 'Combo 2',
    category: 'combo',
    price: 200000,
    description: 'Combo: 4 bia + 2 cơm + 2 nước',
  },
];

// Mock Sessions
export const mockSessions: TableSession[] = [
  {
    id: 'session-1',
    tableId: 'table-2',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endTime: null,
    staffId: '2',
    price: 50000,
    paid: false,
  },
  {
    id: 'session-2',
    tableId: 'table-6',
    startTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
    endTime: null,
    staffId: '3',
    price: 50000,
    paid: false,
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    tableId: 'table-1',
    staffId: '2',
    items: [
      {
        id: 'item-1',
        type: 'table',
        name: 'Bàn 1 - 1 giờ',
        quantity: 1,
        unitPrice: 50000,
        totalPrice: 50000,
      },
      {
        id: 'item-2',
        type: 'service',
        name: 'Bia Tiger x2',
        quantity: 2,
        unitPrice: 25000,
        totalPrice: 50000,
      },
    ],
    totalAmount: 100000,
    paymentMethod: 'cash',
    paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    status: 'paid',
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
  },
  {
    id: 'invoice-2',
    tableId: 'table-3',
    staffId: '3',
    items: [
      {
        id: 'item-3',
        type: 'table',
        name: 'Bàn 3 - 1.5 giờ',
        quantity: 1,
        unitPrice: 75000,
        totalPrice: 75000,
      },
      {
        id: 'item-4',
        type: 'service',
        name: 'Phở x2',
        quantity: 2,
        unitPrice: 50000,
        totalPrice: 100000,
      },
    ],
    totalAmount: 175000,
    paymentMethod: 'card',
    paidAt: new Date(Date.now() - 30 * 60 * 1000),
    status: 'paid',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];
