import React from 'react';
import {Button} from 'primereact/button';

interface FooterListProps {
    isLastPage: boolean
    buttonLabel: string;
    onButtonClick: () => void;
    onLoading: boolean;
    moreDataLabel?: string;
}

const FooterList: React.FC<FooterListProps> = ({ isLastPage, buttonLabel, onButtonClick, onLoading, moreDataLabel  }) => {
    return (
        <div className="flex justify-content-end p-2">
            {!isLastPage ? (
                <Button
                    type="button"
                    icon="pi pi-plus"
                    label={buttonLabel}
                    onClick={onButtonClick}
                    loading={onLoading}
                    rounded
                    size="small"
                />
            ) : (
                <span className="text-500 italic py-2">{moreDataLabel}</span>
            )}
        </div>
    );
};

export default FooterList;