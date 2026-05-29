# FridgeDB Scanner Side

Sample eink code: https://github.com/waveshareteam/e-Paper/blob/master/RaspberryPi_JetsonNano/python/examples/epd_7in5_V2_test.py

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
or
git clone --no-checkout https://github.com/DHMP91/FridgeDB.git
git sparse-checkout set scanner


cd scanner
python -m main
```

Connecting to wireless scanner NT1228BC to Raspberry Pi Zero 2W
```
sudo apt reinstall bluez bluez-firmware pi-bluetooth
sudo systemctl restart bluetooth
bluetoothctl
power on
scan on
connect XX:XX:XX:XX:XX:XX  <---- address of scanner shown in scan list 
```


# Run server as a service

Create service file /etc/systemd/system/fridgedb-scanner.service
```
[Unit]
Description=FridgeDB Scanner
After=network.target

[Service]
Type=simple
User=<USER_NAME>
WorkingDirectory=/REPO_DIR/scanner
ExecStart=python -m main.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```



Register and start service
```
sudo systemctl daemon-reload
sudo systemctl enable fridgedb-scanner.service
sudo systemctl start fridgedb-scanner.service
```


debug
```
journalctl -u fridgedb-scanner.service -f
```






