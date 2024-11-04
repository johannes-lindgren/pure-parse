/**
 * Used to represent optional guards at runtime and compile-time in two different ways
 */
export const optionalSymbol = Symbol('optional')

/**
 * Passed to parsers to indicate that a property is absent
 */
export const propertyAbsent = Symbol('propertyAbsent')

/**
 * Returned from optional parsers to indicate that a property should be omitted
 */
export const omitProperty = Symbol('omitProperty')

export type OptionalSymbol = typeof optionalSymbol
export type PropertyAbsent = typeof propertyAbsent
export type OmitProperty = typeof omitProperty
