import React from 'react';
import {Accordion, AccordionTab} from 'primereact/accordion';
import {Button} from 'primereact/button';

interface FilterListProps {
    onClear: () => void;
    onSearch: () => void;
    children: React.ReactNode;
    title?: string;
    className?: string;
}

const FilterList: React.FC<FilterListProps> = ({ 
    onClear, 
    onSearch, 
    children, 
    title = "Filtros de Pesquisa",
    className = "mb-4"
}) => {
    
    const header = (
        <span className="flex align-items-center gap-2 text-xs">
            <i className="pi pi-filter" style={{ fontSize: '0.75rem' }}></i>
            {title}
        </span>
    );

    return (
        <Accordion className={className}>
            <AccordionTab header={header}>
                <div className="p-fluid grid row-gap-3">
                    {children}
                    <div className="sm:col-6 flex justify-content-end gap-2 mt-0 align-items-end" style={{ width: 'auto', marginLeft: 'auto' }}>
                        <div className="flex gap-2">
                            <Button 
                                label="Limpar" 
                                icon="pi pi-filter-slash" 
                                outlined 
                                onClick={onClear} 
                                severity="secondary" 
                                size="small" 
                                rounded 
                                style={{ width: 'auto' }} 
                            />
                            <Button 
                                label="Pesquisar" 
                                icon="pi pi-search" 
                                onClick={onSearch}  
                                size="small" 
                                rounded 
                                style={{ width: 'auto' }} 
                            />
                        </div>
                    </div>
                </div>
            </AccordionTab>
        </Accordion>
    );
};

export default FilterList;
