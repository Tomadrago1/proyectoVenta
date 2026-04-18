export enum ValueType {
  PRICE = 'PRICE',
  WEIGHT = 'WEIGHT',
}

export class BarcodeConfig {
  constructor(
    public id_config: number,
    public id_negocio: number,
    public prefix: string,
    public plu_length: number,
    public value_length: number,
    public value_type: ValueType,
    public decimal_places: number,
    public descripcion: string | null,
    public activo: boolean,
  ) {}
}
