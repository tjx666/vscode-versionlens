// TODO split these errors out to their domains

export function createConsoleError(providerName: string, functionName: string, packageName: string, error: any) {
  console.error(
    providerName,
    `@function:${functionName}`,
    `@package:${packageName}`,
    error
  );
}
