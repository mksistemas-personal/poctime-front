import React, {useCallback, useEffect, useState} from "react";
import {Toast} from "primereact/toast";
import {confirmDialog, ConfirmDialog} from "primereact/confirmdialog";
import {Button} from "primereact/button";
import {Panel} from "primereact/panel";
import {Accordion, AccordionTab} from "primereact/accordion";
import {InputText} from "primereact/inputtext";
import {IEconomicGroup} from "./EconomicGroupStructures";
import {EconomicGroupService} from "./EconomicGroupService";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import EconomicGroupDetails from "./EconomicGroupDetails";
import EconomicGroupCreator from "./EconomicGroupCreator";
import EconomicGroupUpdater from "./EconomicGroupUpdater";


const EconomicGroupList: React.FC = () => {
    const [economicGroups, setEconomicGroups] = useState<IEconomicGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedEconomicGroup, setSelectedEconomicGroup] = useState<IEconomicGroup | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
    const [displayUpdater, setDisplayUpdater] = useState<boolean>(false);
    const [economicGroupToEdit, setEconomicGroupToEdit] = useState<IEconomicGroup | null>(null);
    const toast = React.useRef<Toast>(null);
    const [filters, setFilters] = useState<any>({
        name: '',
        organization: ''
    });

    const loadingRef = React.useRef(loading);
    const isLastPageRef = React.useRef(isLastPage);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        isLastPageRef.current = isLastPage;
    }, [isLastPage]);

    const ROWS_PER_PAGE = 5;

    const loadEconomicGroups = useCallback(async (pageNumber: number, currentFilters: any = filters) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const data = await EconomicGroupService.getAllEconomicGroups(pageNumber, ROWS_PER_PAGE, currentFilters);

            const content = data.content.map((item: any) => {
                if (item.economicGroup) {
                    return { ...item.economicGroup, id: item.economicGroup.id };
                }
                return { ...item, id: item.id };
            });

            // Acumula os dados se não for a primeira página
            setEconomicGroups(prev => pageNumber === 0 ? content : [...prev, ...content]);
            setIsLastPage(data.last);
            setPage(pageNumber);
        } catch (error) {
            console.error("Erro ao carregar os grupos economicos:", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadEconomicGroups(0);
    }, [loadEconomicGroups]);


    const onFilterChange = (e: any, field: string) => {
        const value = e.target.value;
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const applyFilters = () => {
        // loadOrganizations(0, filters);
    };

    const clearFilters = () => {
        const emptyFilters = {
            name: '',
            organization: ''
        };
        setFilters(emptyFilters);
        // loadOrganizations(0, emptyFilters);
    };

    const confirmDelete = (economicGroup: IEconomicGroup) => {
        confirmDialog({
            message: `Deseja realmente excluir o grupo economico"${economicGroup.name}"?`,
            header: 'Confirmação de Exclusão',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            acceptClassName: 'p-button-danger',
            accept: () => deleteEconomicGroup(economicGroup.id)
        });
    };

    const deleteEconomicGroup = async (id: string) => {
        try {
            setLoading(true);
            await EconomicGroupService.deleteEconomicGroup(id);
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Grupo Economico excluído com sucesso', life: 3000 });
            loadEconomicGroups(0); // Recarrega a lista
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir grupo economico', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const headerTemplate = (options: any) => {
        return (
            <div className={options.className} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', width: '100%' }}>
                <span className="text-xl font-bold">Gerenciamento de Grupos Economicos</span>
                <Button
                    label="Novo Grupo Economico"
                    icon="pi pi-plus"
                    severity="success"
                    rounded
                    onClick={() => setDisplayManager(true)}
                    size="small"
                />
            </div>
        );
    };

    // Rodapé para controle de carregamento manual/automático
    const footer = (
        <div className="flex justify-content-end p-2">
            {!isLastPage ? (
                <Button
                    type="button"
                    icon="pi pi-plus"
                    label="Carregar mais organizações"
                    onClick={() => loadEconomicGroups(page + 1)}
                    loading={loading}
                    severity="success" rounded
                    size="small"
                />
            ) : (
                <span className="text-500 italic py-2">Todas os grupos foram carregados</span>
            )}
        </div>
    );

    const actionBodyTemplate = (rowData: IEconomicGroup) => {
        return (
            <div className="flex gap-1">
                <Button
                    icon="pi pi-search"
                    rounded
                    text
                    severity="info"
                    onClick={() => {
                        setSelectedEconomicGroup(rowData);
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
                        setEconomicGroupToEdit(rowData);
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

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <Accordion className="mb-3">
                    <AccordionTab header={
                        <span className="flex align-items-center gap-2 text-sm small">
                            <i className="pi pi-filter"></i>
                            Filtros de Pesquisa
                        </span>
                    }>
                        <div className="p-fluid grid row-gap-2">
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="name" className="text-xs font-bold text-left block">Nome do Grupo Economico</label>
                                <InputText id="name" value={filters.name} onChange={(e) => onFilterChange(e, 'name')} className="p-inputtext-sm" placeholder="Ex: Grupo Economico..." />
                            </div>
                            <div className="field sm:col-6 md:col-2 mb-0">
                                <label htmlFor="organization" className="text-xs font-bold text-left block">Nome da Organizacao</label>
                                <InputText id="organization" value={filters.organization} onChange={(e) => onFilterChange(e, 'organization')} className="p-inputtext-sm" />
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
                        value={economicGroups}
                        selectionMode="single"
                        selection={selectedEconomicGroup}
                        onSelectionChange={(e) => setSelectedEconomicGroup(e.value as IEconomicGroup)}
                        dataKey="id"
                        loading={loading}
                        footer={footer}
                         scrollable
                        scrollHeight="325px"
                        className="p-datatable-sm h-full flex-1"
                        stripedRows
                        tableStyle={{ minWidth: '50rem' }}
                        emptyMessage="Nenhum grupo economico encontrado."
                    >
                        <Column field="name" header="Nome" sortable bodyClassName="font-bold text-primary"/>
                        <Column field="description" header="Descricao" sortable />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '4rem' }} />
                    </DataTable>
                </div>
            </Panel>

            <EconomicGroupDetails
                visible={displayDetails}
                economicGroup={selectedEconomicGroup}
                onHide={() => {
                    setDisplayDetails(false);
                    setSelectedEconomicGroup(null);
                }}
            />

            <EconomicGroupCreator
                visible={displayManager}
                onHide={() => setDisplayManager(false)}
                onSaveSuccess={(newGroup: IEconomicGroup) => {
                    loadEconomicGroups(0);
                }}
            />

            <EconomicGroupUpdater
                visible={displayUpdater}
                economicGroup={economicGroupToEdit}
                onHide={() => {
                    setDisplayUpdater(false);
                    setEconomicGroupToEdit(null);
                }}
                onSaveSuccess={(updatedEconomicGroup) => {
                    loadEconomicGroups(0);
                }}
            />
        </div>
    )
}

export default EconomicGroupList;