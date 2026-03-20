#!/usr/bin/python
# -*- coding:utf-8 -*-

import logging
import os
import queue
import time
import threading
from scanner.waveshare_epd import epd7in5_V2
from scanner.src.scanner_reader import ScannerReader
from PIL import Image,ImageDraw,ImageFont
logging.basicConfig(level=logging.INFO)


def start_scanner(q):
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


def display(q):
    try:
        while True:
            # Loop until something is put for display
            barcode = q.get(timeout=1) 
            while barcode is None:
                time.sleep(1)
                barcode = q.get(timeout=1) 

            # Display the bar code
            picdir = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'pic')
            font24 = ImageFont.truetype(os.path.join(picdir, 'Font.ttc'), 24)
            
            logging.info("Scanner Demo")
            epd = epd7in5_V2.EPD()
            
            logging.info("init and Clear")
            epd.init()
            epd.Clear()

            barcode_label = 'Bar Code Scanned:'
            num_spacer = 5
            Himage = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
            draw = ImageDraw.Draw(Himage)
            draw.text((10, 0), f'{barcode_label}: {barcode}', font = font24, fill = 0)
            draw.line((20, 50, 70, 100), fill = 0)
            epd.display(epd.getbuffer(Himage))
            time.sleep(10)

            logging.info("Goto Sleep...")
            epd.sleep()
    finally:  
        epd7in5_V2.epdconfig.module_exit(cleanup=True)
    
# Start listening to scan and display
try:
    q = queue.Queue()
    scanner_thread = threading.Thread(target=start_scanner, args=(q,), daemon=True, name='Scanner-')
    display_thread = threading.Thread(target=display, args=(q,), daemon=True, name='Display-')
    scanner_thread.start()
    display_thread.start()
    display_thread.join()
    scanner_thread.join()
except IOError as e:
    logging.info(e)
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    exit()