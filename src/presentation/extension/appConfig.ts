// import { AbstractWorkspaceConfig, IRootConfig } from 'core/configuration';
// import { IConfig } from "core/configuration";
// import { LoggingOptions } from "./options/loggingOptions";
// import { SuggestionsOptions } from "./options/suggestionsOptions";
// import { StatusesOptions } from "./options/statusesOptions";

// enum AppContributions {
//   // vscode ui (todo move to options class)
//   GithubTaggedCommits = 'github.taggedCommits',
// }

// export class AppConfig extends AbstractWorkspaceConfig {

//   logging: LoggingOptions;
//   suggestions: SuggestionsOptions;
//   statuses: StatusesOptions;

//   constructor(config: IConfig) {
//     super(config);

//     this.logging = new LoggingOptions(this);
//     this.suggestions = new SuggestionsOptions(this);
//     this.statuses = new StatusesOptions(this);
//   }

//   get githubTaggedCommits() {
//     return this.getOrDefault(
//       AppContributions.GithubTaggedCommits,
//       ['Release', 'Tag']
//     );
//   }

// }

// export function createAppConfig(configRoot: IRootConfig) {
//   return new AppConfig(<IConfig>configRoot);
// }