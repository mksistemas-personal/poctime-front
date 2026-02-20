export interface IDocument{
    type: string;
    identifier: string;
    country: string;
    complement: string;
}

export interface IPerson {
    id: string;
    name: string;
    document: IDocument;
}


export interface IPersonRequest {
    id: string | null;
    name: string;
    document: IDocument;
}

