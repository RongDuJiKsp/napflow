export const ClientRpc = {
  success: <T>(data?: T) => ({ success: true, data }),
  fail: (errMsg?: string) => ({ success: false, errMsg }),
}
