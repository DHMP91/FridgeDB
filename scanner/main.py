#!/usr/bin/python
# -*- coding:utf-8 -*-

import logging
import os
import platform
import sys
import time
import traceback
from scanner.waveshare_epd import epd7in5_V2
from scanner.src.scanner_reader import ScannerReader
from PIL import Image,ImageDraw,ImageFont
logging.basicConfig(level=logging.DEBUG)


# Scanner Reader
scanner_name = "NT CCD barcode scanner"
scanner_reader = ScannerReader()
device = scanner_reader.find_scanner(scanner_name)
for i in range(3):
    if device == None:
        logging.info(f"{scanner_name} not found. Trying again in 10s...")
        time.sleep(10)
        device = scanner_reader.find_scanner(scanner_name)
    else:
        break

if device == None:
    raise Exception(f"{scanner_name} was not found after 3 attemps")

barcode = scanner_reader.read_scanner(device)


try:
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
    draw.text((10, 0), barcode_label, font = font24, fill = 0)
    draw.text((len(barcode_label) + num_spacer, 0), barcode, font = font24, fill = 0)
    draw.line((20, 50, 70, 100), fill = 0)
    epd.display(epd.getbuffer(Himage))
    time.sleep(2)

    logging.info("Goto Sleep...")
    epd.sleep()
except IOError as e:
    logging.info(e)
    
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    epd7in5_V2.epdconfig.module_exit(cleanup=True)
    exit()