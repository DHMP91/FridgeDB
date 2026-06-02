import dotenv from "dotenv";
import { AbstractPrinter } from "./abstract-printer";
dotenv.config();

export class PrinterFactory {
    static async getPrinter(): Promise<AbstractPrinter | undefined> {
        if( process.env.NIIMBOT_MODEL ){
            const { NiimbotPrinterInst } = await import("$lib/server/printer/niimbot/niimbot-printer");
            return NiimbotPrinterInst
        }
    }
}