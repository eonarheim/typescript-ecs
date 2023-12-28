import { Component } from "../src/Component";
import { Entity } from "../src/Entity";
import { System } from "../src/System";
import { World } from "../src/World";

class Transform extends Component {
    x: number = 0;
    y: number = 0;
}

class Rectangle extends Component {
    width = 20;
    height = 20;
    color = 'black'; 
}

const e1 = new Entity({
    components: [new Transform, new Rectangle]
});

const e2 = new Entity({
    components: [new Transform, new Rectangle]
});

class Mover extends System {
    entityQuery = this.world.query([Transform]);
    constructor(public world: World) {
        super();
        this.entityQuery.entityAdded$.subscribe(e => this.onAdd(e));
        this.entityQuery.entityRemoved$.subscribe(e => this.onRemove(e));
    }

    onAdd(entity: Entity) {
        console.log('Entity added to Mover', entity);
    }
    onRemove(entity: Entity) {
        console.log('Entity removed from Mover', entity);
    }

    update(elapsedMs: number): void {
        for (let e of this.entityQuery.entities) {
            const transform = e.get(Transform)!;
            transform.x += 10;
        }
    }
    
}

class Drawer extends System {
    query = this.world.query([Transform, Rectangle]);
    canvas = document.createElement('canvas');
    ctx = this.canvas.getContext('2d');
    constructor(public world: World) {
        super();
        this.canvas.width = 600;
        this.canvas.height = 400;
        document.body.appendChild(this.canvas);
    }
    update(elapsedMs: number): void {
        this.ctx!.fillStyle = 'white';
        this.ctx?.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let e of this.query.entities) {
            const tx = e.get(Transform)!;
            const r = e.get(Rectangle)!;
            this.ctx!.fillStyle = r.color;
            this.ctx!.fillRect(tx.x, tx.y, r.width, r.height);
        }
    }
}

const world = new World()
world.register(Mover);
world.register(Drawer);
world.addEntity(e1);
setTimeout(() => {
    world.addEntity(e2);
}, 100);

setTimeout(() => {
    e2.removeComponent(Transform);
}, 200);

setInterval(() => {
    world.update(16)
}, 16);

