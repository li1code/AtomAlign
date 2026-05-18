"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../context/SidebarContext';
import { LayoutDashboard, Users, FileText, Settings, PanelLeftClose, PanelLeft } from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { collapsed, toggleSidebar } = useSidebar();

  const adminLinks = [
    { name: 'Governance', href: '/dashboard/admin', icon: LayoutDashboard },
  ];
  const managerLinks = [
    { name: 'Team Overview', href: '/dashboard/manager', icon: Users },
  ];
  const employeeLinks = [
    { name: 'My Goal Sheet', href: '/dashboard/employee', icon: FileText },
  ];

  let links = employeeLinks;
  if (user?.role === 'ADMIN') links = adminLinks;
  if (user?.role === 'MANAGER') links = managerLinks;

  return (
    <div
      className={`h-screen sticky top-0 flex flex-col hidden md:flex shrink-0 z-50 transition-all duration-300 ease-in-out
        bg-white dark:bg-[#111111]
        border-r border-[#E8E8E4] dark:border-white/[0.07]
        ${collapsed ? 'w-[68px]' : 'w-60'}`}
    >
      {/* Brand */}
      <div className={`h-16 flex items-center gap-3 border-b border-[#E8E8E4] dark:border-white/[0.07] shrink-0 ${collapsed ? 'px-4 justify-center' : 'px-5'}`}>
        <div className="w-8 h-8 bg-[#FFB800] rounded-lg flex items-center justify-center shrink-0">
          <div className="w-3 h-3 bg-[#0D0D0D] rounded-sm"></div>
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight text-[#111] dark:text-[#F5F5F5] font-syne whitespace-nowrap">
            AtomAlign
          </span>
        )}
      </div>

      {/* Navigation */}
      <div className={`flex-1 overflow-y-auto ${collapsed ? 'p-2' : 'p-4'}`}>
        {!collapsed && (
          <div className="text-[9px] font-semibold text-[#888] dark:text-[#555] uppercase tracking-[0.1em] mb-4 px-2 font-mono">
            Navigation
          </div>
        )}
        <div className="space-y-1">
          {links.map((link, idx) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;
            return (
              <Link
                key={idx}
                href={link.href}
                title={collapsed ? link.name : undefined}
                className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200
                  ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-[#FEF4DC] dark:bg-[rgba(255,184,0,0.1)] text-[#854F0B] dark:text-[#FFB800]'
                    : 'text-[#555] dark:text-[#A8A8A0] hover:bg-[#F4F4F0] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#111] dark:hover:text-[#F5F5F5]'
                  }`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && link.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom section */}
      <div className={`border-t border-[#E8E8E4] dark:border-white/[0.07] ${collapsed ? 'p-2' : 'p-4'} space-y-1`}>
        <Link
          href="/dashboard/settings"
          title={collapsed ? 'Settings' : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200
            ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
            ${pathname === '/dashboard/settings'
              ? 'bg-[#FEF4DC] dark:bg-[rgba(255,184,0,0.1)] text-[#854F0B] dark:text-[#FFB800]'
              : 'text-[#555] dark:text-[#A8A8A0] hover:bg-[#F4F4F0] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#111] dark:hover:text-[#F5F5F5]'
            }`}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && 'Settings'}
        </Link>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 w-full
            ${collapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'}
            text-[#888] dark:text-[#555] hover:bg-[#F4F4F0] dark:hover:bg-[rgba(255,255,255,0.04)] hover:text-[#111] dark:hover:text-[#F5F5F5]`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
