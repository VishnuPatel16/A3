import React, { useState, useMemo } from 'react';
import { 
  Employee, InventoryItem, Transaction, AttendanceRecord, 
  AttendanceStatus, EmployeeRole, InventoryCategory, TransactionCategory 
} from '../types';
import { 
  TrendingUp, TrendingDown, ClipboardList, Package, DollarSign, Users, LogOut, 
  Plus, AlertTriangle, Check, RefreshCw, X, Sliders, Calendar, Phone, Edit3, 
  Trash2, HelpCircle, Utensils, IndianRupee, Sparkles, MessageSquare, Info
} from 'lucide-react';

interface AdminPanelProps {
  employees: Employee[];
  inventory: InventoryItem[];
  transactions: Transaction[];
  attendanceRecords: AttendanceRecord[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'avatar' | 'joiningDate'>) => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onUpdateAttendance: (
    employeeId: string, 
    date: string, 
    status: AttendanceStatus, 
    punchIn: any, 
    punchOut: any, 
    notes?: string
  ) => void;
  onRestockItem: (itemId: string, addQty: number, customPrice?: number) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onAddItem: (item: Omit<InventoryItem, 'id' | 'markedLowByStaff'>) => void;
  onAddTransaction: (tx: Omit<Transaction, 'id'>) => void;
  onLogout: () => void;
}

export default function AdminPanel({
  employees,
  inventory,
  transactions,
  attendanceRecords,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
  onUpdateAttendance,
  onRestockItem,
  onUpdateItem,
  onAddItem,
  onAddTransaction,
  onLogout,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'inventory' | 'accounts' | 'staff'>('overview');

  // Input states
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState<string | null>(null);

  // Add Employee Form State
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<EmployeeRole>('Waiter');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpSalary, setNewEmpSalary] = useState(15000);
  const [newEmpPin, setNewEmpPin] = useState('');

  // Add Inventory Item Form State
  const [newInvName, setNewInvName] = useState('');
  const [newInvCat, setNewInvCat] = useState<InventoryCategory>('Groceries');
  const [newInvQty, setNewInvQty] = useState(10);
  const [newInvUnit, setNewInvUnit] = useState('kg');
  const [newInvMin, setNewInvMin] = useState(5);
  const [newInvPrice, setNewInvPrice] = useState(100);

  // Add Transaction Form State
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txAmount, setTxAmount] = useState<number>(0);
  const [txCategory, setTxCategory] = useState<TransactionCategory>('Dine-In Sales');
  const [txDetails, setTxDetails] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Management selected Date (default to today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedAttDate, setSelectedAttDate] = useState(todayStr);

  // Restock action State
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockPrice, setRestockPrice] = useState<number>(0);

  // Accounting analytics
  const { totalIncome, totalExpense, netProfit } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      netProfit: inc - exp
    };
  }, [transactions]);

  // Calculate staff present counts for today/selected date
  const selectedDateAttendance = useMemo(() => {
    return attendanceRecords.filter(r => r.date === selectedAttDate);
  }, [attendanceRecords, selectedAttDate]);

  const presentCount = useMemo(() => {
    return selectedDateAttendance.filter(r => r.status === 'Present').length;
  }, [selectedDateAttendance]);

  // Staff check for staff list
  const staffLowStockAlerts = useMemo(() => {
    return inventory.filter(item => item.markedLowByStaff || item.quantity <= item.minStockLevel);
  }, [inventory]);

  // Humanized Business/Chef Insights based on current logs (Pristine English tips)
  const kitchenInsights = useMemo(() => {
    const alerts: string[] = [];
    
    // Low stock insights
    const criticallyLow = inventory.filter(item => item.quantity <= item.minStockLevel);
    if (criticallyLow.length > 0) {
      alerts.push(
        `⚠️ Stock for ${criticallyLow[0].name.split(' (')[0]} is critically low (${criticallyLow[0].quantity} ${criticallyLow[0].unit} left). Please restock immediately so we do not fall short during dinner rush!`
      );
    }

    // High expense insights
    const salaryExpense = transactions.filter(t => t.category === 'Salary Out').reduce((sum, current) => sum + current.amount, 0);
    if (salaryExpense > totalIncome * 0.5 && totalIncome > 0) {
      alerts.push(
        `📈 Staff payroll expenses represent more than 50% of your current dine-in sales. Consider boosting online orders via Zomato/Swiggy or launching special combo meals to improve margins.`
      );
    } else {
      alerts.push(
        `🍀 Mitti Kitchen is performing in a highly stable and balanced manner. Net profit ratio is holding at approximately ${totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0}%, which matches the standard golden ratio for dhabas!`
      );
    }

    // Employee low stock checklist
    const reportedByStaffCount = inventory.filter(i => i.markedLowByStaff).length;
    if (reportedByStaffCount > 0) {
      alerts.push(
        `📝 Staff members (e.g. Chef Rajesh) flagged ${reportedByStaffCount} raw pantry ingredients as "low stock". Please examine and restock them from the Inventory Tab.`
      );
    }

    return alerts;
  }, [inventory, transactions, totalIncome, netProfit]);

  // Handle forms
  const handleAddNewEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName.trim() || !newEmpPhone.trim() || !newEmpPin.trim()) return;
    onAddEmployee({
      name: newEmpName,
      role: newEmpRole,
      phone: newEmpPhone,
      salary: Number(newEmpSalary),
      pin: newEmpPin,
    });
    // Reset
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpPin('');
    setShowAddEmpModal(false);
  };

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvName.trim() || !newInvUnit.trim()) return;
    onAddItem({
      name: newInvName,
      category: newInvCat,
      quantity: Number(newInvQty),
      unit: newInvUnit,
      minStockLevel: Number(newInvMin),
      pricePerUnit: Number(newInvPrice),
      lastRestocked: todayStr,
    });
    // Reset
    setNewInvName('');
    setNewInvQty(10);
    setNewInvMin(5);
    setNewInvPrice(100);
    setShowAddMenuModal(false);
  };

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0 || !txDetails.trim()) return;
    onAddTransaction({
      type: txType,
      amount: Number(txAmount),
      category: txCategory,
      date: txDate,
      details: txDetails,
    });
    // Reset
    setTxAmount(0);
    setTxDetails('');
  };

  const executeRestock = (itemId: string) => {
    onRestockItem(itemId, restockQty, restockPrice > 0 ? restockPrice : undefined);
    setShowRestockModal(null);
    setRestockQty(10);
    setRestockPrice(0);
  };

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-earth-800 flex flex-col font-sans">
      
      {/* Admin header */}
      <header className="bg-white border-b border-earth-300 px-4 md:px-8 py-4.5 flex flex-wrap gap-4 items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-terracotta-500 text-white p-2.5 rounded-xl shadow-sm">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-bold text-earth-900 leading-none">Panjabi da Dhabba</h2>
            <p className="text-[10px] text-terracotta-600 tracking-wider font-semibold mt-1">MANAGER PORTAL</p>
          </div>
        </div>

        {/* Dashboard Nav links */}
        <div className="flex gap-2">
          {/* <div className="bg-earth-100 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-earth-500 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-sage-500 rounded-full animate-pulse shrink-0"></span>
            <span>Manager Mode Active</span>
          </div> */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold text-earth-600 hover:text-terracotta-600 hover:bg-terracotta-50 transition-colors border border-earth-300 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Panel layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-earth-200 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-widest block mb-2 px-2">Console Menu</span>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                  : 'text-earth-800 hover:bg-earth-100/70'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                  : 'text-earth-800 hover:bg-earth-100/70'
              }`}
            >
              <Calendar className="w-4.5 h-4.5" />
              Staff Attendance
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                  : 'text-earth-800 hover:bg-earth-100/70'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              Raw Pantry Stock
            </button>
            <button
              onClick={() => setActiveTab('accounts')}
              className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'accounts'
                  ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                  : 'text-earth-800 hover:bg-earth-100/70'
              }`}
            >
              <DollarSign className="w-4.5 h-4.5" />
              Accounts Ledger
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`w-full py-3 px-4 rounded-2xl flex items-center gap-3 text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-terracotta-500 text-white shadow-sm font-bold'
                  : 'text-earth-800 hover:bg-earth-100/70'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Staff Directory
            </button>
          </div>

          {/* Low Stock Counter widget */}
          {staffLowStockAlerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <span className="font-serif font-bold text-xs md:text-sm">Stock Warnings ({staffLowStockAlerts.length})</span>
              </div>
              <p className="text-[10px] text-amber-800">Inventory are running low. Please check the pantry and restock soon.</p>
            </div>
          )}
        </div>

        {/* Right Side Content Area */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* TAB 1: OVERVIEW BLOCK */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Financial scorecard grids */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-earth-400">Total Revenue</p>
                    <div className="text-2xl font-serif font-bold text-sage-700 flex items-center">
                      <IndianRupee className="w-5 h-5 shrink-0" />
                      <span>{totalIncome.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-sage-50 text-sage-600 rounded-2xl border border-sage-100">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-earth-400">Total Expenses</p>
                    <div className="text-2xl font-serif font-bold text-terracotta-600 flex items-center">
                      <IndianRupee className="w-5 h-5 shrink-0" />
                      <span>{totalExpense.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-terracotta-50 text-terracotta-500 rounded-2xl border border-terracotta-100">
                    <TrendingDown className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm flex items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-xs uppercase tracking-wider font-semibold text-earth-400">Net Profit</p>
                    <div className={`text-2xl font-serif font-bold flex items-center ${netProfit >= 0 ? 'text-sage-700' : 'text-rose-600'}`}>
                      <IndianRupee className="w-5 h-5 shrink-0" />
                      <span>{netProfit.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-2xl border ${netProfit >= 0 ? 'bg-sage-50 text-sage-600 border-sage-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Dynamic Business Insights Block */}
              <div className="bg-[#FAF5EE] border border-[#ECE2D2] rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-terracotta-500" />
                  <h4 className="font-serif font-bold text-earth-900 text-sm md:text-base">Panjabi da Dhabba • Smart Business Insights</h4>
                </div>
                
                <div className="space-y-3">
                  {kitchenInsights.map((insight, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start bg-white/60 p-3.5 rounded-2xl border border-earth-200 text-xs text-earth-800 leading-relaxed">
                      <MessageSquare className="w-4 h-4 text-sage-500 shrink-0 mt-0.5" />
                      <p className="font-medium text-[11px] md:text-xs">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Transaction and Live Staff Attendance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Quick Ledger Input Form */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-earth-200 shadow-sm space-y-4">
                  <h4 className="font-serif font-bold text-earth-900 text-base">Quick Add Transaction</h4>
                  
                  <form onSubmit={handleAddTxSubmit} className="space-y-3">
                    <div className="flex bg-earth-100 p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTxType('income');
                          setTxCategory('Dine-In Sales');
                        }}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          txType === 'income' ? 'bg-white text-sage-700 shadow-xs' : 'text-earth-500'
                        }`}
                      >
                        Add Revenue (+)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTxType('expense');
                          setTxCategory('Grocery Purchase');
                        }}
                        className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                          txType === 'expense' ? 'bg-white text-terracotta-600 shadow-xs' : 'text-earth-500'
                        }`}
                      >
                        Add Expense (-)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-500 uppercase">Amount (₹)</label>
                        <input
                          type="number"
                          placeholder="Amount in ₹"
                          value={txAmount || ''}
                          onChange={(e) => setTxAmount(Number(e.target.value))}
                          className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-terracotta-500"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-earth-500 uppercase">Category</label>
                        <select
                          value={txCategory}
                          onChange={(e) => setTxCategory(e.target.value as TransactionCategory)}
                          className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-terracotta-500 cursor-pointer"
                        >
                          {txType === 'income' ? (
                            <>
                              <option value="Dine-In Sales">Dine-In Sales</option>
                              <option value="Takeaway Sales">Takeaway Sales</option>
                              <option value="Online Orders">Online Orders</option>
                            </>
                          ) : (
                            <>
                              <option value="Grocery Purchase">Grocery Purchase</option>
                              <option value="Electricity & Water">Electricity & Water</option>
                              <option value="Restaurant Rent">Restaurant Rent</option>
                              <option value="General Maintenance">General Maintenance</option>
                              <option value="Salary Out">Salary Out</option>
                              <option value="Other Expense">Other Expense</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-earth-500 uppercase">Transaction Date</label>
                      <input
                        type="date"
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-terracotta-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-earth-500 uppercase">Description Details</label>
                      <input
                        type="text"
                        placeholder="e.g. UPI Payment dinner rush or water cans purchase"
                        value={txDetails}
                        onChange={(e) => setTxDetails(e.target.value)}
                        className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-terracotta-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer mt-2"
                    >
                      Save Transaction
                    </button>
                  </form>
                </div>

                {/* 2. Live Attendance Summary Column */}
                <div className="bg-white rounded-3xl p-5 md:p-6 border border-earth-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-serif font-bold text-earth-900 text-base">Direct Staff Attendance ({selectedAttDate === todayStr ? 'Today' : selectedAttDate})</h4>
                    <span className="text-[10px] bg-sage-50 border border-sage-200 text-sage-700 font-bold px-2 py-0.5 rounded-md">
                      {presentCount} / {employees.length} Active Present
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    {employees.map(emp => {
                      const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedAttDate);
                      return (
                        <div key={emp.id} className="flex justify-between items-center bg-earth-100 border border-earth-200/50 p-2.5 rounded-xl text-xs">
                          <div>
                            <p className="font-bold text-earth-900">{emp.name}</p>
                            <p className="text-[10px] text-earth-500">
                              {emp.role} • {record?.punchIn ? `In: ${record.punchIn}` : 'Not clocked in yet'}
                            </p>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            record?.status === 'Present' 
                              ? 'bg-sage-100 text-sage-700' 
                              : record?.status === 'Half-day'
                              ? 'bg-amber-100 text-amber-700'
                              : record?.status === 'Leave'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record?.status || 'Absent'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ATTENDANCE CORRECTION */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-earth-200 pb-5">
                <div>
                  <h3 className="font-serif font-bold text-earth-900 text-lg">Staff Attendance Records & Manual Correction</h3>
                  <p className="text-xs text-earth-500 mt-1">Select any date to review, punch in/out on behalf of staff, or declare approved leaves.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-earth-500">Choose Date:</span>
                  <input
                    type="date"
                    value={selectedAttDate}
                    onChange={(e) => setSelectedAttDate(e.target.value)}
                    className="bg-earth-100 border border-earth-300 text-earth-900 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-terracotta-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Checklist table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs md:text-sm">
                  <thead>
                    <tr className="border-b border-earth-200 text-earth-500 font-semibold text-xs">
                      <th className="pb-3 px-2">Staff Employee Name</th>
                      <th className="pb-3 px-2">Duty Shift Status</th>
                      <th className="pb-3 px-2">Punch-In Arrival</th>
                      <th className="pb-3 px-2">Punch-Out Departure</th>
                      <th className="pb-3 px-2">Official Notes</th>
                      <th className="pb-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map(emp => {
                      const record = attendanceRecords.find(r => r.employeeId === emp.id && r.date === selectedAttDate);
                      return (
                        <AttendanceRow 
                          key={emp.id}
                          employee={emp}
                          record={record}
                          date={selectedAttDate}
                          onUpdate={onUpdateAttendance}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              
              <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif font-bold text-earth-900 text-lg">Kitchen Pantry - Raw Food Materials</h3>
                    <p className="text-xs text-earth-500 mt-1">Manage pantry ingredients, record bulk purchase restocks, and inspect safety limits.</p>
                  </div>
                  
                  <button
                    onClick={() => setShowAddMenuModal(true)}
                    className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Raw Material
                  </button>
                </div>

                {/* Materials List Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-earth-200 text-earth-500 font-semibold text-xs">
                        <th className="pb-3 px-2">Ingredient</th>
                        <th className="pb-3 px-2">Category</th>
                        <th className="pb-3 px-2">Stock Level</th>
                        <th className="pb-3 px-2">Safety Margin</th>
                        <th className="pb-3 px-2">Est Rate (Per Unit)</th>
                        <th className="pb-3 px-2">Last Restocked</th>
                        <th className="pb-3 px-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map(item => {
                        const isLow = item.quantity <= item.minStockLevel || item.markedLowByStaff;
                        return (
                          <tr key={item.id} className={`border-b border-earth-150 py-3 ${isLow ? 'bg-amber-50/20' : ''}`}>
                            <td className="py-4 px-2 font-serif font-semibold text-earth-900">
                              <div className="flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.markedLowByStaff && (
                                  <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold border border-amber-200 flex items-center gap-0.5">
                                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                                    Staff Flagged
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-2 text-xs text-earth-500 font-medium">{item.category}</td>
                            <td className="py-4 px-2">
                              <span className={`font-semibold font-mono text-xs ${isLow ? 'text-rose-600 font-bold' : 'text-earth-900'}`}>
                                {item.quantity} {item.unit}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-xs font-mono text-earth-500">Min: {item.minStockLevel} {item.unit}</td>
                            <td className="py-4 px-2 font-mono text-xs">₹{item.pricePerUnit}</td>
                            <td className="py-4 px-2 text-xs text-earth-400 font-mono">{item.lastRestocked}</td>
                            <td className="py-4 px-2 text-right">
                              <div className="flex justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setShowRestockModal(item.id);
                                    setRestockQty(10);
                                    setRestockPrice(item.pricePerUnit);
                                  }}
                                  className="py-1 px-2.5 rounded-lg text-xs bg-sage-50 text-sage-700 hover:bg-sage-100 border border-sage-200/50 font-semibold cursor-pointer transition-colors"
                                >
                                  Restock Item
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ACCOUNTS LEDGER */}
          {activeTab === 'accounts' && (
            <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-earth-200 pb-5">
                <div>
                  <h3 className="font-serif font-bold text-earth-900 text-lg">Finance Accounts & Ledger</h3>
                  <p className="text-xs text-earth-500 mt-1">Official financial book registry including dine-in settlements, takeaways, and kitchen expenditure.</p>
                </div>

                <div className="flex bg-earth-100 rounded-lg p-1 text-[11px] font-semibold text-earth-500">
                  📄 Total Operations Registered: {transactions.length} receipts
                </div>
              </div>

              {/* Transactions list */}
              <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center bg-earth-100 border border-earth-200/50 p-4 rounded-2xl">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                          tx.type === 'income' 
                            ? 'bg-sage-100 text-sage-700 border border-sage-200/30' 
                            : 'bg-terracotta-100 text-terracotta-600 border border-terracotta-200/30'
                        }`}>
                          {tx.category}
                        </span>
                        <span className="text-[10px] text-earth-400 font-mono">{tx.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-earth-900">{tx.details}</p>
                      <p className="text-[10px] text-earth-500">Reciept ID: <code className="font-mono">{tx.id}</code></p>
                    </div>

                    <div className={`text-base font-serif font-bold shrink-0 flex items-center ${
                      tx.type === 'income' ? 'text-sage-700' : 'text-terracotta-600'
                    }`}>
                      <span>{tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: STAFF MANAGEMENT */}
          {activeTab === 'staff' && (
            <div className="bg-white rounded-3xl p-6 border border-earth-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif font-bold text-earth-900 text-lg">Staff Directory & Monthly Payroll</h3>
                  <p className="text-xs text-earth-500 mt-1">Create new employee profiles, adjust structural wages, or remove members from rosters.</p>
                </div>
                
                <button
                  onClick={() => {
                    setNewEmpName('');
                    setNewEmpPhone('');
                    setNewEmpPin('');
                    setNewEmpSalary(15000);
                    setShowAddEmpModal(true);
                  }}
                  className="bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Staff Member
                </button>
              </div>

              {/* Roster Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {employees.map(emp => {
                  // Calculate approximate days worked for staff list
                  const records = attendanceRecords.filter(r => r.employeeId === emp.id);
                  const presentCount = records.filter(r => r.status === 'Present').length;
                  const halfDayCount = records.filter(r => r.status === 'Half-day').length;
                  return (
                    <div key={emp.id} className="bg-earth-100 hover:bg-earth-200/60 border border-earth-200 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sage-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {emp.avatar}
                          </div>
                          <div>
                            <h4 className="font-serif font-bold text-earth-900 text-sm md:text-base leading-snug">{emp.name}</h4>
                            <p className="text-xs text-sage-600 font-semibold">{emp.role}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => onDeleteEmployee(emp.id)}
                            className="p-1.5 text-earth-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                            title="Delete Employee"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-earth-200/80 pt-3">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-earth-500 font-semibold">Wages Structure</p>
                          <p className="font-semibold text-earth-900 font-mono">₹{emp.salary.toLocaleString()}/month</p>
                        </div>
                        <div className="space-y-0.5 text-right font-mono">
                          <p className="text-[10px] text-earth-500 font-semibold uppercase">Daily Login PIN</p>
                          <p className="font-bold text-sage-700 bg-white border px-1.5 py-0.5 rounded-md inline-block">{emp.pin}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-earth-600 space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-sage-500" />
                          <span>Phone: {emp.phone}</span>
                        </p>
                        <p className="flex items-center gap-1.5 text-earth-500">
                          <Calendar className="w-3.5 h-3.5 text-sage-500" />
                          <span>Joined: {emp.joiningDate} • Duty Records: {presentCount} Present • {halfDayCount} Half-Days</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-earth-300 py-6 px-4 text-center text-xs text-earth-400 mt-12">
      Panjabi Da Dhabha Indore🍂
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. Modal: Add Employee */}
      {showAddEmpModal && (
        <div className="fixed inset-0 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-earth-300 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-earth-900 text-lg">Add New Employee Profile</h3>
              <button 
                onClick={() => setShowAddEmpModal(false)}
                className="p-1 hover:bg-earth-100 rounded-lg text-earth-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewEmployee} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1.5">
                <label className="block font-semibold text-earth-800">Employee Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Role Selection</label>
                  <select
                    value={newEmpRole}
                    onChange={(e) => setNewEmpRole(e.target.value as EmployeeRole)}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 cursor-pointer"
                  >
                    <option value="Head Chef">Head Chef</option>
                    <option value="Sous Chef">Sous Chef</option>
                    <option value="Manager">Manager</option>
                    <option value="Waiter">Waiter</option>
                    <option value="Cleaner">Cleaner</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Monthly Wages (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={newEmpSalary || ''}
                    onChange={(e) => setNewEmpSalary(Number(e.target.value))}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-[#3C3630] font-semibold text-earth-800">Mobile Phone Number</label>
                  <input 
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={newEmpPhone}
                    onChange={(e) => setNewEmpPhone(e.target.value)}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">4-Digit Security PIN</label>
                  <input 
                    type="text"
                    maxLength={4}
                    placeholder="e.g. 1234"
                    value={newEmpPin}
                    onChange={(e) => setNewEmpPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 font-mono text-center tracking-[0.2em] font-bold"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer mt-2"
              >
                Create Staff Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Add Raw Dining Material */}
      {showAddMenuModal && (
        <div className="fixed inset-0 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full border border-earth-300 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-earth-900 text-lg">Add New Raw Material</h3>
              <button 
                onClick={() => setShowAddMenuModal(false)}
                className="p-1 hover:bg-earth-100 rounded-lg text-earth-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewItem} className="space-y-4 text-xs md:text-sm">
              <div className="space-y-1.5">
                <label className="block font-semibold text-earth-800">Ingredient Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Basmati Rice or Fresh Paneer"
                  value={newInvName}
                  onChange={(e) => setNewInvName(e.target.value)}
                  className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Category</label>
                  <select
                    value={newInvCat}
                    onChange={(e) => setNewInvCat(e.target.value as InventoryCategory)}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 cursor-pointer"
                  >
                    <option value="Groceries">Groceries</option>
                    <option value="Dairy">Dairy</option>
                    <option value="Spices">Spices</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Pantry Unit Type</label>
                  <input 
                    type="text"
                    placeholder="e.g. kg, Litres, Bags"
                    value={newInvUnit}
                    onChange={(e) => setNewInvUnit(e.target.value)}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-terracotta-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Initial Qty</label>
                  <input 
                    type="number"
                    value={newInvQty || ''}
                    onChange={(e) => setNewInvQty(Number(e.target.value))}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-2.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Min Alert</label>
                  <input 
                    type="number"
                    value={newInvMin || ''}
                    onChange={(e) => setNewInvMin(Number(e.target.value))}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-2.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-semibold text-earth-800">Price (Per Unit)</label>
                  <input 
                    type="number"
                    value={newInvPrice || ''}
                    onChange={(e) => setNewInvPrice(Number(e.target.value))}
                    className="w-full bg-earth-100 border border-earth-300 text-earth-900 rounded-xl px-2.5 py-2.5 focus:ring-2 focus:ring-terracotta-500 font-mono"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium py-3 px-4 rounded-xl text-sm transition-colors cursor-pointer mt-2"
              >
                Insert pantry ingredient
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Restock Ingredient and auto-bill */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-earth-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-earth-300 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-serif font-bold text-earth-900 text-base">Restock pantry element</h3>
              <button 
                onClick={() => setShowRestockModal(null)}
                className="p-1 hover:bg-earth-100 rounded-lg text-earth-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs md:text-sm">
              <p className="text-xs text-earth-600">
                Purchasing and adding quantity automatically records a bill payment in your Expense Accounts logs.
              </p>

              <div className="space-y-1.5">
                <label className="block font-semibold text-earth-800">Add Quantity</label>
                <input 
                  type="number"
                  placeholder="Quantity to add"
                  value={restockQty || ''}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full bg-earth-100 text-earth-900 rounded-xl px-3.5 py-2.5 border focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-earth-800">Rate Price per unit (₹)</label>
                <input 
                  type="number"
                  placeholder="Paid price per unit"
                  value={restockPrice || ''}
                  onChange={(e) => setRestockPrice(Number(e.target.value))}
                  className="w-full bg-earth-100 text-earth-900 rounded-xl px-3.5 py-2.5 border focus:ring-2 focus:ring-terracotta-500"
                />
              </div>

              <div className="bg-[#FAF5EE] p-3 rounded-xl border border-[#ECE2D2] text-[11px] text-earth-800 space-y-1">
                <p><strong>Estimated Bill Expense:</strong></p>
                <p className="font-serif font-bold text-sm text-terracotta-600">₹{(restockQty * restockPrice).toLocaleString()}</p>
              </div>

              <button
                type="button"
                onClick={() => executeRestock(showRestockModal)}
                className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Approve Bulk Purchase & Log Expense
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

/* Sub-component for attendance correction row */
interface AttendanceRowProps {
  employee: Employee;
  record: AttendanceRecord | undefined;
  date: string;
  onUpdate: (
    employeeId: string, 
    date: string, 
    status: AttendanceStatus, 
    punchIn: any, 
    punchOut: any, 
    notes?: string
  ) => void;
}

function AttendanceRow({ employee, record, date, onUpdate }: any) {
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<AttendanceStatus>(record?.status || 'Absent');
  const [punchIn, setPunchIn] = useState(record?.punchIn || '09:00 AM');
  const [punchOut, setPunchOut] = useState(record?.punchOut || '06:00 PM');
  const [notes, setNotes] = useState(record?.notes || '');

  const saveRow = () => {
    onUpdate(
      employee.id,
      date,
      status,
      status === 'Absent' || status === 'Leave' ? null : punchIn,
      status === 'Absent' || status === 'Leave' ? null : punchOut,
      notes
    );
    setEditing(false);
  };

  const statusBadgeColor = (st: AttendanceStatus) => {
    switch (st) {
      case 'Present': return 'bg-sage-50 text-sage-700 border border-sage-200';
      case 'Half-day': return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'Leave': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Absent': return 'bg-red-50 text-red-700 border border-red-200';
    }
  };

  if (editing) {
    return (
      <tr className="border-b border-earth-150 py-3 bg-earth-50/50">
        <td className="py-3 px-2 font-serif font-semibold text-earth-900">{employee.name}</td>
        <td className="py-3 px-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="bg-white border rounded px-1.5 py-1 text-xs text-earth-800"
          >
            <option value="Present">Present</option>
            <option value="Half-day">Half-day</option>
            <option value="Leave">Leave</option>
            <option value="Absent">Absent</option>
          </select>
        </td>
        <td className="py-3 px-2">
          {status !== 'Absent' && status !== 'Leave' ? (
            <input 
              type="text"
              value={punchIn}
              onChange={(e) => setPunchIn(e.target.value)}
              className="bg-white border text-center rounded px-1 py-1 w-20 text-xs font-mono"
            />
          ) : (
            <span className="text-earth-400 italic">N/A</span>
          )}
        </td>
        <td className="py-3 px-2">
          {status !== 'Absent' && status !== 'Leave' ? (
            <input 
              type="text"
              value={punchOut}
              onChange={(e) => setPunchOut(e.target.value)}
              className="bg-white border text-center rounded px-1 py-1 w-20 text-xs font-mono"
            />
          ) : (
            <span className="text-earth-400 italic">N/A</span>
          )}
        </td>
        <td className="py-3 px-2">
          <input 
            type="text"
            placeholder="Official remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-white border text-left rounded px-1.5 py-1 w-32 text-xs"
          />
        </td>
        <td className="py-3 px-2 text-right">
          <div className="flex justify-end gap-1">
            <button
              onClick={saveRow}
              className="p-1 text-sage-600 bg-sage-50 border border-sage-200 rounded hover:bg-sage-100 cursor-pointer"
              title="Save Changes"
            >
              <Check className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={() => setEditing(false)}
              className="p-1 text-terracotta-600 bg-terracotta-50 border border-terracotta-200 rounded hover:bg-terracotta-100 cursor-pointer"
              title="Cancel"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-earth-150 py-3 hover:bg-earth-50/30">
      <td className="py-4 px-2 font-serif font-semibold text-earth-900">{employee.name}</td>
      <td className="py-4 px-2">
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusBadgeColor(record?.status || 'Absent')}`}>
          {record?.status || 'Absent'}
        </span>
      </td>
      <td className="py-4 px-2 text-xs font-mono text-earth-900">{record?.punchIn || '--:--'}</td>
      <td className="py-4 px-2 text-xs font-mono text-earth-900">{record?.punchOut || '--:--'}</td>
      <td className="py-4 px-2 text-xs italic text-stone-500 max-w-[150px] truncate" title={record?.notes}>
        {record?.notes ? `💬 ${record.notes}` : '—'}
      </td>
      <td className="py-4 px-2 text-right">
        <button
          onClick={() => {
            setStatus(record?.status || 'Absent');
            setPunchIn(record?.punchIn || '09:00 AM');
            setPunchOut(record?.punchOut || '06:00 PM');
            setNotes(record?.notes || '');
            setEditing(true);
          }}
          className="p-1 hover:bg-earth-150 rounded border border-earth-200 hover:border-earth-300 text-earth-600 flex items-center justify-center inline-block cursor-pointer"
          title="Edit Attendance"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}
