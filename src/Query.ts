import { Component, ComponentCtor } from "./Component";
import { Entity } from "./Entity";
import { Observable } from "./Observable";

export class Query<TComponent extends Component = Component> {
    public readonly id: string;
    public components = new Set<ComponentCtor<any>>();
    public entities: Entity[] = [];
    public entityAdded$ = new Observable<Entity>();
    public entityRemoved$ = new Observable<Entity>();

    //TODO specify a sort?
    //TODO what happens if a user defines the same type name as a built in type
    constructor(public readonly requiredComponents: ComponentCtor<TComponent>[]) {
        for (let type of requiredComponents) {
            this.components.add(type);
        }
        this.id = requiredComponents.slice().map(c => c.name).sort().join('-');
    }

    checkAndAdd(entity: Entity) {
        if (!this.entities.includes(entity) && entity.hasAll(Array.from(this.components))) {
            this.entities.push(entity);
            this.entityAdded$.notifyAll(entity);
        }
    }

    removeEntity(entity: Entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
            this.entityRemoved$.notifyAll(entity);
        }
    }
}

export class QueryEngine {
    private _queries = new Map<string, Query>();
    private _componentToQueriesIndex = new Map<ComponentCtor<any>, Query<any>[]>();
    public createQuery(requiredComponents: ComponentCtor<any>[]): Query {
        const query = new Query(requiredComponents);

        this._queries.set(query.id, query);

        // index maintenance
        for (let component of requiredComponents) {
            let queries = this._componentToQueriesIndex.get(component);
            if (!queries) {
                this._componentToQueriesIndex.set(component, [query]);
            } else {
                queries.push(query);
            }
        }

        return query;
    }

    addEntity(entity: Entity) {
        for (let [_, query] of this._queries.entries()) {
            query.checkAndAdd(entity)
        }
    }

    removeEntity(entity: Entity) {
        for (let [_, query] of this._queries.entries()) {
            query.removeEntity(entity)
        }
    }

    addComponent(entity: Entity, component: Component) {
        const queries = this._componentToQueriesIndex.get(component.constructor as ComponentCtor<any>) ?? [];
        for (let query of queries) {
            query.checkAndAdd(entity);
        }
    }

    removeComponent(entity: Entity, component: Component) {
        const queries = this._componentToQueriesIndex.get(component.constructor as ComponentCtor<any>) ?? [];
        for (let query of queries) {
            query.removeEntity(entity);
        }
    }
}