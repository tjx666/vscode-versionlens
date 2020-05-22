export interface IRepository {
  get<T>(key: string): T;
}

export interface IFrozenRepository extends IRepository {

  defrost(): void;

}