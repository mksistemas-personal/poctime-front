import React from 'react';

const AdminDashboard: React.FC = () => {
  // Simulando dados que viriam de uma API
  const stats = {
    totalUsers: 150,
    totalGroups: 12,
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '200px',
    textAlign: 'center',
    marginRight: '20px'
  };

  return (
    <div style={{ padding: '30px' }}>
      <h1>Dashboard Administrativo</h1>
      
      <div style={{ display: 'flex', marginTop: '20px' }}>
        <div style={cardStyle}>
          <h3 style={{ color: '#7f8c8d', margin: 0 }}>Usuários</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50', margin: '10px 0' }}>
            {stats.totalUsers}
          </p>
          <span style={{ color: '#27ae60', fontSize: '0.9rem' }}>● Ativos</span>
        </div>

        <div style={cardStyle}>
          <h3 style={{ color: '#7f8c8d', margin: 0 }}>Grupos</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2c3e50', margin: '10px 0' }}>
            {stats.totalGroups}
          </p>
          <span style={{ color: '#2980b9', fontSize: '0.9rem' }}>● Categorias</span>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
