import { AuthService } from "../auth/AuthServiceKeycloak";
import { CommonService } from "../CommonService";

export interface IZipCodeResponse {
    zipCode: string;
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

export class ZipCodeService {
    private static readonly API_URL = 'http://localhost:8181/api/zipCodes';

    static async getZipCode(zipCode: string): Promise<IZipCodeResponse> {
        const cleanZipCode = zipCode.replace(/\D/g, '');
        try {
            const tokenData = await AuthService.getAccessToken();
            const response = await fetch(`${this.API_URL}/${cleanZipCode}`, {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

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
            const tokenData = await AuthService.getAccessToken();
            const response = await fetch(this.API_URL, {
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                }
            });

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
