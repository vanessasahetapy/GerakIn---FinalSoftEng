// === FILE: src/components/layout/Sidebar.tsx ===
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard, Calendar, CalendarCheck, Heart, Clock,
  Users, User, BookOpen, ClipboardList, BarChart2,
  LogOut, ChevronLeft, ChevronRight, Zap, MessageSquare
} from 'lucide-react';

interface NavItem { label: string; path: string; icon: React.ReactNode; }

const userNav: NavItem[] = [
  { label: 'Dasbor',     path: '/user/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Booking',    path: '/user/booking',   icon: <BookOpen size={18} />        },
  { label: 'Pesan',      path: '/user/messages',  icon: <MessageSquare size={18} />   },
  { label: 'Jadwal',     path: '/user/schedule',  icon: <Calendar size={18} />        },
  { label: 'Kebiasaan',  path: '/user/habits',    icon: <Heart size={18} />           },
  { label: 'Riwayat',    path: '/user/history',   icon: <Clock size={18} />           },
  { label: 'AI Coach',   path: '/user/ai-coach',  icon: <Zap size={18} />              },
  { label: 'Profil',     path: '/user/profile',   icon: <User size={18} />             },
];
const trainerNav: NavItem[] = [
  { label: 'Dasbor',      path: '/trainer/dashboard',    icon: <LayoutDashboard size={18} /> },
  { label: 'Pesan',       path: '/trainer/messages',     icon: <MessageSquare size={18} />   },
  { label: 'Permintaan',  path: '/trainer/requests',     icon: <ClipboardList size={18} />   },
  { label: 'Ketersediaan', path: '/trainer/availability', icon: <CalendarCheck size={18} />   },
  { label: 'Klien',       path: '/trainer/clients',      icon: <Users size={18} />           },
  { label: 'Profil',      path: '/trainer/profile',      icon: <User size={18} />            },
];
const adminNav: NavItem[] = [
  { label: 'Dasbor',     path: '/admin/dashboard',  icon: <LayoutDashboard size={18} /> },
  { label: 'Analitik',   path: '/admin/analytics',  icon: <BarChart2 size={18} />       },
];

export const Sidebar: React.FC = () => {
  const { currentUser, role, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = role === 'admin' ? adminNav : role === 'trainer' ? trainerNav : userNav;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-full bg-bg-base border-r border-border z-30 flex flex-col overflow-hidden"
      style={{ minWidth: collapsed ? 80 : 260 }}
    >
      {/* Header section with Logo and Expand/Collapse */}
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5 select-none">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="font-bold text-lg text-white tracking-tight uppercase font-barlow italic"
            >
              Gerak<span className="text-accent">In</span>
            </motion.span>
          )}
        </div>
      </div>


      {/* Nav */}
      <nav className="flex-1 px-3 py-6 flex flex-col gap-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 group relative',
                isActive
                  ? 'bg-accent text-white shadow-lg shadow-accent/20'
                  : 'text-text-light hover:bg-white/5 hover:text-white'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="shrink-0">{item.icon}</span>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && !collapsed && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-white/5 px-4 py-6 bg-bg-surface/30">
        {!collapsed && currentUser && (
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate leading-tight">{currentUser.name}</p>
              <p className="text-text-light text-[10px] truncate opacity-50 uppercase tracking-widest">{currentUser.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-light hover:bg-danger/10 hover:text-red-400 transition-all duration-150 w-full text-sm font-bold"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span>Keluar Sistem</span>}
        </button>
      </div>
    </motion.aside>
  );
};
