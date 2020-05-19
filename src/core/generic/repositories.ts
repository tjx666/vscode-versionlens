export interface IRepository {
  get<T>(key: string): T;
}

export interface IConfigRepository extends IRepository {

  section: string;

  repo: IRepository;

}

export interface IFrozenRespository extends IRepository {

  defrost(): void;

}