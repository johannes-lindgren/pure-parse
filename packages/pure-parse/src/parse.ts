import {
  isFunction,
  isNumber,
  isString,
  object,
  OptionalKeys,
  OptionalValidator,
  RequiredKeys,
  Validator,
} from './validation'

type Fallback<T> = (data: unknown) => T
type Parser<T> = (data: unknown) => T

const optionalSymbol = Symbol('optional')
/**
 * Special validator to check optional values
 */
type OptionalParser<T> = { [optionalSymbol]: true } & ((
  data: unknown,
) => data is typeof optionalSymbol)

export const stringParser = (fallback: (value: unknown) => string): Parser<string> =>
  (value) => isString(value) ? value : fallback(value)

export const numberParser = (fallback: (value: unknown) => number): Parser<number> =>
  (value) => isNumber(value) ? value : fallback(value)

export const objectParser =
  <T extends Record<string, unknown>>(schema: {
    [K in keyof T]-?: {} extends Pick<T, K>
      ? OptionalParser<T[K]> | OptionalValidator<T[K]>
      : Parser<T[K]> | Validator<T[K]>
  }, fallback: Fallback<Required<Pick<T, RequiredKeys<T>>> &
    Partial<Pick<T, OptionalKeys<T>>>>) =>
    (
      data: unknown,
    ): Required<Pick<T, RequiredKeys<T>>> &
      Partial<Pick<T, OptionalKeys<T>>> => {
  if(!(typeof data !== 'object' &&
    data !== null)){
    // Not an object
    return fallback(data)
  }
  const parsedObject = Object.keys(schema).reduce((previousValue, key) => {
    if(previousValue === undefined) {
      return previousValue
    }
    const parserOrValidator = schema[key]
    if (parserOrValidator === undefined) {
      // TODO this shouldn't happen, as the type ensures that all properties are validators
      return false
    }
    if (!(key in data)) {
      // If the key is not present, the validator must represent an optional property
      return optionalSymbol in parserOrValidator
    }
    // @ts-ignore - we check that the key is present on the line above
    const value = data[key]

    // TODO both in the union are functions, so we can't distinguish between them
    if(isFunction(parserOrValidator)) {
      // it's a parser
      previousValue[key] = parserOrValidator(value)
      return previousValue
    }
    // it's a validator
    if(parserOrValidator(value)) {
      // it passed validation
      previousValue[key] = value
      return previousValue
    }
    // it failed validation
    return undefined
  }, {} as Record<string, unknown> | undefined)
  if(parsedObject === undefined){
    // Parsing failed
    return fallback(data)
  }
  return data
}
