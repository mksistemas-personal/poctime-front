import React, {useEffect, useState} from 'react';
import {Sidebar} from 'primereact/sidebar';
import {IEconomicGroup} from './EconomicGroupStructures';
import {IOrganizationView} from "../organizations/OrganizationStructures";
import {OrganizationService} from "../organizations/OrganizationService";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import DocumentDisplay from "../shared/document/DocumentDisplay";

interface EconomicGroupDetailsProps {
    visible: boolean;
    economicGroup: IEconomicGroup | null;
    onHide: () => void;
}

const EconomicGroupDetails: React.FC<EconomicGroupDetailsProps> = ({ visible, economicGroup, onHide }) => {
    const [organizations, setOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (visible && economicGroup && economicGroup.organizationIds && economicGroup.organizationIds.length > 0) {
            loadOrganizations();
        } else {
            setOrganizations([]);
        }
    }, [visible, economicGroup]);

    const loadOrganizations = async () => {
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList(economicGroup!.organizationIds);
            setOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações do grupo econômico", error);
        } finally {
            setLoading(false);
        }
    };

    if (!economicGroup) return null;

    const cnpjBodyTemplate = (rowData: IOrganizationView) => {
        return <DocumentDisplay type="CNPJ" value={rowData.document.identifier} />;
    };


    return (
        <Sidebar 
            visible={visible} 
            onHide={onHide} 
            position="right" 
            style={{ width: '40rem' }}
            header={<h4 className="m-0">Detalhes do Grupo Econômico</h4>}
            className="p-sidebar-sm"
        >
            <div className="grid mt-2">
                <div className="col-12 py-0">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Dados do Grupo Econômico</h6>
                    <p className="mb-1 text-sm"><strong>Nome:</strong> {economicGroup.name}</p>
                    <p className="text-sm mb-4"><strong>Descrição:</strong> {economicGroup.description} </p>
                </div>

                <div className="col-12">
                    <h6 className="mb-2 text-primary border-bottom-1 surface-border pb-1 uppercase text-xs">Organizações Vinculadas</h6>
                    <DataTable 
                        value={organizations} 
                        loading={loading} 
                        className="p-datatable-sm"
                        emptyMessage="Nenhuma organização vinculada encontrada."
                        rows={5}
                        selectionMode="single"
                        scrollable
                        scrollHeight="flex"
                        stripedRows>
                        <Column field="name" header="Nome" sortable></Column>
                        <Column header="Documento" body={cnpjBodyTemplate}
                        ></Column>
                    </DataTable>
                </div>
            </div>
        </Sidebar>
    );
};

export default EconomicGroupDetails;
