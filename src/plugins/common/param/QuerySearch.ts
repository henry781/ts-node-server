import {Request} from '../../../types';
import {QuerySearchError} from './QuerySearchError';

export class QuerySearch {

    /**
     * Create a query search from request
     * @param request
     */
    public static fromRequest(request: Request): QuerySearch {

        let filter = {};
        let sort = {};

        const queryFilter = request.query.filter;
        if (queryFilter) {
            if (Array.isArray(queryFilter)) {
                queryFilter.forEach((f: string) => {
                    filter = this.parseFilter(filter, f);
                });

            } else {
                filter = this.parseFilter(filter, queryFilter);
            }
        }

        const querySort = request.query.sort;
        if (querySort) {
            if (Array.isArray(querySort)) {
                querySort.forEach((s: string) => {
                    sort = this.parseSort(sort, s);
                });

            } else {
                sort = this.parseSort(sort, querySort);
            }
        }

        return new QuerySearch(filter, sort);
    }

    /**
     * Parse queryFilter
     * @param filter
     * @param queryFilter
     */
    public static parseFilter(filter: object, queryFilter: string): object {

        const [filterName, filterValue] = queryFilter.split('=');

        const exec = /(.+)\[(.+)\]/g.exec(filterName);

        if (!exec) {
            throw new QuerySearchError('filter is not valid');
        }
        const [, filterField, filterOperator] = exec;

        switch (filterOperator) {

            case 'eq': {
                filter[filterField] = {
                    $eq: filterValue,
                };
                return filter;
            }

            default:
                throw new QuerySearchError(`filter operator <${filterOperator}> is unknown`);
        }
    }

    /**
     * Parse querySort
     * @param sort
     * @param querySort
     */
    public static parseSort(sort: object, querySort: string): object {

        const [sortField, sortDirection] = querySort.split('=');

        if (!sortField) {
            throw new QuerySearchError('sort field is not set');
        }

        switch (sortDirection) {

            case 'ASC': {
                sort[sortField] = 1;
                return sort;
            }

            case 'DESC': {
                sort[sortField] = -1;
                return sort;
            }

            default:
                throw new QuerySearchError(`sort direction <${sortDirection}> is unknown, only <ASC> and <DSC> are allowed`);
        }
    }

    private _filter: object;
    private _sort: object;

    public get filter(): object {
        return this._filter;
    }

    public get sort(): object {
        return this._sort;
    }

    /**
     * Constructor
     * @param filter
     * @param sort
     */
    constructor(filter: object = {}, sort: object = {}) {
        this._filter = filter;
        this._sort = sort;
    }
}
