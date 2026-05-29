export type PrintJob = {
  payload: string;
};

export abstract class AbstractPrinter {
  protected queue: PrintJob[] = [];
  protected running: boolean = false;

  public abstract enabled(): boolean;
  public abstract print(job: PrintJob): Promise<void>;

  public process() {
    if (this.running) return;
    this.running = true;

    // Not-awaited async "printer worker" to process all print job for in-memory queue
    // Completes and exit when queue is empty
    const worker = async () => {
      try{
        while (this.queue.length > 0) {
          const job = this.queue.shift()!;
          await this.print(job);
        }
      } finally {
        this.running = false;
      }
    }
    worker();
  }

  public enqueue(payload: string) {
    this.queue.push({ payload });
    this.process();
  }
}
