import { Component, ComponentCtor } from "./Component";
import { Observable } from "./Observable";
import { World } from "./World";

interface EntityOptions {
    components: Component[];
}

export class Entity {
    private static _ID = 0;
    public id: number = Entity._ID++;
    public components = new Map<Function, Component>();
    public world: World | null = null;
    public componentAdded$ = new Observable<Component>();
    public componentRemoved$ = new Observable<Component>();

    constructor(options: EntityOptions) {
        for (let c of options.components) {
            this.components.set(c.constructor, c);
        }
    }

    hasAll<TComponent extends Component>(requiredTypes: ComponentCtor<TComponent>[]) {
        for (let i = 0; i < requiredTypes.length; i++) {
            if (!this.components.has(requiredTypes[i])) {
                return false;
            }
        }
        return true;
    }

    get<TComponent extends Component>(name: ComponentCtor<TComponent>): TComponent | undefined {
        return this.components.get(name) as TComponent;
    }

    addComponent(component: Component) {
        this.components.set(component.constructor, component);
        this.componentAdded$.notifyAll(component);
    }

    removeComponent<TComponent extends Component>(component: ComponentCtor<TComponent>) {
        const componentToRemove = this.components.get(component);
        if (componentToRemove) {
            this.componentRemoved$.notifyAll(componentToRemove);
        }
    }
}