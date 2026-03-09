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
import {EconomicGroupFormData, economicGroupSchema, IEconomicGroup} from "./EconomicGroupStructures";
import OrganizationSimpleSelector from "../organizations/OrganizationSimpleSelector";
import {OrganizationService} from "../organizations/OrganizationService";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {classNames} from "primereact/utils";

interface EconomicGroupUpdaterProps {
    visible: boolean;
    onHide: () => void;
    economicGroup: IEconomicGroup | null;
    onSaveSuccess?: (economicGroup: IEconomicGroup) => void;
}

const EconomicGroupUpdater: React.FC<EconomicGroupUpdaterProps> = ({ visible, onHide, economicGroup: initialEconomicGroup, onSaveSuccess }) => {

    const [selectedOrganizations, setSelectedOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = React.useRef<Toast>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<EconomicGroupFormData>({
        resolver: zodResolver(economicGroupSchema),
        defaultValues: {
            name: '',
            description: '',
            organizationIds: []
        }
    });

    useEffect(() => {
        if (initialEconomicGroup && visible) {
            reset({
                name: initialEconomicGroup.name || '',
                description: initialEconomicGroup.description || '',
                organizationIds: initialEconomicGroup.organizationIds || []
            });
            if (initialEconomicGroup.organizationIds?.length > 0) {
                loadOrganizations(initialEconomicGroup.organizationIds);
            } else {
                setSelectedOrganizations([]);
            }
        } else if (!visible) {
            clearData();
        }
    }, [initialEconomicGroup, visible, reset]);

    const loadOrganizations = async (organizationIds: string[]) => {
        if (!organizationIds || organizationIds.length === 0) {
            setSelectedOrganizations([]);
            return;
        }
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList(organizationIds);
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
        
        const newSelected = [...selectedOrganizations, org];
        setSelectedOrganizations(newSelected);
        setValue('organizationIds', newSelected.map(o => o.id));
    };

    const handleRemoveOrganization = (orgToRemove: IOrganizationView) => {
        if (!orgToRemove || !orgToRemove.id) return;

        const newSelected = selectedOrganizations.filter(org => org.id !== orgToRemove.id);
        setSelectedOrganizations(newSelected);
        setValue('organizationIds', newSelected.map(o => o.id));
    };

    function clearData() {
        reset({
            name: '',
            description: '',
            organizationIds: []
        });
        setSelectedOrganizations([]);
    }

    const handleSave = async (data: EconomicGroupFormData) => {
        setLoading(true);
        try {
            const groupToSave = {
                ...initialEconomicGroup,
                ...data
            } as IEconomicGroup;

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
            <Button label="Salvar" icon="pi pi-check" onClick={handleSubmit(handleSave)} rounded size="small" loading={loading}/>
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
                            <Controller
                                name="name"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputText 
                                            id={field.name}
                                            {...field}
                                            className={classNames('p-inputtext-sm', { 'p-invalid': fieldState.error })}
                                            placeholder="Digite o nome do grupo"
                                        />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>

                        <div className="field mb-2">
                            <label htmlFor="description" className="text-xs font-bold mb-1 block">Descrição</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <InputTextarea 
                                        id={field.name}
                                        {...field}
                                        rows={3} 
                                        className="p-inputtext-sm" 
                                        placeholder="Digite uma descrição opcional"
                                    />
                                )}
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
