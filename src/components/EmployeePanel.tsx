import React, { useState } from 'react';
import { Employee, InventoryItem, AttendanceRecord, AttendanceStatus } from '../types';
import { 
  LogOut, Clock, CheckSquare, AlertTriangle, 
  CheckCircle2, FileText, Utensils, IndianRupee
} from 'lucide-react';

interface EmployeePanelProps {
  currentEmployee: Employee;
  inventory: InventoryItem[];
  attendanceRecords: AttendanceRecord[];
  onPunchIn: (employeeId: string) => void;
  onPunchOut: (employeeId: string) => void;
  onToggleLowStock: (itemId: string, status: boolean) => void;
  onLogout: () => void;
}

export default function EmployeePanel({
  currentEmployee,
  inventory,
  attendanceRecords,
  onPunchIn,
  onPunchOut,
  onToggleLowStock,
  onLogout,
}: EmployeePanelProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'inventory' | 'payslip'>('attendance');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find employee's today record
  const todayRecord = attendanceRecords.find(
    (r) => r.employeeId === currentEmployee.id && r.date === todayStr
  );

  // Format nice friendly date
  const getFriendlyDateString = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Find monthly stats for employee
  const empRecords = attendanceRecords.filter((r) => r.employeeId === currentEmployee.id);
  const totalPresent = empRecords.filter((r) => r.status === 'Present').length;
  const totalHalfDay = empRecords.filter((r) => r.status === 'Half-day').length;
  const totalLeave = empRecords.filter((r) => r.status === 'Leave').length;
  const totalAbsent = empRecords.filter((r) => r.status === 'Absent').length;

  // Approximate working ratio for salary slips
  const totalDays = 30; // standard month
  const actualPaidDays = totalPresent + (totalHalfDay * 0.5) + totalLeave; // leaves are paid in warm kitchens
  const estimatedEarned = Math.round((actualPaidDays / totalDays) * currentEmployee.salary);

  const handleLowStockAlert = (item: InventoryItem) => {
    const currentMarked = !!item.markedLowByStaff;
    onToggleLowStock(item.id, !currentMarked);
    
    setAlertSuccess(
      !currentMarked 
        ? `Shortage of ${item.name} has been reported to the Manager!`
        : `Low stock alert for ${item.name} has been cleared.`
    );
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const currentStatusTextColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present': return 'text-sage-600 bg-sage-50 border border-sage-200';
      case 'Half-day': return 'text-amber-600 bg-amber-50 border border-amber-200';
      case 'Leave': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'Absent': return 'text-red-600 bg-red-50 border border-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F6] text-earth-800 flex flex-col font-sans">
      
      {/* Upper Brand Nav */}
      <header className="bg-white border-b border-earth-200 shadow-[0_1px_3px_rgba(51,47,43,0.02)] sticky top-0 z-10 px-4 md:px-8 py-4.5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-sage-500 text-white p-2 rounded-xl shadow-sm">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-earth-900 leading-none">Mitti Kitchen</h2>
            <p className="text-[10px] text-sage-600 tracking-wider font-semibold mt-0.5">STAFF HUB</p>
          </div>
        </div>

        {/* Selected Employee Info summary */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs font-semibold text-earth-900">{currentEmployee.name}</p>
            <p className="text-[10px] text-sage-600 font-medium">{currentEmployee.role}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-sage-100 border border-sage-200 text-sage-700 flex items-center justify-center font-bold text-sm shadow-inner">
            {currentEmployee.avatar}
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-earth-500 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-xl transition-all border border-transparent hover:border-terracotta-100 cursor-pointer"
            title="Log out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Staff Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-6">
        
        {/* Friendly Hero Card */}
        <div className="bg-gradient-to-br from-white to-[#FAF8F5] rounded-3xl p-6 md:p-8 border border-earth-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-sage-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
          
          <div className="space-y-3 relative z-10">
            <div className="inline-block bg-terracotta-50 text-terracotta-600 px-3 py-1 rounded-full text-[11px] font-semibold border border-terracotta-100">
              {getFriendlyDateString(todayStr)}
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-semibold text-earth-900 leading-tight">
              Greetings, {currentEmployee.name.split(' (')[0]}
            </h3>
            <p className="text-earth-800 text-xs md:text-sm max-w-xl">
              Welcome back to Panjabi da Dhabba! <br></br>The smooth operation of the kitchen depends on your dedication. Please submit your punch-in status and report raw material needs below.
            </p>
          </div>

          <div className="shrink-0 relative z-10">
            {/* Status Visual widget */}
            {!todayRecord ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center space-y-2">
                <p className="text-xs font-semibold text-amber-700">⚠️ No attendance recorded for today</p>
                <p className="text-[10px] text-earth-500">Please click the "Punch-In" button below.</p>
              </div>
            ) : todayRecord.punchIn && !todayRecord.punchOut ? (
              <div className="bg-sage-50 border border-sage-200 p-4 rounded-2xl text-center space-y-2">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-sage-500 animate-pulse"></span>
                  <p className="text-xs font-semibold text-sage-700">🟢 Shift Active (Punched In)</p>
                </div>
                <p className="text-[11px] text-earth-800">Arrival Time: <strong className="font-mono text-xs">{todayRecord.punchIn}</strong></p>
              </div>
            ) : todayRecord.punchIn && todayRecord.punchOut ? (
              <div className="bg-earth-100 border border-earth-200 p-4 rounded-2xl text-center space-y-1">
                <p className="text-xs font-semibold text-earth-800">✅ Shift Completed</p>
                <div className="text-[10px] text-earth-500 space-y-0.5 font-mono">
                  <p>In: {todayRecord.punchIn}</p>
                  <p>Out: {todayRecord.punchOut}</p>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-center space-y-1">
                <p className="text-xs font-semibold text-blue-700">🗓️ Off Day (On Approved Leave)</p>
                <p className="text-[10px] text-earth-500">Enjoy your rest period today!</p>
              </div>
            )}
          </div>
        </div>

        {/* Alert Feedback Banner */}
        {alertSuccess && (
          <div className="bg-white border-2 border-sage-500 rounded-2xl p-4 shadow-sm text-xs md:text-sm text-sage-700 flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-sage-500 shrink-0" />
            <span className="font-semibold">{alertSuccess}</span>
          </div>
        )}

        {/* Staff Dashboard Tabs */}
        <div className="flex border-b border-earth-200 gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`py-3 px-4 font-serif font-semibold text-sm transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'border-sage-500 text-sage-700'
                : 'border-transparent text-earth-800 hover:text-earth-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Daily Attendance
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-4 font-serif font-semibold text-sm transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'border-sage-500 text-sage-700'
                : 'border-transparent text-earth-800 hover:text-earth-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Report Low Stock
          </button>
          <button
            onClick={() => setActiveTab('payslip')}
            className={`py-3 px-4 font-serif font-semibold text-sm transition-all border-b-2 shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'payslip'
                ? 'border-sage-500 text-sage-700'
                : 'border-transparent text-earth-800 hover:text-earth-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Salary Slip
          </button>
        </div>

        {/* Render Tab Contents */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Action Card: Punch In/Out */}
            <div className="md:col-span-1 bg-white rounded-3xl p-6 border border-earth-200 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h4 className="font-serif font-bold text-earth-900 text-base mb-1">Time Punch Logging</h4>
                <p className="text-xs text-earth-500 leading-relaxed">Register your arrival with "Punch-In" and record departure with "Punch-Out" upon completing your duty.</p>
              </div>

              {/* Punch Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!!todayRecord?.punchIn || todayRecord?.status === 'Leave'}
                  onClick={() => onPunchIn(currentEmployee.id)}
                  className={`w-full py-4.5 px-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                    todayRecord?.punchIn
                      ? 'bg-sage-50/50 text-sage-400 border-sage-100 cursor-not-allowed'
                      : todayRecord?.status === 'Leave'
                      ? 'bg-earth-100 text-earth-400 border-earth-200 cursor-not-allowed'
                      : 'bg-sage-500 hover:bg-sage-600 text-white border-sage-600 shadow-sm'
                  }`}
                >
                  <Clock className="w-6 h-6 shrink-0" />
                  <span className="font-serif font-semibold text-sm">Punch-In Arrival</span>
                  {todayRecord?.punchIn && (
                    <span className="text-[10px] font-mono font-medium">Arrival at {todayRecord.punchIn}</span>
                  )}
                </button>

                <button
                  type="button"
                  disabled={!todayRecord?.punchIn || !!todayRecord?.punchOut}
                  onClick={() => onPunchOut(currentEmployee.id)}
                  className={`w-full py-4.5 px-4 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                    !todayRecord?.punchIn || todayRecord?.punchOut
                      ? 'bg-terracotta-50/20 text-terracotta-300 border-terracotta-100/30 cursor-not-allowed'
                      : 'bg-terracotta-500 hover:bg-terracotta-600 text-white border-terracotta-600 shadow-sm'
                  }`}
                >
                  <LogOut className="w-6 h-6 shrink-0 rotate-180" />
                  <span className="font-serif font-semibold text-sm">Punch-Out Departure</span>
                  {todayRecord?.punchOut && (
                    <span className="text-[10px] font-mono font-medium">Departure at {todayRecord.punchOut}</span>
                  )}
                </button>
              </div>

              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-earth-200/80 text-[11px] text-earth-700 leading-relaxed">
                ℹ️ <strong>Questions?</strong> If you forget your unique PIN or need clock correction, please contact Manager Priya directly.
              </div>
            </div>

            {/* Visual Attendance Logs Summary Column */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Stats Counters */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white p-3 md:p-4 rounded-2xl border border-earth-200 shadow-sm text-center">
                  <p className="text-[10px] md:text-xs text-sage-600 font-semibold mb-1">Total Present</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-sage-700">{totalPresent}</p>
                  <p className="text-[9px] text-earth-400 mt-0.5">Fully Present</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl border border-earth-200 shadow-sm text-center">
                  <p className="text-[10px] md:text-xs text-amber-600 font-semibold mb-1">Half Days</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-amber-600">{totalHalfDay}</p>
                  <p className="text-[9px] text-earth-400 mt-0.5">Short Duties</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl border border-earth-200 shadow-sm text-center">
                  <p className="text-[10px] md:text-xs text-blue-600 font-semibold mb-1">Paid Leave</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-blue-600">{totalLeave}</p>
                  <p className="text-[9px] text-earth-400 mt-0.5">Leave Day</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-2xl border border-earth-200 shadow-sm text-center">
                  <p className="text-[10px] md:text-xs text-red-600 font-semibold mb-1">Absent</p>
                  <p className="text-xl md:text-2xl font-serif font-bold text-red-600">{totalAbsent}</p>
                  <p className="text-[9px] text-earth-400 mt-0.5">Unexcused</p>
                </div>
              </div>

              {/* Chronological List of Records */}
              <div className="bg-white rounded-3xl p-5 md:p-6 border border-earth-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-earth-900 text-base">Attendance Ledger Sheets</h4>
                  <span className="text-[11px] text-earth-500 font-medium">Verified Shifts Log</span>
                </div>

                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {empRecords.length === 0 ? (
                    <p className="text-xs text-earth-400 text-center py-6">No historical records found.</p>
                  ) : (
                    empRecords.map((rec) => (
                      <div key={rec.id} className="flex justify-between items-center p-3 rounded-2xl bg-earth-100 border border-earth-200/50 text-xs gap-3">
                        <div className="space-y-1">
                          <p className="font-medium text-earth-900">
                            {new Date(rec.date).toLocaleDateString('en-US', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-[10px] text-earth-500 font-mono">
                            {rec.punchIn ? `Punch In: ${rec.punchIn}` : 'No Punch-In'} 
                            {rec.punchOut ? ` | Punch Out: ${rec.punchOut}` : ''}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {rec.notes && (
                            <span className="text-[10px] text-stone-500 bg-white border px-1.5 py-0.5 rounded italic max-w-[120px] truncate" title={rec.notes}>
                              💬 {rec.notes}
                            </span>
                          )}
                          <span className={`px-2 py-0.8 rounded-lg font-semibold text-[10px] ${currentStatusTextColor(rec.status)}`}>
                            {rec.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Collaborative Inventory stock checklist selection */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-earth-200 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-serif font-bold text-earth-900 text-lg">Inventory Check & Alerts</h4>
                <p className="text-xs text-earth-500 leading-relaxed mt-1">
                  If you notice any raw material running low in the kitchen pantry during operations, flag it using the buttons below. It immediately flags this item for Manager Priya Sharma.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-amber-700 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Immediate Link to Manager</span>
              </div>
            </div>

            {/* Grid of grocery alerts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {inventory.map((item) => {
                const isWarningStock = item.quantity <= item.minStockLevel;
                const isMarkedLow = !!item.markedLowByStaff;
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isMarkedLow 
                        ? 'bg-amber-50/70 border-amber-300 shadow-inner' 
                        : isWarningStock 
                        ? 'bg-rose-50/40 border-rose-200' 
                        : 'bg-earth-100 border-earth-200 hover:border-earth-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-earth-500">{item.category}</span>
                        {isWarningStock && (
                          <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-lg">Low stock</span>
                        )}
                      </div>
                      <p className="font-medium text-earth-900 text-sm md:text-base">{item.name}</p>
                      <p className="text-xs text-earth-500 font-semibold font-mono">
                        Current level: <strong className="text-earth-900 text-xs">{item.quantity} {item.unit}</strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLowStockAlert(item)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-medium cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                        isMarkedLow
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                          : 'bg-white hover:bg-earth-200 text-earth-800 border border-earth-300'
                      }`}
                    >
                      {isMarkedLow ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Flagged to Manager!</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          <span>Report Low Stock</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive PaySlip Generator component with Traditional Indian style */}
        {activeTab === 'payslip' && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-earth-200 shadow-sm space-y-6">
            <div>
              <h4 className="font-serif font-bold text-earth-900 text-lg">My Monthly Salary Slip (Details)</h4>
              <p className="text-xs text-earth-500 leading-relaxed mt-1">
                Below is the calculated salary receipt for this month based on accumulated attendance registers.
              </p>
            </div>

            {/* Beautiful authentic look receipt slip */}
            <div className="border border-earth-300 rounded-3xl p-6 bg-[#FAF9F6] text-earth-900 max-w-xl mx-auto shadow-sm relative overflow-hidden">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-earth-200 rounded-full border border-dashed border-earth-300 opacity-30 pointer-events-none" />
              
              {/* Slip Header */}
              <div className="text-center border-b border-earth-300 pb-5 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-terracotta-500">Monthly Payroll Slip</span>
                <h5 className="font-serif text-xl font-bold tracking-tight">Mitti Kitchen Cooperative Ltd</h5>
                <p className="text-[10px] text-earth-500">Main Commercial Highway, Dhabba Zone ID: 34320</p>
                <div className="inline-block bg-white border border-earth-300 rounded-lg px-2.5 py-0.5 text-[10px] font-mono mt-1 text-earth-700">
                  Billing Period: June 1st to Present
                </div>
              </div>

              {/* Employee & Bank Info */}
              <div className="grid grid-cols-2 gap-4 py-4 text-xs border-b border-dashed border-earth-300">
                <div className="space-y-1.5">
                  <p className="text-earth-500 font-medium text-[10px] uppercase tracking-wider">Staff Member</p>
                  <p className="font-bold text-earth-900">{currentEmployee.name}</p>
                  <p className="text-earth-500">Role: {currentEmployee.role}</p>
                  <p className="text-earth-500">Phone: {currentEmployee.phone}</p>
                </div>
                <div className="space-y-1.5 text-right font-mono">
                  <p className="text-earth-500 font-medium text-[10px] uppercase tracking-wider">Payroll Log</p>
                  <p className="font-medium text-earth-900">ID: {currentEmployee.id}</p>
                  <p className="text-earth-500">Base Salary: ₹{currentEmployee.salary.toLocaleString()}/month</p>
                  <p className="text-earth-500">Joined: {currentEmployee.joiningDate}</p>
                </div>
              </div>

              {/* Attendance Slip Breakdowns */}
              <div className="py-5 space-y-3 border-b border-earth-300 text-xs">
                <div className="flex justify-between">
                  <span className="text-earth-500">Billing Cycle Days</span>
                  <span className="font-mono">30 Days</span>
                </div>
                <div className="flex justify-between text-sage-700">
                  <span>Fully Present Days</span>
                  <span className="font-semibold font-mono text-sage-600">+{totalPresent} Days</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Half-Day Duties</span>
                  <span className="font-semibold font-mono text-amber-500">+{totalHalfDay} Days (Half Paid)</span>
                </div>
                <div className="flex justify-between text-blue-600">
                  <span>Approved Paid Leaves</span>
                  <span className="font-semibold font-mono">+{totalLeave} Days (Fully Paid)</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Unexcused Absences</span>
                  <span className="font-semibold font-mono">-{totalAbsent} Days (Salary Deducted)</span>
                </div>
              </div>

              {/* Net Payout amount */}
              <div className="py-5 flex justify-between items-center bg-[#ECE7DC]/40 mx-[-24px] px-[24px] mb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-earth-500">Estimated Net Payout Salary</span>
                  <p className="text-xs text-earth-600 italic">Calculated based on actual work attendance logs</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-serif font-bold text-sage-700 flex items-center justify-end">
                    <IndianRupee className="w-5 h-5 stroke-[2.5]" />
                    <span>{estimatedEarned.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-[10px] text-sage-600 bg-sage-50 px-1.5 py-0.5 rounded font-bold border border-sage-200">Pending Approval</span>
                </div>
              </div>

              {/* Bottom Stamp mock */}
              <div className="flex justify-between items-end pt-3 text-[10px] text-earth-500">
                <div className="space-y-1">
                  <p className="italic">Note: This is an auto-generated salary computation slip.</p>
                  <p className="font-semibold">Mitti Kitchen Cooperative Ltd.</p>
                </div>
                <div className="text-center font-serif">
                  <div className="w-16 h-12 border-2 border-sage-500/30 rounded-full flex items-center justify-center text-[10px] font-bold text-sage-600/70 uppercase rotate-[-6deg] bg-white mx-auto shadow-sm">
                    Verified
                  </div>
                  <span className="block mt-2 font-serif text-earth-900 border-t border-earth-300 pt-1">Manager Priya Sharma</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      <footer className="bg-white border-t border-earth-200 py-6 px-4 text-center text-xs text-earth-400">
        Mitti Kitchen - Indian Restaurant & Staff Hub. Clean and organic restaurant management is our priority. 🍃
      </footer>

    </div>
  );
}
