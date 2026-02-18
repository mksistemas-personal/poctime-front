import {CommonService} from "../CommonService";
import {CommonApiService} from "../base/CommonApiService";
import {API_CONFIG} from "../../../config/ApiConfig";

export interface IFederalStateResponse {
    stateName: string;
    stateCode: string;
}

export class FederalStateService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/federalStates`;

    static async getAllFederalStates(): Promise<IFederalStateResponse[]> {
        try {
            const response = await CommonApiService.fetchGetData(this.API_URL);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao listar estados federais'));
            }

            return await response.json();
        } catch (error) {
            console.error("Erro no FederalStateService:", error);
            throw error;
        }
    }
}
