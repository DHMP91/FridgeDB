
import logger from  '$lib/logging'

export class NiimbotClient {
    baseUrl: string
    model: string
    macAddr: string

    constructor(options: { baseUrl: string, model:string, macAddr:string }) {
        this.baseUrl = options.baseUrl
        this.model = options.model
        this.macAddr = options.macAddr
    }

    public async connect(): Promise<Response> {
        const response = await fetch(
            `${this.baseUrl}/connect`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    transport: "ble",
                    address: this.macAddr
                })
            }
        );
        logger.debug("Niimbot connect: " + (await response.json()))
        return response;
    }

    public async disconnect(): Promise<Response> {
        const response = await fetch(
            `${this.baseUrl}/disconnect`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            }
        );
        logger.debug("Niimbot disconnect: " + (await response.json()))
        return response;
    }

    public async print(base64: string): Promise<Response> {
        const response = await fetch(
            `${this.baseUrl}/print`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    printDirection: "top",
                    imageBase64: base64,
                    imageFit: "inside",
                })
            }
        );
        logger.debug("Niimbot print: " + (await response.json()))
        return response;
    }
}