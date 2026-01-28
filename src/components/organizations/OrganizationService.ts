import {AuthService} from "../shared/auth/AuthServiceKeycloak";
import {ISlice} from "../shared/ISlice";
import {CommonService} from "../shared/CommonService";

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

interface IOrganizationRequest {
  id: string | null;
  person: IPerson;
  address: IAddress;
  responsiblePerson: IPerson;
  responsibleEmail: string;
}

export class OrganizationService {
  private static readonly API_URL = 'http://localhost:8181/api/organization'; // Ajuste a URL base conforme necessário
  private static readonly API_ALL_WITH_CITY = `${OrganizationService.API_URL}/projection/all-with-city`;


  static async getOrganizations(page: number = 0, size: number = 10, filters: any = {}): Promise<ISlice<IOrganization>> {
    try {
      const tokenData = await AuthService.getAccessToken();
      
      const filterParams: any = {};
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          filterParams[key] = `${filters[key]}`;
        }
      });

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...filterParams
      });

      const url: string = `${this.API_URL}?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 204) {
        return {
          content: [],
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: false, unsorted: true, empty: true },
            offset: page * size,
            paged: true,
            unpaged: false
          },
          size: size,
          number: page,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: 0,
          first: page === 0,
          last: true,
          empty: true
        };
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar organizações'));
      }
      return await response.json();
    } catch (error) {
      console.log(error);
      console.error("Erro no OrganizationService:", error);
      throw error;
    }
  }

  static async getOrganizationsWithCity(page: number = 0, size: number = 10, documentType: string): Promise<ISlice<IOrganizationWithCityProjection>> {
    try {
      const tokenData = await AuthService.getAccessToken();
      const url: string = `${this.API_ALL_WITH_CITY}?page=${page}&size=${size}&documentType=${documentType}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 204) {
        return {
          content: [],
          pageable: {
            pageNumber: page,
            pageSize: size,
            sort: { sorted: false, unsorted: true, empty: true },
            offset: page * size,
            paged: true,
            unpaged: false
          },
          size: size,
          number: page,
          sort: { sorted: false, unsorted: true, empty: true },
          numberOfElements: 0,
          first: page === 0,
          last: true,
          empty: true
        };
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar organizações'));
      }
      return await response.json();
    } catch (error) {
      console.error("Erro no OrganizationService:", error);
      throw error;
    }
  }

  static async saveOrganization(organization: IOrganization): Promise<IOrganization> {
    const organizationRequest: IOrganizationRequest = {
      id: organization.id || null,
      person: organization.organizationPerson,
      address: organization.address,
      responsiblePerson: organization.responsiblePerson,
      responsibleEmail: organization.responsibleEmail,
    };
    try {
      const tokenData = await AuthService.getAccessToken();
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizationRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log("Erro da Api: ", errorData);
        throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao salvar organização'));
      }
      return await response.json();
    } catch (error) {
      console.log("Erro ao salvar no OrganizationService:", error);
      throw error;
    }
  }

  static async deleteOrganization(id: string): Promise<void> {
    try {
      const tokenData = await AuthService.getAccessToken();
      const response = await fetch(`${this.API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao excluir organização'));
      }
    } catch (error) {
      console.error("Erro no OrganizationService ao excluir:", error);
      throw error;
    }
  }
}
