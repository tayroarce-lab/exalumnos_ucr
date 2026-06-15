import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import '../../../styles/admin-charts.css';

interface DashboardChartsProps {
  graficosCarrera: { name: string; value: number }[];
  graficosSede: { name: string; value: number }[];
}

const BRAND_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  graficosCarrera,
  graficosSede
}) => {
  return (
    <div className="admin-charts-container">
      {/* Gráfico de Distribución por Carrera */}
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <h3>Distribución por Carrera (Matches/Donaciones)</h3>
        </div>
        <div className="admin-chart-body">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <BarChart
              data={graficosCarrera}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
              />
              <Tooltip cursor={{ fill: '#f1f5f9' }} />
              <Bar dataKey="value" fill="#0A2540" radius={[4, 4, 0, 0]}>
                {graficosCarrera.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#0A2540' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Distribución por Sede */}
      <div className="admin-chart-card">
        <div className="admin-chart-header">
          <h3>Estudiantes por Sede UCR</h3>
        </div>
        <div className="admin-chart-body">
          <ResponsiveContainer width="100%" height="100%" minHeight={300}>
            <PieChart>
              <Pie
                data={graficosSede}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
              >
                {graficosSede.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BRAND_COLORS[index % BRAND_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#64748b', paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
