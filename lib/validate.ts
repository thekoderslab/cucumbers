/** Shared client/server validation for allowlist submissions. */

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const X_STATUS =
  /^https?:\/\/(www\.)?(x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d{5,25})/;

export function isEvmAddress(value: string): boolean {
  return EVM_ADDRESS.test(value.trim());
}

export function isXStatusUrl(value: string): boolean {
  return X_STATUS.test(value.trim());
}

/** Pulls the @handle out of a post URL, e.g. .../CucumberHood/status/123. */
export function handleFromStatusUrl(value: string): string | undefined {
  const match = X_STATUS.exec(value.trim());
  return match?.[3];
}
