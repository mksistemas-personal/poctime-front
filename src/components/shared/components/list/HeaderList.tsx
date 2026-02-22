import React from 'react';
import { Button } from 'primereact/button';

interface HeaderListProps {
    title: string;
    buttonLabel: string;
    onButtonClick: () => void;
    options?: any;
}

const HeaderList: React.FC<HeaderListProps> = ({ title, buttonLabel, onButtonClick, options }) => {
    return (
        <div className={options?.className} style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center', width: '100%', padding: '0.5rem 1rem' }}>
            <span className="text-lg font-bold">{title}</span>
            <Button
                label={buttonLabel}
                icon="pi pi-plus"
                rounded
                onClick={onButtonClick}
                size="small"
            />
        </div>
    );
};

export default HeaderList;