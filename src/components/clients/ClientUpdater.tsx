import React, {useEffect, useRef} from 'react';
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

    const { control, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<IClient>({
        defaultValues: emptyClient
    });

    const toast = useRef<Toast>(null);
    const documentType = watch('clientPerson.document.type');
    const zipCode = watch('address.zipCode');

    useEffect(() => {
        if (initialClient && visible) {
            reset(initialClient);
        } else if (!visible) {
            reset(emptyClient);
        }
    }, [initialClient, visible, reset]);

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
            reset(emptyClient);
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
                header={<h4 className="m-0">Alterar Cliente</h4>}
                className="p-sidebar-sm"
            >
            <form onSubmit={handleSubmit(handleSave)} className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados do Cliente</h6>
                    <div className="field mb-2">
                        <label htmlFor="orgName" className="text-xs font-bold mb-1 block">Nome do Cliente</label>
                        <Controller
                            name="clientPerson.name"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    {...field}
                                    id="orgName" 
                                    className="p-inputtext-sm" 
                                    disabled
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
                                    disabled={true}
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

export default ClientUpdater;
