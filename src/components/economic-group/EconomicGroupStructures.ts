import {z} from "zod";

export interface IEconomicGroup {
    id: string;
    name: string;
    description: string;
    organizationIds: string[];
}

export const economicGroupSchema = z.object({
    name: z.string().min(1, "O nome é obrigatório"),
    description: z.string(),
    organizationIds: z.array(z.string())
});

export type EconomicGroupFormData = z.infer<typeof economicGroupSchema>;

export const economicGroupFilterSchema = z.object({
    term: z.string()
});

export type EconomicGroupFilterData = z.infer<typeof economicGroupFilterSchema>;