import React from 'react';
import {
  DollarSign,
  Heart,
  Users,
  GraduationCap,
  Briefcase,
  UserPlus
} from 'lucide-react';
import '../../../styles/admin-metrics.css';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColorClass: 'blue' | 'green' | 'orange' | 'purple';
  description?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, value, icon, iconColorClass, description, trend, trendType 
}) => (
  <div className="admin-metric-card">
    <div className="admin-metric-header">
      <div className={`admin-metric-icon-wrapper ${iconColorClass}`}>
        {icon}
      </div>
      {trend && (
        <span className={`admin-metric-trend ${trendType || 'neutral'}`}>
          {trend}
        </span>
      )}
    </div>
    <div className="admin-metric-content">
      <h3>{title}</h3>
      <p className="admin-metric-value">{value}</p>
    </div>
    {description && (
      <div className="admin-metric-footer">
        <p className="admin-metric-description">{description}</p>
      </div>
    )}
  </div>
);

export const DashboardMetrics: React.FC<{ data: any }> = ({ data }) => {
  if (!data) return null;

  const {
    totalDonadoCRC,
    totalDonadoUSD,
    proyectosApoyados,
    matchesActivos,
    matchesCerradosExitosamente,
    estudiantesActivos,
    exalumnosActivos,
    donantesNuevos,
    donantesRecurrentes,
  } = data;

  const formatterCRC = new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 0 });
  const formatterUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  return (
    <div className="admin-metrics-grid">
      <MetricCard
        title="Total Donado (CRC)"
        value={formatterCRC.format(totalDonadoCRC)}
        icon={<DollarSign size={24} />}
        iconColorClass="blue"
        description="Monto total confirmado"
        trend="+12.4%"
        trendType="positive"
      />
      <MetricCard
        title="Total Donado (USD)"
        value={formatterUSD.format(totalDonadoUSD)}
        icon={<DollarSign size={24} />}
        iconColorClass="green"
        description="Monto total confirmado"
        trend="+8.2%"
        trendType="positive"
      />
      <MetricCard
        title="Proyectos Apoyados"
        value={proyectosApoyados}
        icon={<Heart size={24} />}
        iconColorClass="orange"
        description="Con al menos 1 donación"
        trend="+3"
        trendType="positive"
      />
      <MetricCard
        title="Matches Activos"
        value={matchesActivos}
        icon={<Briefcase size={24} />}
        iconColorClass="purple"
        description="Conexiones actualmente activas"
        trend="Estable"
        trendType="neutral"
      />
      
      {/* Las siguientes tarjetas son secundarias según el diseño, pero se mantienen útiles */}
      <MetricCard
        title="Estudiantes Activos"
        value={estudiantesActivos}
        icon={<GraduationCap size={24} />}
        iconColorClass="blue"
        description="Perfiles visibles y activos"
      />
      <MetricCard
        title="Exalumnos Activos"
        value={exalumnosActivos}
        icon={<Users size={24} />}
        iconColorClass="purple"
        description="Perfiles de mentores/donantes"
      />
      <MetricCard
        title="Nuevos vs Recurrentes"
        value={`${donantesNuevos} / ${donantesRecurrentes}`}
        icon={<UserPlus size={24} />}
        iconColorClass="green"
        description="Primera donación vs historial"
      />
      <MetricCard
        title="Matches Cerrados"
        value={matchesCerradosExitosamente}
        icon={<Briefcase size={24} />}
        iconColorClass="orange"
        description="Completados con éxito"
      />
    </div>
  );
};
