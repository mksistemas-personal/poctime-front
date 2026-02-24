import React from 'react';
import {Button} from 'primereact/button';

interface ActionRowListProps<T> {
    rowData: T;
    onView?: (data: T) => void;
    onEdit?: (data: T) => void;
    onDelete?: (data: T) => void;
    viewTooltip?: string;
    editTooltip?: string;
    deleteTooltip?: string;
    className?: string;
}

const ActionRowList = <T,>({
    rowData,
    onView,
    onEdit,
    onDelete,
    viewTooltip = 'Ver detalhes',
    editTooltip = 'Editar',
    deleteTooltip = 'Excluir',
    className = 'flex gap-1'
}: ActionRowListProps<T>) => {
    return (
        <div className={className}>
            {onView && (
                <Button
                    icon="pi pi-search"
                    rounded
                    text
                    severity="info"
                    onClick={() => onView(rowData)}
                    tooltip={viewTooltip}
                    size="small"
                    className="p-1"
                />
            )}
            {onEdit && (
                <Button
                    icon="pi pi-pencil"
                    rounded
                    text
                    severity="warning"
                    onClick={() => onEdit(rowData)}
                    tooltip={editTooltip}
                    size="small"
                    className="p-1"
                />
            )}
            {onDelete && (
                <Button
                    icon="pi pi-trash"
                    rounded
                    text
                    severity="danger"
                    onClick={() => onDelete(rowData)}
                    tooltip={deleteTooltip}
                    size="small"
                    className="p-1"
                />
            )}
        </div>
    );
};

export default ActionRowList;
