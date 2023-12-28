import { Component, ComponentCtor } from "./Component";
import { Entity } from "./Entity";
import { Observable } from "./Observable";

export type ComponentInstance<T> = T extends ComponentCtor<infer R> ? R : never;

export class Query<TKnownComponentCtors extends ComponentCtor<Component> = never> {
    public readonly id: string;
    public components = new Set<TKnownComponentCtors>();
    public entities: Entity<ComponentInstance<TKnownComponentCtors>>[] = [];
    public entityAdded$ = new Observable<Entity<ComponentInstance<TKnownComponentCtors>>>();
    public entityRemoved$ = new Observable<Entity>();

    //TODO specify a sort with an optional options?
    constructor(public readonly requiredComponents: TKnownComponentCtors[]) {
        for (let type of requiredComponents) {
            this.components.add(type);
        }
        // TODO what happens if a user defines the same type name as a built in type
        // ! TODO this could be dangerous depending on the bundler's settings for names
        // Maybe somekind of hash function is better here?
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

export class TagQuery<TKnownTags extends string = never> {
    public readonly id: string;
    public tags = new Set<TKnownTags>();
    public entities: Entity[] = [];
    public entityAdded$ = new Observable<Entity>();
    public entityRemoved$ = new Observable<Entity>();

    constructor(public readonly requiredTags: TKnownTags[]) {
        for (let tag of requiredTags) {
            this.tags.add(tag);
        }
        this.id = requiredTags.slice().map(c => c).sort().join('-');
    }
}

export class QueryEngine {
    private _queries = new Map<string, Query<any>>();
    private _componentToQueriesIndex = new Map<ComponentCtor<any>, Query<any>[]>();
    public createQuery<TKnownComponentCtors extends ComponentCtor<Component>>(requiredComponents: TKnownComponentCtors[]): Query<TKnownComponentCtors> {
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