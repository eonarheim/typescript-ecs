import { World } from "./World";

export interface SystemCtor<T extends System> {
    new (world: World): T;
}

/**
 * Systems get the world injected into their constructor
 */
export abstract class System<TContext = any> {
    /**
     * Unique name to identify types after bundle
     */
    public priority: number = 0;
    abstract update(elapsedMs: number): void;
    initialize?(context: TContext): void;
}