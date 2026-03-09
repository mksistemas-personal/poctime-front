import React, {useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {OrganizationService} from './OrganizationService';
import {IOrganization, OrganizationFormData, organizationSchema} from './OrganizationStructures';
import OrganizationSelector from './OrganizationSelector';
import {InputMask} from "primereact/inputmask";
import {ZipCodeService} from '../shared/zipcode/ZipCodeService';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {classNames} from "primereact/utils";

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

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        getValues,
        watch
    } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationSchema),
        defaultValues: emptyOrganization
    });

    const [selectedOrgProj, setSelectedOrgProj] = useState<any>(null);
    const [selectedRespProj, setSelectedRespProj] = useState<any>(null);
    const [isManualEntry, setIsManualEntry] = useState(false);
    const [isRespManualEntry, setIsRespManualEntry] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    const handleOrgSelect = (e: any) => {
        const selected = e.value;
        setSelectedOrgProj(selected);
        if (selected) {
            const currentOrgPerson = getValues('organizationPerson');
            setValue('organizationPerson', {
                ...currentOrgPerson,
                id: selected.personId || '',
                name: selected.personName,
                document: {
                    ...currentOrgPerson.document,
                    identifier: selected.documentNumber
                }
            }, { shouldValidate: true });
            setIsManualEntry(false);
        } else {
            setValue('organizationPerson', emptyOrganization.organizationPerson, { shouldValidate: true });
        }
    };

    const handleRespSelect = (e: any) => {
        const selected = e.value;
        setSelectedRespProj(selected);
        if (selected) {
            const currentRespPerson = getValues('responsiblePerson');
            setValue('responsiblePerson', {
                ...currentRespPerson,
                id: selected.personId || '',
                name: selected.personName,
                document: {
                    ...currentRespPerson.document,
                    identifier: selected.documentNumber
                }
            }, { shouldValidate: true });
            setIsRespManualEntry(false);
        } else {
            setValue('responsiblePerson', emptyOrganization.responsiblePerson, { shouldValidate: true });
        }
    };

    const handleZipCodeChange = async (zipValue: string) => {
        setValue('address.zipCode', zipValue, { shouldValidate: true });
        const cleanZip = zipValue.replace(/\D/g, '');

        if (cleanZip.length === 8) {
            try {
                const response = await ZipCodeService.getZipCode(cleanZip);
                if (response) {
                    const currentAddress = getValues('address');
                    setValue('address', {
                        ...currentAddress,
                        street: currentAddress.street || response.street,
                        neighborhood: currentAddress.neighborhood || response.neighborhood,
                        city: currentAddress.city || response.city,
                        stateCode: currentAddress.stateCode || response.state
                    }, { shouldValidate: true });
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleAddNew = () => {
        setValue('organizationPerson', emptyOrganization.organizationPerson);
        setValue('address.city', '');
        setSelectedOrgProj(null);
        setIsManualEntry(true);
    };

    const handleRespAddNew = () => {
        setValue('responsiblePerson', emptyOrganization.responsiblePerson);
        setSelectedRespProj(null);
        setIsRespManualEntry(true);
    };

    const handleSave = async (data: OrganizationFormData) => {
        setLoading(true);
        try {
            const savedOrg = await OrganizationService.saveOrganization(data as IOrganization);
            if (onSave) {
                onSave(savedOrg);
            }
            onHide();
            handleCancel();
        } catch (error: any) {
            console.error("Erro ao salvar organização:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao salvar organização',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset(emptyOrganization);
        setSelectedOrgProj(null);
        setSelectedRespProj(null);
        setIsManualEntry(false);
        setIsRespManualEntry(false);
        onHide();
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={handleCancel} rounded size="small" className="p-button-secondary" />
            <Button label="Salvar" icon="pi pi-check" onClick={handleSubmit(handleSave)} loading={loading} rounded size="small"/>
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
            <div className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados da Organização</h6>
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
                                <Controller
                                    name="organizationPerson.name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="flex-1">
                                            <InputText 
                                                id={field.name}
                                                {...field}
                                                className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })}
                                                placeholder="Digite o novo nome"
                                                autoFocus
                                            />
                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                        </div>
                                    )}
                                />
                                <Button 
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsManualEntry(false);
                                        setSelectedOrgProj(null);
                                        setValue('organizationPerson', emptyOrganization.organizationPerson);
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cnpj" className="text-xs font-bold mb-1 block">CNPJ</label>
                        <Controller
                            name="organizationPerson.document.identifier"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputMask
                                        id={field.name}
                                        {...field}
                                        className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })}
                                        mask="99.999.999/9999-99"
                                        placeholder="00.000.000/0000-00"
                                        disabled={!isManualEntry && watch('organizationPerson.name') !== ''}
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Responsável</h6>
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
                                <Controller
                                    name="responsiblePerson.name"
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <div className="flex-1">
                                            <InputText 
                                                id={field.name}
                                                {...field}
                                                className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })}
                                                placeholder="Digite o nome do responsável"
                                                autoFocus
                                            />
                                            {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                        </div>
                                    )}
                                />
                                <Button 
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsRespManualEntry(false);
                                        setSelectedRespProj(null);
                                        setValue('responsiblePerson', emptyOrganization.responsiblePerson);
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cpf" className="text-xs font-bold mb-1 block">CPF</label>
                        <Controller
                            name="responsiblePerson.document.identifier"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputMask 
                                        id={field.name}
                                        {...field}
                                        className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })}
                                        mask="999.999.999-99"
                                        placeholder="000.000.000-00"
                                        disabled={!isRespManualEntry && watch('responsiblePerson.name') !== ''}
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="respEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <Controller
                            name="responsibleEmail"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText 
                                        id={field.name}
                                        {...field}
                                        keyfilter="email"
                                        className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })}
                                        placeholder="exemplo@email.com"
                                    />
                                    {fieldState.error && <small className="p-error block mt-1 text-xs">{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                </div>

                <div className="col-12 py-0">
                    <h6 className="mb-1 text-primary border-bottom-1 surface-border pb-1">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="field col-9 p-1 mb-2">
                            <label htmlFor="street" className="text-xs font-bold mb-1 block">Rua</label>
                            <Controller
                                name="address.street"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputText id={field.name} {...field} className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })} placeholder="Rua, Avenida, etc." />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="field col-3 p-1 mb-2">
                            <label htmlFor="number" className="text-xs font-bold mb-1 block">Nº</label>
                            <Controller
                                name="address.number"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputText id={field.name} {...field} className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })} placeholder="123" />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="field col-7 p-1 mb-2">
                            <label htmlFor="neighborhood" className="text-xs font-bold mb-1 block">Bairro</label>
                            <Controller
                                name="address.neighborhood"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputText id={field.name} {...field} className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })} placeholder="Bairro" />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="field col-5 p-1 mb-2">
                            <label htmlFor="zipCode" className="text-xs font-bold mb-1 block">CEP</label>
                            <Controller
                                name="address.zipCode"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputMask 
                                            id={field.name}
                                            {...field}
                                            mask="99999-999"
                                            className={classNames('w-full p-inputtext-sm', { 'p-invalid': fieldState.error })}
                                            onChange={(e) => handleZipCodeChange(e.value || '')}
                                            placeholder="00000-000"
                                        />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="field col-9 p-1 mb-2">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <Controller
                                name="address.city"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <InputText id={field.name} {...field} className={classNames('p-inputtext-sm w-full', { 'p-invalid': fieldState.error })} placeholder="Cidade" />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
                            />
                        </div>
                        <div className="field col-3 p-1 mb-2">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <Controller
                                name="address.stateCode"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <FederalStateSelector 
                                            value={field.value} 
                                            onChange={field.onChange}
                                            className={classNames('w-full p-inputtext-sm', { 'p-invalid': fieldState.error })}
                                        />
                                        {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                    </>
                                )}
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
