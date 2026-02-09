import {AuthService} from "../shared/auth/AuthServiceKeycloak";
import {ISlice} from "../shared/ISlice";
import {CommonService} from "../shared/CommonService";
import {CommonStructures} from "../shared/base/CommonStructures";
import {CommonApiService} from "../shared/base/CommonApiService";
import {
  IOrganization,
  IOrganizationRequest,
  IOrganizationView,
  IOrganizationWithCityProjection
} from "./OrganizationStructures";

export class OrganizationService {
  private static readonly API_URL = 'http://localhost:8181/api/organization'; // Ajuste a URL base conforme necessário
  private static readonly API_ALL_WITH_CITY = `${OrganizationService.API_URL}/projection/all-with-city`;


  static async getOrganizations(page: number = 0, size: number = 10, filters: any = {}): Promise<ISlice<IOrganization>> {
    try {

      const filterParams = CommonApiService.mountFilter(filters);

      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...filterParams
      });

      const url: string = `${this.API_URL}?${params.toString()}`;

      const response = await CommonApiService.fetchGetData(url);
      if (response.status === 204)
        return CommonStructures.getEmptySliceResponse(page, size);

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
      const url: string = `${this.API_ALL_WITH_CITY}?page=${page}&size=${size}&documentType=${documentType}`;

      const response = await CommonApiService.fetchGetData(url);

      if (response.status === 204)
        return CommonStructures.getEmptySliceResponse(page, size);

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

  static async getOrganizationsFromList(ids: string[] = []): Promise<ISlice<IOrganizationView>> {
    try {

      const idsParam = ids.join(',');
      const url: string = `${OrganizationService.API_URL}/projection/from-list?ids=${idsParam.toString()}`;

      const response = await CommonApiService.fetchGetData(url);
      if (response.status === 204)
        return CommonStructures.getEmptySliceResponse(0, 0);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
        throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar organizações listadas'));
      }

      return await response.json();
    } catch (error) {
      console.log(error);
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
      const response = await CommonApiService.fetchPostData(this.API_URL, organizationRequest);

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
