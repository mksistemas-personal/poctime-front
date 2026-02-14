import React, {useState} from 'react';
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

interface EconomicGroupCreatorProps {
    visible: boolean;
    onHide: () => void;
    onSaveSuccess?: (economicGroup: IEconomicGroup) => void;
}

const EconomicGroupCreator: React.FC<EconomicGroupCreatorProps> = ({ visible, onHide, onSaveSuccess }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedOrganizations, setSelectedOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = React.useRef<Toast>(null);

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
        setName('');
        setDescription('');
        setSelectedOrganizations([]);
    }

    const handleSave = async () => {
        if (!name.trim()) {
            toast.current?.show({ severity: 'error', summary: 'Erro', detail: 'O nome é obrigatório', life: 3000 });
            return;
        }

        setLoading(true);
        try {
            const savedGroup = await EconomicGroupService.saveEconomicGroup({
                name,
                description,
                organizationIds: selectedOrganizations.map(org => org.id)
            });
            
            toast.current?.show({ severity: 'success', summary: 'Sucesso', detail: 'Grupo Econômico criado com sucesso', life: 3000 });

            clearData();

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
                header={<h4 className="m-0">Novo Grupo Econômico</h4>}
                className="p-sidebar-sm"
            >
                <div className="grid mt-2">
                    <div className="col-12 field">
                        <label htmlFor="name" className="block text-sm font-bold mb-2">Nome*</label>
                        <InputText 
                            id="name" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full p-inputtext-sm" 
                            placeholder="Digite o nome do grupo"
                        />
                    </div>

                    <div className="col-12 field">
                        <label htmlFor="description" className="block text-sm font-bold mb-2">Descrição</label>
                        <InputTextarea 
                            id="description" 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
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
                            scrollHeight="20rem"
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

export default EconomicGroupCreator;
