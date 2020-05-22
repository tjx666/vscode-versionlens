import { UrlHelpers } from 'core/clients';
import { RegistryProtocols } from '/core/clients/helpers/urlHelpers';

const assert = require('assert')

export const UrlHelpersTests = {

  "getProtocolFromUrl": {

    "parses http and https protocols": () => {
      const testUrls = [
        'https://test.url.example/path',
        'http://test.url.example/path'
      ]

      const expectedProtocols = [
        RegistryProtocols.https,
        RegistryProtocols.http
      ]

      testUrls.forEach((testUrl, testIndex) => {
        const actual = UrlHelpers.getProtocolFromUrl(testUrl)
        assert.equal(actual, expectedProtocols[testIndex], "Protocol did not match")
      })

    },

    "parses file protocols": () => {
      const testFolders = [
        'd:\\some\\path',
        '/d/some/path'
      ]

      testFolders.forEach((testFolder, testIndex) => {
        const actual = UrlHelpers.getProtocolFromUrl(testFolder)
        assert.equal(actual, RegistryProtocols.file, "Protocol did not match")
      })

    },

  },

};