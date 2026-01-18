import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { OrganizationService, IOrganizationWithCityProjection } from './OrganizationService';
import DocumentDisplay, { DocumentType } from '../shared/document/DocumentDisplay';

interface OrganizationSelectorProps {
    value: any;
    onChange: (e: DropdownChangeEvent) => void;
    onAddNew: () => void;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ value, onChange, onAddNew }) => {
    const [organizations, setOrganizations] = useState<IOrganizationWithCityProjection[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsWithCity(0, 50);
            setOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações:", error);
        } finally {
            setLoading(false);
        }
    };

    // Template para os itens na lista suspensa
    const itemTemplate = (option: IOrganizationWithCityProjection) => {
        return (
            <div className="flex flex-column gap-1 py-1 ">
                <div className="flex justify-content-between align-items-center">
                    <span className="font-bold text-primary">{option.personName}</span>
                    <small className="text-500 flex align-items-center">
                        <i className="pi pi-map-marker mr-1" style={{ fontSize: '0.7rem' }}></i>
                        {option.city}
                    </small>
                </div>
                <div className="text-sm">
                    <DocumentDisplay 
                        type={option.documentType as DocumentType} 
                        value={option.documentNumber} 
                    />
                </div>
            </div>
        );
    };

    // Template para o item selecionado no campo (quando fechado)
    const valueTemplate = (option: IOrganizationWithCityProjection, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center gap-2">
                    <span className="font-bold">{option.personName}</span>
                    <span className="text-600">|</span>
                    <DocumentDisplay 
                        type={option.documentType as DocumentType} 
                        value={option.documentNumber} 
                    />
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    // Rodapé para permitir inserir nova organização
    const panelFooterTemplate = () => {
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
            optionLabel="personName"
            placeholder="Selecione uma Organização"
            filter
            filterBy="personName,documentNumber"
            showClear
            loading={loading}
            itemTemplate={itemTemplate}
            valueTemplate={valueTemplate}
            panelFooterTemplate={panelFooterTemplate}
            className="w-full md:w-30rem"
            panelStyle={{ minWidth: '25rem' }}
        />
    );
};

export default OrganizationSelector;
