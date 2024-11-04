/**
 * Used to represent optional guards at runtime and compile-time in two different ways
 */
export const optionalSymbol = Symbol('optional')

export type OptionalSymbol = typeof optionalSymbol
