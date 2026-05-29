'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  PoolTable,
  Service,
  Invoice,
  TableSession,
  InvoiceItem,
} from './types';
import {
  mockUsers,
  mockPoolTables,
  mockServices,
  mockSessions,
  mockInvoices,
} from './mockData';

interface DataContextType {
  users: User[];
  tables: PoolTable[];
  services: Service[];
  sessions: TableSession[];
  invoices: Invoice[];

  // Table operations
  startTableSession: (tableId: string, staffId: string) => void;
  endTableSession: (sessionId: string) => void;
  getTableSession: (tableId: string) => TableSession | undefined;
  updateTableStatus: (tableId: string, status: PoolTable['status']) => void;

  // User operations
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;

  // Service operations
  addService: (service: Service) => void;
  updateService: (service: Service) => void;
  deleteService: (serviceId: string) => void;

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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [tables, setTables] = useState<PoolTable[]>(mockPoolTables);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [sessions, setSessions] = useState<TableSession[]>(mockSessions);
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = {
      users: localStorage.getItem('billiards_users'),
      tables: localStorage.getItem('billiards_tables'),
      services: localStorage.getItem('billiards_services'),
      sessions: localStorage.getItem('billiards_sessions'),
      invoices: localStorage.getItem('billiards_invoices'),
    };

    if (stored.users) setUsers(JSON.parse(stored.users));
    if (stored.tables) setTables(JSON.parse(stored.tables));
    if (stored.services) setServices(JSON.parse(stored.services));
    if (stored.sessions)
      setSessions(
        JSON.parse(stored.sessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : null,
        }))
      );
    if (stored.invoices)
      setInvoices(
        JSON.parse(stored.invoices).map((i: any) => ({
          ...i,
          createdAt: new Date(i.createdAt),
          paidAt: i.paidAt ? new Date(i.paidAt) : null,
        }))
      );
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('billiards_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('billiards_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('billiards_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('billiards_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('billiards_invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Table operations
  const startTableSession = useCallback((tableId: string, staffId: string) => {
    const session: TableSession = {
      id: `session-${Date.now()}`,
      tableId,
      startTime: new Date(),
      endTime: null,
      staffId,
      price: 50000, // Default price per hour
      paid: false,
    };

    setSessions((prev) => [...prev, session]);
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId ? { ...t, status: 'in-use', lastUpdate: new Date() } : t
      )
    );
  }, []);

  const endTableSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, endTime: new Date() } : s
      )
    );
  }, []);

  const getTableSession = useCallback(
    (tableId: string) => sessions.find((s) => s.tableId === tableId && !s.endTime),
    [sessions]
  );

  const updateTableStatus = useCallback(
    (tableId: string, status: PoolTable['status']) => {
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, status, lastUpdate: new Date() }
            : t
        )
      );
    },
    []
  );

  // User operations
  const addUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const updateUser = useCallback((user: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? user : u))
    );
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  // Service operations
  const addService = useCallback((service: Service) => {
    setServices((prev) => [...prev, service]);
  }, []);

  const updateService = useCallback((service: Service) => {
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? service : s))
    );
  }, []);

  const deleteService = useCallback((serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
  }, []);

  // Invoice operations
  const createInvoice = useCallback(
    (tableId: string, staffId: string, items: InvoiceItem[]) => {
      const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

      const invoice: Invoice = {
        id: `invoice-${Date.now()}`,
        tableId,
        staffId,
        items,
        totalAmount,
        paymentMethod: 'cash',
        paidAt: null,
        status: 'pending',
        createdAt: new Date(),
      };

      setInvoices((prev) => [...prev, invoice]);

      // Clear the session
      setSessions((prev) =>
        prev.filter((s) => s.tableId !== tableId || s.endTime)
      );

      // Mark table as available
      setTables((prev) =>
        prev.map((t) =>
          t.id === tableId
            ? { ...t, status: 'available', lastUpdate: new Date() }
            : t
        )
      );

      return invoice;
    },
    []
  );

  const payInvoice = useCallback((invoiceId: string, method: 'cash' | 'card') => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'paid',
              paymentMethod: method,
              paidAt: new Date(),
            }
          : inv
      )
    );
  }, []);

  // Stats
  const getTodayRevenue = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices
      .filter((inv) => {
        const invDate = new Date(inv.createdAt);
        invDate.setHours(0, 0, 0, 0);
        return invDate.getTime() === today.getTime() && inv.status === 'paid';
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
  }, [invoices]);

  const getTablesInUse = useCallback(
    () => tables.filter((t) => t.status === 'in-use').length,
    [tables]
  );

  const getTodayInvoices = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      invDate.setHours(0, 0, 0, 0);
      return invDate.getTime() === today.getTime();
    }).length;
  }, [invoices]);

  const value: DataContextType = {
    users,
    tables,
    services,
    sessions,
    invoices,
    startTableSession,
    endTableSession,
    getTableSession,
    updateTableStatus,
    addUser,
    updateUser,
    deleteUser,
    addService,
    updateService,
    deleteService,
    createInvoice,
    payInvoice,
    getTodayRevenue,
    getTablesInUse,
    getTodayInvoices,
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
