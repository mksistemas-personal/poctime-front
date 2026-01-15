export interface IAuthToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
}

export class AuthService {
  private static readonly KEYCLOAK_URL = 'http://localhost:9090/realms/poctime-app/protocol/openid-connect/token';
  private static readonly CLIENT_ID = 'api-backend';
  private static readonly CLIENT_SECRET = 'uc87VVWr9Um4w2nVJk20gTUfxMFaFFNp'; // CUIDADO: Apenas para testes ou server-side.
  private static readonly USERNAME = 'poctime-user';
  private static readonly PASSWORD = 'kiniz001';

  static async getAccessToken(): Promise<IAuthToken> {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.CLIENT_ID);
    params.append('client_secret', this.CLIENT_SECRET);
    params.append('username', this.USERNAME);
    params.append('password', this.PASSWORD);

    try {
      const response = await fetch(this.KEYCLOAK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error_description || 'Erro ao obter token do Keycloak');
      }

      return await response.json();
    } catch (error) {
      console.error("Erro no AuthService:", error);
      throw error;
    }
  }
}
