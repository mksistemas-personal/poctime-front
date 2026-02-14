import React, {useState} from 'react';
import './index.css';
import './App.css';

// prime react
//import "primereact/resources/themes/lara-light-cyan/theme.css"; // Tema
// import "primereact/resources/themes/md-dark-indigo/theme.css";
import "primereact/resources/themes/saga-orange/theme.css";
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import MainLayout from './components/main/MainLayout';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OrganizationList from './components/organizations/OrganizationList';
import EconomicGroupList from './components/economic-group/EconomicGroupList';

function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(page) => setCurrentPage(page)} />;
      case 'organizations':
        return <OrganizationList />;
      case 'economic-groups':
        return <EconomicGroupList />;
      default:
        return <AdminDashboard onNavigate={(page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="App">
      <MainLayout onNavigate={(page) => setCurrentPage(page)} currentPage={currentPage}>
        {renderContent()}
      </MainLayout>
    </div>
  );
}

export default App;
