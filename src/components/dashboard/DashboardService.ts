import {CommonService} from "../shared/CommonService";
import {CommonApiService} from "../shared/base/CommonApiService";
import {API_CONFIG} from "../../config/ApiConfig";

export interface IDashboardTotals {
    totalOrganizations: number;
    totalEconomicGroups: number;
    totalPersons: number;
    totalClients: number;
}

export class DashboardService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/dashboard`;

    static async getTotals(): Promise<IDashboardTotals> {
        try {

            const url: string = `${this.API_URL}/totals`;

            const response = await CommonApiService.fetchGetData(url);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log(errorData);
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar totsalizadores'));
            }

            return await response.json();
        } catch (error) {
            console.log(error);
            console.error("Erro no DashboardService:", error);
            throw error;
        }
    }


}
