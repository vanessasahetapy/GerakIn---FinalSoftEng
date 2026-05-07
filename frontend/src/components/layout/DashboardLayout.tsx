// === FILE: src/components/layout/DashboardLayout.tsx ===
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface DashboardLayoutProps {
  title?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -5 },
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title }) => {
  return (
    <div className="flex h-screen bg-deep overflow-hidden bg-mesh">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 md:ml-[260px] relative">
        <div className="absolute inset-0 bg-mesh opacity-50 pointer-events-none" />
        <TopBar title={title} />
        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 overflow-y-auto p-8 md:p-12 relative z-10 scrollbar-hide"
        >
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};
