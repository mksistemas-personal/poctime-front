import React, { useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import DocumentDisplay from '../shared/document/DocumentDisplay';

interface IOrganization {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  status: string;
}

const cnpjBodyTemplate = (rowData: IOrganization) => {
  return <DocumentDisplay type="CNPJ" value={rowData.cnpj} />;
};

const OrganizationList: React.FC = () => {
  const [organizations] = useState<IOrganization[]>([
    { id: 1, nome: 'Organização Matriz', cnpj: '98540983000153', cidade: 'São Paulo', status: 'Ativo' },
    { id: 2, nome: 'Filial Nordeste', cnpj: '23602376000171', cidade: 'Recife', status: 'Ativo' },
    { id: 3, nome: 'Filial Sul', cnpj: '87588841000140', cidade: 'Porto Alegre', status: 'Inativo' },
  ]);

  // Função para estilizar a célula de status (equivalente ao cellStyle do AG Grid)
  const statusBodyTemplate = (rowData: IOrganization) => {
    const isAtivo = rowData.status === 'Ativo';
    return (
      <span style={{ color: isAtivo ? 'green' : 'red', fontWeight: 'bold' }}>
        {rowData.status}
      </span>
    );
  };

  return (
    <div style={{ padding: '10px' }}>
      <h2>Gestão de Organizações</h2>
      
      <div className="card" style={{ marginTop: '10px' }}>
        <DataTable 
          value={organizations}
          rows={10}
          paginator={true}
          tableStyle={{ minWidth: '50rem' }}
          stripedRows
          paginatorLeft={true}
          rowsPerPageOptions={[5, 10, 25, 50]}
          selectionMode="single"
        >
          <Column field="id" header="ID" hidden={true}></Column>
          <Column field="nome"
                  header="Nome da Organização"
                  sortable filter style={{ textAlign: 'left', minWidth: '200px' }}></Column>
          <Column field="cnpj"
                  header="Identificador"
                  style={{ width: '30%', textAlign: 'left', minWidth: '150px' }}
                  body={cnpjBodyTemplate}></Column>
          <Column field="cidade" header="Cidade"
                  style={{ width: '30%', minWidth: '120px', textAlign: 'left' }}></Column>
          <Column header="Status" body={statusBodyTemplate}
                  style={{ width: '5%', minWidth: '100px', textAlign: 'left' }}></Column>
        </DataTable>
      </div>
    </div>
  );
};

export default OrganizationList;
