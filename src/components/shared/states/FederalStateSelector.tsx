import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { FederalStateService, IFederalStateResponse } from './FederalStateService';

interface FederalStateSelectorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const FederalStateSelector: React.FC<FederalStateSelectorProps> = ({
    value,
    onChange,
    placeholder = "UF",
    className
}) => {
    const [states, setStates] = useState<IFederalStateResponse[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadStates();
    }, []);

    const loadStates = async () => {
        setLoading(true);
        try {
            const data = await FederalStateService.getAllFederalStates();
            setStates(data);
        } catch (error) {
            console.error("Erro ao carregar estados:", error);
        } finally {
            setLoading(false);
        }
    };

    const onDropdownChange = (e: DropdownChangeEvent) => {
        onChange(e.value);
    };

    return (
        <Dropdown
            value={value}
            options={states}
            onChange={onDropdownChange}
            optionLabel="stateCode"
            optionValue="stateCode"
            placeholder={placeholder}
            loading={loading}
            filter
            editable
            className={className}
            panelStyle={{ minWidth: '15rem' }}
            itemTemplate={(option: IFederalStateResponse) => (
                <div className="flex justify-content-between">
                    <span>{option.stateName}</span>
                </div>
            )}
        />
    );
};

export default FederalStateSelector;
