import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { ZipCodeService, IZipCodeResponse } from './ZipCodeService';

interface ZipCodeSelectorProps {
    value: string;
    onChange: (zipCodeData: IZipCodeResponse) => void;
    placeholder?: string;
    className?: string;
}

const ZipCodeSelector: React.FC<ZipCodeSelectorProps> = ({ 
    value, 
    onChange, 
    placeholder = "Selecione um CEP",
    className
}) => {
    const [zipCodes, setZipCodes] = useState<IZipCodeResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadZipCodes();
    }, []);

    const loadZipCodes = async () => {
        setLoading(true);
        try {
            const data = await ZipCodeService.getAllZipCodes();
            setZipCodes(data);
        } catch (error) {
            console.error("Erro ao carregar CEPs:", error);
        } finally {
            setLoading(false);
        }
    };

    const onDropdownChange = (e: DropdownChangeEvent) => {
        const selectedZip = zipCodes.find(z => z.zipCode === e.value);
        if (selectedZip) {
            onChange(selectedZip);
        }
    };

    const itemTemplate = (option: IZipCodeResponse) => {
        return (
            <div className="flex flex-column gap-1 text-sm py-1">
                <div className="flex justify-content-between">
                    <span className="font-bold text-primary">{option.zipCode}</span>
                    <span className="text-600">{option.city} - {option.stateCode}</span>
                </div>
                <div className="text-500 text-xs">
                    {option.street}, {option.neighborhood}
                </div>
            </div>
        );
    };

    const valueTemplate = (option: IZipCodeResponse, props: any) => {
        if (option) {
            return (
                <div className="flex align-items-center gap-2">
                    <span className="font-bold">{option.zipCode}</span>
                    <span className="text-400">|</span>
                    <span className="text-600">{option.city}</span>
                </div>
            );
        }
        return <span>{props.placeholder}</span>;
    };

    return (
        <Dropdown
            value={value}
            options={zipCodes}
            onChange={onDropdownChange}
            optionLabel="zipCode"
            optionValue="zipCode"
            placeholder={placeholder}
            filter
            filterBy="zipCode,city,street"
            showClear
            loading={loading}
            itemTemplate={itemTemplate}
            valueTemplate={valueTemplate}
            className={`w-full ${className}`}
            scrollHeight="250px"
            filterPlaceholder="Buscar CEP, cidade ou rua..."
        />
    );
};

export default ZipCodeSelector;
