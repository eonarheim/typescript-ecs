
export type ComponentCtor<TComponent extends Component> = new (...args: any[]) => TComponent;

/**
 * All components must implement Component
 */
export abstract class Component {
    // TODO lifecycle methods here
}