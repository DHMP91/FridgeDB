import logger from  '$lib/logging'
export type PrintJob = {
  payload: string;
};

export abstract class AbstractPrinter {
  private queue: PrintJob[] = [];
  private running: boolean = false;

  public abstract enabled(): boolean;
  
  public enqueue(payload: string) {
    this.queue.push({ payload });
    this.process();
  }

  protected abstract connect(): Promise<boolean>
  protected abstract print(job: PrintJob): Promise<void>;
  protected abstract disconnect(): Promise<boolean>

  protected process() {
    if (this.running) return;
    this.running = true;

    // Not-awaited async "printer worker" to process all print job for in-memory queue
    // Completes and exit when queue is empty
    const worker = async () => {
      let connected = false
      try{
        if(await this.connect()){
          connected = true
          while (this.queue.length > 0) {
            const job = this.queue.shift()!;
            await this.print(job);
          }
        }
      } catch (error) {
        logger.error("Issue encounter while trying to print")
        logger.error(error)
      } finally {
        if (connected) {
          await this.disconnect();
          logger.info("All print job completed")
        }
        this.running = false;
      }
    }
    worker();
  }

}
