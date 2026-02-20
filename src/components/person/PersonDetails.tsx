import React from 'react';
import {Sidebar} from 'primereact/sidebar';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import {IPerson} from "./PersonStructures";


interface PersonDetailsProps {
    visible: boolean;
    person: IPerson | null;
    onHide: () => void;
}

const PersonDetails: React.FC<PersonDetailsProps> = ({ visible, person, onHide }) => {
    if (!person) return null;

    const documentBodyTemplate = (rowData: IPerson) => {
        const type = rowData.document.type.toUpperCase() as any;
        return <DocumentDisplay type={type} value={rowData.document.identifier} />;
    };
    
    return (
        <Sidebar 
            visible={visible} 
            onHide={onHide} 
            position="right" 
            style={{ width: '30rem' }}
            header={<h4 className="m-0">Detalhes da Pessoa</h4>}
            className="p-sidebar-sm"
        >
            <div className="grid mt-2">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Dados da Pessoa</h6>
                    <p className="mb-1 text-sm"><strong>Nome:</strong> {person.name}</p>
                    <p className="text-sm"><strong>Doc:</strong> {documentBodyTemplate(person)}</p>
                </div>
            </div>
        </Sidebar>
    );
};

export default PersonDetails;
