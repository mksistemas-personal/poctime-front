export interface IAddress {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    stateCode: string;
}

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
export interface IClient{
    clientId: string;
    clientPerson: IPerson;
    clientEmail: string;
    address: IAddress;
}
export interface IClientWithCityProjection {
    id: string;
    personId: string;
    personName: string;
    documentType: string;
    documentNumber: string;
    city: string;
}

export interface IClientRequest {
    id: string | null;
    person: IPerson;
    address: IAddress;
    clientEmail: string;
}

