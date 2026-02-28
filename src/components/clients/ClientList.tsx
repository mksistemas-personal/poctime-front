import React, {useCallback, useEffect, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Panel} from 'primereact/panel';
import {InputText} from 'primereact/inputtext';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Toast} from 'primereact/toast';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import FilterList from '../shared/components/list/FilterList';
import {IClient} from "./ClientStructures";
import {ClientService} from "./ClientService";
import ClientDetails from "./ClientDetails";
import ClientManager from "./ClientManager";
import ClientUpdater from "./ClientUpdater";
import HeaderList from '../shared/components/list/HeaderList';
import ActionRowList from '../shared/components/list/ActionRowList';
import {API_CONFIG} from "../../config/ApiConfig";
import FooterList from "../shared/components/list/FooterList";


const ClientList: React.FC = () => {
    const [clients, setClients] = useState<IClient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
    const [displayUpdater, setDisplayUpdater] = useState<boolean>(false);
    const [clientToEdit, setClientToEdit] = useState<IClient | null>(null);
    const toast = React.useRef<Toast>(null);
    const [filters, setFilters] = useState<any>({
        name: '',
        street: '',
        city: '',
        stateCode: ''
    });
    const loadingRef = React.useRef(loading);
    const isLastPageRef = React.useRef(isLastPage);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        isLastPageRef.current = isLastPage;
    }, [isLastPage]);

    const loadClients = useCallback(async (pageNumber: number, currentFilters: any = filters) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const data = await ClientService.getClients(pageNumber, API_CONFIG.ROWS_PER_PAGE, currentFilters);

            // Garantir que estamos pegando o objeto de organização, caso venha envolvido
            const content = data.content.map((item: any) => {
                if (item.client) {
                    return { ...item.client, id: item.client.id  };
                }
                return { ...item, id: item.id };
            });

            // Acumula os dados se não for a primeira página
            setClients(prev => pageNumber === 0 ? content : [...prev, ...content]);
            setIsLastPage(data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadClients(0);
    }, []);


    const onFilterChange = (e: any, field: string) => {
        const value = e.target.value;
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        loadClients(0, filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            name: '',
            street: '',
            city: '',
            stateCode: ''
        };
        setFilters(emptyFilters);
        loadClients(0, emptyFilters);
    };

    const confirmDelete = (client: IClient) => {
        confirmDialog({
            message: `Deseja realmente excluir o cliente "${client.clientPerson.name}"?`,
            header: 'Confirmação de Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptClassName: 'p-button-danger',
            accept: () => deleteClient(client.clientId)
        });
    };

    const deleteClient = async (id: string) => {
        try {
            setLoading(true);
            await ClientService.deleteClient(id);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Cliente excluído com sucesso', life: 3000 });
            loadClients(0); // Recarrega a lista
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir cliente', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const cnpjBodyTemplate = (rowData: IClient) => {
        return <DocumentDisplay type="CNPJ" value={rowData.clientPerson.document.identifier} />;
    };

    const cpfBodyTemplate = (rowData: IClient) => {
        return <DocumentDisplay type="CPF" value={rowData.clientPerson.document.identifier} />;
    };

    const documentBodyTemplate = (rowData: IClient) => {
        return rowData.clientPerson.document.type === 'cnpj' ? cnpjBodyTemplate(rowData) : cpfBodyTemplate(rowData);
    };

    const footer = ()=> {
        return (
            <FooterList
                onLoading={loading}
                isLastPage={isLastPage}
                onButtonClick={() => loadClients(page + 1)}
                buttonLabel="Carregar mais clientes"
                moreDataLabel="Todas os clientes foram carregados"
            />
        );
    };

    const actionBodyTemplate = (rowData: IClient) => {
        return (
            <ActionRowList
                rowData={rowData}
                onView={(data) => {
                    setSelectedClient(data);
                    setDisplayDetails(true);
                }}
                onEdit={(data) => {
                    setClientToEdit(data);
                    setDisplayUpdater(true);
                }}
                onDelete={(data) => confirmDelete(data)}
                editTooltip="Editar cliente"
                deleteTooltip="Excluir cliente"
            />
        );
    };

    const headerTemplate = (options: any) => (
        <HeaderList 
            title="Gerenciamento de Clientes" 
            buttonLabel="Novo Cliente" 
            onButtonClick={() => setDisplayManager(true)} 
            options={options} 
        />
    );

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <FilterList onClear={clearFilters} onSearch={applyFilters} className="mb-2">
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="name" className="text-xs font-bold text-left block mb-2">Nome do Cliente</label>
                        <InputText id="name" value={filters.name} onChange={(e) => onFilterChange(e, 'name')} className="p-inputtext-sm" placeholder="Ex: Cliente..." />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="clientEmail" className="text-xs font-bold text-left block mb-2">E-mail do Cliente</label>
                        <InputText id="clientEmail" value={filters.clientEmail} onChange={(e) => onFilterChange(e, 'clientEmail')} className="p-inputtext-sm" />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="street" className="text-xs font-bold text-left block mb-2">Rua</label>
                        <InputText id="street" value={filters.street} onChange={(e) => onFilterChange(e, 'street')} className="p-inputtext-sm" />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="city" className="text-xs font-bold text-left block mb-2">Cidade</label>
                        <InputText id="city" value={filters.city} onChange={(e) => onFilterChange(e, 'city')} className="p-inputtext-sm" />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="stateCode" className="text-xs font-bold block text-left mb-2">UF</label>
                        <FederalStateSelector 
                            value={filters.stateCode} 
                            onChange={(val) => setFilters((prev: any) => ({ ...prev, stateCode: val }))}
                            className="w-full p-inputtext-sm"
                        />
                    </div>
                </FilterList>

                <div className="flex-1 min-h-0">
                    <DataTable 
                        value={clients}
                        selectionMode="single"
                        selection={selectedClient}
                        onSelectionChange={(e) => setSelectedClient(e.value as IClient)}
                        dataKey="id"
                        loading={loading}
                        footer={footer}
                        scrollable 
                        scrollHeight="calc(100vh - 20rem)" 
                        className="p-datatable-sm h-full flex-1 text-sm"
                        stripedRows
                        tableStyle={{ minWidth: '80rem' }}
                        emptyMessage="Nenhum cliente encontrada."
                    >
                        <Column field="clientPerson.name" header="Nome" sortable bodyClassName="font-bold text-primary py-1" headerClassName="text-sm py-2"/>
                        <Column header="Doc." body={documentBodyTemplate} bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column field="clientEmail" header="E-mail" bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column field="address.city" header="Cidade" sortable bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} bodyClassName="py-1 text-right" headerClassName="py-2" />
                    </DataTable>
                </div>
            </Panel>

            <ClientDetails
                visible={displayDetails}
                client={selectedClient}
                onHide={() => {
                    setDisplayDetails(false);
                    setSelectedClient(null);
                }}
            />

            <ClientManager
                visible={displayManager}
                onHide={() => setDisplayManager(false)}
                onSave={(newOrg) => {
                        loadClients(0);
                    }}
                />

            <ClientUpdater
                visible={displayUpdater}
                clientInput={clientToEdit}
                onHide={() => {
                    setDisplayUpdater(false);
                    setClientToEdit(null);
                }}
                onSave={(updatedOrg) => {
                    loadClients(0);
                }}
            />

            </div>
    );
};

export default ClientList;
