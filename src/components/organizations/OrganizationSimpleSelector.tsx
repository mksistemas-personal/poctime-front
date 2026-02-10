import React, {useCallback, useEffect, useState} from 'react';
import {Dropdown, DropdownChangeEvent} from 'primereact/dropdown';
import {Button} from 'primereact/button';
import {OrganizationService} from './OrganizationService';
import {IOrganizationView} from './OrganizationStructures';
import DocumentDisplay, {DocumentType} from '../shared/document/DocumentDisplay';

interface OrganizationSelectorProps {
    value: any;
    onChange: (e: DropdownChangeEvent) => void;
    onAddNew?: () => void;
    placeholder?: string;
}

const OrganizationSimpleSelector: React.FC<OrganizationSelectorProps> = ({
    value, 
    onChange, 
    onAddNew,
    placeholder = "Selecione uma Organização"
}) => {
    const [organizations, setOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData= useCallback(async () => {
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList();
            setOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Template para os itens na lista suspensa
    const itemTemplate = (option: IOrganizationView) => {
        return (
            <div className="flex align-items-center gap-2 py-1 text-sm">
                <i className="pi pi-building text-primary"
                   title="Organização"
                   style={{ fontSize: '1rem' }}></i>
                
                <span className="font-bold text-primary">{option.name}</span>
                
                <span className="text-400">|</span>

                <DocumentDisplay
                    type={option.document.type as DocumentType}
                    value={option.document.identifier}
                />
            </div>
        );
    };

    // Template para o item selecionado no campo (quando fechado)
    const valueTemplate = (option: IOrganizationView, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center gap-2 text-sm">
                    <i className="pi pi-building text-primary"
                       style={{ fontSize: '0.9rem' }}></i>
                    <span className="font-bold">{option.name}</span>

                    <span className="text-400">|</span>
                    <DocumentDisplay
                        type={option.document.type as DocumentType}
                        value={option.document.identifier}
                    />
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    // Rodapé para permitir inserir nova organização
    const panelFooterTemplate = () => {
        if (!onAddNew) return null;

        return (
            <div className="p-2 border-top-1 surface-border">
                <Button 
                    label="Não encontrou? Cadastrar Nova" 
                    icon="pi pi-plus" 
                    className="p-button-text p-button-sm w-full justify-content-start" 
                    onClick={onAddNew}
                />
            </div>
        );
    };

    return (
        <Dropdown
            value={value}
            options={organizations}
            onChange={onChange}
            optionLabel="name"
            dataKey="id"
            placeholder={placeholder}
            filter
            filterBy="name, document.identifier"
            showClear
            loading={loading}
            itemTemplate={itemTemplate}
            valueTemplate={valueTemplate}
            panelFooterTemplate={panelFooterTemplate}
            className="w-full p-inputtext-sm"
            panelStyle={{ minWidth: '25rem' }}
            scrollHeight="300px"
            filterPlaceholder="Buscar..."
        />
    );
};

export default OrganizationSimpleSelector;
