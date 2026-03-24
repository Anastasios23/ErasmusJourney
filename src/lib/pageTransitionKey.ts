export function getPageTransitionKey(asPath: string): string {
  return asPath.split("?")[0];
}
