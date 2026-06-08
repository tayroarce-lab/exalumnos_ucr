'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Heart,
  BarChart3,
  Settings,
  HelpCircle,
  GraduationCap,
  ClipboardList,
  ShieldAlert
} from 'lucide-react';
import Image from 'next/image';
import logoUCR from '@/images/Logo_UCR.png';
import '../../../styles/admin-sidebar.css';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const GENERAL_ITEMS: NavItem[] = [
  { href: '/admin/reportes', label: 'Reportes', icon: <BarChart3 size={20} /> },
  { href: '/admin/matches', label: 'Matches', icon: <Briefcase size={20} /> },
  { href: '/admin/donaciones', label: 'Donaciones', icon: <Heart size={20} /> },
  { href: '/admin/usuarios', label: 'Usuarios', icon: <Users size={20} /> },
  { href: '/admin/vacantes', label: 'Vacantes', icon: <ClipboardList size={20} /> },
  { href: '/admin/denuncias', label: 'Denuncias', icon: <ShieldAlert size={20} /> },
];

const SUPPORT_ITEMS: NavItem[] = [
  { href: '/admin/configuracion', label: 'Configuración', icon: <Settings size={20} /> },
  { href: '/admin/ayuda', label: 'Ayuda', icon: <HelpCircle size={20} /> },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  // Comprueba si el enlace es la ruta activa actualmente
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="admin-sidebar">
      {/* Logo / Nombre de la plataforma */}
      <div className="admin-sidebar-header">
        <Link href="/" className="admin-sidebar-logo">
          <Image 
            src={logoUCR} 
            alt="Logo Alumni UCR" 
            width={220} 
            height={75} 
            className="admin-sidebar-logo-img"
            style={{ objectFit: 'contain' }}
            priority
          />
        </Link>
      </div>

      {/* Menú de navegación principal */}
      <nav className="admin-sidebar-nav">
        <div className="admin-nav-section">
          <span className="admin-nav-title">General</span>
          {GENERAL_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="admin-nav-section">
          <span className="admin-nav-title">Soporte</span>
          {SUPPORT_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Perfil del administrador en la base del sidebar */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-profile">
          <div className="admin-user-avatar">A</div>
          <div className="admin-user-info">
            <p className="admin-user-name">Administrador</p>
            <p className="admin-user-role">admin@exalumnos.ucr.ac.cr</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
