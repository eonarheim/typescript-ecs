import { Component, ComponentCtor } from "./Component";
import { Entity } from "./Entity";
import { Query, QueryEngine } from "./Query";
import { System, SystemCtor } from "./System";


export class World {
    private systems: System[] = [];
    private entities = new Map<number, Entity>();
    private queryEngine = new QueryEngine();
    public register<TSystem extends System>(systemCtor: SystemCtor<TSystem>) {
        const s = new systemCtor(this);
        this.systems.push(s);
    }

    public addEntity(entity: Entity) {
        this.entities.set(entity.id, entity);
        this.queryEngine.addEntity(entity);
        entity.componentAdded$.subscribe(c => {
            this.queryEngine.addComponent(entity, c);
        });
        entity.componentRemoved$.subscribe(c => {
            this.queryEngine.removeComponent(entity, c);
        });
    }

    public removeEntity(entity: Entity) {
        this.entities.delete(entity.id);
        this.queryEngine.removeEntity(entity);
    }

    public query(requiredTypes: ComponentCtor<any>[]): Query {
        return this.queryEngine.createQuery(requiredTypes);
    }

    public update(elapsedMs: number) {

        for (let system of this.systems) {
            system.update(elapsedMs);
        }
    }
}