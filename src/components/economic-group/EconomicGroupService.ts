import {CommonApiService} from "../shared/base/CommonApiService";
import {CommonStructures} from "../shared/base/CommonStructures";
import {CommonService} from "../shared/CommonService";
import {IEconomicGroup} from "./EconomicGroupStructures";

export class EconomicGroupService {
    private static readonly API_URL = 'http://localhost:8181/api/economic-group';


    static async getAllEconomicGroups(page: number = 0, size: number = 10, filters: any = {}) {
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
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao buscar grupos economicos'));
            }

            return await response.json();
        } catch (error) {
            console.log(error);
            console.error("Erro no EconomicGroupService:", error);
            throw error;
        }
    }

    static async saveEconomicGroup(economicGroup: Partial<IEconomicGroup>): Promise<IEconomicGroup> {
        try {
            console.log(economicGroup);
            let response = undefined;
            if (economicGroup.id === undefined || economicGroup.id === null)
                response = await CommonApiService.fetchPostData(this.API_URL, economicGroup);
            else
                response = await CommonApiService.fetchPutData(`${this.API_URL}/${economicGroup.id}`, economicGroup);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log("Erro da Api: ", errorData);
                throw new Error(CommonService.getErrorMessage(errorData.message, 'Erro ao salvar grupo econômico'));
            }
            return await response.json();
        } catch (error) {
            console.log("Erro ao salvar no EconomicGroupService:", error);
            throw error;
        }
    }
}