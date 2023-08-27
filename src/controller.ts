import { Model, PaginationOptions, PaginationResponse } from "./model";
import { In, Like, FindOperator, FindOneOptions, MoreThan, LessThan } from "typeorm";
import { RouteContract, BaseRoute, Method, response, Request, Response } from "./router";

export class Controller {
    static index(modelClass: typeof Model): new () => RouteContract {
        const callback = (req: Request) => this.getMany(modelClass, req);

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}`;

            method: Method = "get";

            async handle(req: Request): Promise<Response> {
                return response(await callback(req));
            }
        };
    }

    static create(modelClass: typeof Model): new () => RouteContract {
        const callback = (req: Request) => this.fill(new modelClass(), req).save();

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}`;

            method: Method = "post";

            async handle(req: Request): Promise<Response> {
                return response(await callback(req), 201);
            }
        };
    }

    static read(modelClass: typeof Model): new () => RouteContract {
        const callback = (id: number, req: Request) => this.getOne(id, modelClass, req);

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "get";

            async handle(req: Request): Promise<Response> {
                return response(await callback(parseInt(req.params.id), req));
            }
        };
    }

    static update(modelClass: typeof Model): new () => RouteContract {
        const callback = async (id: number, req: Request) => this.fill(await modelClass.findOneOrFail({
            where: {
                Id: id
            }
        } as any), req).save();

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "patch";

            async handle(req: Request): Promise<Response> {
                return response(await callback(parseInt(req.params.id), req));
            }
        };
    }

    static delete(modelClass: typeof Model): new () => RouteContract {
        const callback = (id: number) => modelClass.delete(id);

        return class extends BaseRoute {
            url = `/api/v1/${modelClass.getRepository().metadata.tableNameWithoutPrefix}/:id`;

            method: Method = "delete";

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

    static crud(modelClass: typeof Model): (new () => RouteContract)[] {
        return [
            this.index(modelClass),
            this.create(modelClass),
            this.read(modelClass),
            this.update(modelClass),
            this.delete(modelClass),
        ];
    }

    protected static fill(model: Model, req: Request): Model {
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

    protected static async getOne(id: number, model: typeof Model, req: Request): Promise<Model | undefined> {
        return await model.findOne({
            ...this.prepareQueryOptions(model, req),
            where: {
                Id: id,
            }
        });
    }

    protected static prepareQueryOptions(model: typeof Model, req: Request): FindOneOptions {
        const queryString: Record<string, any> = req.query;
        const metadata = model.getRepository().metadata;
        const columns = metadata.columns.map(col => col.propertyName);

        const where = this.getConditions(queryString, columns);
        const options: PaginationOptions = {};

        options.where = {
            ...where
        };

        options.order = this.getOrderBy(req.query.orderBy as string, columns);

        options.relations = this.getRelations(queryString, metadata.relations.map(rel => rel.propertyName));

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
                    (item[1] as any) = operator((item[1] as string).split(","));
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
            (value: any) => MoreThan(isNaN(value) ? value : parseInt(value)),
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
            (value: any) => LessThan(isNaN(value) ? value : parseInt(value)),
            "_lt"
        );
    }

    protected static getOrderBy(
        orderBy: string,
        cols: string[]
    ): Record<string, string> | undefined {
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
        return (req.with?.split(",") ?? new Array<string>()).filter((rel: string) => rels.includes(rel));
    }
}
