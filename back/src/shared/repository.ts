export interface Repository<T> {
  findAll(): Promise<T[] | undefined>;
  findOne(items: { [key: string]: string }): Promise<T | undefined>;
  save(entity: T): Promise<T | undefined>;
  update(items: { [key: string]: string }, entity: T): Promise<T | undefined>;
  remove(items: { [key: string]: string }): Promise<void>;
}
