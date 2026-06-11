type PooledConnection = {
  key: string;
  socket: WebSocket;
  refCount: number;
};

export class ConnectionPool {
  private readonly connections = new Map<string, PooledConnection>();

  acquire(key: string, factory: () => WebSocket): WebSocket {
    const existing = this.connections.get(key);
    if (existing) {
      existing.refCount += 1;
      return existing.socket;
    }

    const socket = factory();
    this.connections.set(key, { key, socket, refCount: 1 });
    return socket;
  }

  release(key: string): void {
    const existing = this.connections.get(key);
    if (!existing) return;

    existing.refCount -= 1;
    if (existing.refCount <= 0) {
      existing.socket.close();
      this.connections.delete(key);
    }
  }

  get(key: string): WebSocket | undefined {
    return this.connections.get(key)?.socket;
  }

  closeAll(): void {
    this.connections.forEach(({ socket }) => socket.close());
    this.connections.clear();
  }
}

export const connectionPool = new ConnectionPool();
