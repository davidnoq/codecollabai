"use client"; // Required for client-side hooks like usePathname

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaProjectDiagram, FaUserFriends, FaRegChartBar, FaUser } from "react-icons/fa";

const Sidebar: React.FC = () => {
  const pathname = usePathname(); // Gets the current route

  const sidebarItems = [
    { name: "Workspaces", href: "/dashboard/workspaces", icon: <FaProjectDiagram /> },
    { name: "Previous Matches", href: "/dashboard/previous-matches", icon: <FaUserFriends /> },
    
    { name: "Profile", href: "/dashboard/profile", icon: <FaUser /> },
  ];

  return (
    <div className="w-64 min-h-dvh bg-gray-800 text-white flex flex-col p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">CodeCollab</h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1">
        <ul>
          {sidebarItems.map((item) => (
            <li key={item.name} className="mb-4">
              <Link
                href={item.href}
                className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                  pathname === item.href ? "bg-gray-700" : ""
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
