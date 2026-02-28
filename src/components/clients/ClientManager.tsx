import React, {useEffect, useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {InputMask} from "primereact/inputmask";
import {Controller, useForm} from 'react-hook-form';
import {IZipCodeResponse, ZipCodeService} from '../shared/zipcode/ZipCodeService';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import {IClient} from "./ClientStructures";
import {ClientService} from "./ClientService";
import ClientSelector from "./ClientSelector";
import {SelectButton} from "primereact/selectbutton";

interface ClientManagerProps {
    visible: boolean;
    onHide: () => void;
    onSave?: (client: IClient) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ visible, onHide, onSave }) => {
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

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<IClient>({
        defaultValues: emptyClient
    });

    const [selectedClientProj, setSelectedClientProj] = useState<any>(null);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const toast = useRef<Toast>(null);

    const clientPersonName = watch('clientPerson.name');
    const documentType = watch('clientPerson.document.type');
    const zipCode = watch('address.zipCode');

    // Reset formulário ao fechar/abrir
    useEffect(() => {
        if (!visible) {
            handleCancel();
        }
    }, [visible]);

    const handleClientSelect = (e: any) => {
        const selected = e.value;
        setSelectedClientProj(selected);
        if (selected) {
            setValue('clientPerson.id', selected.personId || '');
            setValue('clientPerson.name', selected.personName);
            setValue('clientPerson.document.identifier', selected.documentNumber);
            setValue('clientPerson.document.type', selected.documentType || 'cnpj');
            setIsManualEntry(false);
        } else {
            setValue('clientPerson', emptyClient.clientPerson);
        }
    };

    const handleZipCodeChange = async (zipData: IZipCodeResponse | string) => {
        if (typeof zipData === 'string') {
            const cleanZip = zipData.replace(/\D/g, '');
            setValue('address.zipCode', zipData);

            if (cleanZip.length === 8) {
                try {
                    const response = await ZipCodeService.getZipCode(cleanZip);
                    if (response) {
                        const currentStreet = watch('address.street');
                        const currentNeighborhood = watch('address.neighborhood');
                        const currentCity = watch('address.city');
                        const currentStateCode = watch('address.stateCode');

                        if (!currentStreet) setValue('address.street', response.street);
                        if (!currentNeighborhood) setValue('address.neighborhood', response.neighborhood);
                        if (!currentCity) setValue('address.city', response.city);
                        if (!currentStateCode) setValue('address.stateCode', response.state);
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        } else {
            setValue('address.zipCode', zipData.zipCode);
            const currentStreet = watch('address.street');
            const currentNeighborhood = watch('address.neighborhood');
            const currentCity = watch('address.city');
            const currentStateCode = watch('address.stateCode');

            if (!currentStreet) setValue('address.street', zipData.street);
            if (!currentNeighborhood) setValue('address.neighborhood', zipData.neighborhood);
            if (!currentCity) setValue('address.city', zipData.city);
            if (!currentStateCode) setValue('address.stateCode', zipData.state);
        }
    };

    const handleAddNew = () => {
        setValue('clientPerson', emptyClient.clientPerson);
        setValue('address.city', '');
        setSelectedClientProj(null);
        setIsManualEntry(true);
    };

    const handleSave = async (data: IClient) => {
        try {
            const savedOrg = await ClientService.saveClient(data);
            toast.current?.show({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Cliente salvo com sucesso',
                life: 3000
            });
            if (onSave) {
                onSave(savedOrg);
            }
            onHide();
            handleCancel();
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
        reset(emptyClient);
        setSelectedClientProj(null);
        setIsManualEntry(false);
        onHide();
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button type="button" label="Cancelar" icon="pi pi-times" outlined onClick={handleCancel} rounded size="small" className="p-button-secondary" />
            <Button type="button" label="Salvar" icon="pi pi-check" onClick={handleSubmit(handleSave)} rounded size="small"/>
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
                header={<h4 className="m-0">Cadastrar Cliente</h4>}
                className="p-sidebar-sm"
            >
            <form onSubmit={handleSubmit(handleSave)} className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados do Cliente</h6>
                    <div className="field mb-2">
                        <label htmlFor="orgName" className="text-xs font-bold mb-1 block">Nome do Cliente</label>
                        {!isManualEntry ? (
                                <ClientSelector
                                    value={selectedClientProj}
                                    onChange={handleClientSelect}
                                    onAddNew={handleAddNew}
                                />
                            ) : (
                            <div className="flex gap-2">
                                <Controller
                                    name="clientPerson.name"
                                    control={control}
                                    rules={{ required: 'Nome é obrigatório' }}
                                    render={({ field, fieldState }) => (
                                        <div className="flex-1">
                                            <InputText 
                                                {...field}
                                                id="orgName" 
                                                className={`p-inputtext-sm w-full ${fieldState.invalid ? 'p-invalid' : ''}`} 
                                                placeholder="Digite o novo nome"
                                                autoFocus
                                            />
                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                        </div>
                                    )}
                                />
                                <Button 
                                    type="button"
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsManualEntry(false);
                                        setSelectedClientProj(null);
                                        setValue('clientPerson', emptyClient.clientPerson);
                                        setValue('address.city', '');
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field mb-2">
                        <label className="text-xs font-bold mb-1 block">Tipo de Documento</label>
                        <Controller
                            name="clientPerson.document.type"
                            control={control}
                            render={({ field }) => (
                                <SelectButton 
                                    {...field}
                                    options={[
                                        {label: 'CNPJ', value: 'cnpj'},
                                        {label: 'CPF', value: 'cpf'}
                                    ]} 
                                    onChange={(e) => {
                                        if (e.value) {
                                            field.onChange(e.value);
                                            setValue('clientPerson.document.identifier', '');
                                        }
                                    }}
                                    pt={{
                                        button: {
                                            className: 'py-1 text-xs px-2'
                                        }
                                    }}
                                    disabled={!isManualEntry && clientPersonName !== ''}
                                />
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="identifier" className="text-xs font-bold mb-1 block">
                            {documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                        </label>
                        <Controller
                            name="clientPerson.document.identifier"
                            control={control}
                            render={({ field }) => (
                                <InputMask
                                    {...field}
                                    id="identifier" 
                                    className="p-inputtext-sm"
                                    mask={documentType === 'cnpj' ? "99.999.999/9999-99" : "999.999.999-99"}
                                    placeholder={documentType === 'cnpj' ? "00.000.000/0000-00" : "000.000.000-00"}
                                    disabled={!isManualEntry && clientPersonName !== ''}
                                />
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="clientEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <Controller
                            name="clientEmail"
                            control={control}
                            rules={{ 
                                pattern: { 
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
                                    message: 'E-mail inválido' 
                                } 
                            }}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText 
                                        {...field}
                                        id="clientEmail"
                                        keyfilter="email"
                                        className={`p-inputtext-sm ${fieldState.invalid ? 'p-invalid' : ''}`} 
                                    />
                                    {fieldState.error && <small className="p-error block mt-1" style={{ fontSize: '0.7rem' }}>{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="street" className="text-xs font-bold mb-1 block">Rua</label>
                            <Controller
                                name="address.street"
                                control={control}
                                render={({ field }) => (
                                    <InputText {...field} id="street" className="p-inputtext-sm" />
                                )}
                            />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="number" className="text-xs font-bold mb-1 block">Nº</label>
                            <Controller
                                name="address.number"
                                control={control}
                                render={({ field }) => (
                                    <InputText {...field} id="number" className="p-inputtext-sm" />
                                )}
                            />
                        </div>
                        <div className="field col-7 p-1 mb-1">
                            <label htmlFor="neighborhood" className="text-xs font-bold mb-1 block">Bairro</label>
                            <Controller
                                name="address.neighborhood"
                                control={control}
                                render={({ field }) => (
                                    <InputText {...field} id="neighborhood" className="p-inputtext-sm" />
                                )}
                            />
                        </div>
                        <div className="field col-5 p-1 mb-1">
                            <label htmlFor="zipCode" className="text-xs font-bold mb-1 block">CEP</label>
                            <InputMask 
                                id="zipCode"
                                mask="99999-999"
                                className="w-full p-inputtext-sm"
                                value={zipCode}
                                onChange={(e) => handleZipCodeChange(e.value || '')}
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="field col-9 p-1 mb-1">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <Controller
                                name="address.city"
                                control={control}
                                render={({ field }) => (
                                    <InputText {...field} id="city" className="p-inputtext-sm" />
                                )}
                            />
                        </div>
                        <div className="field col-3 p-1 mb-1">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <Controller
                                name="address.stateCode"
                                control={control}
                                render={({ field }) => (
                                    <FederalStateSelector 
                                        value={field.value}
                                        onChange={field.onChange}
                                        className="w-full p-inputtext-sm"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </form>
            {footer}
        </Sidebar>
        </>
    );
};

export default ClientManager;
