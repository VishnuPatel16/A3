import React, { useState } from 'react';
import { Employee } from '../types';
import { Shield, Users, HelpCircle, ArrowRight, Utensils, Heart, Clock } from 'lucide-react';

interface PortalSelectionProps {
  employees: Employee[];
  onAdminLogin: (password: string) => boolean;
  onEmployeeLogin: (employeeId: string, pin: string) => boolean;
  loginError: string | null;
  setLoginError: (error: string | null) => void;
}

export default function PortalSelection({
  employees,
  onAdminLogin,
  onEmployeeLogin,
  loginError,
  setLoginError,
}: PortalSelectionProps) {
  const [activeTab, setActiveTab] = useState<'admin' | 'employee'>('employee');
  
  // Admin Form State
  const [adminPassword, setAdminPassword] = useState('');
  
  // Employee Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [empPin, setEmpPin] = useState('');
  
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!adminPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }
    const success = onAdminLogin(adminPassword);
    if (!success) {
      setLoginError('Incorrect password! (Hint: use admin123)');
    }
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    if (!selectedEmpId) {
      setLoginError('Please select your name.');
      return;
    }
    if (!empPin.trim()) {
      setLoginError('Please enter your 4-digit PIN.');
      return;
    }
    const success = onEmployeeLogin(selectedEmpId, empPin);
    if (!success) {
      setLoginError('Incorrect PIN! Please examine and try again.');
    }
  };

  // Humanized Time-based Greetings (Pristine English)
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 5 && hours < 12) {
      return { eng: 'Good Morning', icon: '🌅' };
    } else if (hours >= 12 && hours < 17) {
      return { eng: 'Good Afternoon', icon: '☀️' };
    } else if (hours >= 17 && hours < 22) {
      return { eng: 'Good Evening', icon: '🌆' };
    } else {
      return { eng: 'Good Night', icon: '🌙' };
    }
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FCF9F6] text-earth-800 font-sans selection:bg-terracotta-100 selection:text-terracotta-700 relative overflow-hidden">
      
      {/* Decorative leaf motifs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-sage-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-150px] right-[-100px] w-96 h-96 bg-terracotta-50 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      {/* Left Panel: Warm Hospitality Column */}
      <div className="w-full md:w-[45%] bg-[#FAF5EE] border-b md:border-b-0 md:border-r border-earth-300 flex flex-col justify-between p-8 md:p-12 lg:p-16 relative">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-sage-500 text-white p-2.5 rounded-2xl shadow-sm border border-sage-600/20">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold tracking-tight text-earth-900 leading-none">Panjabi da Dhabba</h1>
              <p className="text-xs text-sage-600 tracking-wider uppercase font-medium mt-1">Mass Kitchen Connect</p>
            </div>
          </div>

          <div className="pt-8">
            <span className="text-4xl text-terracotta-500 mb-2 block">{greeting.icon}</span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-earth-900">
              {greeting.eng},<br />
              <span className="text-terracotta-500 font-normal italic">Welcome Back!</span>
            </h2>
          </div>

          <p className="text-earth-800 leading-relaxed text-sm max-w-sm">
            A simple and natural management portal for our delicious Indian dishes and hardworking staff members. 
            Here you can track your <strong>Attendance</strong>, update kitchen <strong>Inventory</strong>, and log restaurant <strong>Accounts</strong>.
          </p>
        </div>

        <div className="space-y-4 pt-12 md:pt-0">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-earth-200 shadow-sm inline-flex items-start gap-3">
            <div className="p-2 bg-terracotta-50 text-terracotta-500 rounded-lg shrink-0">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="text-xs font-serif italic text-earth-900">“Atithi Devo Bhava”</p>
              <p className="text-[10px] text-earth-500 mt-0.5">Warm Indian Hospitality & Organic Taste</p>
            </div>
          </div>

          {/* <div className="flex items-center gap-2 text-xs text-earth-500">
            <Clock className="w-3.5 h-3.5 text-sage-500" />
            <span>Live Recording Portal • Version 2.4</span>
          </div> */}
        
        </div>
      </div>

      {/* Right Panel: Clean Native Indian Authentication Card */}
      <div className="w-full md:w-[55%] flex flex-col justify-center items-center p-6 md:p-12 lg:p-20 relative">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-10 shadow-[0_8px_30px_rgb(51,47,43,0.06)] border border-earth-200">
          
          {/* Custom Tabs */}
          <div className="flex bg-[#F5F2EB] p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => {
                setActiveTab('employee');
                setLoginError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'employee'
                  ? 'bg-white text-earth-900 shadow-sm font-semibold'
                  : 'text-earth-800 hover:text-earth-900 hover:bg-white/40'
              }`}
            >
              <Users className="w-4 h-4 text-sage-500" />
              Employee Login
            </button>
            <button
              onClick={() => {
                setActiveTab('admin');
                setLoginError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-white text-earth-900 shadow-sm font-semibold'
                  : 'text-earth-800 hover:text-earth-900 hover:bg-white/40'
              }`}
            >
              <Shield className="w-4 h-4 text-terracotta-500" />
              Manager Login
            </button>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-earth-900">
              {activeTab === 'employee' ? 'Staff Attendance & Dashboard' : 'Manager Security Login'}
            </h3>
            <p className="text-xs text-earth-500 mt-1">
              {activeTab === 'employee' 
                ? 'Please choose your name from the list and enter your 4-digit PIN' 
                : 'Enter security password to view kitchen metrics, salaries, and reports'}
            </p>
          </div>

          {/* Error Message */}
          {loginError && (
            <div className="mb-6 p-4.5 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-xs md:text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 const-pulse"></span>
              <p className="font-medium">{loginError}</p>
            </div>
          )}

          {/* Employee Login Form */}
          {activeTab === 'employee' ? (
            <form onSubmit={handleEmployeeSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-earth-800">Select Employee Name</label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full bg-earth-100 border border-earth-300 text-earth-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='gray' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`, backgroundPosition: 'calc(100% - 12px) 50%', backgroundRepeat: 'no-repeat', backgroundSize: '18px' }}
                >
                  <option value="">-- Choose your name --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-earth-800">4-Digit PIN</label>
                  <span className="text-[11px] text-sage-600 italic">Security PIN code</span>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  placeholder="• • • •"
                  value={empPin}
                  onChange={(e) => setEmpPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1em] text-lg font-bold bg-earth-100 border border-earth-300 text-earth-800 rounded-xl px-4 py-3 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3.5 px-4 rounded-xl text-sm transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                Access Staff Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-earth-800">Manager Password (Admin Password)</label>
                <input
                  type="password"
                  placeholder="Enter security password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-earth-100 border border-earth-300 text-earth-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500 focus:bg-white transition-all"
                />
              </div>

              <div className="bg-terracotta-50/60 p-3 rounded-xl border border-terracotta-100 text-[11px] text-terracotta-700 leading-relaxed">
                👉 <strong>Authorized Access:</strong> Managers possess administrative rights to modify raw materials, evaluate overall profit columns, and dispense staff salaries.
              </div>

              <button
                type="submit"
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-medium py-3.5 px-4 rounded-xl text-sm transition-all duration-300 hover:shadow-md flex items-center justify-center gap-2 cursor-pointer mt-6"
              >
                Enter Admin Portal
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Cheat Sheet Toggle to verify immediately */}
          <div className="mt-8 pt-6 border-t border-earth-200">
            <button
              type="button"
              onClick={() => setShowCheatSheet(!showCheatSheet)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-earth-500 hover:text-earth-900 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Click to view credentials for demo testing</span>
            </button>

            {showCheatSheet && (
              <div className="mt-3 p-4 bg-earth-100 rounded-2xl border border-earth-200 text-[11px] space-y-2 divide-y divide-earth-200/60 animate-fade-in text-earth-700">
                <div className="pb-1.5 flex justify-between">
                  <span className="font-semibold text-terracotta-600">Manager (Admin Pass)</span>
                  <code className="bg-white px-2 py-0.5 rounded border border-earth-300 text-[10px]">admin123</code>
                </div>
                {employees.map((emp) => (
                  <div key={emp.id} className="pt-1.5 flex justify-between items-center">
                    <span>{emp.name} <span className="text-earth-500">({emp.role})</span></span>
                    <span className="flex items-center gap-1">
                      PIN Code: <code className="bg-white px-1.5 py-0.5 rounded border border-earth-300 text-[10px] font-semibold text-sage-700">{emp.pin}</code>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
