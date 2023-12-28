
export type ComponentCtor<TComponent extends Component> = new (...args: any[]) => TComponent;

export abstract class Component {
    /**
     * Unique name to identify components
     */
    // abstract name: string;
}