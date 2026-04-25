# FridgeDB
A passion project to track fridge and freezer contents, built specifically for our household use cases. This will be helping us manage everything from frozen meal prep and marinated beef to crockpot ready meals and individual prepped ingredients.

FYI: AI was not used to "vibe" code this project, using AI ruins all the fun and defeats the purpose of passion project wouldn't it? What you see here, design choice, code, good or bad practice is just me learning as I go. 

This repo has two parts: the scanner and the web app

# Scanner
The scanner is responsible for tracking freezer contents using a Raspberry Pi, an e-ink display, and a Bluetooth barcode scanner. Its main job is to communicate with the server to:
- Display the inventory on the eink screen
- Send scanned barcodes to the server
- Show the scanned barcode 
- Display the server’s response message for each scan

Each barcode has a prefix that maps to a specific item. When a barcode is scanned, one of the following scenarios occurs:
- New barcode: The barcode doesnt exist for item then it gets added and the item quantity increases
- Existing barcode: The barcode is marked as “consumed” and item quantity decreases
- Already consumed: No change, the quantity stays the same
- Force re-add (not yet implemented): Scanning a control code before the barcode will reset it to “not consumed” and item quantity increases

Demo of scanning new items (stocking/meal prep workflow):

[![Scanner multiple barcode](https://img.youtube.com/vi/qsnDxpVEd24/0.jpg)](https://www.youtube.com/watch?v=qsnDxpVEd24)

Demo of scanning existing items (consuming/eating workflow)

[![Scanner consuming barcode](https://img.youtube.com/vi/PBEhlaHHz9Q/0.jpg)](https://www.youtube.com/watch?v=PBEhlaHHz9Q)

Tech:
- Language: Python
- Framework: None

Hardware:
- Raspberry Pi Zero
- Waveshare eink 7.5
- Netum bluetooth scanner 1228BC

# Webapp
The webapp is where the core of the fridge tracking logic lives. It controls:
- The creation of the item
- Generates item specific barcode to print (I'm using avery 8167 sheet to print the barcode on)
- API endpoints for the scanner to communicate through

Demo of Webapp Front End:
https://youtube.com/shorts/o5oiDtPdUNE?feature=share

[![Webapp UI](https://img.youtube.com/vi/o5oiDtPdUNE/0.jpg)](https://www.youtube.com/watch?v=o5oiDtPdUNE)

Tech:
- Language: Typescript
- Framework: Svelte kit app
- Auth Library: Better-auth
- ORM Libary: Drizzle
- Database: Any db supported by Drizzle (I'm using MySQL)







