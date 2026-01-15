import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { OrganizationService, IOrganization } from './OrganizationService';
import DocumentDisplay from "../shared/document/DocumentDisplay";

const OrganizationList: React.FC = () => {
    const [organizations, setOrganizations] = useState<IOrganization[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedOrganization, setSelectedOrganization] = useState<IOrganization | null>(null);

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
        return <DocumentDisplay type="CNPJ" value={rowData.documentNumber} />;
    };

    const cpfBodyTemplate = (rowData: IOrganization) => {
        return <DocumentDisplay type="CPF" value={rowData.responsibleDocumentNumber} />;
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
                />
            ) : (
                <span className="text-500 italic py-2">Todas as organizações foram carregadas</span>
            )}
        </div>
    );

    return (
        <div className="p-m-4">
            <Panel header="Gerenciamento de Organizações">
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
                    <Column field="personName" header="Nome" sortable bodyClassName="font-bold text-primary"/>
                    <Column header="CNPJ" body={cnpjBodyTemplate} />
                    <Column field="responsibleName" header="Responsável" sortable />
                    <Column header="CPF Resp." body={cpfBodyTemplate} />
                    <Column field="responsibleEmail" header="E-mail" />
                    <Column field="city" header="Cidade" sortable />
                </DataTable>
            </Panel>
        </div>
    );
};

export default OrganizationList;
