
class Component {}

type ComponentConstructor<T extends Component> = new (...args:any[]) => T;

class PositionComponent extends Component {
    x: number = 0;
    y: number = 0;
}

class VelocityComponent extends Component {
    velX: number = 100;
    velY: number = 0;
}

type MaybeKnownComponent<Component, TKnownComponents> = Component extends TKnownComponents ? Component : (Component | undefined);

interface EntityOptions {
    name: string;
}

class Entity<TKnownComponents extends Component = never> {
    private components = new Map<Function, Component>();
    constructor(options?: EntityOptions) {

    }

    addComponent<TComponent extends Component>(component: TComponent): Entity<TKnownComponents | TComponent> {
        this.components.set(component.constructor, component);
        return this as Entity<TKnownComponents | TComponent>;
    }

    get<TComponent extends Component>(componentType: ComponentConstructor<TComponent>): MaybeKnownComponent<TComponent, TKnownComponents> {
        return this.components.get(componentType) as MaybeKnownComponent<TComponent, TKnownComponents>;
    }

    toString() {
        
    }
}

const entity = new Entity()
    .addComponent(new VelocityComponent());

const vel = entity.get(VelocityComponent);
console.log('Definite vel', vel);
const maybePos = entity.get(PositionComponent);
console.log('Maybe pos', maybePos);

