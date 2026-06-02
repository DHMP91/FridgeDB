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
    if(!this.enabled()){
      console.error("Printer is not configured. Check environment file for NIIMBOT_MODEL, NIMMBOT_MAC_ADDR, NIIMBOT_HTTP_SERVER vars")
      return false
    }

    const retry_interval = 2000
    let tries = 7;
    while(true){
      try {
        if((await this.client.connect()).ok) return true
      } catch ( error ) {
        logger.debug("Niimbot connect error:" + error)
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
    const retry_interval = 2000
    let tries = 7;
    while(true){
      try {
        logger.debug("Disconnecting from niimbot printer")
        if((await this.client.disconnect()).ok) return true
      } catch ( error ) {
        logger.debug("Niimbot disconnect error:" + error)
      }

      if ( tries < 0){
        logger.error("Could not disconnect to niimbot printer");
        return false
      }
      --tries;
      logger.info(`Retrying disconnecting printer in ${retry_interval}ms. Remaining Attempts:${tries}`)
      await new Promise(resolve => setTimeout(resolve, retry_interval));
    }
  }

  protected async print(job: PrintJob): Promise<void> {
    logger.info(`Printing for job: ${job.name}`)
    const resp = await this.client.print(job.payload)
    if(!resp.ok && resp.status === 500){
      logger.error("Print server error:" + resp.statusText)
    }
  }
}


export const NiimbotPrinterInst = new NiimbotPrinter()