// User roles
export type UserRole = 'admin' | 'staff';

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  salary: number; // VND per hour
  createdAt: Date;
  password?: string;
}

// Table interface
export interface PoolTable {
  id: string;
  name: string;
  status: 'available' | 'in-use' | 'maintenance';
  pricePerHour: number; // VND
  lastUpdate: Date;
}

// Session interface
export interface TableSession {
  id: string;
  tableId: string;
  startTime: Date;
  endTime: Date | null;
  staffId: string;
  price: number;
  paid: boolean;
  items?: InvoiceItem[];
}

// Category interface
export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
  ring: string;
  createdAt?: Date;
}

// Service interface
export interface Service {
  id: string;
  name: string;
  category: string;
  price: number; // VND
  description?: string;
  image_url?: string;
}

// Invoice item
export interface InvoiceItem {
  id: string;
  type: 'table' | 'service';
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  serviceId?: string;
}

// Invoice interface
export interface Invoice {
  id: string;
  tableId: string;
  staffId: string;
  items: InvoiceItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card';
  paidAt: Date | null;
  status: 'pending' | 'paid';
  createdAt: Date;
}

// Dashboard stats
export interface DashboardStats {
  totalRevenue: number;
  tablesInUse: number;
  totalInvoices: number;
  averageSessionDuration: number;
}
