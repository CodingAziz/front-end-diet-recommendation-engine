import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/automatic", label: "Auto Recommendation", icon: "💪" },
    { path: "/custom", label: "Custom Food", icon: "🔍" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-emerald-400">SmartBite.</h1>
          <p className="text-xs text-slate-400 mt-1">Smart Nutrition Planner</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 space-x-3 hover:bg-slate-800 transition-colors ${location.pathname === item.path ? "bg-emerald-600/20 border-r-4 border-emerald-500" : ""}`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 relative">
        <header className="md:hidden bg-white p-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
          <h1 className="text-xl font-bold text-emerald-600">DietSys.</h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 bg-gray-100 rounded"
          >
            ☰
          </button>
        </header>
        <div className="max-w-6xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
