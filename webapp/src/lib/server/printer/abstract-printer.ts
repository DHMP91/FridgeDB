import logger from  '$lib/logging'
import { Mutex } from 'async-mutex'

const mutex = new Mutex();

export type PrintJob = {
  name: string,
  payload: string;
};

export abstract class AbstractPrinter {
  private queue: PrintJob[] = [];
  private running: boolean = false;

  public abstract enabled(): boolean;
  
  public async enqueue(printJob: PrintJob) {
    this.queue.push(printJob);
    await this.process();
  }

  public getPendingJobs(){
     return [...this.queue]; // snapshot of queue
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
