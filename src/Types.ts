
export type MaybeKnown<Component, TKnownComponents> = Component extends TKnownComponents ? Component : (Component | undefined);