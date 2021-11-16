export abstract class DataTableConverter<R> {
  constructor(rawData: R) {}
  abstract toRawData(): R
}
