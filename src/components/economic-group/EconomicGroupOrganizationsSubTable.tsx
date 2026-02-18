import React, {useEffect, useState} from "react";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {IEconomicGroup} from "./EconomicGroupStructures";
import {IOrganizationView} from "../organizations/OrganizationStructures";
import {OrganizationService} from "../organizations/OrganizationService";
import DocumentDisplay from "../shared/document/DocumentDisplay";

interface EconomicGroupOrganizationsSubTableProps {
    economicGroup: IEconomicGroup;
}

const EconomicGroupOrganizationsSubTable: React.FC<EconomicGroupOrganizationsSubTableProps> = ({ economicGroup }) => {
    const [organizations, setOrganizations] = useState<IOrganizationView[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (economicGroup && economicGroup.organizationIds && economicGroup.organizationIds.length > 0) {
            loadOrganizations();
        } else {
            setOrganizations([]);
        }
    }, [economicGroup]);

    const loadOrganizations = async () => {
        setLoading(true);
        try {
            const response = await OrganizationService.getOrganizationsFromList(economicGroup.organizationIds);
            setOrganizations(response.content);
        } catch (error) {
            console.error("Erro ao carregar organizações do grupo econômico", error);
        } finally {
            setLoading(false);
        }
    };

    const cnpjBodyTemplate = (rowData: IOrganizationView) => {
        return <div className="text-sm"><DocumentDisplay type="CNPJ" value={rowData.document.identifier} /></div>;
    };

    return (
        <div className="surface-card p-2 border-round shadow-1">
            <div className="flex align-items-center mb-2 px-1">
                <i className="pi pi-building mr-2 text-primary" style={{ fontSize: '0.8rem' }}></i>
                <span className="text-primary font-bold uppercase text-xs">Organizações</span>
            </div>
            <DataTable
                value={organizations}
                loading={loading}
                className="p-datatable-sm h-full flex-1 text-sm"
                emptyMessage="Nenhuma organização vinculada encontrada."
                stripedRows
                responsiveLayout="scroll"
            >
                <Column field="name" header="Nome" sortable className="text-sm"></Column>
                <Column header="Documento" body={cnpjBodyTemplate} className="text-sm"></Column>
            </DataTable>
        </div>
    );
};

export default EconomicGroupOrganizationsSubTable;
