import React from 'react';
import { Sidebar } from '@/components/admin/layout/Sidebar';
import { AdminFooter } from '@/components/admin/layout/AdminFooter';
import '../../../styles/admin-dashboard.css';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main-content">
        {children}
        <AdminFooter />
      </div>
    </div>
  );
}
