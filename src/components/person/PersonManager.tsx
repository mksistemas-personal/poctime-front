import React, {useRef, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {InputText} from 'primereact/inputtext';
import {Button} from 'primereact/button';
import {Toast} from 'primereact/toast';
import {InputMask} from "primereact/inputmask";
import {SelectButton} from "primereact/selectbutton";
import {IPerson} from "./PersonStructures";
import {PersonService} from "./PersonService";

interface PersonManagerProps {
    visible: boolean;
    onHide: () => void;
    onSave?: (person: IPerson) => void;
}

const PersonManager: React.FC<PersonManagerProps> = ({ visible, onHide, onSave }) => {
    const emptyPerson: IPerson = {
        id: '',
        name: '',
        document: { type: 'cnpj', identifier: '', country: 'BR', complement: '' },
    };

    const [person, setPerson] = useState<IPerson>(emptyPerson);
    const toast = useRef<Toast>(null);

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>, path: string) => {
        const val = e.target.value;
        const keys = path.split('.');
        
        setPerson(prev => {
            const newState = { ...prev };
            let current: any = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = val;
            return { ...newState };
        });
    };
    

    const handleSave = async () => {
        if (!person.name || !person.document.identifier) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Atenção',
                detail: 'Por favor, preencha o nome e o documento.',
                life: 3000
            });
            return;
        }

        try {
            const dataToSave = { ...person };
            const savedPerson = await PersonService.savePerson(dataToSave);
            if (onSave) {
                onSave(savedPerson);
            }
            onHide(); // Fecha a barra lateral após sucesso
            setPerson(emptyPerson); // Reseta o formulário
        } catch (error: any) {
            console.error("Erro ao salvar pessoa:", error);
            toast.current?.show({
                severity: 'error',
                summary: 'Erro',
                detail: error.message || 'Erro ao salvar pessoa',
                life: 3000
            });
        }
    };

    const handleCancel = () => {
        setPerson(emptyPerson);
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
                style={{ width: '30rem' }}
                header={<h4 className="m-0">Cadastrar Pessoa</h4>}
                className="p-sidebar-sm"
            >
            <div className="p-fluid grid mt-2 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1">Dados da Pessoa</h6>
                    <div className="field mb-2">
                        <label htmlFor="name" className="text-xs font-bold mb-1 block">Nome da Pessoa</label>
                        <InputText 
                            id="name" 
                            className="p-inputtext-sm" 
                            value={person.name}
                            onChange={(e) => onInputChange(e, 'name')}
                            placeholder="Digite o nome"
                            autoFocus
                        />
                    </div>
                    <div className="field mb-1">
                        <label className="text-xs font-bold mb-1 block">Tipo de Documento</label>
                        <SelectButton 
                            value={person.document.type} 
                            options={[
                                {label: 'CNPJ', value: 'cnpj'},
                                {label: 'CPF', value: 'cpf'}
                            ]} 
                            onChange={(e) => {
                                if (e.value) {
                                    setPerson(prev => ({
                                        ...prev,
                                        document: {
                                            ...prev.document,
                                            type: e.value,
                                            identifier: '' // Reseta o valor ao mudar o tipo
                                        }
                                    }));
                                }
                            }}
                            className="p-buttonset-sm small"
                        />
                    </div>
                    <div className="field mb-2">
                        <label htmlFor="identifier" className="text-xs font-bold mb-1 block">
                            {person.document.type === 'cnpj' ? 'CNPJ' : 'CPF'}
                        </label>
                        <InputMask
                            id="identifier" 
                            className="p-inputtext-sm"
                            mask={person.document.type === 'cnpj' ? "99.999.999/9999-99" : "999.999.999-99"}
                            value={person.document.identifier}
                            placeholder={person.document.type === 'cnpj' ? "00.000.000/0000-00" : "000.000.000-00"}
                            onChange={(e) => onInputChange(e as any, 'document.identifier')}
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
