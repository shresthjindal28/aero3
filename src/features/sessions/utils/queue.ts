export class Queue<T> {
  private readonly items: T[] = [];
  private head = 0;

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.head];
    this.head += 1;

    if (this.head > 50 && this.head * 2 >= this.items.length) {
      this.items.splice(0, this.head);
      this.head = 0;
    }

    return item;
  }

  peek(): T | undefined {
    return this.isEmpty() ? undefined : this.items[this.head];
  }

  isEmpty(): boolean {
    return this.size() === 0;
  }

  size(): number {
    return this.items.length - this.head;
  }

  clear(): void {
    this.items.length = 0;
    this.head = 0;
  }
}
