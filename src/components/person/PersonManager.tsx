import React, {useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {InputMask} from "primereact/inputmask";
import {SelectButton} from "primereact/selectbutton";
import {IPerson, PersonFormData, personSchema} from "./PersonStructures";
import {PersonService} from "./PersonService";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {classNames} from "primereact/utils";

interface PersonManagerProps {
    visible: boolean;
    onHide: () => void;
    onSave?: (person: IPerson) => void;
}

const PersonManager: React.FC<PersonManagerProps> = ({ visible, onHide, onSave }) => {
    const emptyPerson: PersonFormData = {
        name: '',
        document: { type: 'cnpj', identifier: '', country: 'BR', complement: '' },
    };

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm<PersonFormData>({
        resolver: zodResolver(personSchema),
        defaultValues: emptyPerson
    });

    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const documentType = watch('document.type');

    const handleSave = async (data: PersonFormData) => {
        try {
            setLoading(true);
            const savedPerson = await PersonService.savePerson(data as IPerson);
            if (onSave) {
                onSave(savedPerson);
            }
            onHide(); // Fecha a barra lateral após sucesso
            reset(emptyPerson); // Reseta o formulário
        } catch (error: any) {
            console.error("Erro ao salvar pessoa:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao salvar pessoa',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        reset(emptyPerson);
        onHide();
    };

    const footer = (
        <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancelar" icon="pi pi-times" outlined onClick={handleCancel} rounded size="small" className="p-button-secondary" />
            <Button label="Salvar" icon="pi pi-check" onClick={() => handleSubmit(handleSave)()} loading={loading} rounded size="small"/>
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Sidebar 
                visible={visible} 
                onHide={onHide} 
                position="right" 
                style={{ width: '30rem' }}
                header={<h4 className="m-0">Cadastrar Pessoa</h4>}
                className="p-sidebar-sm"
            >
            <div className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2">Dados da Pessoa</h6>
                    <div className="field mb-2">
                        <label htmlFor="name" className="text-xs font-bold mb-1 block">Nome da Pessoa</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputText 
                                        {...field}
                                        id="name" 
                                        className={classNames('p-inputtext-sm', { 'p-invalid': fieldState.error })}
                                        placeholder="Digite o nome"
                                        autoFocus
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label className="text-xs font-bold mb-1 block">Tipo de Documento</label>
                        <Controller
                            name="document.type"
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
                                            setValue('document.identifier', ''); // Reseta o valor ao mudar o tipo
                                        }
                                    }}
                                    pt={{
                                        button: {
                                            className: 'py-1 text-xs px-2'
                                        }
                                    }}
                                />
                            )}
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="document.identifier" className="text-xs font-bold mb-1 block">
                            {documentType === 'cnpj' ? 'CNPJ' : 'CPF'}
                        </label>
                        <Controller
                            name="document.identifier"
                            control={control}
                            render={({ field, fieldState }) => (
                                <>
                                    <InputMask
                                        {...field}
                                        id="document.identifier" 
                                        className={classNames('p-inputtext-sm', { 'p-invalid': fieldState.error })}
                                        mask={documentType === 'cnpj' ? "99.999.999/9999-99" : "999.999.999-99"}
                                        placeholder={documentType === 'cnpj' ? "00.000.000/0000-00" : "000.000.000-00"}
                                    />
                                    {fieldState.error && <small className="p-error">{fieldState.error.message}</small>}
                                </>
                            )}
                        />
                    </div>
                </div>
            </div>
            {footer}
            </Sidebar>
        </>
    );
};

export default PersonManager;
