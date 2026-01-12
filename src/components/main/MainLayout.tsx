import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void; // Adicionado esta prop
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate }) => {
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      {/* Menu Lateral */}
      <aside style={{ width: '240px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h3>Sistema Admin</h3>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <li 
              onClick={() => onNavigate('dashboard')} 
              style={{ padding: '10px 0', cursor: 'pointer' }}
            >
              Dashboard
            </li>
            <li 
              onClick={() => onNavigate('organizations')} 
              style={{ padding: '10px 0', cursor: 'pointer' }}
            >
              Organizações
            </li>
            <li 
              onClick={() => onNavigate('users')} 
              style={{ padding: '10px 0', cursor: 'pointer' }}
            >
              Usuários
            </li>
            <li 
              onClick={() => onNavigate('groups')} 
              style={{ padding: '10px 0', cursor: 'pointer' }}
            >
              Grupos de Usuários
            </li>
          </ul>
        </nav>
      </aside>

      {/* Área Direita (Topo + Conteúdo) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Barra de Topo */}
        <header style={{ 
          height: '60px', 
          backgroundColor: '#ecf0f1', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          padding: '0 20px',
          borderBottom: '1px solid #bdc3c7'
        }}>
          <div style={{ marginRight: '20px' }}>
            <label>Org: </label>
            <select>
              <option>Organização Matriz</option>
              <option>Filial 01</option>
            </select>
          </div>
          <div>
            <label>Usuário: </label>
            <select>
              <option>Admin</option>
              <option>Sair</option>
            </select>
          </div>
        </header>

        {/* Área de Conteúdo Central */}
        <main style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f9f9f9' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
