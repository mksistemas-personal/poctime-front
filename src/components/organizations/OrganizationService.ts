import {AuthService} from "../shared/auth/AuthServiceKeycloak";
import {ISlice} from "../shared/ISlice";

export interface IOrganization {
  id: string;
  personId: string;
  personName: string;
  documentType: string;
  documentNumber: string;
  city: string;
  responsibleId: string;
  responsibleName: string;
  responsibleEmail: string;
  responsibleDocumentType: string;
  responsibleDocumentNumber: string;
}

export class OrganizationService {
  private static readonly API_URL = 'http://localhost:8181/api/organization/flat'; // Ajuste a URL base conforme necessário

  static async getOrganizations(page: number = 0, size: number = 10): Promise<ISlice<IOrganization>> {
    try {
      const tokenData = await AuthService.getAccessToken();
      const url: string = `${this.API_URL}?page=${page}&size=${size}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar organizações');
      }
      return await response.json();
    } catch (error) {
      console.error("Erro no OrganizationService:", error);
      throw error;
    }
  }
}
