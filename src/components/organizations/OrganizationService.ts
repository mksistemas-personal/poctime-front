export interface IOrganization {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  status: string;
}

export class OrganizationService {
  private static readonly API_URL = 'https://api.poctime.com/v1/organizations'; // Ajuste a URL base conforme necessário

  static async getOrganizations(): Promise<IOrganization[]> {
    try {
      const response = await fetch(this.API_URL);
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
