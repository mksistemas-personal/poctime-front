import React, {useCallback, useEffect, useState} from "react";
import {Toast} from "primereact/toast";
import {confirmDialog, ConfirmDialog} from "primereact/confirmdialog";
import {Panel} from "primereact/panel";
import {InputText} from "primereact/inputtext";
import FilterList from "../shared/components/list/FilterList";
import {IEconomicGroup} from "./EconomicGroupStructures";
import {EconomicGroupService} from "./EconomicGroupService";
import {Column} from "primereact/column";
import {DataTable} from "primereact/datatable";
import EconomicGroupDetails from "./EconomicGroupDetails";
import EconomicGroupCreator from "./EconomicGroupCreator";
import EconomicGroupUpdater from "./EconomicGroupUpdater";
import EconomicGroupOrganizationsSubTable from "./EconomicGroupOrganizationsSubTable";
import HeaderList from '../shared/components/list/HeaderList';
import ActionRowList from '../shared/components/list/ActionRowList';
import {API_CONFIG} from "../../config/ApiConfig";
import FooterList from "../shared/components/list/FooterList";


const EconomicGroupList: React.FC = () => {
    const [economicGroups, setEconomicGroups] = useState<IEconomicGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedRows, setExpandedRows] = useState<any>(null);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [selectedEconomicGroup, setSelectedEconomicGroup] = useState<IEconomicGroup | null>(null);
    const [displayDetails, setDisplayDetails] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
    const [displayUpdater, setDisplayUpdater] = useState<boolean>(false);
    const [economicGroupToEdit, setEconomicGroupToEdit] = useState<IEconomicGroup | null>(null);
    const toast = React.useRef<Toast>(null);
    const [filters, setFilters] = useState<string>('');

    const loadingRef = React.useRef(loading);
    const isLastPageRef = React.useRef(isLastPage);

    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        isLastPageRef.current = isLastPage;
    }, [isLastPage]);

    const loadEconomicGroups = useCallback(async (pageNumber: number, currentFilters?: string) => {
        if (pageNumber !== 0 && (loadingRef.current || isLastPageRef.current)) return;
        try {
            setLoading(true);
            const data = await EconomicGroupService.getAllEconomicGroups(pageNumber, API_CONFIG.ROWS_PER_PAGE, currentFilters !== undefined ? currentFilters : filters);

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
    }, []);

    // Carrega a primeira página ao iniciar
    useEffect(() => {
        loadEconomicGroups(0);
    }, []);


    const onFilterChange = (e: any) => {
        setFilters(e.target.value);
    };

    const onKeyDown = (e: any) => {
        if (e.key === 'Enter') {
            applyFilters();
        }
    };

    const applyFilters = () => {
        loadEconomicGroups(0, filters);
    };

    const clearFilters = () => {
        setFilters('');
        loadEconomicGroups(0, '');
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
            loadEconomicGroups(0, filters); // Recarrega a lista
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao excluir grupo economico', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const headerTemplate = (options: any) => (
        <HeaderList 
            title="Gerenciamento de Grupos Econômicos" 
            buttonLabel="Novo Grupo Econômico" 
            onButtonClick={() => setDisplayManager(true)} 
            options={options} 
        />
    );

    const footer = ()=> {
        return (
            <FooterList
                onLoading={loading}
                isLastPage={isLastPage}
                onButtonClick={() => loadEconomicGroups(page + 1, filters)}
                buttonLabel="Carregar mais grupos"
                moreDataLabel="Todos os grupos foram carregados"
            />
        );
    };

    const actionBodyTemplate = (rowData: IEconomicGroup) => {
        return (
            <ActionRowList
                rowData={rowData}
                onView={(data) => {
                    setSelectedEconomicGroup(data);
                    setDisplayDetails(true);
                }}
                onEdit={(data) => {
                    setEconomicGroupToEdit(data);
                    setDisplayUpdater(true);
                }}
                onDelete={(data) => confirmDelete(data)}
                editTooltip="Editar grupo econômico"
                deleteTooltip="Excluir grupo econômico"
            />
        );
    };

    const rowExpansionTemplate = (data: IEconomicGroup) => {
        return (
            <div className="py-2 px-3 surface-ground">
                <EconomicGroupOrganizationsSubTable economicGroup={data} />
            </div>
        );
    };

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            <ConfirmDialog />
            <Panel headerTemplate={headerTemplate} className="flex flex-column flex-1 min-h-0" pt={{ content: { className: 'flex flex-column flex-1 min-h-0' } }}>
                <FilterList onClear={clearFilters} onSearch={applyFilters} className="mb-2">
                    <div className="field sm:col-6 md:col-4 mb-0">
                        <label htmlFor="name" className="text-xs font-bold text-left block mb-2">Termo de Pesquisa</label>
                        <InputText id="name" value={filters} onChange={onFilterChange} onKeyDown={onKeyDown} className="p-inputtext-sm" placeholder="Pesquisar por nome ou descrição..." />
                    </div>
                </FilterList>
                <div className="flex-1 min-h-0">
                    <DataTable
                        value={economicGroups}
                        selectionMode="single"
                        selection={selectedEconomicGroup}
                        onSelectionChange={(e) => setSelectedEconomicGroup(e.value as IEconomicGroup)}
                        expandedRows={expandedRows}
                        onRowToggle={(e) => setExpandedRows(e.data)}
                        rowExpansionTemplate={rowExpansionTemplate}
                        dataKey="id"
                        loading={loading}
                        footer={footer}
                        scrollable
                        scrollHeight="calc(100vh - 20rem)"
                        className="p-datatable-sm h-full flex-1 text-sm"
                        stripedRows
                        tableStyle={{ minWidth: '50rem' }}
                        emptyMessage="Nenhum grupo economico encontrado."
                    >
                        <Column expander={true} style={{ width: '2rem' }} bodyClassName="py-1" />
                        <Column field="name" header="Nome" sortable bodyClassName="font-bold text-primary py-1" headerClassName="text-sm py-2" />
                        <Column field="description" header="Descricao" sortable bodyClassName="py-1" headerClassName="text-sm py-2" />
                        <Column body={actionBodyTemplate} exportable={false} style={{ width: '8rem' }} bodyClassName="py-1 text-right" headerClassName="py-2" />
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
                    loadEconomicGroups(0, filters);
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
                    loadEconomicGroups(0, filters);
                }}
            />
        </div>
    )
}

export default EconomicGroupList;