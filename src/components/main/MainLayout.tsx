import React, {useMemo, useState} from 'react';
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown';
import {Avatar} from 'primereact/avatar';
import {MegaMenu} from "primereact/megamenu";

interface MainLayoutProps {
    children: React.ReactNode;
    onNavigate: (page: string) => void;
    currentPage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({children, onNavigate, currentPage}) => {
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(true);

    // Mock de organizações para o seletor
    const organizations = [
        {name: 'Organização Matriz', code: '001'},
        {name: 'Filial Nordeste', code: '002'},
        {name: 'Filial Sul', code: '003'}
    ];


    const items = useMemo(() => [
        {
            label: 'Dashboard',
            icon: 'pi pi pi-home',
            className: currentPage === 'dashboard' ? 'p-highlight' : '',
            command: () => onNavigate('dashboard')
        },
        {
            label: 'Organizações',
            icon: 'pi pi-building',
            className: currentPage === 'organizations' ? 'p-highlight' : '',
            command: () => onNavigate('organizations')
        },
        {
            label: 'Grupos economicos',
            icon: 'pi pi-sitemap',
            className: currentPage === 'economic-groups' ? 'p-highlight' : '',
            command: () => onNavigate('economic-groups')
        },
        {
            label: 'Clientes',
            icon: 'pi pi-id-card',
            className: currentPage === 'clients' ? 'p-highlight' : '',
            command: () => onNavigate('clients')
        }
    ], [onNavigate, currentPage]);


return (
    <div className="min-h-screen flex flex-column surface-ground">
        {/* Topbar Customizada */}
        <header
            className="surface-card shadow-2 h-4rem flex align-items-center justify-content-between px-4 sticky top-0"
            style={{ zIndex: 1000 }}>
            <div className="flex align-items-center">
                <Button
                    icon="pi pi-bars"
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    className="p-button-text p-button-secondary mr-3"
                />
                <img alt="logo" src="logo.svg" height="30" className="mr-4 cursor-pointer"
                     onClick={() => onNavigate('dashboard')}/>
            </div>

            <div className="flex align-items-center gap-3">
                {/* Seletor de Organização */}
                <span className="p-input-icon-left hidden md:block">
                        <i className="pi pi-building mr-2"/>
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
                <Button icon="pi pi-bell" className="p-button-rounded p-button-text p-button-secondary"/>
                <Button icon="pi pi-cog" className="p-button-rounded p-button-text p-button-secondary"/>

                <div className="border-left-1 surface-border h-2rem mx-2"></div>

                <div
                    className="flex align-items-center cursor-pointer p-2 border-round hover:surface-100 transition-colors">
                    <Avatar label="JD" shape="circle" className="bg-primary text-white"/>
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

        <div className="flex flex-grow-1 min-h-0 overflow-hidden" style={{ height: 'calc(100vh - 4rem)', position: 'relative' }}>
            <aside
                className={`flex flex-column surface-section border-right-1 surface-border shadow-1 transition-all transition-duration-300 ${sidebarVisible ? 'w-14rem' : 'w-0 p-0 border-none'}`}
                style={{ zIndex: 10, height: '100%', overflowY: 'auto' }}
            >
                {sidebarVisible && (
                    <MegaMenu 
                        model={items} 
                        orientation="vertical"
                        breakpoint="960px"
                        className="border-none w-full surface-section"
                        style={{ height: 'auto' }}
                    />
                )}
            </aside>

            {/* Área de Conteúdo */}
            <main className="flex-1 p-3 md:p-5 flex flex-column min-h-0">
                {children}
            </main>
        </div>
    </div>
);
}
;

export default MainLayout;
