import {ISlice} from "../shared/ISlice";
import {CommonService} from "../shared/CommonService";
import {CommonStructures} from "../shared/base/CommonStructures";
import {CommonApiService} from "../shared/base/CommonApiService";
import {IClient, IClientRequest, IClientWithCityProjection} from "./ClientStructures";
import {API_CONFIG} from "../../config/ApiConfig";

export class ClientService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/client`;
    private static readonly API_ALL_WITH_CITY = `${ClientService.API_URL}/projection/all-with-city`;

    static async getClients(page: number = 0, size: number = 10, filters: any = {}): Promise<ISlice<IClient>> {
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
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar clientes'));
            }

            return await response.json();
        } catch (error) {
            console.log(error);
            console.error("Erro no ClientService:", error);
            throw error;
        }
    }

    static async getClientWithCity(page: number = 0, size: number = 10): Promise<ISlice<IClientWithCityProjection>> {
        try {
            const url: string = `${this.API_ALL_WITH_CITY}?page=${page}&size=${size}`;

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


    static async saveClient(client: IClient): Promise<IClient> {
        const clientRequest: IClientRequest = {
            id: client.clientId ||  null ,
            person: client.clientPerson,
            address: client.address,
            clientEmail: client.clientEmail,
        };

        try {
            let response = undefined;
            if (client.clientId === undefined || client.clientId === null || client.clientId === "")
                response = await CommonApiService.fetchPostData(this.API_URL, clientRequest);
            else
                response = await CommonApiService.fetchPutData(`${this.API_URL}/${client.clientId}`, clientRequest);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("Erro da Api: ", errorData);
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao salvar o cliente'));
            }
            return await response.json();
        } catch (error) {
            console.log("Erro ao salvar no ClientService:", error);
            throw error;
        }
    }

    static async deleteClient(id: string): Promise<void> {
        try {
            const response = await CommonApiService.fetchDeleteData(`${this.API_URL}/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao excluir cliente'));
            }
        } catch (error) {
            console.error("Erro no ClientService ao excluir:", error);
            throw error;
        }
    }
}
