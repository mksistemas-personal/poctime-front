import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { OrganizationService, IOrganization } from './OrganizationService';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import OrganizationDetails from './OrganizationDetails';
import OrganizationManager from './OrganizationManager';

const OrganizationList: React.FC = () => {
    const [organizations, setOrganizations] = useState<IOrganization[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedOrganization, setSelectedOrganization] = useState<IOrganization | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);

    const ROWS_PER_PAGE = 2;

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadOrganizations(0);
    }, []);

    const loadOrganizations = async (pageNumber: number) => {
        if (loading || (isLastPage && pageNumber !== 0)) return;

        try {
            setLoading(true);
            const data = await OrganizationService.getOrganizations(pageNumber, ROWS_PER_PAGE);
            
            // Acumula os dados se não for a primeira página
            setOrganizations(prev => pageNumber === 0 ? data.content : [...prev, ...data.content]);
            setIsLastPage(data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Erro ao carregar organizações:", error);
        } finally {
            setLoading(false);
        }
    };

    const cnpjBodyTemplate = (rowData: IOrganization) => {
        return <DocumentDisplay type="CNPJ" value={rowData.organizationPerson.document.identifier} />;
    };

    const cpfBodyTemplate = (rowData: IOrganization) => {
        return <DocumentDisplay type="CPF" value={rowData.responsiblePerson.document.identifier} />;
    };

    // Rodapé para controle de carregamento manual/automático
    const footer = (
        <div className="flex justify-content-end p-2">
            {!isLastPage ? (
                <Button 
                    type="button" 
                    icon="pi pi-plus" 
                    label="Carregar mais organizações" 
                    onClick={() => loadOrganizations(page + 1)} 
                    loading={loading}
                    severity="success" rounded
                    size="small"
                />
            ) : (
                <span className="text-500 italic py-2">Todas as organizações foram carregadas</span>
            )}
        </div>
    );

    const actionBodyTemplate = (rowData: IOrganization) => {
        return (
            <Button
                icon="pi pi-search"
                rounded
                text
                severity="info"
                onClick={() => {
                    setSelectedOrganization(rowData);
                    setDisplayDetails(true);
                }}
            />
        );
    };

    const headerTemplate = (options: any) => {
        return (
            <div className={options.className} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', width: '100%' }}>
                <span className="text-xl font-bold">Gerenciamento de Organizações</span>
                <Button
                    label="Nova Organização"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={() => setDisplayManager(true)}
                    size="small"
                />
            </div>
        );
    };

    return (
        <div className="p-m-4">
            <Panel headerTemplate={headerTemplate}>
                <DataTable 
                    value={organizations} 
                    selectionMode="single"
                    selection={selectedOrganization}
                    onSelectionChange={(e) => setSelectedOrganization(e.value.selection)}
                    dataKey="id"
                    loading={loading}
                    footer={footer}
                    scrollable 
                    scrollHeight="flex" // Ajusta ao tamanho do container
                    className="p-datatable-sm"
                    stripedRows
                    tableStyle={{ minWidth: '50rem' }}
                    emptyMessage="Nenhuma organização encontrada."
                >
                    <Column field="organizationPerson.name" header="Nome" sortable bodyClassName="font-bold text-primary"/>
                    <Column header="Doc." body={cnpjBodyTemplate} />
                    <Column field="responsiblePerson.name" header="Responsável" sortable />
                    <Column header="Resp. Doc." body={cpfBodyTemplate} />
                    <Column field="responsibleEmail" header="E-mail" />
                    <Column field="address.city" header="Cidade" sortable />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem' }} />
                </DataTable>
            </Panel>

            <OrganizationDetails
                visible={displayDetails}
                organization={selectedOrganization}
                onHide={() => setDisplayDetails(false)}
            />

            <OrganizationManager
                visible={displayManager}
                onHide={() => setDisplayManager(false)}
                onSave={(org) => console.log('Salvar organização:', org)}
            />

        </div>
    );
};

export default OrganizationList;
