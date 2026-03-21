import asyncio
import sys
import logging
import time
from asyncio import Queue
from scanner.waveshare_epd import epd7in5_V2
from scanner.src.scanner_reader import ScannerReader, ScannerNotFoundException
from scanner.src.display_barcode import DisplayBarCode
logging.basicConfig(level=logging.INFO)


async def barcode_scanner_provider(q_barcode: Queue):
    scanner_name = "NT CCD barcode scanner"
    scanner_reader = ScannerReader()

    # Loop until device is found
    attempts = 10
    delay = 5
    device = scanner_reader.find_scanner(scanner_name)
    while attempts > 0:
        if device is None:
            attempts -= 1
            logging.info("%s not found. Trying again in %s s...", scanner_name, delay)
            time.sleep(delay)
            device = scanner_reader.find_scanner(scanner_name)
        else:
            logging.info("Scanner %s found!", scanner_name)
            break
    if device is None:
        raise ScannerNotFoundException(f"{scanner_name} was not found after 3 attempts")

    # Keep listening for barcode scan and push to queue
    while True:
        barcode = scanner_reader.read_scanner(device)
        logging.info("barcode scanner: %s", barcode)
        await q_barcode.put(barcode)


async def barcode_display_consumer(q_barcode: Queue, disp_instance: DisplayBarCode):
    while True:
        # Loop until something is put for display
        while await q_barcode.empty():
            time.sleep(1)

        # Display the bar code
        barcode = await q_barcode.get()
        logging.info("Updateing screen with barcode: %s", barcode)
        disp_instance.barcode_update(barcode)


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

# try:
#     # logging.info("init and Clear")
#     # epd = epd7in5_V2.EPD()
#     # display_instance = DisplayBarCode(epd)

#     # q = Queue()
#     # scanner_thread = threading.Thread(
#     #     target=barcode_scanner_provider,
#     #     args=(q,),
#     #     daemon=True,
#     #     name='Scanner-'
#     # )
#     # display_thread = threading.Thread(
#     #     target=barcode_display_consumer,
#     #     args=(q,display_instance,),
#     #     daemon=True,
#     #     name='Display-'
#     # )
#     # scanner_thread.start()
#     # display_thread.start()
#     # display_thread.join()
#     # scanner_thread.join()
# except KeyboardInterrupt:
#     logging.info("ctrl + c:")
#     epd7in5_V2.epdconfig.module_exit(cleanup=True) #pylint: disable=no-member
#     sys.exit()

asyncio.run(main())
