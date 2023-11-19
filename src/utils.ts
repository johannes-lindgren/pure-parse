export type Validator<T> = ((data: unknown) => data is T) & {
  optional?: boolean
}

export type ValidatorGuardType<
  T extends (data: unknown, ...args: unknown[]) => data is unknown,
> = T extends (data: unknown, ...args: unknown[]) => data is infer R
  ? R
  : unknown
