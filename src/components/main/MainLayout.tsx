import React, {useMemo, useState} from 'react';
import {Button} from 'primereact/button';
import {Dropdown} from 'primereact/dropdown';
import {Avatar} from 'primereact/avatar';
import {MegaMenu} from "primereact/megamenu";
import {Toolbar} from "primereact/toolbar";
import logo from '../../logo.svg';

interface MainLayoutProps {
    children: React.ReactNode;
    onNavigate: (page: string) => void;
    currentPage?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({children, onNavigate, currentPage}) => {
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [sidebarVisible, setSidebarVisible] = useState(true);
    const [selectedTheme, setSelectedTheme] = useState('lara-light-blue');

    const themes = [
        { name: 'Lara Light Blue', code: 'lara-light-blue' },
        { name: 'Lara Dark Blue', code: 'lara-dark-blue' },
        { name: 'Lara Light Indigo', code: 'lara-light-indigo' },
        { name: 'Lara Dark Indigo', code: 'lara-dark-indigo' },
        { name: 'Saga Orange', code: 'saga-orange' },
        { name: 'Material Dark Indigo', code: 'md-dark-indigo' },
        { name: 'Bootstrap Light Blue', code: 'bootstrap4-light-blue' },
        { name: 'Bootstrap Dark Blue', code: 'bootstrap4-dark-blue' },
        { name: 'Tailwind Light', code: 'tailwind-light' },
        { name: 'Viva Light', code: 'viva-light' },
        { name: 'Viva Dark', code: 'viva-dark' }
    ];

    const onThemeChange = (e: { value: string }) => {
        const theme = e.value;
        const themeLink = document.getElementById('theme-link') as HTMLLinkElement;

        if (themeLink) {
            themeLink.href = `/themes/${theme}/theme.css`;
            setSelectedTheme(theme);
        }
    };

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
            label: 'Cadastros',
            icon: 'pi pi-list',
            items: [
                [
                    {
                        label: 'Cadastro Geral',
                        items: [
                            {
                                label: 'Pessoas',
                                icon: 'pi pi-user',
                                className: currentPage === 'people' ? 'p-highlight' : '',
                                command: () => onNavigate('people')
                            },
                            {
                                label: 'Organizações',
                                icon: 'pi pi-building',
                                className: currentPage === 'organizations' ? 'p-highlight' : '',
                                command: () => onNavigate('organizations')
                            },
                            {
                                label: 'Grupos econômicos',
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
                        ]
                    }
                ]
            ]
        }
    ], [onNavigate, currentPage]);

    const startContent = (
        <div className="flex align-items-center">
            <Button
                icon="pi pi-bars"
                onClick={() => setSidebarVisible(!sidebarVisible)}
                className="p-button-text p-button-secondary mr-3"
            />
            <img alt="logo" src={logo} height="30" className="mr-4 cursor-pointer"
                 onClick={() => onNavigate('dashboard')}/>
        </div>
    );

    const endContent = (
        <div className="flex align-items-center gap-3">

            <Dropdown
                value={selectedTheme}
                options={themes}
                onChange={onThemeChange}
                optionLabel="name"
                optionValue="code"
                placeholder="Tema"
                tooltip="Selecione um tema"
                className="w-12rem border-none bg-gray-100"
            />

            <div className="border-left-1 surface-border h-2rem mx-2"></div>

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
    );


return (
    <div className="min-h-screen flex flex-column surface-ground">
        {/* Topbar Customizada */}
        <Toolbar
            start={startContent}
            end={endContent}
            className="surface-50 shadow-2 h-5rem px-4 sticky top-0"
            style={{ zIndex: 1000, borderRadius: '0rem' }}
        />

        <div className="flex flex-grow-1 min-h-0" style={{ height: 'calc(100vh - 4rem)', position: 'relative' }}>
            <aside
                className={`flex flex-column surface-section border-right-1 surface-border shadow-1 transition-all transition-duration-300 ${sidebarVisible ? 'w-14rem' : 'w-0 p-0 border-none'}`}
                style={{ zIndex: 10, height: '100%' }}
            >
                {sidebarVisible && (
                    <MegaMenu 
                        model={items} 
                        orientation="vertical"
                        breakpoint="960px"
                        className="border-none w-full surface-section"
                        style={{ height: 'auto' }}
                        pt={{
                            menuitem: { className: 'white-space-nowrap' },
                            action: { className: 'white-space-nowrap' },
                            label: { className: 'white-space-nowrap' }
                        }}
                    />
                )}
            </aside>

            {/* Área de Conteúdo */}
            <main className="flex-1 p-4 md:p-6 flex flex-column min-h-0 overflow-y-auto">
                {children}
            </main>
        </div>
    </div>
);
}
;

export default MainLayout;
