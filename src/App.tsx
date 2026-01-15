import React, { useState } from 'react';
import './index.css';
import './App.css';

// prime react
//import "primereact/resources/themes/lara-light-cyan/theme.css"; // Tema
// import "primereact/resources/themes/md-dark-indigo/theme.css";
import "primereact/resources/themes/saga-orange/theme.css";
import "primereact/resources/primereact.min.css";               // Core CSS
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import MainLayout from './components/main/MainLayout';
import UserList from './components/users/UserList';
import GroupList from './components/users/GroupList';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OrganizationList from './components/organizations/OrganizationList'; // Import do novo componente

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'organizations':
        return <OrganizationList />; // Nova rota para organizações
      case 'users':
        return <UserList />;
      case 'groups':
        return <GroupList />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="App">
      <MainLayout onNavigate={(page) => setCurrentPage(page)}>
        {renderContent()}
      </MainLayout>
    </div>
  );
}

export default App;
