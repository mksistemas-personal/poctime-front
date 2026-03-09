import {z} from "zod";

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
    type: "cnpj" | "cpf";
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

export interface ClientFilter {
    name: string;
    clientEmail: string;
    street: string;
    city: string;
    stateCode: string;
}

export const clientSchema = z.object({
    clientId: z.string().optional().nullable(),
    clientPerson: z.object({
        id: z.string().optional().nullable(),
        name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
        document: z.object({
            type: z.enum(["cnpj", "cpf"]),
            identifier: z.string().min(1, "Documento é obrigatório").refine((val) => {
                const clean = val.replace(/\D/g, '');
                return clean.length === 11 || clean.length === 14;
            }, "Documento inválido"),
            country: z.string().optional(),
            complement: z.string().optional(),
        })
    }),
    clientEmail: z.string().email("E-mail inválido"),
    address: z.object({
        zipCode: z.string().min(8, "CEP inválido"),
        street: z.string().min(1, "Rua é obrigatória"),
        number: z.string().min(1, "Número é obrigatório"),
        neighborhood: z.string().min(1, "Bairro é obrigatório"),
        city: z.string().min(1, "Cidade é obrigatória"),
        stateCode: z.string().length(2, "UF inválida"),
        state: z.string().optional(),
        country: z.string().optional(),
        complement: z.string().optional(),
    })
});

export type ClientFormData = z.infer<typeof clientSchema>;

