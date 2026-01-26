import { AuthService } from "../auth/AuthServiceKeycloak";
import { CommonService } from "../CommonService";

export interface IFederalStateResponse {
    stateName: string;
    stateCode: string;
}

export class FederalStateService {
    private static readonly API_URL = 'http://localhost:8181/api/federalStates';

    static async getAllFederalStates(): Promise<IFederalStateResponse[]> {
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
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao listar estados federais'));
            }

            return await response.json();
        } catch (error) {
            console.error("Erro no FederalStateService:", error);
            throw error;
        }
    }
}
