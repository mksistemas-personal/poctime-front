import React from 'react';

// Tipos suportados
export type DocumentType = 'CPF' | 'CNPJ';

interface DocumentDisplayProps {
  type: DocumentType;
  value: string;
}

const DocumentDisplay: React.FC<DocumentDisplayProps> = ({ type, value }) => {
  // Remove caracteres não numéricos para garantir a formatação limpa
  const cleanValue = value.replace(/\D/g, '');

  const formatCPF = (val: string) => {
    return val
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
  };

  const formatCNPJ = (val: string) => {
    return val
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
  };

  const formattedValue = type === 'CPF' ? formatCPF(cleanValue) : formatCNPJ(cleanValue);

  return (
    <span>
      <span style={{ fontSize: '0.60rem', fontWeight: 'bold', marginRight: '4px', color: '#650' }}>
        {type}:
      </span>
      {formattedValue}
    </span>
  );
};

export default DocumentDisplay;
