"use client";

import React from 'react';
import Sidebar from '../../components/layout/Sidebar';
import Navbar from '../../components/layout/Navbar';
import { SidebarProvider } from '../../context/SidebarContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F4F4F0] dark:bg-[#0D0D0D] text-[#111] dark:text-[#F5F5F5] font-sans transition-colors duration-300">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          <Navbar />
          <main className="w-full px-6 py-5 flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
