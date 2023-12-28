import { Component, ComponentCtor } from "./Component";
import { Observable } from "./Observable";
import { TagsComponent } from "./Tags";
import { World } from "./World";

interface EntityOptions<TComponents extends Component> {
    name?: string;
    components: TComponents[];
}

export class Entity<TKnownComponents extends Component = any> {
    private static _ID = 0;
    public id: number = Entity._ID++;
    public name: string = `Entity#${this.id}`;
    public components = new Map<Function, Component>();
    public world: World | null = null;
    public componentAdded$ = new Observable<Component>();
    public componentRemoved$ = new Observable<Component>();
    private _tags: TagsComponent;

    constructor(options: EntityOptions<TKnownComponents>) {
        this.name = options.name ?? this.name;
        for (let c of options.components) {
            this.components.set(c.constructor, c);
        }
        this._tags = new TagsComponent;
        this.addComponent(this._tags);
    }

    hasTag(tag: string): boolean {
        return this._tags.tags.has(tag);
    }

    addTag(tag: string) {
        this._tags.tags.add(tag);
        return this;
    }

    removeTag(tag: string) {
        this._tags.tags.delete(tag);
        return this;
    }

    hasAll<TComponent extends Component>(requiredTypes: ComponentCtor<TComponent>[]) {
        for (let i = 0; i < requiredTypes.length; i++) {
            if (!this.components.has(requiredTypes[i])) {
                return false;
            }
        }
        return true;
    }

    get<TComponent extends Component>(type: ComponentCtor<TComponent>): MaybeKnownComponent<TComponent, TKnownComponents> {
        return this.components.get(type) as MaybeKnownComponent<TComponent, TKnownComponents>;
    }

    addComponent<TComponent extends Component>(component: TComponent): Entity<TKnownComponents | TComponent> {
        this.components.set(component.constructor, component);
        this.componentAdded$.notifyAll(component);
        return this as Entity<TKnownComponents | TComponent>;
    }

    removeComponent<TComponent extends Component>(type: ComponentCtor<TComponent>): Entity<Exclude<TKnownComponents, TComponent>> {
        const componentToRemove = this.components.get(type);
        if (componentToRemove) {
            this.componentRemoved$.notifyAll(componentToRemove);
        }
        return this as unknown as Entity<Exclude<TKnownComponents, TComponent>>;
    }
}