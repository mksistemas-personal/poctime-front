import {CommonService} from "../CommonService";
import {CommonApiService} from "../base/CommonApiService";
import {API_CONFIG} from "../../../config/ApiConfig";

export interface IZipCodeResponse {
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

export class ZipCodeService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/zipCodes`;

    static async getZipCode(zipCode: string): Promise<IZipCodeResponse> {
        const cleanZipCode = zipCode.replace(/\D/g, '');
        try {
            const response = await CommonApiService.fetchGetData(`${this.API_URL}/${cleanZipCode}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar CEP'));
            }

            return await response.json();
        } catch (error) {
            console.error("Erro no ZipCodeService:", error);
            throw error;
        }
    }

    static async getAllZipCodes(): Promise<IZipCodeResponse[]> {
        try {
            const response = await CommonApiService.fetchGetData(this.API_URL);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao listar CEPs'));
            }

            return await response.json();
        } catch (error) {
            console.error("Erro no ZipCodeService:", error);
            throw error;
        }
    }
}
