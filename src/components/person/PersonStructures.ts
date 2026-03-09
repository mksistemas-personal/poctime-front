import {z} from 'zod';

export const documentSchema = z.object({
    type: z.string().min(1, 'Tipo de documento é obrigatório'),
    identifier: z.string().min(1, 'Documento é obrigatório'),
    country: z.string(),
    complement: z.string(),
});

export const personSchema = z.object({
    id: z.string().optional().nullable(),
    name: z.string().min(1, 'Nome é obrigatório'),
    document: documentSchema,
});

export type PersonFormData = z.infer<typeof personSchema>;

export const personFilterSchema = z.object({
    name: z.string(),
    identifier: z.string()
});

export type PersonFilterData = z.infer<typeof personFilterSchema>;

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

