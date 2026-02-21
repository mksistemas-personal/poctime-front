import React from 'react';
import './index.css';
import './App.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';

// prime react
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import MainLayout from './components/main/MainLayout';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OrganizationList from './components/organizations/OrganizationList';
import EconomicGroupList from './components/economic-group/EconomicGroupList';
import ClientList from "./components/clients/ClientList";
import PersonList from "./components/person/PersonList";

function App() {
  return (
    <Router>
      <div className="App">
        <MainLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<AdminDashboard />} />
            <Route path="/people" element={<PersonList />} />
            <Route path="/organizations" element={<OrganizationList />} />
            <Route path="/economic-groups" element={<EconomicGroupList />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </MainLayout>
      </div>
    </Router>
  );
}

export default App;
