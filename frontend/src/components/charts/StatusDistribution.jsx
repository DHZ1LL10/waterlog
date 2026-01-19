import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function StatusDistribution({ data, height = 300 }) {
  const COLORS = {
    'CLEARED': '#10b981',
    'DEBT': '#ef4444',
    'IN_PROGRESS': '#f59e0b',
    'PENDING': '#6b7280'
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[entry.status] || '#8b5cf6'} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
        <Legend 
          wrapperStyle={{ fontSize: '14px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
