import React from "react";
import Sidebar from "../components/sidebar";

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 min-h-screen bg-indigo-800 p-4">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
