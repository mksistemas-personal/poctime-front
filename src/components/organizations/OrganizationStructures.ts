import {z} from "zod";

export interface IAddress {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state?: string;
    zipCode: string;
    country: string;
    stateCode: string;
}

export const addressSchema = z.object({
    street: z.string().min(1, "A rua é obrigatória"),
    number: z.string().min(1, "O número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "O bairro é obrigatório"),
    city: z.string().min(1, "A cidade é obrigatória"),
    state: z.string().optional(),
    zipCode: z.string().min(8, "O CEP deve ter pelo menos 8 dígitos"),
    country: z.string(),
    stateCode: z.string().min(2, "O estado é obrigatório")
});

export interface IDocument{
    type: string;
    identifier: string;
    country: string;
    complement?: string;
}

export const documentSchema = z.object({
    type: z.string(),
    identifier: z.string().min(1, "O número do documento é obrigatório"),
    country: z.string(),
    complement: z.string().optional()
});

export interface IPerson {
    id: string;
    name: string;
    document: IDocument;
}

export const personSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "O nome é obrigatório"),
    document: documentSchema
});

export interface IOrganization {
    id: string;
    organizationPerson: IPerson
    responsiblePerson: IPerson;
    responsibleEmail: string;
    address: IAddress;
}

export const organizationSchema = z.object({
    id: z.string().optional(),
    organizationPerson: personSchema,
    responsiblePerson: personSchema,
    responsibleEmail: z.string().email("E-mail inválido").or(z.literal('')),
    address: addressSchema
});

export const organizationFilterSchema = z.object({
    name: z.string(),
    respName: z.string(),
    responsibleEmail: z.string(),
    street: z.string(),
    city: z.string(),
    stateCode: z.string()
});

export type OrganizationFilterData = z.infer<typeof organizationFilterSchema>;

export type OrganizationFormData = z.infer<typeof organizationSchema>;

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
