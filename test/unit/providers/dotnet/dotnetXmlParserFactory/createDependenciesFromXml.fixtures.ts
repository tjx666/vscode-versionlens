export default {

  "createDependenciesFromXml": {

    "test": `
    <Project>
    <ItemGroup>
        <PackageReference Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="2.0.0" />
        <PackageReference Include="Microsoft.Extensions.Logging.Abstractions" Version="2.0.1" />
    </ItemGroup>
</Project>
`,

    "expected": [
      {
        "nameRange": {
          "start": 35,
          "end": 35
        },
        "versionRange": {
          "start": 130,
          "end": 34
        },
        "packageInfo": {
          "name": "Microsoft.Extensions.DependencyInjection.Abstractions",
          "version": "2.0.0"
        }
      },
      {
        "nameRange": {
          "start": 144,
          "end": 144
        },
        "versionRange": {
          "start": 227,
          "end": 143
        },
        "packageInfo": {
          "name": "Microsoft.Extensions.Logging.Abstractions",
          "version": "2.0.1"
        }
      }
    ]

  }

}