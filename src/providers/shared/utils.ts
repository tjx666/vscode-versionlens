export function logErrorToConsole(providerName: string, functionName: string, packageName: string, error: any) {
  console.error(providerName, `@function:${functionName}`, `@package:${packageName}`, error);
}