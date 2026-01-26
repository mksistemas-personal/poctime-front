import React, { useState, useRef } from 'react';
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { OrganizationService, IOrganization } from './OrganizationService';
import OrganizationSelector from './OrganizationSelector';
import {InputMask} from "primereact/inputmask";
import { IZipCodeResponse, ZipCodeService } from '../shared/zipcode/ZipCodeService';
import FederalStateSelector from '../shared/states/FederalStateSelector';

interface OrganizationManagerProps {
    visible: boolean;
    onHide: () => void;
    onSave?: (organization: IOrganization) => void;
}

const OrganizationManager: React.FC<OrganizationManagerProps> = ({ visible, onHide, onSave }) => {
    const emptyOrganization: IOrganization = {
        id: '',
        organizationPerson: { id: '', name: '', document: { type: 'cnpj', identifier: '', country: 'BR', complement: '' } },
        responsiblePerson: { id: '', name: '', document: { type: 'cpf', identifier: '', country: 'BR', complement: '' } },
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
    const [selectedRespProj, setSelectedRespProj] = useState<any>(null);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [isRespManualEntry, setIsRespManualEntry] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    const validateEmail = (email: string) => {
        if (!email) {
            setEmailError(null);
            return true;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(email);
        setEmailError(isValid ? null : 'E-mail inválido');
        return isValid;
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        const val = e.target.value;
        const keys = path.split('.');
        
        if (path === 'responsibleEmail') {
            validateEmail(val);
        }
        
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
        setEmailError(null);
        if (selected) {
            setOrganization(prev => ({
                ...prev,
                organizationPerson: {
                    ...prev.organizationPerson,
                    id: selected.personId || '',
                    name: selected.personName,
                    document: { 
                        ...prev.organizationPerson.document, 
                        identifier: selected.documentNumber 
                    }
                }
            }));
            setIsManualEntry(false);
        } else {
            // Se limpar a seleção
            setOrganization(prev => ({
                ...prev,
                organizationPerson: emptyOrganization.organizationPerson
            }));
        }
    };

    const handleRespSelect = (e: any) => {
        const selected = e.value;
        setSelectedRespProj(selected);
        setEmailError(null);
        if (selected) {
            setOrganization(prev => ({
                ...prev,
                responsiblePerson: {
                    ...prev.responsiblePerson,
                    id: selected.personId || '',
                    name: selected.personName,
                    document: { 
                        ...prev.responsiblePerson.document, 
                        identifier: selected.documentNumber 
                    }
                }
            }));
            setIsRespManualEntry(false);
        } else {
            setOrganization(prev => ({
                ...prev,
                responsiblePerson: emptyOrganization.responsiblePerson
            }));
        }
    };

    const handleZipCodeChange = async (zipData: IZipCodeResponse | string) => {
        if (typeof zipData === 'string') {
            const cleanZip = zipData.replace(/\D/g, '');
            
            setOrganization(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    zipCode: zipData
                }
            }));

            if (cleanZip.length === 8) {
                try {
                    const response = await ZipCodeService.getZipCode(cleanZip);
                    if (response) {
                        setOrganization(prev => ({
                            ...prev,
                            address: {
                                ...prev.address,
                                street: prev.address.street || response.street,
                                neighborhood: prev.address.neighborhood || response.neighborhood,
                                city: prev.address.city || response.city,
                                stateCode: prev.address.stateCode || response.state
                            }
                        }));
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        } else {
            setOrganization(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    zipCode: zipData.zipCode,
                    street: prev.address.street || zipData.street,
                    neighborhood: prev.address.neighborhood || zipData.neighborhood,
                    city: prev.address.city || zipData.city,
                    stateCode: prev.address.stateCode || zipData.state
                }
            }));
        }
    };

    const handleAddNew = () => {
        setOrganization(prev => ({
            ...prev,
            organizationPerson: emptyOrganization.organizationPerson,
            address: { ...prev.address, city: '' }
        }));
        setSelectedOrgProj(null);
        setIsManualEntry(true);
        setEmailError(null);
    };

    const handleRespAddNew = () => {
        setOrganization(prev => ({
            ...prev,
            responsiblePerson: emptyOrganization.responsiblePerson
        }));
        setSelectedRespProj(null);
        setIsRespManualEntry(true);
        setEmailError(null);
    };

    const handleSave = async () => {
        if (organization.responsibleEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(organization.responsibleEmail)) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Por favor, insira um e-mail válido para o responsável.',
                life: 3000
            });
            return;
        }

        try {
            const dataToSave = { ...organization };
            const savedOrg = await OrganizationService.saveOrganization(dataToSave);
            if (onSave) {
                onSave(savedOrg);
            }
            onHide(); // Fecha a barra lateral após sucesso
            setOrganization(emptyOrganization); // Reseta o formulário
            setSelectedOrgProj(null);
            setSelectedRespProj(null);
            setIsManualEntry(false);
            setIsRespManualEntry(false);
            setEmailError(null);
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

    const handleCancel = () => {
        setOrganization(emptyOrganization);
        setSelectedOrgProj(null);
        setSelectedRespProj(null);
        setIsManualEntry(false);
        setIsRespManualEntry(false);
        setEmailError(null);
        onHide();
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={handleCancel} severity="danger" rounded size="small" />
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
                                        setOrganization(prev => ({
                                            ...prev,
                                            organizationPerson: emptyOrganization.organizationPerson,
                                            address: { ...prev.address, city: '' }
                                        }));
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
                        {!isRespManualEntry ? (
                            <OrganizationSelector 
                                value={selectedRespProj}
                                onChange={handleRespSelect}
                                onAddNew={handleRespAddNew}
                                documentType="cpf"
                                placeholder="Selecione um Responsável"
                            />
                        ) : (
                            <div className="flex gap-2">
                                <InputText 
                                    id="respName" 
                                    className="p-inputtext-sm flex-1" 
                                    value={organization.responsiblePerson.name} 
                                    onChange={(e) => onInputChange(e, 'responsiblePerson.name')} 
                                    placeholder="Digite o nome do responsável"
                                    autoFocus
                                />
                                <Button 
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsRespManualEntry(false);
                                        setSelectedRespProj(null);
                                        setOrganization(prev => ({
                                            ...prev,
                                            responsiblePerson: emptyOrganization.responsiblePerson
                                        }));
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cpf" className="text-xs font-bold mb-1 block">CPF</label>
                        <InputMask 
                            id="cpf" 
                            className="p-inputtext-sm" 
                            mask="999.999.999-99"
                            value={organization.responsiblePerson.document.identifier} 
                            placeholder="000.000.000-00"
                            onChange={(e) => onInputChange(e as any, 'responsiblePerson.document.identifier')} 
                            disabled={!isRespManualEntry && organization.responsiblePerson.name !== ''}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="respEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <InputText 
                            id="respEmail"
                            keyfilter="email"
                            className={`p-inputtext-sm ${emailError ? 'p-invalid' : ''}`} 
                            value={organization.responsibleEmail} 
                            onChange={(e) => onInputChange(e, 'responsibleEmail')} 
                        />
                        {emailError && <small className="p-error block mt-1" style={{ fontSize: '0.7rem' }}>{emailError}</small>}
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
                            <InputMask 
                                id="zipCode"
                                mask="99999-999"
                                className="w-full p-inputtext-sm"
                                value={organization.address.zipCode} 
                                onChange={(e) => handleZipCodeChange(e.value || '')}
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <InputText id="city" className="p-inputtext-sm" value={organization.address.city} onChange={(e) => onInputChange(e, 'address.city')} />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <FederalStateSelector 
                                value={organization.address.stateCode} 
                                onChange={(val) => {
                                    setOrganization(prev => ({
                                        ...prev,
                                        address: {
                                            ...prev.address,
                                            stateCode: val
                                        }
                                    }));
                                }}
                                className="w-full p-inputtext-sm"
                            />
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
