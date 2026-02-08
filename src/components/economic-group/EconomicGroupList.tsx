import React, {useCallback, useEffect, useState} from "react";
import {Toast} from "primereact/toast";
import {ConfirmDialog} from "primereact/confirmdialog";
import {Button} from "primereact/button";
import {Panel} from "primereact/panel";
import {Accordion, AccordionTab} from "primereact/accordion";
import {InputText} from "primereact/inputtext";
import {IEconomicGroup} from "./EconomicGroupStructures";
import {EconomicGroupService} from "./EconomicGroupService";


const EconomicGroupList: React.FC = () => {
    const [economicGroups, setEconomicGroups] = useState<IEconomicGroup[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [isLastPage, setIsLastPage] = useState<boolean>(false);
    const [displayManager, setDisplayManager] = useState<boolean>(false);
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
            </Panel>
        </div>
    )
}

export default EconomicGroupList;