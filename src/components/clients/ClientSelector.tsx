import React, {useCallback, useEffect, useState} from 'react';
import {Dropdown, DropdownChangeEvent} from 'primereact/dropdown';
import {Button} from 'primereact/button';
import DocumentDisplay, {DocumentType} from '../shared/document/DocumentDisplay';
import {IClientWithCityProjection} from "./ClientStructures";
import {ClientService} from "./ClientService";

interface ClientSelectorProps {
    value: any;
    onChange: (e: DropdownChangeEvent) => void;
    onAddNew?: () => void;
    documentType?: 'cnpj' | 'cpf';
    placeholder?: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
    value, 
    onChange, 
    onAddNew,
    placeholder = "Selecione um Cliente"
}) => {
    const [clients, setClients] = useState<IClientWithCityProjection[]>([]);
    const [loading, setLoading] = useState(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const loadData= useCallback(async () => {
        setLoading(true);
        try {
            const response = await ClientService.getClientWithCity(0, 9999);
            setClients(response.content);
        } catch (error) {
            console.error("Erro ao carregar clientes:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    // Template para os itens na lista suspensa
    const itemTemplate = (option: IClientWithCityProjection) => {
        const isClient = !!option.id;
        const hasCity = !!option.city;
        return (
            <div className="flex align-items-center gap-2 py-1 text-sm">
                <i className={isClient ? "pi pi-id-card text-primary" : "pi pi-user text-600"}
                   title={isClient ? "Cliente" : "Pessoa Jurídica"}
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
    const valueTemplate = (option: IClientWithCityProjection, props: any) => {
        if (option) {
            const isClient = !!option.id;
            const hasCity = !!option.city;
            return (
                <div className="flex align-items-center gap-2 text-sm">
                    <i className={isClient ? "pi pi-building text-primary" : "pi pi-user text-600"}
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
            options={clients}
            onChange={onChange}
            optionLabel="personName"
            dataKey="personId"
            placeholder={placeholder}
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

export default ClientSelector;
