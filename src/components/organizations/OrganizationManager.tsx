import React, { useState, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { OrganizationService, IOrganization } from './OrganizationService';
import OrganizationSelector from './OrganizationSelector';
import {InputMask} from "primereact/inputmask";

interface OrganizationManagerProps {
    visible: boolean;
    onHide: () => void;
    onSave?: (organization: IOrganization) => void;
}

const OrganizationManager: React.FC<OrganizationManagerProps> = ({ visible, onHide, onSave }) => {
    const emptyOrganization: IOrganization = {
        id: '',
        organizationPerson: { id: '', name: '', document: { type: 'cnpj', identifier: '', country: 'Brasil', complement: '' } },
        responsiblePerson: { id: '', name: '', document: { type: 'cpf', identifier: '', country: 'Brasil', complement: '' } },
        responsibleEmail: '',
        address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            country: 'BR',
            stateCode: ''
        }
    };

    const [organization, setOrganization] = useState<IOrganization>(emptyOrganization);
    const [selectedOrgProj, setSelectedOrgProj] = useState<any>(null);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const toast = useRef<Toast>(null);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        const val = e.target.value;
        const keys = path.split('.');
        
        setOrganization(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = val;
            return { ...newState };
        });
    };

    const handleOrgSelect = (e: any) => {
        const selected = e.value;
        setSelectedOrgProj(selected);
        if (selected) {
            setOrganization(prev => ({
                ...prev,
                organizationPerson: {
                    ...prev.organizationPerson,
                    name: selected.personName,
                    document: { 
                        ...prev.organizationPerson.document, 
                        identifier: selected.documentNumber 
                    }
                },
                address: {
                    ...prev.address,
                    city: selected.city
                }
            }));
            setIsManualEntry(false);
        } else {
            // Se limpar a seleção
            setOrganization(emptyOrganization);
        }
    };

    const handleAddNew = () => {
        setOrganization(emptyOrganization);
        setSelectedOrgProj(null);
        setIsManualEntry(true);
    };

    const handleSave = async () => {
        try {
            const dataToSave = { ...organization };
            const savedOrg = await OrganizationService.saveOrganization(dataToSave);
            if (onSave) {
                onSave(savedOrg);
            }
            onHide(); // Fecha a barra lateral após sucesso
            setOrganization(emptyOrganization); // Reseta o formulário
            setSelectedOrgProj(null);
        } catch (error: any) {
            console.error("Erro ao salvar organização:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao salvar organização',
                life: 3000
            });
        }
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} severity="danger" rounded size="small" />
            <Button label="Salvar" icon="pi pi-check" onClick={handleSave} severity="success" rounded size="small"/>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Sidebar 
                visible={visible} 
                onHide={onHide} 
                position="right" 
                style={{ width: '35rem' }}
                header={<h4 className="m-0">Cadastrar Organização</h4>}
                className="p-sidebar-sm"
            >
            <div className="p-fluid grid mt-2 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Dados da Organização</h6>
                    <div className="field mb-2">
                        <label htmlFor="orgName" className="text-xs font-bold mb-1 block">Nome da Organização</label>
                        {!isManualEntry ? (
                                <OrganizationSelector 
                                    value={selectedOrgProj}
                                    onChange={handleOrgSelect}
                                    onAddNew={handleAddNew}
                                />
                            ) : (
                            <div className="flex gap-2">
                                <InputText 
                                    id="orgName" 
                                    className="p-inputtext-sm flex-1" 
                                    value={organization.organizationPerson.name} 
                                    onChange={(e) => onInputChange(e, 'organizationPerson.name')} 
                                    placeholder="Digite o novo nome"
                                    autoFocus
                                />
                                <Button 
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsManualEntry(false);
                                        setSelectedOrgProj(null);
                                        setOrganization(emptyOrganization);
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cnpj" className="text-xs font-bold mb-1 block">CNPJ</label>
                        <InputMask
                            id="cnpj" 
                            className="p-inputtext-sm"
                            mask="99.999.999/9999-99"
                            value={organization.organizationPerson.document.identifier}
                            placeholder="00.000.000/0000-00"
                            onChange={(e) => onInputChange(e as any, 'organizationPerson.document.identifier')}
                            disabled={!isManualEntry && organization.organizationPerson.name !== ''}
                        />
                    </div>
                </div>

                <div className="col-12 py-0 mt-2">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Responsável</h6>
                    <div className="field mb-2">
                        <label htmlFor="respName" className="text-xs font-bold mb-1 block">Nome do Responsável</label>
                        <InputText id="respName" className="p-inputtext-sm" value={organization.responsiblePerson.name} onChange={(e) => onInputChange(e, 'responsiblePerson.name')} />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="respEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <InputText id="respEmail" className="p-inputtext-sm" value={organization.responsibleEmail} onChange={(e) => onInputChange(e, 'responsibleEmail')} />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cpf" className="text-xs font-bold mb-1 block">CPF</label>
                        <InputText id="cpf" className="p-inputtext-sm" value={organization.responsiblePerson.document.identifier} onChange={(e) => onInputChange(e, 'responsiblePerson.document.identifier')} />
                    </div>
                </div>

                <div className="col-12 py-0 mt-2">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="street" className="text-xs font-bold mb-1 block">Rua</label>
                            <InputText id="street" className="p-inputtext-sm" value={organization.address.street} onChange={(e) => onInputChange(e, 'address.street')} />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="number" className="text-xs font-bold mb-1 block">Nº</label>
                            <InputText id="number" className="p-inputtext-sm" value={organization.address.number} onChange={(e) => onInputChange(e, 'address.number')} />
                        </div>
                        <div className="field col-7 p-1 mb-1">
                            <label htmlFor="neighborhood" className="text-xs font-bold mb-1 block">Bairro</label>
                            <InputText id="neighborhood" className="p-inputtext-sm" value={organization.address.neighborhood} onChange={(e) => onInputChange(e, 'address.neighborhood')} />
                        </div>
                        <div className="field col-5 p-1 mb-1">
                            <label htmlFor="zipCode" className="text-xs font-bold mb-1 block">CEP</label>
                            <InputText id="zipCode" className="p-inputtext-sm" value={organization.address.zipCode} onChange={(e) => onInputChange(e, 'address.zipCode')} />
                        </div>
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <InputText id="city" className="p-inputtext-sm" value={organization.address.city} onChange={(e) => onInputChange(e, 'address.city')} />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <InputText id="stateCode" className="p-inputtext-sm" value={organization.address.stateCode} onChange={(e) => onInputChange(e, 'address.stateCode')} />
                        </div>
                    </div>
                </div>
            </div>
            {footer}
        </Sidebar>
        </>
    );
};

export default OrganizationManager;
