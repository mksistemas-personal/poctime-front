import {AuthService} from "../auth/AuthServiceKeycloak";


export class CommonApiService {
    static async fetchData(url: string) {
        const tokenData = await AuthService.getAccessToken();
        return await fetch(url, {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json'
            }
        });
    }
}