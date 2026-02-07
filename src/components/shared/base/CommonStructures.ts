export class CommonStructures {
    static async getEmptyHttpResponse(page: number = 0, size: number = 10) {
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
}

