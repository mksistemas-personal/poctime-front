import {AuthService} from "../shared/auth/AuthServiceKeycloak";
import {ISlice} from "../shared/ISlice";

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
export interface IOrganization {
  id: string;
  organizationPerson: IPerson
  responsiblePerson: IPerson;
  responsibleEmail: string;
  address: IAddress;
}
export interface IOrganizationWithCityProjection {
  id: string;
  personId: string;
  personName: string;
  documentType: string;
  documentNumber: string;
  city: string;
}

export class OrganizationService {
  private static readonly API_URL = 'http://localhost:8181/api/organization'; // Ajuste a URL base conforme necessário
  private static readonly API_ALL_WITH_CITY = `${OrganizationService.API_URL}/projection/all-with-city`;

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

  static async getOrganizationsWithCity(page: number = 0, size: number = 10): Promise<ISlice<IOrganizationWithCityProjection>> {
    try {
      const tokenData = await AuthService.getAccessToken();
      const url: string = `${this.API_ALL_WITH_CITY}?page=${page}&size=${size}`;
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

  static async saveOrganization(organization: IOrganization): Promise<IOrganization> {
    try {
      const tokenData = await AuthService.getAccessToken();
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organization)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao salvar organização');
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao salvar no OrganizationService:", error);
      throw error;
    }
  }
}
