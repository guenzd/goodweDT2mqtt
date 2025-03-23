# goodweDT2mqtt
Polls GoodWE-DT Inverter on the direct way (No SEMS, No Cloud!) and publishes Values to mqtt. Forked from [https://github.com/int2001/goodweDT2mqtt](https://github.com/int2001/goodweDT2mqtt)

Added: configuration json, user/password, updated packages for npm, 

## SetUp:
* Place `package.json` and `goodwe.js` in one folder (`git clone`)
* Go to Folder and type `npm install` or `yarn install` at the Shell

#### Edit goodwe.js and 
* change mqclient-var to your MQTT-Server
* change HOST to your GoodWE-DT-Inverter WLAN-Stick
* Call `node goodwe.js` or run in within pm2 or some other processmanager

## Operation:
* Run in f.ex. in pm2 or in tmux
* Polls Data from Inverter every 15seconds (changeable with var `interval` in Script)

## Docker
* Build a docker container using the dockerfile

Disclaimer:
Only proof-of-concept.
Some weird things occured here, when developing this. For example the inverter exposes a complete Dataset with the correct CRC, but the Values are bullshit. Tried to catch those things in the Script.
