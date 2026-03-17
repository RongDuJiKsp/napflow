export class RegisterManager {
  private unsubscribes: Array<() => void> | null = null

  register(unsubscribe: () => void) {
    if (!this.unsubscribes)
      this.unsubscribes = []

    this.unsubscribes.push(unsubscribe)
  }

  clear() {
    this.unsubscribes?.forEach(unsubscribe => unsubscribe())
    this.unsubscribes = null
  }
}
