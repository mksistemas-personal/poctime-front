import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Panel } from 'primereact/panel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import { OrganizationService, IOrganization } from './OrganizationService';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import OrganizationDetails from './OrganizationDetails';
import OrganizationManager from './OrganizationManager';
import OrganizationUpdater from './OrganizationUpdater';

const OrganizationList: React.FC = () => {
    const [organizations, setOrganizations] = useState<IOrganization[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedOrganization, setSelectedOrganization] = useState<IOrganization | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
    const [displayUpdater, setDisplayUpdater] = useState<boolean>(false);
    const [organizationToEdit, setOrganizationToEdit] = useState<IOrganization | null>(null);
    const toast = React.useRef<Toast>(null);
    const [filters, setFilters] = useState<any>({
        name: '',
        respName: '',
        responsibleEmail: '',
        street: '',
        city: '',
        stateCode: ''
    });

    const ROWS_PER_PAGE = 5;

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadOrganizations(0);
    }, []);

    const loadOrganizations = async (pageNumber: number, currentFilters: any = filters) => {
        if (loading && pageNumber !== 0) return;
        if (isLastPage && pageNumber !== 0) return;

        try {
            setLoading(true);
            const data = await OrganizationService.getOrganizations(pageNumber, ROWS_PER_PAGE, currentFilters);
            
            // Garantir que estamos pegando o objeto de organização, caso venha envolvido
            const content = data.content.map((item: any) => {
                if (item.organization) {
                    return { ...item.organization, id: item.organization.id || item.organizationId };
                }
                return { ...item, id: item.id || item.organizationId };
            });

            // Acumula os dados se não for a primeira página
            setOrganizations(prev => pageNumber === 0 ? content : [...prev, ...content]);
            setIsLastPage(data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Erro ao carregar organizações:", error);
        } finally {
            setLoading(false);
        }
    };

    const onFilterChange = (e: any, field: string) => {
        const value = e.target.value;
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        loadOrganizations(0, filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            name: '',
            respName: '',
            responsibleEmail: '',
            street: '',
            city: '',
            stateCode: ''
        };
        setFilters(emptyFilters);
        loadOrganizations(0, emptyFilters);
    };

    const confirmDelete = (organization: IOrganization) => {
        confirmDialog({
            message: `Deseja realmente excluir a organização "${organization.organizationPerson.name}"?`,
            header: 'Confirmação de Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptClassName: 'p-button-danger',
            accept: () => deleteOrganization(organization.id)
        });
    };

    const deleteOrganization = async (id: string) => {
        try {
            setLoading(true);
            await OrganizationService.deleteOrganization(id);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Organização excluída com sucesso', life: 3000 });
            loadOrganizations(0); // Recarrega a lista
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir organização', life: 3000 });
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
            <div className="flex gap-1">
                <Button
                    icon="pi pi-search"
                    rounded
                    text
                    severity="info"
                    onClick={() => {
                        setSelectedOrganization(rowData);
                        setDisplayDetails(true);
                    }}
                    tooltip="Ver detalhes"
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => {
                        setOrganizationToEdit(rowData);
                        setDisplayUpdater(true);
                    }}
                    tooltip="Editar organização"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Excluir organização"
                />
            </div>
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
                    rounded
                    onClick={() => setDisplayManager(true)}
                    size="small"
                />
            </div>
        );
    };

    return (
        <div className="p-m-4">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate}>
                <Accordion className="mb-3">
                    <AccordionTab header={
                        <span className="flex align-items-center gap-2 text-sm small">
                            <i className="pi pi-filter"></i>
                            Filtros de Pesquisa
                        </span>
                    }>
                        <div className="p-fluid grid row-gap-2">
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="name" className="text-xs font-bold text-left block">Nome da Organização</label>
                                <InputText id="name" value={filters.name} onChange={(e) => onFilterChange(e, 'name')} className="p-inputtext-sm" placeholder="Ex: Organizacao..." />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="respName" className="text-xs font-bold text-left block">Nome do Responsável</label>
                                <InputText id="respName" value={filters.respName} onChange={(e) => onFilterChange(e, 'respName')} className="p-inputtext-sm" />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="responsibleEmail" className="text-xs font-bold text-left block">E-mail do Responsável</label>
                                <InputText id="responsibleEmail" value={filters.responsibleEmail} onChange={(e) => onFilterChange(e, 'responsibleEmail')} className="p-inputtext-sm" />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="street" className="text-xs font-bold text-left block">Rua</label>
                                <InputText id="street" value={filters.street} onChange={(e) => onFilterChange(e, 'street')} className="p-inputtext-sm" />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="city" className="text-xs font-bold text-left block">Cidade</label>
                                <InputText id="city" value={filters.city} onChange={(e) => onFilterChange(e, 'city')} className="p-inputtext-sm" />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="stateCode" className="text-xs font-bold block text-left">UF</label>
                                <FederalStateSelector 
                                    value={filters.stateCode} 
                                    onChange={(val) => setFilters((prev: any) => ({ ...prev, stateCode: val }))}
                                    className="w-full p-inputtext-sm"
                                />
                            </div>
                            <div className="sm:col-6 flex justify-content-end gap-2 mt-0 align-items-end" style={{ width: 'auto', marginLeft: 'auto' }}>
                                <div className="flex gap-2">
                                    <Button label="Limpar" icon="pi pi-filter-slash" outlined onClick={clearFilters} severity="secondary" size="small" rounded style={{ width: 'auto' }} />
                                    <Button label="Pesquisar" icon="pi pi-search" onClick={applyFilters}  size="small" rounded style={{ width: 'auto' }} />
                                </div>
                            </div>
                        </div>
                    </AccordionTab>
                </Accordion>

                <DataTable 
                    value={organizations} 
                    selectionMode="single"
                    selection={selectedOrganization}
                    onSelectionChange={(e) => setSelectedOrganization(e.value as IOrganization)}
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
                onHide={() => {
                    setDisplayDetails(false);
                    setSelectedOrganization(null);
                }}
            />

            <OrganizationManager
                visible={displayManager}
                onHide={() => setDisplayManager(false)}
                onSave={(newOrg) => {
                        loadOrganizations(0);
                    }}
                />

            <OrganizationUpdater
                visible={displayUpdater}
                organization={organizationToEdit}
                onHide={() => {
                    setDisplayUpdater(false);
                    setOrganizationToEdit(null);
                }}
                onSave={(updatedOrg) => {
                    loadOrganizations(0);
                }}
            />

            </div>
    );
};

export default OrganizationList;
