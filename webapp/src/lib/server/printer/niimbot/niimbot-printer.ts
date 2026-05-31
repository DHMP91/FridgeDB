import dotenv from "dotenv";
import logger from  '$lib/logging'
import { AbstractPrinter, type PrintJob } from "../abstract-printer";
import { NiimbotClient } from "./niimbot-client";
dotenv.config();

class NiimbotPrinter extends AbstractPrinter {
  private client: NiimbotClient;
  constructor() {
    super();
    const model = process.env.NIIMBOT_MODEL!
    const macAddr = process.env.NIMMBOT_MAC_ADDR!
    const baseUrl = process.env.NIIMBOT_HTTP_SERVER!
    this.client = new NiimbotClient({baseUrl, model, macAddr})
  }
  public enabled(): boolean {
    return Boolean(process.env.NIIMBOT_MODEL && process.env.NIMMBOT_MAC_ADDR && process.env.NIIMBOT_HTTP_SERVER)
  }

  protected async connect() {
    const retry_interval = 5000
    let tries = 5;
    while(true){
      try {
        if((await this.client.connect()).ok) return true
      } catch ( error ) {
        logger.debug("Niimbot connect attempt:" + error)
      }

      if ( tries < 0){
        logger.error("Could not connect to niimbot printer");
        return false
      }
      --tries;
      logger.info(`Retrying connect to printer in ${retry_interval}ms. Remaining Attempts:${tries}`)
      await new Promise(resolve => setTimeout(resolve, retry_interval));
    }
  }

  protected async disconnect() {
    return (await this.client.disconnect()).ok
  }

  protected async print(job: PrintJob): Promise<void> {
    if(this.enabled()){
      await this.client.print(job.payload)
    }
  }
}




export const NiimbotPrinterInst = new NiimbotPrinter()