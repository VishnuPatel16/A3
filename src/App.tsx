import React, { useState, useEffect } from 'react';
import PortalSelection from './components/PortalSelection';
import AdminPanel from './components/AdminPanel';
import EmployeePanel from './components/EmployeePanel';
import { Employee, InventoryItem, Transaction, AttendanceRecord, AttendanceStatus } from './types';

export default function App() {
  // Authentication states
  const [userRole, setUserRole] = useState<'admin' | 'employee' | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core lists loaded dynamically from the Express full-stack API
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // API Fetch helper functions
  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
        // refresh current employee if logged in
        if (currentEmployee) {
          const fresh = data.find((e: Employee) => e.id === currentEmployee.id);
          if (fresh) setCurrentEmployee(fresh);
        }
      }
    } catch (err) {
      console.error('Failed to load employees from API', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) {
        setInventory(await res.json());
      }
    } catch (err) {
      console.error('Failed to load inventory from API', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/transactions');
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error('Failed to load transactions from API', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        setAttendance(await res.json());
      }
    } catch (err) {
      console.error('Failed to load attendance from API', err);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    const initAppData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchEmployees(),
        fetchInventory(),
        fetchTransactions(),
        fetchAttendance(),
      ]);
      setIsLoading(false);
    };
    initAppData();
  }, []);

  // Sync current employee local state when general employees state changes (such as pin change or update)
  useEffect(() => {
    if (userRole === 'employee' && currentEmployee) {
      const matched = employees.find(emp => emp.id === currentEmployee.id);
      if (matched) {
        setCurrentEmployee(matched);
      }
    }
  }, [employees, userRole]);

  // LOGOUT HANDLER
  const handleLogout = () => {
    setUserRole(null);
    setCurrentEmployee(null);
    setLoginError(null);
  };

  // LOGIN PORTALS HANDLERS
  const handleAdminLogin = (password: string): boolean => {
    if (password === 'admin123') {
      setUserRole('admin');
      setCurrentEmployee(null);
      setLoginError(null);
      return true;
    }
    return false;
  };

  const handleEmployeeLogin = (employeeId: string, pin: string): boolean => {
    const matched = employees.find(emp => emp.id === employeeId);
    if (matched && matched.pin === pin) {
      setUserRole('employee');
      setCurrentEmployee(matched);
      setLoginError(null);
      return true;
    }
    return false;
  };

  // EMPLOYEE PORTAL ACTIVE ACTIONS
  const handlePunchIn = async (employeeId: string) => {
    try {
      const res = await fetch('/api/attendance/punch-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (res.ok) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Punch in request failed', err);
    }
  };

  const handlePunchOut = async (employeeId: string) => {
    try {
      const res = await fetch('/api/attendance/punch-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (res.ok) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Punch out request failed', err);
    }
  };

  const handleToggleLowStock = async (itemId: string, status: boolean) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markedLowByStaff: status }),
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (err) {
      console.error('Toggle low stock request failed', err);
    }
  };

  // ADMIN PORTAL STAFF DIRECTORY ACTIONS
  const handleAddEmployee = async (emp: Omit<Employee, 'id' | 'avatar' | 'joiningDate'>) => {
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emp),
      });
      if (res.ok) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Failed to add employee', err);
    }
  };

  const handleUpdateEmployee = async (updatedEmp: Employee) => {
    try {
      const res = await fetch(`/api/employees/${updatedEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmp),
      });
      if (res.ok) {
        await fetchEmployees();
      }
    } catch (err) {
      console.error('Failed to update employee', err);
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await Promise.all([fetchEmployees(), fetchAttendance()]);
      }
    } catch (err) {
      console.error('Failed to delete employee', err);
    }
  };

  // ADMIN PORTAL ATTENDANCE CORRECTION
  const handleUpdateAttendance = async (
    employeeId: string,
    date: string,
    status: AttendanceStatus,
    punchIn: string | null,
    punchOut: string | null,
    notes?: string
  ) => {
    try {
      const res = await fetch('/api/attendance/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, date, status, punchIn, punchOut, notes }),
      });
      if (res.ok) {
        await fetchAttendance();
      }
    } catch (err) {
      console.error('Failed to modify attendance', err);
    }
  };

  // ADMIN PORTAL INVENTORY RAW MATERIALS ACTIONS
  const handleRestockItem = async (itemId: string, addQty: number, customPrice?: number) => {
    try {
      const res = await fetch(`/api/inventory/${itemId}/restock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addQty, customPrice }),
      });
      if (res.ok) {
        await Promise.all([fetchInventory(), fetchTransactions()]);
      }
    } catch (err) {
      console.error('Failed to restock material item', err);
    }
  };

  const handleUpdateItem = async (updatedItem: InventoryItem) => {
    try {
      const res = await fetch(`/api/inventory/${updatedItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItem),
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (err) {
      console.error('Failed to update inventory', err);
    }
  };

  const handleAddItem = async (item: Omit<InventoryItem, 'id' | 'markedLowByStaff'>) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        await fetchInventory();
      }
    } catch (err) {
      console.error('Failed to add raw material item', err);
    }
  };

  // ADMIN PORTAL TRANSACTIONS ACTIONS
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTx),
      });
      if (res.ok) {
        await fetchTransactions();
      }
    } catch (err) {
      console.error('Failed to record transaction', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCF9F6] flex flex-col justify-center items-center font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-sage-200 border-t-sage-500 animate-spin" />
        </div>
        <p className="text-earth-600 text-sm font-medium mt-4 tracking-wide animate-pulse">
          Loading gourmet credentials & database records...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#FCF9F6] min-h-screen">
      {userRole === null ? (
        <PortalSelection
          employees={employees}
          onAdminLogin={handleAdminLogin}
          onEmployeeLogin={handleEmployeeLogin}
          loginError={loginError}
          setLoginError={setLoginError}
        />
      ) : userRole === 'admin' ? (
        <AdminPanel
          employees={employees}
          inventory={inventory}
          transactions={transactions}
          attendanceRecords={attendance}
          onAddEmployee={handleAddEmployee}
          onUpdateEmployee={handleUpdateEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateAttendance={handleUpdateAttendance}
          onRestockItem={handleRestockItem}
          onUpdateItem={handleUpdateItem}
          onAddItem={handleAddItem}
          onAddTransaction={handleAddTransaction}
          onLogout={handleLogout}
        />
      ) : userRole === 'employee' && currentEmployee ? (
        <EmployeePanel
          currentEmployee={currentEmployee}
          inventory={inventory}
          attendanceRecords={attendance}
          onPunchIn={handlePunchIn}
          onPunchOut={handlePunchOut}
          onToggleLowStock={handleToggleLowStock}
          onLogout={handleLogout}
        />
      ) : null}
    </div>
  );
}
