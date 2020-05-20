export interface IRepository {
  get<T>(key: string): T;
}

export interface IConfigRepository extends IRepository {

  section: string;

  repo: IRepository;

}

export interface IFrozenRepository extends IRepository {

  defrost(): void;

}