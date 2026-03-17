# FridgeDB Scanner Side


# Setup 
### [Tested on Raspberry pi OS + 7.5 waveshare eink paper hat]

Follow initial setup in and python section 

https://www.waveshare.com/wiki/7.5inch_e-Paper_HAT_Manual#Working_With_Raspberry_Pi

Skip the SPIDEV in the tutorial and do this:

```
  sudo apt install python3-venv
  python3 -m venv venv
  source venv/bin/activate
  sudo /venv/bin/pip3 install spidev
  sudo /venv/bin/pip3 install gpiozero
  sudo /venv/bin/pip3 install -r requirments-scanner.txt
```
OR 

```
  cd ~
  sudo pip3 config set global.break-system-packages true
  sudo pip3 install spidev
  sudo pip3 install gpiozero
  sudo pip3 install -r requirments-scanner.txt
```

Run
```
git clone https://github.com/DHMP91/FridgeDB.git
python -m scanner.main
```





