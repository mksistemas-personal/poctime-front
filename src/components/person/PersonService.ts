import {ISlice} from "../shared/ISlice";
import {CommonService} from "../shared/CommonService";
import {CommonStructures} from "../shared/base/CommonStructures";
import {CommonApiService} from "../shared/base/CommonApiService";
import {API_CONFIG} from "../../config/ApiConfig";
import {IPerson, IPersonRequest} from "./PersonStructures";

export class PersonService {
    private static readonly API_URL = `${API_CONFIG.BASE_URL}/person`;

    static async getPeople(page: number = 0, size: number = 10, filters: any = {}): Promise<ISlice<IPerson>> {
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
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar pessoas'));
            }

            return await response.json();
        } catch (error) {
            console.log(error);
            console.error("Erro no PersonService:", error);
            throw error;
        }
    }

    static async savePerson(client: IPerson): Promise<IPerson> {
        const personRequest: IPersonRequest = {
            id: client.id ||  null ,
            name: client.name,
            document: client.document,
        };

        try {
            let response = undefined;
            if (client.id === undefined || client.id === null || client.id === "")
                response = await CommonApiService.fetchPostData(this.API_URL, personRequest);
            else
                response = await CommonApiService.fetchPutData(`${this.API_URL}/${client.id}`, personRequest);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("Erro da Api: ", errorData);
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao salvar a pessoa'));
            }
            return await response.json();
        } catch (error) {
            console.log("Erro ao salvar no PessoaService:", error);
            throw error;
        }
    }

    static async deletePerson(id: string): Promise<void> {
        try {
            const response = await CommonApiService.fetchDeleteData(`${this.API_URL}/${id}`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao excluir pessoa'));
            }
        } catch (error) {
            console.error("Erro no PessoaService ao excluir:", error);
            throw error;
        }
    }
}
