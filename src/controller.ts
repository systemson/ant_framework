import {
    In,
    Like,
    FindOperator,
    FindOneOptions,
    FindOptionsOrder,
    MoreThanOrEqual,
    LessThanOrEqual,
    Between,
    FindOptionsWhere
} from "typeorm";
import {
    Model,
    PaginationResponse,
    PaginationOptions,
} from "./model";
import {
    BaseRoute,
    Method,
    MiddlewareContract,
    Request,
    Response,
    response,
    RouteContract,
} from "./router";
import { CacheFacade } from "./cache";

type Action = "index" | "create" | "read" | "update" | "delete";

export type CrudOptions = {
    only?: Action[],
    exclude?: Action[],
    middlewares?: MiddlewareContract[];
}

export type IndexOptions = {
    url?: string;
    middlewares?: (new () => MiddlewareContract)[];
    request?: (req: Request) => Request,
}

export class Controller {
    static index(
        modelClass: typeof Model,
        options?: IndexOptions,
    ): new () => RouteContract {
        const callback = (req: Request) => this.getMany(modelClass, req);
        return class extends BaseRoute {
            url = options?.url ?? `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}`;

            method: Method = "get";

            middlewares: (new () => MiddlewareContract)[] = options?.middlewares ?? [];

            async handle(req: Request): Promise<Response> {
                let result: PaginationResponse<Model>;
                if (req.query.cache) {
                    result = await CacheFacade.call(new URL(req.url, `http://${req.headers.host}`).toString(), callback(req), 1000 * 15 * 60);
                } else {
                    result = await callback(req);
                }

                return response(await callback(req));
            }
        };
    }

    static create(
        modelClass: typeof Model,
        options?: IndexOptions,
    ): new () => RouteContract {
        const callback = (req: Request) => this.fill(new modelClass(), req).save();

        return class extends BaseRoute {
            url = options?.url ?? `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}`;

            method: Method = "post";

            middlewares: (new () => MiddlewareContract)[] = options?.middlewares ?? [];

            async handle(req: Request): Promise<Response> {
                return response(await callback(req), 201);
            }
        };
    }

    static read(
        modelClass: typeof Model,
        options?: IndexOptions
    ): new () => RouteContract {
        const callback = (id: number, req: Request) => this.getOne({
            id: id,
            model: modelClass,
            req: req
        });

        return class extends BaseRoute {
            url = options?.url ?? `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "get";

            middlewares: (new () => MiddlewareContract)[] = options?.middlewares ?? [];

            async handle(req: Request): Promise<Response> {
                let result: Model | null;
                if (req.query.cache) {
                    result = await CacheFacade.call(new URL(req.url, `http://${req.headers.host}`).toString(), callback(parseInt(req.params.id), req), 1000 * 15 * 60);
                } else {
                    result = await callback(parseInt(req.params.id), req);
                }

                if (result) {
                    return response(result);
                }

                return response().notFound({
                    message: "Not found",
                });
            }
        };
    }

    static update(
        modelClass: typeof Model,
        options?: IndexOptions
    ): new () => RouteContract {
        const callback = async (id: number, req: Request) => this.fill(await modelClass.findOneOrFail({
            where: {
                id: id
            }
        } as any), req).save();

        return class extends BaseRoute {
            url = options?.url ?? `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "patch";

            middlewares: (new () => MiddlewareContract)[] = options?.middlewares ?? [];

            async handle(req: Request): Promise<Response> {
                return response(await callback(parseInt(req.params.id), req));
            }
        };
    }

    static delete(
        modelClass: typeof Model,
        middlewares: (new () => MiddlewareContract)[] = [],
    ): new () => RouteContract {
        const callback = (id: number) => modelClass.delete(id);

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "delete";

            middlewares: (new () => MiddlewareContract)[] = middlewares;

            async handle(req: Request): Promise<Response> {
                const result = await callback(parseInt(req.params.id));

                if (result.affected && result.affected > 0) {
                    return response({
                        status: "OK",
                        message: "Resource deleted."
                    });
                }

                return response({
                    status: "NOT FOUND",
                    message: "Resource not found."
                }, 404);

            }
        };
    }

    static crud(modelClass: typeof Model, options?: CrudOptions): (new () => RouteContract)[] {
        const actions: Action[] = [
            "index",
            "create",
            "read",
            "update",
            "delete",
        ];

        const filtered = actions.filter(item => {
            if (options?.only) {
                return options.only.includes(item);
            }

            if (options?.exclude) {
                return !options.exclude.includes(item)
            }

            return true;
        })

        const routes: (new () => RouteContract)[] = [];

        for (const action of filtered) {
            routes.push(this[action](modelClass))
        }

        return routes;
    }

    static fill<T extends Model>(model: T, req: Request): T {
        return Object.assign(model, this.getFillable(model.constructor as typeof Model, req));
    }

    protected static getFillable(modelClass: typeof Model, req: Request): Record<string, any> {
        const cols = this.getModelColumns(modelClass);

        return Object.fromEntries(
            Object.entries(req.body)
                .filter(item => cols.includes(item[0]))
        );

    }

    protected static getModelColumns(modelClass: typeof Model): string[] {
        return modelClass.getRepository().metadata.columns.map(col => col.propertyName);
    }

    protected static async getMany(model: typeof Model, req: Request): Promise<PaginationResponse<Model>> {
        const { perPage, page } = req.query;
        const options: PaginationOptions = this.prepareQueryOptions(model, req);

        options.page = page ? parseInt(page as string) : undefined;
        options.perPage = perPage ? parseInt(perPage as string) : undefined;

        return await model.paginate(options);
    }

    protected static async getOne(options: {
        id: number,
        model: typeof Model,
        req: Request
    }): Promise<Model | null> {
        const queryString: Record<string, any> = options.req.query;
        
        queryString["id"] = options.id;

        return await options.model.findOne({
            ...this.prepareQueryOptions(options.model, options.req),
        });
    }

    static prepareQueryOptions<T extends Model>(model: typeof Model, req: Request): FindOneOptions<T> {
        const queryString: Record<string, any> = req.query;
        const metadata = model.getRepository().metadata;
        const columns = metadata.columns.map(col => col.propertyName);
        const where: FindOptionsWhere<T> = this.getConditions(queryString, columns);
        const options: PaginationOptions<T> = {};

        options.where = {
            ...where
        };

        options.select = metadata.columns.filter(col => col.isSelect).map(col => col.propertyName) as any;
        options.order = this.getOrderBy(req.query.orderBy as string, columns);

        options.relations = this.getRelations(queryString, metadata.relations.map(rel => rel.propertyName));
        options.cache = req.query.cache == "true";

        return options;
    }

    protected static getConditions(
        req: Record<string, any>,
        cols: string[]
    ): Record<string, any> {
        return {
            ...this.getWhere(req, cols, In),
            ...this.getWhereLike(req, cols),
            ...this.getWhereGreaterThan(req, cols),
            ...this.getWhereLowerThan(req, cols),
            ...this.getWhereBetween(req, cols),
        };
    }

    protected static getWhere(
        req: Record<string, any>,
        cols: string[],
        operator: (...args: any[]) => FindOperator<any>,
        modifier?: string
    ): Record<string, any> | undefined {
        if (modifier) {
            cols = cols.map(col => `${col}${modifier}`);
        }

        return Object.fromEntries(
            Object.entries(req)
                .filter(item => cols.includes(item[0]))
                .map(item => {
                    if (modifier) {
                        item[0] = item[0].replace(modifier, "");
                    }
                    (item[1] as any) = operator((`${item[1]}`).split(","));
                    return item;
                })
        );
    }

    protected static getWhereLike(
        req: Record<string, any>,
        cols: string[]
    ): Record<string, any> | undefined {
        return this.getWhere(
            req,
            cols,
            (value: any) => Like(`%${value}%`),
            "_like"
        );
    }

    protected static getWhereGreaterThan(
        req: Record<string, any>,
        cols: string[]
    ): Record<string, any> | undefined {
        return this.getWhere(
            req,
            cols,
            (value: any) => MoreThanOrEqual(isNaN(value) ? value : parseInt(value)),
            "_gt"
        );
    }

    protected static getWhereLowerThan(
        req: Record<string, any>,
        cols: string[]
    ): Record<string, any> | undefined {
        return this.getWhere(
            req,
            cols,
            (value: any) => LessThanOrEqual(isNaN(value) ? value : parseInt(value)),
            "_lt"
        );
    }

    protected static getWhereBetween(req: Record<string, any>, cols: string[]) {
        
        return this.getWhere(
            req,
            cols,
            (value: any) => {
                const valueArray = (value as string).split(",");

                if (valueArray.length < 2) {
                    return MoreThanOrEqual(isNaN(value) ? value : parseInt(value));
                }

                return Between(valueArray[0], valueArray[1])
            },
            "_btw"
        );
    }

    protected static getOrderBy<T extends Model>(
        orderBy: string,
        cols: string[]
    ): FindOptionsOrder<T> | undefined {
        if (!orderBy) {
            return undefined;
        }

        const orderByArray = orderBy?.split(",");
        const orderByResult: Record<string, any> = {};

        for (const orderByItem of orderByArray) {
            const array = orderByItem.split(":");
            const prop = array[0];

            if (cols.includes(prop)) {
                orderByResult[prop] = array[1]?.toLowerCase() ?? "asc";
            }
        }

        return orderByResult;
    }

    protected static getRelations(
        req: Record<string, any>,
        rels: string[]
    ): string[] {
        return (req.with?.split(",") ?? new Array<string>()).filter((rel: string) => rels.includes(rel.split(".")[0]));
    }
}
