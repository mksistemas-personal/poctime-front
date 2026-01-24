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
            const response = await OrganizationService.getOrganizationsWithCity(0, 9999, 'cnpj');
            setOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações:", error);
        } finally {
            setLoading(false);
        }
    };

    // Template para os itens na lista suspensa
    const itemTemplate = (option: IOrganizationWithCityProjection) => {
        const isOrganization = !!option.id;
        const hasCity = !!option.city;
        return (
            <div className="flex align-items-center gap-2 py-1 text-sm">
                <i className={isOrganization ? "pi pi-building text-primary" : "pi pi-user text-600"} 
                   title={isOrganization ? "Organização" : "Pessoa Jurídica"}
                   style={{ fontSize: '1rem' }}></i>
                
                <span className="font-bold text-primary">{option.personName}</span>
                
                <span className="text-400">|</span>

                <DocumentDisplay
                    type={option.documentType as DocumentType}
                    value={option.documentNumber}
                />

                {hasCity && (
                    <>
                        <span className="text-400">|</span>
                        <span className="text-600 flex align-items-center">
                            <i className="pi pi-map-marker mr-1" style={{ fontSize: '0.7rem' }}></i>
                            {option.city}
                        </span>
                    </>
                )}
            </div>
        );
    };

    // Template para o item selecionado no campo (quando fechado)
    const valueTemplate = (option: IOrganizationWithCityProjection, props: any) => {
        if (option) {
            const isOrganization = !!option.id;
            const hasCity = !!option.city;
            return (
                <div className="flex align-items-center gap-2 text-sm">
                    <i className={isOrganization ? "pi pi-building text-primary" : "pi pi-user text-600"} 
                       style={{ fontSize: '0.9rem' }}></i>
                    <span className="font-bold">{option.personName}</span>

                    <span className="text-400">|</span>
                    <DocumentDisplay
                        type={option.documentType as DocumentType}
                        value={option.documentNumber}
                    />

                    {hasCity && (
                        <>
                            <span className="text-400">|</span>
                            <span className="text-600 flex align-items-center">
                                <i className="pi pi-map-marker mr-1" style={{ fontSize: '0.7rem' }}></i>
                                {option.city}
                            </span>
                        </>
                    )}
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
            dataKey="personId"
            placeholder="Selecione uma Organização"
            filter
            filterBy="personName,documentNumber"
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

export default OrganizationSelector;
