export const maskApiKey = (apiKey: string, maskLength: number = 6) => {
  if (apiKey.length <= maskLength * 2)
    return '*'.repeat(apiKey.length)

  return apiKey.slice(0, maskLength) + '*'.repeat(apiKey.length - maskLength * 2) + apiKey.slice(-maskLength)
}
