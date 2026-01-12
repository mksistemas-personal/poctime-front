import React from 'react';

const GroupList: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Listagem de Grupos de Usuários</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ background: '#fff', margin: '10px 0', padding: '15px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <strong>Administradores</strong> - Acesso total ao sistema
        </li>
        <li style={{ background: '#fff', margin: '10px 0', padding: '15px', borderRadius: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <strong>Operadores</strong> - Acesso a rotinas de lançamento
        </li>
      </ul>
    </div>
  );
};

export default GroupList;
