import React from 'react';
import {Sidebar} from 'primereact/sidebar';
import DocumentDisplay from "../shared/document/DocumentDisplay";
import {IClient} from "./ClientStructures";

interface ClientDetailsProps {
    visible: boolean;
    client: IClient | null;
    onHide: () => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ visible, client, onHide }) => {
    if (!client) return null;

    const documentBodyTemplate = (rowData: IClient) => {
        const type = rowData.clientPerson.document.type.toUpperCase() as any;
        return <DocumentDisplay type={type} value={rowData.clientPerson.document.identifier} />;
    };
    
    return (
        <Sidebar 
            visible={visible} 
            onHide={onHide} 
            position="right" 
            style={{ width: '35rem' }}
            header={<h4 className="m-0">Detalhes do Cliente</h4>}
            className="p-sidebar-sm"
        >
            <div className="p-fluid grid mt-1 w-full">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2 uppercase text-xs">Dados do Cliente</h6>
                    <p className="mb-1 text-sm"><strong>Nome:</strong> {client.clientPerson.name}</p>
                    <p className="text-sm"><strong>Doc:</strong> {documentBodyTemplate(client)}</p>
                    <p className="mb-1 text-sm"><strong>E-mail:</strong> {client.clientEmail}</p>
                </div>

                <div className="col-12 py-0 mt-3">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-2 uppercase text-xs">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Rua:</strong> {client.address.street}, {client.address.number}</p>
                        </div>
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Bairro:</strong> {client.address.neighborhood}</p>
                        </div>
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Cidade:</strong> {client.address.city} - {client.address.stateCode}</p>
                        </div>
                        <div className="col-6 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>CEP:</strong> {client.address.zipCode}</p>
                        </div>
                        <div className="col-6 p-0 mb-1 text-sm text-right">
                            <p className="m-0"><strong>País:</strong> {client.address.country}</p>
                        </div>
                        {client.address.complement && (
                            <div className="col-12 p-0 text-sm italic text-600 mt-1">
                                <strong>Comp:</strong> {client.address.complement}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default ClientDetails;
