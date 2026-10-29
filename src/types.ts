export type EmployeeRole = 
  | 'Owner'
  | 'Manager'
  | 'Head Chef'
  | 'Sous Chef'
  | 'Waiter'
  | 'Cleaner'
  | 'Cashier';

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  phone: string;
  salary: number; // in ₹ per month
  pin: string; // PIN for check-in
  avatar: string; // url or initials
  joiningDate: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  punchIn: string | null; // HH:MM AM/PM
  punchOut: string | null; // HH:MM AM/PM
  notes?: string;
}

export type InventoryCategory = 'Groceries' | 'Dairy' | 'Spices' | 'Vegetables' | 'Others';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  unit: string; // kg, Litres, Bags, Packets
  minStockLevel: number; // Alerts below this
  pricePerUnit: number; // Cost in ₹
  lastRestocked: string; // YYYY-MM-DD
  markedLowByStaff?: boolean; // Set by staff to warn admin
}

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 
  | 'Dine-In Sales' 
  | 'Takeaway Sales' 
  | 'Online Orders' 
  | 'Grocery Purchase' 
  | 'Electricity & Water' 
  | 'Restaurant Rent' 
  | 'General Maintenance' 
  | 'Salary Out' 
  | 'Other Expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: TransactionCategory;
  date: string; // YYYY-MM-DD
  details: string;
}

export interface AIAdvice {
  id: string;
  targetDate: string;
  status: 'low_stock' | 'profitable' | 'high_expense' | 'general';
  title: string;
  message: string;
}
