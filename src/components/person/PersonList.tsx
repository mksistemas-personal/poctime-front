import React, {useCallback, useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Panel} from 'primereact/panel';
import {InputText} from 'primereact/inputtext';
import {ConfirmDialog, confirmDialog} from 'primereact/confirmdialog';
import {Toast} from 'primereact/toast';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import FilterList from '../shared/components/list/FilterList';
import {IPerson, PersonFilterData, personFilterSchema} from "./PersonStructures";
import {PersonService} from "./PersonService";
import PersonManager from "./PersonManager";
import PersonDetails from "./PersonDetails";
import PersonUpdater from "./PersonUpdater";
import HeaderList from '../shared/components/list/HeaderList';
import ActionRowList from '../shared/components/list/ActionRowList';
import {API_CONFIG} from "../../config/ApiConfig";
import FooterList from "../shared/components/list/FooterList";


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
    const {control, handleSubmit, reset, getValues} = useForm<PersonFilterData>({
        resolver: zodResolver(personFilterSchema),
        defaultValues: {
            name: '',
            identifier: ''
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

    const loadPeople = useCallback(async (pageNumber: number, currentFilters: PersonFilterData = getValues()) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const data = await PersonService.getPeople(pageNumber, API_CONFIG.ROWS_PER_PAGE, currentFilters);

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
    }, []);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadPeople(0);
    }, []);


    const applyFilters = (data: PersonFilterData) => {
        loadPeople(0, data);
    };

    const clearFilters = () => {
        reset();
        loadPeople(0, getValues());
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
            loadPeople(0); // Recarrega a lista
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

    const footer = ()=> {
        return (
            <FooterList
                onLoading={loading}
                isLastPage={isLastPage}
                onButtonClick={() => loadPeople(page + 1)}
                buttonLabel="Carregar mais pessoas"
                moreDataLabel="Todas as pessoas foram carregados"
            />
        );
    };

    const actionBodyTemplate = (rowData: IPerson) => {
        return (
            <ActionRowList
                rowData={rowData}
                onView={(data) => {
                    setSelectedPerson(data);
                    setDisplayDetails(true);
                }}
                onEdit={(data) => {
                    setPersonToEdit(data);
                    setDisplayUpdater(true);
                }}
                onDelete={(data) => confirmDelete(data)}
                editTooltip="Editar pessoa"
                deleteTooltip="Excluir pessoa"
            />
        );
    };

    const headerTemplate = (options: any) => (
        <HeaderList 
            title="Gerenciamento de Pessoas" 
            buttonLabel="Nova Pessoa" 
            onButtonClick={() => setDisplayManager(true)} 
            options={options} 
        />
    );

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <FilterList onClear={clearFilters} onSearch={() => void handleSubmit(applyFilters)()}>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="name" className="text-xs font-bold text-left block mb-2">Nome da Pessoa</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field}
                                    id="name" 
                                    className="p-inputtext-sm" 
                                    placeholder="Ex: Pessoa..." 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            void handleSubmit(applyFilters)();
                                        }
                                    }}
                                />
                            )}
                        />
                    </div>
                    <div className="field sm:col-6 md:col-2 mb-0">
                        <label htmlFor="identifier" className="text-xs font-bold text-left block mb-2">Documento</label>
                        <Controller
                            name="identifier"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field}
                                    id="identifier" 
                                    className="p-inputtext-sm" 
                                    placeholder="CPF/CNPJ..." 
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            void handleSubmit(applyFilters)();
                                        }
                                    }}
                                />
                            )}
                        />
                    </div>
                </FilterList>

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
                        scrollHeight="calc(100vh - 22rem)" 
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
                        loadPeople(0);
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
                    loadPeople(0);
                }}
            />

            </div>
    );
};

export default PersonList;
