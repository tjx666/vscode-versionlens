import { RegistryProtocols } from "core/clients/helpers/urlHelpers"

export type MavenRepository = {
  url: string,
  protocol: RegistryProtocols
}

export type MavenClientData = {
  repositories: Array<MavenRepository>
}