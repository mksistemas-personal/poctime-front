import React from 'react';

const UserList: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Listagem de Usuários</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #ccc' }}>
            <th style={{ textAlign: 'left', padding: '10px' }}>Nome</th>
            <th style={{ textAlign: 'left', padding: '10px' }}>Email</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '10px' }}>João Silva</td>
            <td style={{ padding: '10px' }}>joao@exemplo.com</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
