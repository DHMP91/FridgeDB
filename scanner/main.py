import asyncio
import errno
import sys
import logging
from asyncio import Queue
from src.waveshare_epd import epd7in5_V2
from src.scanner_reader import ScannerReader
from src.display import Display
from src.app_client import AppClient
logging.basicConfig(level=logging.INFO)


async def barcode_scanner_provider(q_barcode: Queue):
    scanner_name = "NT CCD barcode scanner"
    scanner_reader = ScannerReader()
    # Loop until device is found
    delay = 5
    device = scanner_reader.find_scanner(scanner_name)
    while True:
        # Search for device
        while True:
            if device is None:
                logging.info("%s not found. Trying again in %s s...", scanner_name, delay)
                await asyncio.sleep(delay)
                device = scanner_reader.find_scanner(scanner_name)
            else:
                logging.info("Scanner %s found!", scanner_name)
                break

        # Keep listening for barcode scan and push to queue
        while True:
            try:
                barcode = await asyncio.to_thread(
                    scanner_reader.read_scanner, device
                )
                logging.info("barcode scanner: %s", barcode)
                await q_barcode.put({ "code": barcode })
            except OSError as e:
                if e.errno == errno.ENODEV:
                    logging.info(
                        "No such device. Device disconnected?\n" \
                        "Starting searching for device again..."
                    )
                    device = None
                    break
                raise e

async def barcode_display_consumer(q_barcode: Queue, disp_instance: Display):
    client = AppClient()
    while True:
        # Display the bar code
        barcode = await q_barcode.get()
        message = await client.post_barcode(barcode)
        logging.info("Updating screen with barcode: %s", barcode)
        await asyncio.to_thread(
            disp_instance.barcode_update, barcode['code'], message
        )

async def display_inventory(disp_instance: Display):
    client = AppClient()
    while True:
        items = await client.get_inventory_list()
        logging.info("Updating screen with items")
        await asyncio.to_thread(
            disp_instance.display_inventory, items
        )
        await asyncio.sleep(15)

async def main():
    try:
        logging.info("init and Clear")
        epd = epd7in5_V2.EPD()
        display_instance = Display(epd)

        # init empty screen
        display_instance.barcode_update("", "")
        display_instance.display_inventory([])

        # Run scanner and various dispay update in parallel
        q = Queue()
        await asyncio.gather(
            barcode_scanner_provider(q),
            barcode_display_consumer(q, display_instance),
            display_inventory(display_instance)
        )
    except KeyboardInterrupt:
        logging.info("ctrl + c:")
        epd7in5_V2.epdconfig.module_exit(cleanup=True) #pylint: disable=no-member
        sys.exit()

asyncio.run(main())
