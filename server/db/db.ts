import fs from 'fs';
import path from 'path';
import { Employee, InventoryItem, Transaction, AttendanceRecord } from '../../src/types';

// Let's establish relative directories safely
const DATA_DIR = path.join(process.cwd(), 'server', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  employees: Employee[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  attendance: AttendanceRecord[];
}

// Generate dates relative to execution time
const today = new Date().toISOString().split('T')[0];
const yesterdayObj = new Date();
yesterdayObj.setDate(yesterdayObj.getDate() - 1);
const yesterday = yesterdayObj.toISOString().split('T')[0];

const dayBeforeObj = new Date();
dayBeforeObj.setDate(dayBeforeObj.getDate() - 2);
const dayBefore = dayBeforeObj.toISOString().split('T')[0];

const getDefaultData = (): DatabaseSchema => ({
  employees: [
    {
      id: 'emp-1',
      name: 'Rajesh Kumar',
      role: 'Head Chef',
      phone: '+91 98765 43210',
      salary: 35000,
      pin: '1234',
      avatar: 'RK',
      joiningDate: '2025-01-10',
    },
    {
      id: 'emp-2',
      name: 'Priya Sharma',
      role: 'Manager',
      phone: '+91 98123 45678',
      salary: 28000,
      pin: '2580',
      avatar: 'PS',
      joiningDate: '2025-03-15',
    },
    {
      id: 'emp-3',
      name: 'Amit Patel',
      role: 'Waiter',
      phone: '+91 97654 32109',
      salary: 15000,
      pin: '1122',
      avatar: 'AP',
      joiningDate: '2025-05-01',
    },
    {
      id: 'emp-4',
      name: 'Vikram Singh',
      role: 'Cleaner',
      phone: '+91 95432 10987',
      salary: 12000,
      pin: '9988',
      avatar: 'VS',
      joiningDate: '2025-06-12',
    },
    {
      id: 'emp-5',
      name: 'Neha Verma',
      role: 'Cashier',
      phone: '+91 91234 56789',
      salary: 18000,
      pin: '4321',
      avatar: 'NV',
      joiningDate: '2025-11-20',
    },
  ],
  inventory: [
    {
      id: 'inv-1',
      name: 'Basmati Rice',
      category: 'Groceries',
      quantity: 45,
      unit: 'kg',
      minStockLevel: 15,
      pricePerUnit: 120,
      lastRestocked: '2026-06-10',
      markedLowByStaff: false,
    },
    {
      id: 'inv-2',
      name: 'Farm Fresh Paneer',
      category: 'Dairy',
      quantity: 4.5,
      unit: 'kg',
      minStockLevel: 6,
      pricePerUnit: 340,
      lastRestocked: '2026-06-18',
      markedLowByStaff: false,
    },
    {
      id: 'inv-3',
      name: 'Shudh Desi Ghee',
      category: 'Dairy',
      quantity: 12,
      unit: 'Litres',
      minStockLevel: 4,
      pricePerUnit: 680,
      lastRestocked: '2026-06-08',
      markedLowByStaff: false,
    },
    {
      id: 'inv-4',
      name: 'Kachi Ghani Mustard Oil',
      category: 'Groceries',
      quantity: 18,
      unit: 'Litres',
      minStockLevel: 5,
      pricePerUnit: 175,
      lastRestocked: '2026-06-12',
      markedLowByStaff: false,
    },
    {
      id: 'inv-5',
      name: 'Whole Wheat Atta',
      category: 'Groceries',
      quantity: 75,
      unit: 'kg',
      minStockLevel: 20,
      pricePerUnit: 48,
      lastRestocked: '2026-06-14',
      markedLowByStaff: false,
    },
    {
      id: 'inv-6',
      name: 'Spicy Garam Masala',
      category: 'Spices',
      quantity: 1.5,
      unit: 'kg',
      minStockLevel: 3,
      pricePerUnit: 450,
      lastRestocked: '2026-05-20',
      markedLowByStaff: true,
    },
    {
      id: 'inv-7',
      name: 'Kashmiri Lalchili Powder',
      category: 'Spices',
      quantity: 5,
      unit: 'kg',
      minStockLevel: 2,
      pricePerUnit: 320,
      lastRestocked: '2026-06-12',
      markedLowByStaff: false,
    },
    {
      id: 'inv-8',
      name: 'Red Onions',
      category: 'Vegetables',
      quantity: 12,
      unit: 'kg',
      minStockLevel: 15,
      lastRestocked: '2026-06-15',
      pricePerUnit: 35,
      markedLowByStaff: false,
    },
    {
      id: 'inv-9',
      name: 'Fresh Tomatoes',
      category: 'Vegetables',
      quantity: 3,
      unit: 'kg',
      minStockLevel: 8,
      pricePerUnit: 40,
      lastRestocked: '2026-06-17',
      markedLowByStaff: true,
    },
    {
      id: 'inv-10',
      name: 'Amul Full Cream Milk',
      category: 'Dairy',
      quantity: 2,
      unit: 'Litres',
      minStockLevel: 10,
      pricePerUnit: 66,
      lastRestocked: '2026-06-18',
      markedLowByStaff: true,
    },
  ],
  transactions: [
    {
      id: 't-1',
      type: 'income',
      amount: 14500,
      category: 'Dine-In Sales',
      date: '2026-06-18',
      details: 'Thursday Dinner Rush (18 Cash Bills + UPI payment)',
    },
    {
      id: 't-2',
      type: 'income',
      amount: 8400,
      category: 'Online Orders',
      date: '2026-06-18',
      details: 'Zomato & Swiggy online order settlements',
    },
    {
      id: 't-3',
      type: 'expense',
      amount: 3200,
      category: 'Grocery Purchase',
      date: '2026-06-18',
      details: 'Daily fresh dairy, coriander, ginger and mint purchase',
    },
    {
      id: 't-4',
      type: 'income',
      amount: 12200,
      category: 'Dine-In Sales',
      date: '2026-06-17',
      details: 'Wednesday Lunch & Dinner bills',
    },
    {
      id: 't-5',
      type: 'income',
      amount: 5120,
      category: 'Takeaway Sales',
      date: '2026-06-17',
      details: 'Direct takeaway evening chats and tandoor items',
    },
    {
      id: 't-6',
      type: 'expense',
      amount: 1400,
      category: 'Electricity & Water',
      date: '2026-06-15',
      details: 'Borewell water pump maintenance & drinking water cans',
    },
    {
      id: 't-7',
      type: 'expense',
      amount: 45000,
      category: 'Restaurant Rent',
      date: '2026-06-01',
      details: 'June Rent paid to landlord Mr. Gupta',
    },
    {
      id: 't-8',
      type: 'expense',
      amount: 12000,
      category: 'Electricity & Water',
      date: '2026-06-05',
      details: 'State EB Commercial Electricity Bill',
    },
    {
      id: 't-9',
      type: 'expense',
      amount: 6500,
      category: 'General Maintenance',
      date: '2026-06-14',
      details: 'Commercial LPG Gas Cylinder refilled (4 cylinders)',
    },
    {
      id: 't-10',
      type: 'expense',
      amount: 108000,
      category: 'Salary Out',
      date: '2026-06-02',
      details: 'May Month Staff Salaries Disbursed',
    },
  ],
  attendance: [
    {
      id: 'att-db-1',
      employeeId: 'emp-1',
      date: dayBefore,
      status: 'Present',
      punchIn: '09:05 AM',
      punchOut: '09:30 PM',
      notes: 'On-time. Special dinner prep.',
    },
    {
      id: 'att-db-2',
      employeeId: 'emp-2',
      date: dayBefore,
      status: 'Present',
      punchIn: '08:50 AM',
      punchOut: '08:00 PM',
      notes: 'Inventory checked',
    },
    {
      id: 'att-db-3',
      employeeId: 'emp-3',
      date: dayBefore,
      status: 'Present',
      punchIn: '10:00 AM',
      punchOut: '10:00 PM',
    },
    {
      id: 'att-db-4',
      employeeId: 'emp-4',
      date: dayBefore,
      status: 'Present',
      punchIn: '08:30 AM',
      punchOut: '06:00 PM',
    },
    {
      id: 'att-db-5',
      employeeId: 'emp-5',
      date: dayBefore,
      status: 'Present',
      punchIn: '09:55 AM',
      punchOut: '08:00 PM',
    },
    {
      id: 'att-y-1',
      employeeId: 'emp-1',
      date: yesterday,
      status: 'Present',
      punchIn: '09:12 AM',
      punchOut: '09:45 PM',
    },
    {
      id: 'att-y-2',
      employeeId: 'emp-2',
      date: yesterday,
      status: 'Present',
      punchIn: '08:45 AM',
      punchOut: '08:15 PM',
    },
    {
      id: 'att-y-3',
      employeeId: 'emp-3',
      date: yesterday,
      status: 'Leave',
      punchIn: null,
      punchOut: null,
      notes: 'Urgent home work',
    },
    {
      id: 'att-y-4',
      employeeId: 'emp-4',
      date: yesterday,
      status: 'Present',
      punchIn: '08:40 AM',
      punchOut: '06:10 PM',
    },
    {
      id: 'att-y-5',
      employeeId: 'emp-5',
      date: yesterday,
      status: 'Present',
      punchIn: '10:02 AM',
      punchOut: '08:05 PM',
    },
    {
      id: 'att-t-1',
      employeeId: 'emp-1',
      date: today,
      status: 'Present',
      punchIn: '09:08 AM',
      punchOut: null,
    },
    {
      id: 'att-t-2',
      employeeId: 'emp-2',
      date: today,
      status: 'Present',
      punchIn: '08:40 AM',
      punchOut: null,
    },
    {
      id: 'att-t-4',
      employeeId: 'emp-4',
      date: today,
      status: 'Present',
      punchIn: '08:35 AM',
      punchOut: '06:00 PM',
    },
  ],
});

export class Database {
  private static init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(getDefaultData(), null, 2), 'utf-8');
    }
  }

  static read(): DatabaseSchema {
    this.init();
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as DatabaseSchema;
    } catch (err) {
      console.error('Failed to read database, returning default data', err);
      return getDefaultData();
    }
  }

  static write(data: DatabaseSchema): void {
    this.init();
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file', err);
    }
  }

  // --- EMPLOYEES CRUD ---
  static getEmployees(): Employee[] {
    return this.read().employees;
  }

  static saveEmployees(employees: Employee[]): void {
    const data = this.read();
    data.employees = employees;
    this.write(data);
  }

  // --- INVENTORY CRUD ---
  static getInventory(): InventoryItem[] {
    return this.read().inventory;
  }

  static saveInventory(inventory: InventoryItem[]): void {
    const data = this.read();
    data.inventory = inventory;
    this.write(data);
  }

  // --- TRANSACTIONS CRUD ---
  static getTransactions(): Transaction[] {
    return this.read().transactions;
  }

  static saveTransactions(transactions: Transaction[]): void {
    const data = this.read();
    data.transactions = transactions;
    this.write(data);
  }

  // --- ATTENDANCE CRUD ---
  static getAttendance(): AttendanceRecord[] {
    return this.read().attendance;
  }

  static saveAttendance(attendance: AttendanceRecord[]): void {
    const data = this.read();
    data.attendance = attendance;
    this.write(data);
  }
}
