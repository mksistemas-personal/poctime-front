import React, {useCallback, useEffect, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Panel} from 'primereact/panel';
import {InputText} from 'primereact/inputtext';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Toast} from 'primereact/toast';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import {OrganizationService} from './OrganizationService';
import FilterList from '../shared/components/list/FilterList';
import {IOrganization, OrganizationFilterData, organizationFilterSchema} from './OrganizationStructures';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import OrganizationDetails from './OrganizationDetails';
import OrganizationManager from './OrganizationManager';
import OrganizationUpdater from './OrganizationUpdater';
import HeaderList from '../shared/components/list/HeaderList';
import ActionRowList from '../shared/components/list/ActionRowList';
import {API_CONFIG} from "../../config/ApiConfig";
import FooterList from "../shared/components/list/FooterList";

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

    const { control, handleSubmit, reset, getValues } = useForm<OrganizationFilterData>({
        resolver: zodResolver(organizationFilterSchema),
        defaultValues: {
            name: '',
            respName: '',
            responsibleEmail: '',
            street: '',
            city: '',
            stateCode: ''
        }
    });

    const loadingRef = React.useRef(loading);
    const isLastPageRef = React.useRef(isLastPage);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        isLastPageRef.current = isLastPage;
    }, [isLastPage]);


    const loadOrganizations = useCallback(async (pageNumber: number, currentFilters?: OrganizationFilterData) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const filtersToUse = currentFilters || getValues();
            const data = await OrganizationService.getOrganizations(pageNumber, API_CONFIG.ROWS_PER_PAGE, filtersToUse);
            console.log(data);
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
    }, []);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadOrganizations(0);
    }, []);


    const applyFilters = (data: OrganizationFilterData) => {
        loadOrganizations(0, data);
    };

    const clearFilters = () => {
        reset();
        loadOrganizations(0, getValues());
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
    const footer = ()=> {
        return (
            <FooterList
                onLoading={loading}
                isLastPage={isLastPage}
                onButtonClick={() => loadOrganizations(page + 1)}
                buttonLabel="Carregar mais organizações"
                moreDataLabel="Todas as organizações foram carregadas"
            />
        );
    };

    const actionBodyTemplate = (rowData: IOrganization) => {
        return (
            <ActionRowList
                rowData={rowData}
                onView={(data) => {
                    setSelectedOrganization(data);
                    setDisplayDetails(true);
                }}
                onEdit={(data) => {
                    setOrganizationToEdit(data);
                    setDisplayUpdater(true);
                }}
                onDelete={(data) => confirmDelete(data)}
                editTooltip="Editar organização"
                deleteTooltip="Excluir organização"
            />
        );
    };

    const headerTemplate = (options: any) => (
        <HeaderList 
            title="Gerenciamento de Organizações" 
            buttonLabel="Nova Organização" 
            onButtonClick={() => setDisplayManager(true)} 
            options={options} 
        />
    );

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <FilterList onClear={clearFilters} onSearch={() => { void handleSubmit(applyFilters)(); }}>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="name" className="text-xs font-bold text-left block mb-2">Nome da Organização</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field} 
                                    id="name" 
                                    className="p-inputtext-sm" 
                                    placeholder="Ex: Organizacao..." 
                                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(applyFilters)()}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="respName" className="text-xs font-bold text-left block mb-2">Nome do Responsável</label>
                        <Controller
                            name="respName"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field} 
                                    id="respName" 
                                    className="p-inputtext-sm" 
                                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(applyFilters)()}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="responsibleEmail" className="text-xs font-bold text-left block mb-2">E-mail do Responsável</label>
                        <Controller
                            name="responsibleEmail"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field} 
                                    id="responsibleEmail" 
                                    className="p-inputtext-sm" 
                                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(applyFilters)()}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="street" className="text-xs font-bold text-left block mb-2">Rua</label>
                        <Controller
                            name="street"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field} 
                                    id="street" 
                                    className="p-inputtext-sm" 
                                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(applyFilters)()}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="city" className="text-xs font-bold text-left block mb-2">Cidade</label>
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field} 
                                    id="city" 
                                    className="p-inputtext-sm" 
                                    onKeyDown={(e) => e.key === 'Enter' && void handleSubmit(applyFilters)()}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="stateCode" className="text-xs font-bold block text-left mb-2">UF</label>
                        <Controller
                            name="stateCode"
                            control={control}
                            render={({ field }) => (
                                <FederalStateSelector 
                                    value={field.value} 
                                    onChange={field.onChange}
                                    className="w-full p-inputtext-sm"
                                />
                            )}
                        />
                    </div>
                </FilterList>

                <div className="flex-1 min-h-0">
                    <DataTable 
                        value={organizations} 
                        selectionMode="single"
                        selection={selectedOrganization}
                        onSelectionChange={(e) => setSelectedOrganization(e.value as IOrganization)}
                        dataKey="id"
                        loading={loading}
                        footer={footer}
                        scrollable 
                        scrollHeight="calc(100vh - 22rem)" 
                        className="p-datatable-sm h-full flex-1 text-sm"
                        stripedRows
                        tableStyle={{ minWidth: '80rem' }}
                        emptyMessage="Nenhuma organização encontrada."
                    >
                        <Column field="organizationPerson.name" header="Nome" sortable bodyClassName="font-bold text-primary py-1" headerClassName="text-sm py-2"/>
                        <Column header="Doc." body={cnpjBodyTemplate} bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column field="responsiblePerson.name" header="Responsável" sortable bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column header="Resp. Doc." body={cpfBodyTemplate} bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column field="responsibleEmail" header="E-mail" bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column field="address.city" header="Cidade" sortable bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} bodyClassName="py-1 text-right" headerClassName="py-2" />
                    </DataTable>
                </div>
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
