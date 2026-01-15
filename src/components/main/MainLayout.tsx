import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Avatar } from 'primereact/avatar';
import { Ripple } from 'primereact/ripple';

interface MainLayoutProps {
    children: React.ReactNode;
    onNavigate: (page: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavigate }) => {
    const [selectedOrg, setSelectedOrg] = useState(null);

    // Mock de organizações para o seletor
    const organizations = [
        { name: 'Organização Matriz', code: '001' },
        { name: 'Filial Nordeste', code: '002' },
        { name: 'Filial Sul', code: '003' }
    ];

    return (
        <div className="min-h-screen flex flex-column surface-ground">
            {/* Topbar Customizada */}
            <header className="surface-card shadow-2 h-4rem flex align-items-center justify-content-between px-4 z-5 sticky top-0">
                <div className="flex align-items-center">
                    <img alt="logo" src="logo.svg" height="30" className="mr-4 cursor-pointer" onClick={() => onNavigate('dashboard')} />
                </div>

                <div className="flex align-items-center gap-3">
                    {/* Seletor de Organização */}
                    <span className="p-input-icon-left hidden md:block">
                        <i className="pi pi-building mr-2" />
                        <Dropdown
                            value={selectedOrg}
                            options={organizations}
                            onChange={(e) => setSelectedOrg(e.value)}
                            optionLabel="name"
                            placeholder="Organização"
                            className="w-full md:w-20rem border-none bg-gray-100"
                        />
                    </span>
                    {/* Ações de Usuário */}
                    <Button icon="pi pi-bell" className="p-button-rounded p-button-text p-button-secondary" />
                    <Button icon="pi pi-cog" className="p-button-rounded p-button-text p-button-secondary" />
                    
                    <div className="border-left-1 surface-border h-2rem mx-2"></div>
                    
                    <div className="flex align-items-center cursor-pointer p-2 border-round hover:surface-100 transition-colors">
                        <Avatar label="JD" shape="circle" className="bg-primary text-white" />
                        <div className="flex flex-column ml-2 hidden sm:flex">
                            <span className="font-bold text-sm">João Doe</span>
                            <span className="text-xs text-600">Admin</span>
                        </div>
                    </div>
                    
                    <Button 
                        label="Sair" 
                        icon="pi pi-sign-out" 
                        className="p-button-outlined p-button-danger p-button-sm ml-2" 
                        onClick={() => console.log('Sign Out')}
                    />
                </div>
            </header>

            <div className="flex flex-grow-1">
                {/* Menu Lateral Simplificado */}
                <aside className="hidden md:flex flex-column w-16rem surface-section border-right-1 surface-border shadow-1">
                    <nav className="p-3">
                        <ul className="list-none p-0 m-0">
                            <li className="mb-2">
                                <a onClick={() => onNavigate('dashboard')} className="p-ripple flex align-items-center cursor-pointer p-3 text-700 border-round hover:surface-100 transition-colors transition-duration-150">
                                    <i className="pi pi-home mr-2 text-primary"></i>
                                    <span className="font-medium">Dashboard</span>
                                    <Ripple />
                                </a>
                            </li>
                            <li className="mb-2">
                                <a onClick={() => onNavigate('organizations')} className="p-ripple flex align-items-center cursor-pointer p-3 text-700 border-round hover:surface-100 transition-colors transition-duration-150">
                                    <i className="pi pi-building mr-2 text-primary"></i>
                                    <span className="font-medium">Organizações</span>
                                    <Ripple />
                                </a>
                            </li>
                            {/* Adicione outros itens conforme necessário */}
                        </ul>
                    </nav>
                </aside>

                {/* Área de Conteúdo */}
                <main className="flex-1 p-3 md:p-5 overflow-y-auto">
                    <div className="min-h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
