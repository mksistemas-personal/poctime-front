import React, {useEffect, useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {InputMask} from "primereact/inputmask";
import {IZipCodeResponse, ZipCodeService} from '../shared/zipcode/ZipCodeService';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import {IClient} from "./ClientStructures";
import {ClientService} from "./ClientService";

interface ClientManagerProps {
    visible: boolean;
    onHide: () => void;
    clientInput: IClient | null;
    onSave?: (client: IClient) => void;
}

const ClientUpdater: React.FC<ClientManagerProps> = ({ visible, onHide, clientInput: initialClient, onSave }) => {
    const emptyClient: IClient = {
        clientId: '',
        clientPerson: { id: '', name: '', document: { type: 'cnpj', identifier: '', country: 'BR', complement: '' } },
        clientEmail: '',
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

    const [client, setClient] = useState<IClient>(emptyClient);
    const [emailError, setEmailError] = useState<string | null>(null);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (initialClient) {
            setClient(initialClient);
            setEmailError(null);
        }
    }, [initialClient, visible]);

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
        
        if (path === 'clientEmail') {
            validateEmail(val);
        }
        
        setClient(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = val;
            return { ...newState };
        });
    };

    const handleZipCodeChange = async (zipData: IZipCodeResponse | string) => {
        if (typeof zipData === 'string') {
            const cleanZip = zipData.replace(/\D/g, '');
            
            setClient(prev => ({
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
                        setClient(prev => ({
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
            setClient(prev => ({
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

    const handleSave = async () => {
        if (client.clientEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.clientEmail)) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Por favor, insira um e-mail válido para o responsável.',
                life: 3000
            });
            return;
        }

        try {
            const dataToSave = { ...client };
            console.log('Dados do cliente antes de salvar:', dataToSave);
            const savedOrg = await ClientService.saveClient(dataToSave);
            if (onSave) {
                onSave(savedOrg);
            }
            onHide(); // Fecha a barra lateral após sucesso
            setClient(emptyClient); // Reseta o formulário
            setEmailError(null);
        } catch (error: any) {
            console.error("Erro ao salvar cliente:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao salvar cliente',
                life: 3000
            });
        }
    };

    const handleCancel = () => {
        setClient(emptyClient);
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
                header={<h4 className="m-0">Alterar Cliente</h4>}
                className="p-sidebar-sm"
            >
            <div className="p-fluid grid mt-2 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Dados do Cliente</h6>
                    <div className="field mb-2">
                        <label htmlFor="orgName" className="text-xs font-bold mb-1 block">Nome do Cliente</label>
                        <InputText 
                            id="orgName" 
                            className="p-inputtext-sm" 
                            value={client.clientPerson.name}
                            disabled
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="identifier" className="text-xs font-bold mb-1 block">
                            {client.clientPerson.document.type === 'cnpj' ? 'CNPJ' : 'CPF'}
                        </label>
                        <InputMask
                            id="identifier" 
                            className="p-inputtext-sm"
                            mask={client.clientPerson.document.type === 'cnpj' ? "99.999.999/9999-99" : "999.999.999-99"}
                            value={client.clientPerson.document.identifier}
                            placeholder={client.clientPerson.document.type === 'cnpj' ? "00.000.000/0000-00" : "000.000.000-00"}
                            onChange={(e) => onInputChange(e as any, 'clientPerson.document.identifier')}
                            disabled={true}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="clientEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <InputText 
                            id="clientEmail"
                            keyfilter="email"
                            className={`p-inputtext-sm ${emailError ? 'p-invalid' : ''}`} 
                            value={client.clientEmail}
                            onChange={(e) => onInputChange(e, 'clientEmail')}
                        />
                        {emailError && <small className="p-error block mt-1" style={{ fontSize: '0.7rem' }}>{emailError}</small>}
                    </div>
                </div>

                <div className="col-12 py-0 mt-2">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="street" className="text-xs font-bold mb-1 block">Rua</label>
                            <InputText id="street" className="p-inputtext-sm" value={client.address.street} onChange={(e) => onInputChange(e, 'address.street')} />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="number" className="text-xs font-bold mb-1 block">Nº</label>
                            <InputText id="number" className="p-inputtext-sm" value={client.address.number} onChange={(e) => onInputChange(e, 'address.number')} />
                        </div>
                        <div className="field col-7 p-1 mb-1">
                            <label htmlFor="neighborhood" className="text-xs font-bold mb-1 block">Bairro</label>
                            <InputText id="neighborhood" className="p-inputtext-sm" value={client.address.neighborhood} onChange={(e) => onInputChange(e, 'address.neighborhood')} />
                        </div>
                        <div className="field col-5 p-1 mb-1">
                            <label htmlFor="zipCode" className="text-xs font-bold mb-1 block">CEP</label>
                            <InputMask 
                                id="zipCode"
                                mask="99999-999"
                                className="w-full p-inputtext-sm"
                                value={client.address.zipCode}
                                onChange={(e) => handleZipCodeChange(e.value || '')}
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <InputText id="city" className="p-inputtext-sm" value={client.address.city} onChange={(e) => onInputChange(e, 'address.city')} />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <FederalStateSelector 
                                value={client.address.stateCode}
                                onChange={(val) => {
                                    setClient(prev => ({
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

export default ClientUpdater;
