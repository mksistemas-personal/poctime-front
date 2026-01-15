import React from 'react';
import { Dialog } from 'primereact/dialog';
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
        <Dialog 
            header={`Detalhes: ${organization.organizationPerson.name}`} 
            visible={visible} 
            style={{ width: '50vw' }} 
            onHide={onHide}
            breakpoints={{ '960px': '75vw', '641px': '100vw' }}
        >
            <div className="grid">
                <div className="col-12 md:col-6">
                    <h5>Dados da Organização</h5>
                    <p><strong>Nome:</strong> {organization.organizationPerson.name}</p>
                    <p><strong>CNPJ:</strong> <DocumentDisplay type="CNPJ" value={organization.organizationPerson.document.identifier} /></p>
                </div>
                
                <div className="col-12 md:col-6">
                    <h5>Responsável</h5>
                    <p><strong>Nome:</strong> {organization.responsiblePerson.name}</p>
                    <p><strong>E-mail:</strong> {organization.responsibleEmail}</p>
                    <p><strong>CPF:</strong> <DocumentDisplay type="CPF" value={organization.responsiblePerson.document.identifier} /></p>
                </div>

                <Divider />

                <div className="col-12">
                    <h5>Endereço</h5>
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <p><strong>Rua:</strong> {organization.address.street}, {organization.address.number}</p>
                            <p><strong>Bairro:</strong> {organization.address.neighborhood}</p>
                            <p><strong>Complemento:</strong> {organization.address.complement || 'N/A'}</p>
                        </div>
                        <div className="col-12 md:col-6">
                            <p><strong>Cidade:</strong> {organization.address.city} - {organization.address.stateCode}</p>
                            <p><strong>CEP:</strong> {organization.address.zipCode}</p>
                            <p><strong>País:</strong> {organization.address.country}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

export default OrganizationDetails;
