import logger from  '$lib/logging'
import { Mutex } from 'async-mutex'

const mutex = new Mutex();

export type PrintJob = {
  name: string,
  payload: string;
  onPrinted?: () => Promise<void>;
};
type PendingPrintJob = Omit<PrintJob, "onPrinted">;

export abstract class AbstractPrinter {
  private queue: PrintJob[] = [];
  private running: boolean = false;


  public abstract enabled(): boolean;
  
  public async enqueue(printJob: PrintJob) {
    this.queue.push(printJob);
    await this.process();
  }

  public getPendingJobs(): PendingPrintJob[] {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      return this.queue.map(({ onPrinted, ...job }) => job);
  }

  protected abstract connect(): Promise<boolean>
  protected abstract print(job: PrintJob): Promise<void>;
  protected abstract disconnect(): Promise<boolean>

  protected async process() {
    const release = await mutex.acquire();
    if (this.running) {
      release()
      return;
    } else {
      this.running = true; 
      release()
    }

    /** Not-awaited async "printer worker" to process all print job for in-memory queue
    * Completes and exit when queue is empty14
    * 
    * There's a race condition where during disconnect and before "running" is set to false that
    * if print job gets added, it will stay in queue until next trigger.
    */
    const worker = async () => {
      let connected = false
      try{
        if(await this.connect()){
          connected = true
          while (this.queue.length > 0) {
            const job = this.queue[0]
            await this.print(job);
            await job.onPrinted?.().catch((error: unknown) => { 
              logger.error(`Issue encountered running callback fun after print: ${String(error)}`)
            });
            this.queue.shift();
          }
        }
      } catch (error) {
        logger.error("Issue encountered while trying to print")
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
