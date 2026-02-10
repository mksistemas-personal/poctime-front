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
        }
    }, [initialEconomicGroup, visible]);

    useEffect(() => {
        if (visible && economicGroup && economicGroup.id && economicGroup.organizationIds && economicGroup.organizationIds.length > 0) {
            loadOrganizations();
        } else if (visible && (!economicGroup.organizationIds || economicGroup.organizationIds.length === 0)) {
            setSelectedOrganizations([]);
        }
    }, [visible, economicGroup.id]);

    const loadOrganizations = async () => {
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList(economicGroup.organizationIds);
            setSelectedOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações do grupo econômico", error);
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

    return (
        <>
            <Toast ref={toast} />
            <Sidebar 
                visible={visible} 
                onHide={handleCancel}
                position="right" 
                style={{ width: '40rem' }}
                header={<h4 className="m-0">Editar Grupo Econômico</h4>}
                className="p-sidebar-sm"
            >
                <div className="grid mt-2">
                    <div className="col-12 field">
                        <label htmlFor="name" className="block text-sm font-bold mb-2">Nome*</label>
                        <InputText 
                            id="name" 
                            value={economicGroup.name}
                            onChange={(e) => setEconomicGroup({...economicGroup, name: e.target.value})} 
                            className="w-full p-inputtext-sm" 
                            placeholder="Digite o nome do grupo"
                        />
                    </div>

                    <div className="col-12 field">
                        <label htmlFor="description" className="block text-sm font-bold mb-2">Descrição</label>
                        <InputTextarea 
                            id="description"
                            value={economicGroup.description}
                            onChange={(e) => setEconomicGroup({...economicGroup, description: e.target.value})} 
                            rows={3} 
                            className="w-full p-inputtext-sm" 
                            placeholder="Digite uma descrição opcional"
                        />
                    </div>

                    <div className="col-12 mt-4">
                        <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Organizações Vinculadas</h6>
                        
                        <div className="flex gap-2 mb-3 align-items-end">
                            <div className="flex-grow-1">
                                <label className="block text-xs font-bold mb-1">Buscar Organização</label>
                                <OrganizationSimpleSelector
                                    value={null}
                                    onChange={(e) => handleAddOrganization(e.value)}
                                    placeholder="Selecione para adicionar..."
                                />
                            </div>
                        </div>

                        <DataTable 
                            value={selectedOrganizations} 
                            className="p-datatable-sm"
                            emptyMessage="Nenhuma organização adicionada."
                            rows={5}
                            stripedRows
                            dataKey="id"
                            selectionMode="single"
                            scrollable
                            scrollHeight="flex"
                        >
                            <Column field="name" header="Nome" sortable></Column>
                            <Column header="Documento" body={cnpjBodyTemplate}></Column>
                            <Column body={actionsTemplate} style={{ width: '3rem' }}></Column>
                        </DataTable>
                    </div>

                    <div className="col-12 mt-4 flex justify-content-end gap-2">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            disabled={loading}
                            rounded
                            severity="danger"
                            outlined
                            size="small"
                            onClick={handleCancel}
                        />
                        <Button 
                            label="Salvar"
                            icon="pi pi-check" 
                            onClick={handleSave}
                            loading={loading}
                            severity="success"
                            rounded
                            size="small"
                        />
                    </div>
                </div>
            </Sidebar>
        </>
    );
};

export default EconomicGroupUpdater;
