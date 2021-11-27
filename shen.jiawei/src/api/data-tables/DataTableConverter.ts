export abstract class DataTableConverter<
  R extends {
    date_create?: number
  }
> {
  date_create?: Date
  constructor(rawData: R) {
    if (rawData.date_create)
      this.date_create = new Date(rawData.date_create * 1000)
  }
  abstract toRawData(): R
}
