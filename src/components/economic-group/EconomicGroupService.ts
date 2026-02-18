import {CommonApiService} from "../shared/base/CommonApiService";
import {CommonStructures} from "../shared/base/CommonStructures";
import {CommonService} from "../shared/CommonService";
import {IEconomicGroup} from "./EconomicGroupStructures";
import {API_CONFIG} from "../../config/ApiConfig";

export class EconomicGroupService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/economic-group`;


    static async getAllEconomicGroups(page: number = 0, size: number = 10, filters?: string) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                term: filters || ''
            });

            const url: string = `${this.API_URL}?${params.toString()}`;

            const response = await CommonApiService.fetchGetData(url);
            if (response.status === 204)
                return CommonStructures.getEmptySliceResponse(page, size);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar grupos economicos'));
            }

            return await response.json();
        } catch (error) {
            console.error("Erro no EconomicGroupService:", error);
            throw error;
        }
    }

    static async saveEconomicGroup(economicGroup: Partial<IEconomicGroup>): Promise<IEconomicGroup> {
        try {
            let response = undefined;
            if (economicGroup.id === undefined || economicGroup.id === null || economicGroup.id === "")
                response = await CommonApiService.fetchPostData(this.API_URL, economicGroup);
            else
                response = await CommonApiService.fetchPutData(`${this.API_URL}/${economicGroup.id}`, economicGroup);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao salvar grupo econômico'));
            }
            return await response.json();
        } catch (error) {
            console.error("Erro ao salvar no EconomicGroupService:", error);
            throw error;
        }
    }

    static async deleteEconomicGroup(id: string): Promise<void> {
        try {
            const response = await CommonApiService.fetchDeleteData(`${this.API_URL}/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao excluir grupo econômico'));
            }
        } catch (error) {
            console.error("Erro no EconomicGroupService ao excluir:", error);
            throw error;
        }
    }

}