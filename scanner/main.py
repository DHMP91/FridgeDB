#!/usr/bin/python
# -*- coding:utf-8 -*-

import logging
from queue import Queue
import time
import threading
from scanner.waveshare_epd import epd7in5_V2
from scanner.src.scanner_reader import ScannerReader
from scanner.src.display_barcode import DisplayBarCode
logging.basicConfig(level=logging.INFO)


def barcode_scanner_provider(q: Queue):
    scanner_name = "NT CCD barcode scanner"
    scanner_reader = ScannerReader()
    device = scanner_reader.find_scanner(scanner_name)
    while True:
        if device == None:
            logging.info(f"{scanner_name} not found. Trying again in 10s...")
            time.sleep(5)
            device = scanner_reader.find_scanner(scanner_name)
        else:
            logging.info(f"Scanner {scanner_name} found!")
            break

    if device == None:
        raise Exception(f"{scanner_name} was not found after 3 attemps")
    
    while True:
        barcode = scanner_reader.read_scanner(device)
        logging.info(f"barcode scanner: {barcode}")
        q.put(barcode)


def barcode_display_consumer(q: Queue, display_instance: DisplayBarCode):
    while True:
        # Loop until something is put for display
        while q.empty():
            time.sleep(1)

        # Display the bar code
        barcode = q.get()
        logging.info(f"Updateing screen with barcode: {barcode}")
        display_instance.barcode_update(barcode)


try:
    logging.info("init and Clear")
    epd = epd7in5_V2.EPD()
    display_instance = DisplayBarCode(epd)

    q = Queue()
    scanner_thread = threading.Thread(target=barcode_scanner_provider, args=(q), daemon=True, name='Scanner-')
    display_thread = threading.Thread(target=barcode_display_consumer, args=(q,display_instance), daemon=True, name='Display-')
    scanner_thread.start()
    display_thread.start()
    display_thread.join()
    scanner_thread.join()
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    epd7in5_V2.epdconfig.module_exit(cleanup=True)
    exit()