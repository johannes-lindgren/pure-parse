/**
 * This function will not throw an error.
 * @param is
 */
export const parseJson =
  <T>(is: (data: unknown) => T) =>
  (json: string): T | Error => {
    //   TODO
  }
