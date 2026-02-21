import React, {useEffect, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {InputTextarea} from 'primereact/inputtextarea';
import {Button} from 'primereact/button';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {EconomicGroupService} from './EconomicGroupService';
import {IOrganizationView} from '../organizations/OrganizationStructures';
import DocumentDisplay from '../shared/document/DocumentDisplay';
import {Toast} from 'primereact/toast';
import {IEconomicGroup} from "./EconomicGroupStructures";
import OrganizationSimpleSelector from "../organizations/OrganizationSimpleSelector";
import {OrganizationService} from "../organizations/OrganizationService";

interface EconomicGroupUpdaterProps {
    visible: boolean;
    onHide: () => void;
    economicGroup: IEconomicGroup | null;
    onSaveSuccess?: (economicGroup: IEconomicGroup) => void;
}

const EconomicGroupUpdater: React.FC<EconomicGroupUpdaterProps> = ({ visible, onHide, economicGroup: initialEconomicGroup, onSaveSuccess }) => {

    const emptyEconomicGroup: IEconomicGroup = {
        id: '',
        name: '',
        description: '',
        organizationIds: []
    };

    const [economicGroup, setEconomicGroup] = useState<IEconomicGroup>(emptyEconomicGroup);
    const [selectedOrganizations, setSelectedOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = React.useRef<Toast>(null);

    useEffect(() => {
        if (initialEconomicGroup && visible) {
            setEconomicGroup({...initialEconomicGroup});
        } else if (!visible) {
            clearData();
        }
    }, [initialEconomicGroup, visible]);

    useEffect(() => {
        if (visible && economicGroup?.id && economicGroup?.organizationIds?.length > 0) {
            loadOrganizations();
        } else if (visible) {
            setSelectedOrganizations([]);
        }
    }, [visible, economicGroup.id, economicGroup.organizationIds]);

    const loadOrganizations = async () => {
        if (!economicGroup.organizationIds || economicGroup.organizationIds.length === 0) {
            setSelectedOrganizations([]);
            return;
        }
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList(economicGroup.organizationIds);
            setSelectedOrganizations(response.content || []);
        } catch (error) {
            console.error("Erro ao carregar organizações do grupo econômico", error);
            setSelectedOrganizations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrganization = (org: IOrganizationView) => {
        if (!org || !org.id) {
            console.error("Tentativa de adicionar organização sem ID:", org);
            return;
        }
        
        const exists = selectedOrganizations.some(o => o.id === org.id);
        if (exists) {
            toast.current?.show({ severity: 'warn', summary: 'Atenção', detail: 'Organização já adicionada', life: 3000 });
            return;
        }
        setSelectedOrganizations([...selectedOrganizations, org]);
    };

    const handleRemoveOrganization = (orgToRemove: IOrganizationView) => {
        if (!orgToRemove || !orgToRemove.id) return;

        setSelectedOrganizations((prevOrganizations) => {
            return prevOrganizations.filter(org => org.id !== orgToRemove.id);
        });
    };

    function clearData() {
        setEconomicGroup(emptyEconomicGroup);
        setSelectedOrganizations([]);
    }

    const handleSave = async () => {
        if (!economicGroup.name.trim()) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'O nome é obrigatório', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            const groupToSave = {
                ...economicGroup,
                organizationIds: selectedOrganizations.map(org => org.id)
            };
            const savedGroup = await EconomicGroupService.saveEconomicGroup(groupToSave);
            
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Grupo Econômico atualizado com sucesso', life: 3000 });

            if (onSaveSuccess)
                onSaveSuccess(savedGroup);
            
            clearData();
            onHide();
        } catch (error: any) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: error.message || 'Erro ao salvar grupo econômico', life: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const actionsTemplate = (rowData: IOrganizationView) => {
        return (
            <Button 
                icon="pi pi-trash" 
                className="p-button-rounded p-button-danger p-button-text" 
                onClick={() => handleRemoveOrganization(rowData)}
                title="Remover"
            />
        );
    };

    const cnpjBodyTemplate = (rowData: IOrganizationView) => {
        return <DocumentDisplay type="CNPJ" value={rowData.document.identifier} />;
    };

    const handleCancel: () => void = () => {
        clearData();
        onHide();
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={handleCancel} rounded size="small" className="p-button-secondary"/>
            <Button label="Salvar" icon="pi pi-check" onClick={handleSave} rounded size="small"/>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Sidebar 
                visible={visible} 
                onHide={handleCancel}
                position="right" 
                style={{ width: '35rem' }}
                header={<h4 className="m-0">Editar Grupo Econômico</h4>}
                className="p-sidebar-sm"
            >
                <div className="p-fluid grid mt-1 w-full">
                    <div className="col-12 py-0">
                        <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados do Grupo Econômico</h6>
                        <div className="field mb-2">
                            <label htmlFor="name" className="text-xs font-bold mb-1 block">Nome*</label>
                            <InputText 
                                id="name" 
                                value={economicGroup.name}
                                onChange={(e) => setEconomicGroup({...economicGroup, name: e.target.value})} 
                                className="p-inputtext-sm" 
                                placeholder="Digite o nome do grupo"
                            />
                        </div>

                        <div className="field mb-2">
                            <label htmlFor="description" className="text-xs font-bold mb-1 block">Descrição</label>
                            <InputTextarea 
                                id="description"
                                value={economicGroup.description}
                                onChange={(e) => setEconomicGroup({...economicGroup, description: e.target.value})} 
                                rows={3} 
                                className="p-inputtext-sm" 
                                placeholder="Digite uma descrição opcional"
                            />
                        </div>
                    </div>

                    <div className="col-12 py-0">
                        <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Organizações Vinculadas</h6>
                        
                        <div className="field mb-2">
                            <label className="text-xs font-bold mb-1 block">Buscar Organização</label>
                            <OrganizationSimpleSelector
                                value={null}
                                onChange={(e) => handleAddOrganization(e.value)}
                                placeholder="Selecione para adicionar..."
                            />
                        </div>

                        <DataTable 
                            value={selectedOrganizations} 
                            className="p-datatable-sm text-xs"
                            emptyMessage="Nenhuma organização adicionada."
                            rows={5}
                            stripedRows
                            dataKey="id"
                            selectionMode="single"
                            scrollable
                            scrollHeight="20rem"
                        >
                            <Column field="name" header="Nome" sortable headerClassName="text-xs py-2" bodyClassName="py-1 text-xs"></Column>
                            <Column header="Documento" body={cnpjBodyTemplate} headerClassName="text-xs py-2" bodyClassName="py-1 text-xs"></Column>
                            <Column body={actionsTemplate} style={{ width: '3rem' }} bodyClassName="py-1 text-xs"></Column>
                        </DataTable>
                    </div>
                </div>
                {footer}
            </Sidebar>
        </>
    );
};

export default EconomicGroupUpdater;
