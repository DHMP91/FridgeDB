import asyncio
import sys
import logging
from asyncio import Queue
from src.waveshare_epd import epd7in5_V2
from src.scanner_reader import ScannerReader, ScannerNotFoundException
from src.display_barcode import DisplayBarCode
from src.app_client import AppClient
logging.basicConfig(level=logging.INFO)


async def barcode_scanner_provider(q_barcode: Queue):
    scanner_name = "NT CCD barcode scanner"
    scanner_reader = ScannerReader()
    client = AppClient()
    # Loop until device is found
    attempts = 10
    delay = 5
    device = scanner_reader.find_scanner(scanner_name)
    while attempts > 0:
        if device is None:
            attempts -= 1
            logging.info("%s not found. Trying again in %s s...", scanner_name, delay)
            await asyncio.sleep(delay)
            device = scanner_reader.find_scanner(scanner_name)
        else:
            logging.info("Scanner %s found!", scanner_name)
            break
    if device is None:
        raise ScannerNotFoundException(f"{scanner_name} was not found after 3 attempts")

    # Keep listening for barcode scan and push to queue
    while True:
        barcode = await asyncio.to_thread(
            scanner_reader.read_scanner, device
        )
        logging.info("barcode scanner: %s", barcode)
        message = await client.post_barcode(barcode)
        await q_barcode.put({ "code": barcode, "message": message})     


async def barcode_display_consumer(q_barcode: Queue, disp_instance: DisplayBarCode):
    while True:
        # Display the bar code
        barcode = await q_barcode.get()
        logging.info("Updating screen with barcode: %s", barcode)
        barcode = await asyncio.to_thread(
            disp_instance.barcode_update, f"{barcode['code']} {barcode['message']}"
        )

async def main():
    try:
        logging.info("init and Clear")
        epd = epd7in5_V2.EPD()
        display_instance = DisplayBarCode(epd)

        q = Queue()
        # Run both tasks concurrently
        await asyncio.gather(
            barcode_scanner_provider(q),
            barcode_display_consumer(q, display_instance)
        )
    except KeyboardInterrupt:
        logging.info("ctrl + c:")
        epd7in5_V2.epdconfig.module_exit(cleanup=True) #pylint: disable=no-member
        sys.exit()

asyncio.run(main())
