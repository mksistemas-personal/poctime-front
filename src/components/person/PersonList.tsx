import React, {useCallback, useEffect, useState} from 'react';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Panel} from 'primereact/panel';
import {Button} from 'primereact/button';
import {InputText} from 'primereact/inputtext';
import {Accordion, AccordionTab} from 'primereact/accordion';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Toast} from 'primereact/toast';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import {IPerson} from "./PersonStructures";
import {PersonService} from "./PersonService";
import PersonManager from "./PersonManager";
import PersonDetails from "./PersonDetails";
import PersonUpdater from "./PersonUpdater";


const PersonList: React.FC = () => {
    const [people, setPeople] = useState<IPerson[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedPerson, setSelectedPerson] = useState<IPerson | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
    const [displayUpdater, setDisplayUpdater] = useState<boolean>(false);
    const [personToEdit, setPersonToEdit] = useState<IPerson | null>(null);
    const toast = React.useRef<Toast>(null);
    const [filters, setFilters] = useState<any>({
        name: '',
        identifier: ''
    });
    const [appliedFilters, setAppliedFilters] = useState<any>({
        name: '',
        identifier: ''
    });
    const loadingRef = React.useRef(loading);
    const isLastPageRef = React.useRef(isLastPage);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        isLastPageRef.current = isLastPage;
    }, [isLastPage]);

    const ROWS_PER_PAGE = 10;

    const loadPeople = useCallback(async (pageNumber: number, currentFilters: any = appliedFilters) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const data = await PersonService.getPeople(pageNumber, ROWS_PER_PAGE, currentFilters);

            // Garantir que estamos pegando o objeto de organização, caso venha envolvido
            const content = data.content.map((item: any) => {
                if (item.person) {
                    return { ...item.person, id: item.person.id  };
                }
                return { ...item, id: item.id };
            });

            // Acumula os dados se não for a primeira página
            setPeople(prev => pageNumber === 0 ? content : [...prev, ...content]);
            setIsLastPage(data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Erro ao carregar pessoas:", error);
        } finally {
            setLoading(false);
        }
    }, [appliedFilters]);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadPeople(0);
    }, [loadPeople]);


    const onFilterChange = (e: any, field: string) => {
        const value = e.target.value;
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            name: '',
            identifier: ''
        };
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    const confirmDelete = (person: IPerson) => {
        confirmDialog({
            message: `Deseja realmente excluir da pessoa "${person.name}"?`,
            header: 'Confirmação de Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptClassName: 'p-button-danger',
            accept: () => deletePerson(person.id)
        });
    };

    const deletePerson = async (id: string) => {
        try {
            setLoading(true);
            await PersonService.deletePerson(id);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Pessoa excluída com sucesso', life: 3000 });
            loadPeople(0, appliedFilters); // Recarrega a lista
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir pessoa', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const cnpjBodyTemplate = (rowData: IPerson) => {
        return <DocumentDisplay type="CNPJ" value={rowData.document.identifier} />;
    };

    const cpfBodyTemplate = (rowData: IPerson) => {
        return <DocumentDisplay type="CPF" value={rowData.document.identifier} />;
    };

    const documentBodyTemplate = (rowData: IPerson) => {
        return rowData.document.type === 'cnpj' ? cnpjBodyTemplate(rowData) : cpfBodyTemplate(rowData);
    };

    // Rodapé para controle de carregamento manual/automático
    const footer = (
        <div className="flex justify-content-end p-2">
            {!isLastPage ? (
                <Button 
                    type="button" 
                    icon="pi pi-plus" 
                    label="Carregar mais pessoas"
                    onClick={() => loadPeople(page + 1)}
                    loading={loading}
                    rounded
                    size="small"
                />
            ) : (
                <span className="text-500 italic py-2">Todas as pessoas foram carregados</span>
            )}
        </div>
    );

    const actionBodyTemplate = (rowData: IPerson) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-search"
                    rounded
                    text
                    severity="info"
                    onClick={() => {
                        setSelectedPerson(rowData);
                        setDisplayDetails(true);
                    }}
                    tooltip="Ver detalhes"
                    size="small"
                    className="p-1"
                />
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => {
                        setPersonToEdit(rowData);
                        setDisplayUpdater(true);
                    }}
                    tooltip="Editar cliente"
                    size="small"
                    className="p-1"
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                    tooltip="Excluir cliente"
                    size="small"
                    className="p-1"
                />
            </div>
        );
    };

    const headerTemplate = (options: any) => {
        return (
            <div className={options.className} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 1rem' }}>
                <span className="text-lg font-bold">Gerenciamento de Pessoas</span>
                <Button
                    label="Nova Pessoa"
                    icon="pi pi-plus"
                    rounded
                    onClick={() => setDisplayManager(true)}
                    size="small"
                />
            </div>
        );
    };

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <Accordion className="mb-4">
                    <AccordionTab header={
                        <span className="flex align-items-center gap-2 text-xs">
                            <i className="pi pi-filter" style={{ fontSize: '0.75rem' }}></i>
                            Filtros de Pesquisa
                        </span>
                    }>
                        <div className="p-fluid grid row-gap-3 mt-1">
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="name" className="text-xs font-bold text-left block mb-2">Nome da Pessoa</label>
                                <InputText id="name" value={filters.name} onChange={(e) => onFilterChange(e, 'name')} className="p-inputtext-sm" placeholder="Ex: Pessoa..." />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="identifier" className="text-xs font-bold text-left block mb-2">Documento</label>
                                <InputText id="identifier" value={filters.identifier} onChange={(e) => onFilterChange(e, 'identifier')} className="p-inputtext-sm" placeholder="CPF/CNPJ..." />
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

                <div className="flex-1 min-h-0">
                    <DataTable 
                        value={people}
                        selectionMode="single"
                        selection={selectedPerson}
                        onSelectionChange={(e) => setSelectedPerson(e.value as IPerson)}
                        dataKey="id"
                        loading={loading}
                        footer={footer}
                        scrollable 
                        scrollHeight="525px" // Ajusta ao tamanho do container
                        className="p-datatable-sm h-full flex-1 text-sm"
                        stripedRows
                        tableStyle={{ minWidth: '80rem' }}
                        emptyMessage="Nenhuma pessoa encontrada."
                    >
                        <Column field="name" header="Nome" sortable bodyClassName="font-bold text-primary py-1" headerClassName="text-sm py-2"/>
                        <Column header="Doc." body={documentBodyTemplate} sortable bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} bodyClassName="py-1 text-right" headerClassName="py-2" />
                    </DataTable>
                </div>
            </Panel>

            <PersonDetails
                visible={displayDetails}
                person={selectedPerson}
                onHide={() => {
                    setDisplayDetails(false);
                    setSelectedPerson(null);
                }}
            />

            <PersonManager
                visible={displayManager}
                onHide={() => setDisplayManager(false)}
                onSave={() => {
                        loadPeople(0, appliedFilters);
                    }}
                />

            <PersonUpdater
                visible={displayUpdater}
                personToUpdate={personToEdit}
                onHide={() => {
                    setDisplayUpdater(false);
                    setPersonToEdit(null);
                }}
                onSave={(updatedOrg) => {
                    loadPeople(0, appliedFilters);
                }}
            />

            </div>
    );
};

export default PersonList;
