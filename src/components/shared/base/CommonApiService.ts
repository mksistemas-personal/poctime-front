import {AuthService} from "../auth/AuthServiceKeycloak";


export class CommonApiService {
    static async fetchGetData(url: string) {
        const tokenData = await AuthService.getAccessToken();
        return await fetch(url, {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            }
        });
    }

    static async fetchPostData(url: string, bodyData: any) {
        const tokenData = await AuthService.getAccessToken();
        return await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });
    }
}