import { IRepository, IFrozenRespository } from "core/generic/repositories";

// allows vscode configuration to be defrosted
// Useful for accessing hot changing values from settings.json
// Stays frozen until defrost() is called and then refrosts
export class VsCodeFrozenConfig implements IFrozenRespository {

  protected frozen: IRepository;

  section: string;

  constructor(section: string) {
    this.section = section;
    this.frozen = null;
  }

  get repo(): IRepository {
    const { workspace } = require('vscode');
    return workspace.getConfiguration(this.section);
  }

  get<T>(key: string): T {
    if (this.frozen === null) {
      this.frozen = this.repo;
    }

    return this.frozen.get(key);
  }

  defrost() {
    this.frozen = null;
  }

}