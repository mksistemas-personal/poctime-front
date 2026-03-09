import React, {useEffect, useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {OrganizationService} from './OrganizationService';
import {IOrganization, OrganizationFormData, organizationSchema} from './OrganizationStructures';
import OrganizationSelector from './OrganizationSelector';
import {InputMask} from "primereact/inputmask";
import {IZipCodeResponse, ZipCodeService} from '../shared/zipcode/ZipCodeService';
import FederalStateSelector from '../shared/states/FederalStateSelector';
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

interface OrganizationUpdaterProps {
    visible: boolean;
    onHide: () => void;
    organization: IOrganization | null;
    onSave?: (organization: IOrganization) => void;
}

const OrganizationUpdater: React.FC<OrganizationUpdaterProps> = ({ visible, onHide, organization: initialOrganization, onSave }) => {
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

    const { control, handleSubmit, reset, setValue, getValues, formState: { errors } } = useForm<OrganizationFormData>({
        resolver: zodResolver(organizationSchema),
        defaultValues: emptyOrganization
    });

    const [selectedRespProj, setSelectedRespProj] = useState<any>(null);
    const [isRespManualEntry, setIsRespManualEntry] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (initialOrganization && visible) {
            reset(initialOrganization);
            
            // Inicializar o responsável selecionado no dropdown
            if (initialOrganization.responsiblePerson) {
                setSelectedRespProj({
                    personId: initialOrganization.responsiblePerson.id,
                    personName: initialOrganization.responsiblePerson.name,
                    documentNumber: initialOrganization.responsiblePerson.document.identifier,
                    documentType: initialOrganization.responsiblePerson.document.type,
                    id: '', // id da organização (não aplicável aqui pois estamos selecionando uma pessoa)
                    city: initialOrganization.address?.city || ''
                });
            } else {
                setSelectedRespProj(null);
            }
            
            setIsRespManualEntry(false);
        }
    }, [initialOrganization, visible, reset]);

    const handleRespSelect = (e: any) => {
        const selected = e.value;
        setSelectedRespProj(selected);
        if (selected) {
            setValue('responsiblePerson.id', selected.personId || '');
            setValue('responsiblePerson.name', selected.personName);
            setValue('responsiblePerson.document.identifier', selected.documentNumber);
            setIsRespManualEntry(false);
        } else {
            setValue('responsiblePerson', emptyOrganization.responsiblePerson);
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
                        const currentAddress = getValues('address');
                        setValue('address.street', currentAddress.street || response.street, { shouldValidate: true });
                        setValue('address.neighborhood', currentAddress.neighborhood || response.neighborhood, { shouldValidate: true });
                        setValue('address.city', currentAddress.city || response.city, { shouldValidate: true });
                        setValue('address.stateCode', currentAddress.stateCode || response.state, { shouldValidate: true });
                    }
                } catch (error) {
                    console.error("Erro ao buscar CEP:", error);
                }
            }
        } else {
            const currentAddress = getValues('address');
            setValue('address.zipCode', zipData.zipCode);
            setValue('address.street', currentAddress.street || zipData.street, { shouldValidate: true });
            setValue('address.neighborhood', currentAddress.neighborhood || zipData.neighborhood, { shouldValidate: true });
            setValue('address.city', currentAddress.city || zipData.city, { shouldValidate: true });
            setValue('address.stateCode', currentAddress.stateCode || zipData.state, { shouldValidate: true });
        }
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
        } catch (error: any) {
            console.error("Erro ao atualizar organização:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao atualizar organização',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset(initialOrganization || emptyOrganization);
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
                header={<h4 className="m-0">Atualizar Organização</h4>}
                className="p-sidebar-sm"
            >
            <div className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados da Organização</h6>
                    <div className="field mb-2">
                        <label htmlFor="orgName" className="text-xs font-bold mb-1 block">Nome da Organização</label>
                        <Controller
                            name="organizationPerson.name"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    id="orgName" 
                                    className="p-inputtext-sm" 
                                    value={field.value} 
                                    disabled={true}
                                />
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cnpj" className="text-xs font-bold mb-1 block">CNPJ</label>
                        <Controller
                            name="organizationPerson.document.identifier"
                            control={control}
                            render={({ field }) => (
                                <InputMask
                                    id="cnpj" 
                                    className="p-inputtext-sm"
                                    mask="99.999.999/9999-99"
                                    value={field.value}
                                    placeholder="00.000.000/0000-00"
                                    disabled={true}
                                />
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
                                    render={({ field }) => (
                                        <InputText 
                                            id="respName" 
                                            className={`p-inputtext-sm flex-1 ${errors.responsiblePerson?.name ? 'p-invalid' : ''}`}
                                            value={field.value} 
                                            onChange={(e) => field.onChange(e.target.value)}
                                            placeholder="Digite o nome do responsável"
                                            autoFocus
                                        />
                                    )}
                                />
                                <Button 
                                    icon="pi pi-search" 
                                    className="p-button-sm p-button-text" 
                                    onClick={() => {
                                        setIsRespManualEntry(false);
                                        // Restaurar o responsável selecionado anteriormente ou limpar se não houver
                                        const currentResp = getValues('responsiblePerson');
                                        if (currentResp && currentResp.id) {
                                            setSelectedRespProj({
                                                personId: currentResp.id,
                                                personName: currentResp.name,
                                                documentNumber: currentResp.document.identifier,
                                                documentType: currentResp.document.type,
                                                id: '',
                                                city: getValues('address.city') || ''
                                            });
                                        } else {
                                            setSelectedRespProj(null);
                                        }
                                    }} 
                                    tooltip="Voltar"
                                    tooltipOptions={{ className: 'text-xs', position: 'top', mouseTrack: true, mouseTrackTop: 15 }}
                                />
                            </div>
                        )}
                        {errors.responsiblePerson?.name && <small className="p-error block mt-1 text-xs">{errors.responsiblePerson.name.message}</small>}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="cpf" className="text-xs font-bold mb-1 block">CPF</label>
                        <Controller
                            name="responsiblePerson.document.identifier"
                            control={control}
                            render={({ field }) => (
                                <InputMask 
                                    id="cpf" 
                                    className={`p-inputtext-sm ${errors.responsiblePerson?.document?.identifier ? 'p-invalid' : ''}`}
                                    mask="999.999.999-99"
                                    value={field.value} 
                                    placeholder="000.000.000-00"
                                    onChange={(e) => field.onChange(e.value || '')} 
                                    disabled={!isRespManualEntry && getValues('responsiblePerson.name') !== ''}
                                />
                            )}
                        />
                        {errors.responsiblePerson?.document?.identifier && <small className="p-error block mt-1 text-xs">{errors.responsiblePerson.document.identifier.message}</small>}
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="respEmail" className="text-xs font-bold mb-1 block">E-mail</label>
                        <Controller
                            name="responsibleEmail"
                            control={control}
                            render={({ field }) => (
                                <InputText 
                                    id="respEmail"
                                    keyfilter="email"
                                    className={`p-inputtext-sm ${errors.responsibleEmail ? 'p-invalid' : ''}`} 
                                    value={field.value} 
                                    onChange={(e) => field.onChange(e.target.value)} 
                                    placeholder="exemplo@email.com"
                                />
                            )}
                        />
                        {errors.responsibleEmail && <small className="p-error block mt-1 text-xs">{errors.responsibleEmail.message}</small>}
                    </div>
                </div>

                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="field col-9 p-1 mb-2">
                            <label htmlFor="street" className="text-xs font-bold mb-1 block">Rua</label>
                            <Controller
                                name="address.street"
                                control={control}
                                render={({ field }) => (
                                    <InputText 
                                        id="street" 
                                        className={`p-inputtext-sm ${errors.address?.street ? 'p-invalid' : ''}`} 
                                        value={field.value} 
                                        onChange={(e) => field.onChange(e.target.value)} 
                                        placeholder="Rua, Avenida, etc." 
                                    />
                                )}
                            />
                            {errors.address?.street && <small className="p-error block mt-1 text-xs">{errors.address.street.message}</small>}
                        </div>
                        <div className="field col-3 p-1 mb-2">
                            <label htmlFor="number" className="text-xs font-bold mb-1 block">Nº</label>
                            <Controller
                                name="address.number"
                                control={control}
                                render={({ field }) => (
                                    <InputText 
                                        id="number" 
                                        className={`p-inputtext-sm ${errors.address?.number ? 'p-invalid' : ''}`} 
                                        value={field.value} 
                                        onChange={(e) => field.onChange(e.target.value)} 
                                        placeholder="123" 
                                    />
                                )}
                            />
                            {errors.address?.number && <small className="p-error block mt-1 text-xs">{errors.address.number.message}</small>}
                        </div>
                        <div className="field col-7 p-1 mb-2">
                            <label htmlFor="neighborhood" className="text-xs font-bold mb-1 block">Bairro</label>
                            <Controller
                                name="address.neighborhood"
                                control={control}
                                render={({ field }) => (
                                    <InputText 
                                        id="neighborhood" 
                                        className={`p-inputtext-sm ${errors.address?.neighborhood ? 'p-invalid' : ''}`} 
                                        value={field.value} 
                                        onChange={(e) => field.onChange(e.target.value)} 
                                        placeholder="Bairro" 
                                    />
                                )}
                            />
                            {errors.address?.neighborhood && <small className="p-error block mt-1 text-xs">{errors.address.neighborhood.message}</small>}
                        </div>
                        <div className="field col-5 p-1 mb-2">
                            <label htmlFor="zipCode" className="text-xs font-bold mb-1 block">CEP</label>
                            <Controller
                                name="address.zipCode"
                                control={control}
                                render={({ field }) => (
                                    <InputMask 
                                        id="zipCode"
                                        mask="99999-999"
                                        className={`w-full p-inputtext-sm ${errors.address?.zipCode ? 'p-invalid' : ''}`}
                                        value={field.value} 
                                        onChange={(e) => handleZipCodeChange(e.value || '')}
                                        placeholder="00000-000"
                                    />
                                )}
                            />
                            {errors.address?.zipCode && <small className="p-error block mt-1 text-xs">{errors.address.zipCode.message}</small>}
                        </div>
                        <div className="field col-9 p-1 mb-2">
                            <label htmlFor="city" className="text-xs font-bold mb-1 block">Cidade</label>
                            <Controller
                                name="address.city"
                                control={control}
                                render={({ field }) => (
                                    <InputText 
                                        id="city" 
                                        className={`p-inputtext-sm ${errors.address?.city ? 'p-invalid' : ''}`} 
                                        value={field.value} 
                                        onChange={(e) => field.onChange(e.target.value)} 
                                        placeholder="Cidade" 
                                    />
                                )}
                            />
                            {errors.address?.city && <small className="p-error block mt-1 text-xs">{errors.address.city.message}</small>}
                        </div>
                        <div className="field col-3 p-1 mb-2">
                            <label htmlFor="stateCode" className="text-xs font-bold mb-1 block">UF</label>
                            <Controller
                                name="address.stateCode"
                                control={control}
                                render={({ field }) => (
                                    <FederalStateSelector 
                                        value={field.value} 
                                        onChange={(val) => field.onChange(val)}
                                        className={`w-full p-inputtext-sm ${errors.address?.stateCode ? 'p-invalid' : ''}`}
                                    />
                                )}
                            />
                            {errors.address?.stateCode && <small className="p-error block mt-1 text-xs">{errors.address.stateCode.message}</small>}
                        </div>
                    </div>
                </div>
            </div>
            {footer}
        </Sidebar>
        </>
    );
};

export default OrganizationUpdater;
