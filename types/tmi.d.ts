declare module "tmi.js" {
  interface ClientOptions {
    channels?: string[]
  }

  interface Client {
    on(event: "message", callback: (channel: string, tags: { username?: string }, message: string, self: boolean) => void): void
    on(event: "connected", callback: (address: string, port: number) => void): void
    on(event: "disconnected", callback: (reason: string) => void): void
    connect(): Promise<void>
    disconnect(): Promise<void>
  }

  class ClientConstructor {
    new (options: ClientOptions): Client
  }

  const Client: ClientConstructor
  export { Client }
  export default Client
}