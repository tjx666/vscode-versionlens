import * as VsCodeTypes from "vscode";

export class ConfigurationMock implements VsCodeTypes.WorkspaceConfiguration {

  intercepts: {};

  constructor(intercepts = {}) {
    this.intercepts = intercepts;
  }

  get(section: any, defaultValue?: any) {
    return this.intercepts['get'](section, defaultValue);
  }

  has(section: string): boolean {
    return this.intercepts['has'](section);
  }

  inspect<T>(section: string): any {
    return this.intercepts['has'](section);
  }

  update(
    section: string,
    value: any,
    configurationTarget?: boolean,
    overrideInLanguage?: boolean
  ): Promise<void> {
    return this.intercepts['update'](
      section,
      value,
      configurationTarget,
      overrideInLanguage
    );
  }

}