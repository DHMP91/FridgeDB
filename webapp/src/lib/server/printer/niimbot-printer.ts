import dotenv from "dotenv";
import { AbstractPrinter, type PrintJob } from "./abstract-printer";
dotenv.config();


class NiimbotPrinter extends AbstractPrinter {
  public enabled(): boolean {
    return Boolean(process.env.NIIMBOT_MODEL && process.env.NIIMBOT_MODEL)
  }

  public async print(job: PrintJob): Promise<void> {
    console.log("Printer Niimbot:", job.payload);
    // TODO IMPLEMENT printing with niimblue node cli or http
  }
}



export const NiimbotPrinterInst = new NiimbotPrinter()