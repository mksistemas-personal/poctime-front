import React from 'react';
import { Sidebar } from 'primereact/sidebar';
import { IOrganization } from './OrganizationService';
import { Divider } from 'primereact/divider';
import DocumentDisplay from "../shared/document/DocumentDisplay";

interface OrganizationDetailsProps {
    visible: boolean;
    organization: IOrganization | null;
    onHide: () => void;
}

const OrganizationDetails: React.FC<OrganizationDetailsProps> = ({ visible, organization, onHide }) => {
    if (!organization) return null;

    return (
        <Sidebar 
            visible={visible} 
            onHide={onHide} 
            position="right" 
            style={{ width: '30rem' }}
            header={<h4 className="m-0">Detalhes da Organização</h4>}
            className="p-sidebar-sm"
        >
            <div className="grid mt-2">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Dados da Organização</h6>
                    <p className="mb-1 text-sm"><strong>Nome:</strong> {organization.organizationPerson.name}</p>
                    <p className="text-sm"><strong>CNPJ:</strong> <DocumentDisplay type="CNPJ" value={organization.organizationPerson.document.identifier} /></p>
                </div>
            
                <div className="col-12 py-0 mt-3">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Responsável</h6>
                    <p className="mb-1 text-sm"><strong>Nome:</strong> {organization.responsiblePerson.name}</p>
                    <p className="mb-1 text-sm"><strong>E-mail:</strong> {organization.responsibleEmail}</p>
                    <p className="text-sm"><strong>CPF:</strong> <DocumentDisplay type="CPF" value={organization.responsiblePerson.document.identifier} /></p>
                </div>

                <div className="col-12 py-0 mt-3">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Endereço</h6>
                    <div className="grid p-0 m-0">
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Rua:</strong> {organization.address.street}, {organization.address.number}</p>
                        </div>
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Bairro:</strong> {organization.address.neighborhood}</p>
                        </div>
                        <div className="col-12 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>Cidade:</strong> {organization.address.city} - {organization.address.stateCode}</p>
                        </div>
                        <div className="col-6 p-0 mb-1 text-sm">
                            <p className="m-0"><strong>CEP:</strong> {organization.address.zipCode}</p>
                        </div>
                        <div className="col-6 p-0 mb-1 text-sm text-right">
                            <p className="m-0"><strong>País:</strong> {organization.address.country}</p>
                        </div>
                        {organization.address.complement && (
                            <div className="col-12 p-0 text-sm italic text-600 mt-1">
                                <strong>Comp:</strong> {organization.address.complement}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Sidebar>
    );
};

export default OrganizationDetails;
