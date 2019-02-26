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

        const offset = request.query.offset ? parseInt(request.query.offset, 10) : undefined;
        const limit = request.query.limit ? parseInt(request.query.limit, 10) : undefined;

        return new QuerySearch(filter, sort, offset, limit);
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
            filter[filterName] = filterValue;
            return filter;
        }

        const [, filterField, filterOperator] = exec;

        switch (filterOperator) {

            case 'eq': {
                filter[filterField] = {
                    $eq: filterValue,
                };
                return filter;
            }

            case 'regex': {
                const regexParts = /\/(.*)\/(.*)/.exec(filterValue);
                if (!regexParts) {
                    throw new QuerySearchError(`cannot parse regex <${filterValue}> for parameter <${filterField}>`);
                }

                try {
                    filter[filterField] = {
                        $regex: new RegExp(regexParts[1], regexParts[2]),
                    };
                    return filter;
                } catch (err) {
                    throw new QuerySearchError(`<${filterValue}> is not a valid regex for parameter <${filterField}>`);
                }
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

    public get filter(): object {
        return this._filter;
    }

    private _sort: object;

    public get sort(): object {
        return this._sort;
    }

    private _offset: number;

    public get offset(): number {
        return this._offset;
    }

    public set offset(value: number) {
        this._offset = value;
    }

    private _limit: number;

    public get limit(): number {
        return this._limit;
    }

    public set limit(value: number) {
        this._limit = value;
    }

    /**
     * Constructor
     * @param filter
     * @param sort
     * @param offset
     * @param limit
     */
    constructor(
        filter: object = {},
        sort: object = {},
        offset?: number,
        limit?: number) {

        this._filter = filter;
        this._sort = sort;
        this._offset = offset;
        this._limit = limit;
    }
}
