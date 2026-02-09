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
export interface IOrganization {
    id: string;
    organizationPerson: IPerson
    responsiblePerson: IPerson;
    responsibleEmail: string;
    address: IAddress;
}
export interface IOrganizationWithCityProjection {
    id: string;
    personId: string;
    personName: string;
    documentType: string;
    documentNumber: string;
    city: string;
}

export interface IOrganizationRequest {
    id: string | null;
    person: IPerson;
    address: IAddress;
    responsiblePerson: IPerson;
    responsibleEmail: string;
}

export interface IOrganizationView {
    id: string;
    name: string;
    document: IDocument;
}
