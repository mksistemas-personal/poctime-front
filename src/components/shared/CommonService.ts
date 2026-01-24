export class CommonService {
    static getErrorMessage(errorCode: string, defaultMessage: string = 'Ocorreu um erro inesperado. Por favor, tente novamente.'): string {
        const errorMessages: { [key: string]: string } = {
            'organization.person.duplicated': 'Esta organização já está cadastrada.',
            'organization.person.not.found': 'Pessoa da organização não encontrada.',
            'organization.responsible.person.not.found': 'Responsável não encontrado.',
            'organization.person.id.not.null': 'O ID da pessoa da organização deve ser nulo.',
            'organization.address.not.null': 'O endereço é obrigatório.',
            'organization.responsible.person.id.not.null': 'O ID do responsável deve ser nulo.',
            'organization.responsible.email.not.blank': 'O e-mail do responsável não pode estar em branco.',
            'organization.responsible.email.invalid': 'O e-mail do responsável é inválido.',
            'organization.person.not.null': 'A pessoa da organização é obrigatória.',
            'organization.responsible.person.not.null': 'O responsável pela organização é obrigatório.',
            'organization.responsible.email.not.null': 'O e-mail do responsável é obrigatório.',
            'organization.country.responsible.invalid': 'O país do responsável é inválido.',
            'organization.person.country.wrong.type': 'Tipo de país da pessoa da organização está incorreto.',
            'organization.responsible.person.country.wrong.type': 'Tipo de país do responsável está incorreto.',
            'organization.not.found': 'Organização não encontrada.',
            'address.street.required': 'A rua é obrigatória.',
            'address.neighborhood.required': 'O bairro é obrigatório.',
            'address.city.required': 'A cidade é obrigatória.',
            'address.statecode.invalid': 'O código do estado é inválido.',
            'address.state.invalid': 'O estado é inválido.',
            'address.country.required': 'O país é obrigatório.',
            'address.country.invalid': 'O país é inválido.',
            'address.zipcode.required': 'O CEP é obrigatório.',
            'address.zipcode.invalid': 'O CEP é inválido.'
        };

        return errorMessages[errorCode] || defaultMessage;
    }

}