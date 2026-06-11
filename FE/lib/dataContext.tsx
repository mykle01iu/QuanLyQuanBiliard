'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  PoolTable,
  Service,
  Invoice,
  TableSession,
  InvoiceItem,
  Category,
} from './types';
import { apiRequest } from './api';
import { io } from 'socket.io-client';
import { useAuth } from './authContext';
interface DataContextType {
  users: User[];
  tables: PoolTable[];
  services: Service[];
  categories: Category[];
  sessions: TableSession[];
  invoices: Invoice[];

  // Table operations
  startTableSession: (tableId: string, staffId: string) => void;
  endTableSession: (sessionId: string) => void;
  getTableSession: (tableId: string) => TableSession | undefined;
  updateTableStatus: (tableId: string, status: PoolTable['status']) => void;
  addTable: (name: string, pricePerHour: number) => void;
  editTable: (id: string, name: string, pricePerHour: number, status?: PoolTable['status']) => void;
  deleteTable: (id: string) => void;
  addServiceToActiveTable: (tableId: string, serviceId: string, quantity: number) => Promise<void>;

  // User operations
  addUser: (user: User) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  // Service operations
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (serviceId: string) => void;

  // Category operations
  addCategory: (category: Partial<Category>) => void;
  updateCategory: (category: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;

  // Invoice operations
  createInvoice: (
    tableId: string,
    staffId: string,
    items: InvoiceItem[]
  ) => void;
  payInvoice: (invoiceId: string, method: 'cash' | 'card') => void;

  // Stats
  getTodayRevenue: () => number;
  getTablesInUse: () => number;
  getTodayInvoices: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mapping utilities
const mapBETable = (t: any): PoolTable => ({
  id: String(t.id),
  name: t.name,
  status: t.status === 'Đang sử dụng' ? 'in-use' : t.status === 'Bảo trì' ? 'maintenance' : 'available',
  pricePerHour: Number(t.price_per_hour),
  lastUpdate: new Date(t.updatedAt || t.createdAt || Date.now()),
});

const mapCategory = (cat: string): string => {
  return cat || 'Khác';
};

const mapBEService = (s: any): Service => ({
  id: String(s.id),
  name: s.name,
  category: mapCategory(s.category),
  price: Number(s.price),
  description: s.description || s.category,
  image_url: s.image_url,
});

const mapBECategory = (c: any): Category => ({
  id: String(c.id),
  name: c.name,
  icon: c.icon || 'Package',
  color: c.color || 'text-slate-600',
  bg: c.bg || 'bg-slate-50',
  ring: c.ring || 'ring-slate-100',
  createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
});

const mapBEUser = (u: any): User => ({
  id: String(u.id),
  name: u.fullname || u.username,
  email: u.username.includes('@') ? u.username : `${u.username}@99billiards.com`,
  phone: u.phone || '',
  role: u.role === 'admin' ? 'admin' : 'staff',
  salary: u.role === 'admin' ? 50000 : 30000,
  createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
});

const mapBEInvoiceItem = (detail: any): InvoiceItem => ({
  id: String(detail.id),
  type: 'service',
  name: detail.Service?.name || 'Dịch vụ',
  quantity: Number(detail.quantity),
  unitPrice: Number(detail.price),
  totalPrice: Number(detail.total),
});

const mapBEInvoice = (inv: any): Invoice => {
  const items: InvoiceItem[] = [];

  let tableFee = Number(inv.table_fee) || 0;
  let totalTime = inv.total_time || 0;

  if (inv.status === 'Đang chơi') {
    const start = new Date(inv.start_time);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    totalTime = Math.floor(diffMs / 60000); // minutes
    tableFee = Math.floor((totalTime / 60) * (inv.BilliardTable?.price_per_hour || 60000));
  }

  // Add hourly rate item if billed or pending
  if (tableFee > 0 || inv.status === 'Đã thanh toán' || inv.status === 'Đang chơi') {
    items.push({
      id: `table-fee-${inv.id}`,
      type: 'table',
      name: `Tiền giờ (${inv.BilliardTable?.name || `Bàn ${inv.table_id}`})`,
      quantity: 1,
      unitPrice: tableFee,
      totalPrice: tableFee,
    });
  }

  // Add individual services
  if (inv.InvoiceDetails) {
    inv.InvoiceDetails.forEach((d: any) => {
      items.push(mapBEInvoiceItem(d));
    });
  }

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  return {
    id: String(inv.id),
    tableId: String(inv.table_id),
    staffId: String(inv.user_id),
    items,
    totalAmount,
    paymentMethod: 'cash',
    paidAt: inv.end_time ? new Date(inv.end_time) : null,
    status: inv.status === 'Đã thanh toán' ? 'paid' : 'pending',
    createdAt: new Date(inv.start_time),
  };
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<PoolTable[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sessions, setSessions] = useState<TableSession[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    active_tables: 0,
    total_invoices_today: 0,
    revenue_today: 0
  });

  const refreshAllData = useCallback(async () => {
    try {
      // 1. Fetch tables
      const rawTables = await apiRequest('/tables');
      const mappedTables = rawTables.map(mapBETable);
      setTables(mappedTables);

      // 2. Fetch services and categories
      const rawCategories = await apiRequest('/categories');
      const mappedCategories = rawCategories.map(mapBECategory);
      setCategories(mappedCategories);

      const rawServices = await apiRequest('/services');
      const mappedServices = rawServices.map(mapBEService);
      setServices(mappedServices);

      // 3. Fetch users/employees (handle gracefully if employee lacks permission)
      try {
        const rawUsers = await apiRequest('/users');
        setUsers(rawUsers.map(mapBEUser));
      } catch (err) {
        console.warn('Cannot fetch user list, likely non-admin user:', err);
      }

      // 4. Fetch invoices
      const rawInvoices = await apiRequest('/invoices');
      const mappedInvoices = rawInvoices.map(mapBEInvoice);
      setInvoices(mappedInvoices);

      // 5. Build play sessions from invoices with pending status ('Đang chơi')
      const activeInvoices = rawInvoices.filter((inv: any) => inv.status === 'Đang chơi');
      const mappedSessions = activeInvoices.map((inv: any) => {
        const items: InvoiceItem[] = [];
        if (inv.InvoiceDetails) {
          inv.InvoiceDetails.forEach((d: any) => {
            items.push(mapBEInvoiceItem(d));
          });
        }
        return {
          id: String(inv.id),
          tableId: String(inv.table_id),
          startTime: new Date(inv.start_time),
          endTime: null,
          staffId: String(inv.user_id),
          price: inv.BilliardTable?.price_per_hour || 60000,
          paid: false,
          items,
        };
      });
      setSessions(mappedSessions);

      // 6. Fetch dashboard statistics
      const stats = await apiRequest('/dashboard');
      setDashboardStats(stats);

    } catch (error) {
      console.error('refreshAllData error:', error);
    }
  }, []);

  // Fetch all on mount and when auth state changes (user logged in)
  useEffect(() => {
    if (user) {
      refreshAllData();

      const socketUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://billiards-be.onrender.com';
      const socket = io(socketUrl);

      socket.on('dataChange', () => {
        refreshAllData();
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user, refreshAllData]);

  // Start table session
  const startTableSession = useCallback(async (tableId: string, staffId: string) => {
    try {
      await apiRequest('/play/start', {
        method: 'POST',
        body: JSON.stringify({ table_id: Number(tableId) }),
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('startTableSession error:', err);
      alert(err.message || 'Lỗi khi bắt đầu chơi');
    }
  }, [refreshAllData]);

  // End table session locally (checkout will finalize on server)
  const endTableSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, endTime: new Date() } : s
      )
    );
  }, []);

  // Get current session for table
  const getTableSession = useCallback(
    (tableId: string) => sessions.find((s) => s.tableId === tableId && !s.endTime),
    [sessions]
  );

  // Update table status locally/remotely
  const updateTableStatus = useCallback(
    async (tableId: string, status: PoolTable['status']) => {
      try {
        const beStatus = status === 'in-use' ? 'Đang sử dụng' : status === 'maintenance' ? 'Bảo trì' : 'Trống';
        await apiRequest(`/tables/${tableId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: beStatus }),
        });
        await refreshAllData();
      } catch (err: any) {
        console.error('updateTableStatus error:', err);
      }
    },
    [refreshAllData]
  );

  const addServiceToActiveTable = useCallback(
    async (tableId: string, serviceId: string, quantity: number) => {
      try {
        const activeData = await apiRequest(`/play/active-invoice/${tableId}`);
        const invoiceId = activeData.invoice.id;

        await apiRequest('/play/add-service', {
          method: 'POST',
          body: JSON.stringify({
            invoice_id: invoiceId,
            service_id: Number(serviceId),
            quantity,
          }),
        });

        await refreshAllData();
      } catch (err: any) {
        console.error('addServiceToActiveTable error:', err);
        throw err;
      }
    },
    [refreshAllData]
  );

  // Table CRUD operations
  const addTable = useCallback(
    async (name: string, pricePerHour: number) => {
      try {
        await apiRequest('/tables', {
          method: 'POST',
          body: JSON.stringify({ name, price_per_hour: pricePerHour }),
        });
        await refreshAllData();
      } catch (err: any) {
        console.error('addTable error:', err);
        alert(err.message || 'Lỗi khi thêm bàn');
      }
    },
    [refreshAllData]
  );

  const editTable = useCallback(
    async (id: string, name: string, pricePerHour: number, status?: PoolTable['status']) => {
      try {
        const body: any = { name, price_per_hour: pricePerHour };
        if (status) {
          body.status = status === 'in-use' ? 'Đang sử dụng' : status === 'maintenance' ? 'Bảo trì' : 'Trống';
        }
        await apiRequest(`/tables/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        await refreshAllData();
      } catch (err: any) {
        console.error('editTable error:', err);
        alert(err.message || 'Lỗi khi cập nhật bàn');
      }
    },
    [refreshAllData]
  );

  const deleteTable = useCallback(
    async (id: string) => {
      try {
        await apiRequest(`/tables/${id}`, {
          method: 'DELETE',
        });
        await refreshAllData();
      } catch (err: any) {
        console.error('deleteTable error:', err);
        alert(err.message || 'Lỗi khi xóa bàn');
      }
    },
    [refreshAllData]
  );

  // User CRUD operations
  const addUser = useCallback(async (user: User) => {
    try {
      const username = user.email;
      await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password: user.password || '123456',
          fullname: user.name,
          role: user.role === 'admin' ? 'admin' : 'employee',
          phone: user.phone
        })
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('addUser error:', err);
      alert(err.message || 'Lỗi khi thêm nhân viên');
      throw err;
    }
  }, [refreshAllData]);

  const updateUser = useCallback(async (user: User) => {
    try {
      const username = user.email;
      const payload: any = {
        username,
        fullname: user.name,
        role: user.role === 'admin' ? 'admin' : 'employee',
        phone: user.phone
      };
      if (user.password) {
        payload.password = user.password;
      }
      await apiRequest(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('updateUser error:', err);
      alert(err.message || 'Lỗi khi cập nhật nhân viên');
      throw err;
    }
  }, [refreshAllData]);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'DELETE'
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('deleteUser error:', err);
      alert(err.message || 'Lỗi khi xóa nhân viên');
    }
  }, [refreshAllData]);

  // Service CRUD operations
  const addService = useCallback(async (service: Service) => {
    try {
      await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify({
          name: service.name,
          category: service.category,
          price: service.price,
          image_url: service.image_url
        })
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('addService error:', err);
      alert(err.message || 'Lỗi khi thêm dịch vụ');
    }
  }, [refreshAllData]);

  const updateService = useCallback(async (service: Service) => {
    try {
      await apiRequest(`/services/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: service.name,
          category: service.category,
          price: service.price,
          image_url: service.image_url
        })
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('updateService error:', err);
      alert(err.message || 'Lỗi khi cập nhật dịch vụ');
    }
  }, [refreshAllData]);

  const deleteService = useCallback(async (serviceId: string) => {
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'DELETE'
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('deleteService error:', err);
      alert(err.message || 'Lỗi khi xóa dịch vụ');
    }
  }, [refreshAllData]);

  // Category CRUD operations
  const addCategory = useCallback(async (category: Partial<Category>) => {
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify(category)
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('addCategory error:', err);
      alert(err.message || 'Lỗi khi thêm danh mục');
    }
  }, [refreshAllData]);

  const updateCategory = useCallback(async (category: Partial<Category>) => {
    try {
      await apiRequest(`/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify(category)
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('updateCategory error:', err);
      alert(err.message || 'Lỗi khi cập nhật danh mục');
    }
  }, [refreshAllData]);

  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      await apiRequest(`/categories/${categoryId}`, {
        method: 'DELETE'
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('deleteCategory error:', err);
      alert(err.message || 'Lỗi khi xóa danh mục');
    }
  }, [refreshAllData]);

  // Create invoice / checkout process
  const createInvoice = useCallback(
    async (tableId: string, staffId: string, items: InvoiceItem[]) => {
      try {
        // 1. Fetch the active invoice for this table
        const activeData = await apiRequest(`/play/active-invoice/${tableId}`);
        const invoiceId = activeData.invoice.id;

        // 2. Add services added via InvoiceModal
        const serviceItems = items.filter((item) => item.type === 'service' && item.serviceId);
        for (const item of serviceItems) {
          const serviceId = Number(item.serviceId);
          if (!isNaN(serviceId)) {
            await apiRequest('/play/add-service', {
              method: 'POST',
              body: JSON.stringify({
                invoice_id: invoiceId,
                service_id: serviceId,
                quantity: item.quantity,
              }),
            });
          }
        }

        // 3. Finalize payment / Checkout
        await apiRequest('/play/checkout', {
          method: 'POST',
          body: JSON.stringify({ invoice_id: invoiceId }),
        });

        await refreshAllData();
      } catch (err: any) {
        console.error('createInvoice error:', err);
        alert(err.message || 'Lỗi khi thanh toán');
      }
    },
    [refreshAllData]
  );

  const payInvoice = useCallback(async (invoiceId: string, method: 'cash' | 'card') => {
    try {
      await apiRequest('/play/checkout', {
        method: 'POST',
        body: JSON.stringify({ invoice_id: Number(invoiceId) }),
      });
      await refreshAllData();
    } catch (err: any) {
      console.error('payInvoice error:', err);
    }
  }, [refreshAllData]);

  // Stats functions reading directly from backend dashboard stats
  const getTodayRevenue = useCallback(() => dashboardStats.revenue_today, [dashboardStats]);
  const getTablesInUse = useCallback(() => dashboardStats.active_tables, [dashboardStats]);
  const getTodayInvoices = useCallback(() => dashboardStats.total_invoices_today, [dashboardStats]);

  const value: DataContextType = {
    users,
    tables,
    services,
    categories,
    sessions,
    invoices,
    startTableSession,
    endTableSession,
    getTableSession,
    updateTableStatus,
    addTable,
    editTable,
    deleteTable,
    addUser,
    updateUser,
    deleteUser,
    addService,
    updateService,
    deleteService,
    addCategory,
    updateCategory,
    deleteCategory,
    createInvoice,
    payInvoice,
    getTodayRevenue,
    getTablesInUse,
    getTodayInvoices,
    addServiceToActiveTable,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
