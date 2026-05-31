# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

```sh
# recreate this project
npx sv@0.13.0 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" playwright tailwindcss="plugins:typography,forms" drizzle="database:mysql+mysql:mysql2+docker:no" better-auth="demo:password" --install npm ./
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

# or start on accessible host ip
npm run dev -- --host

# Create test data on the database
npx tsx .\src\tests\db\seed.ts\
```

## Better Auth 
Auth 3rd party changes

```sh
npm run auth:schema
npm run db:generate
npm run db:migrate
npm run db:push
```

## Building

To create a production version of your app:

```sh
npm run build
node --env-file=.env.prod build # deploy on node server
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.


## Printers

### Niimbot
Configuring this project using niimbot B1 require installing:
https://github.com/MultiMote/niimblue-node


#### For local CLI (same machine as webapp)


Install the dependies and add the bariables ENV file
```
npm install -g node-gyp
npm i -g @mmote/niimblue-node
```

```
# NIMBOT PRINTER INFO (only 1 supported right now)
NIIMBOT_MODEL=""
NIIMBOT_MAC_ADDR="" 
```

#### Setting up HTTP server on a linux machine instead 

Add the following info to ENV file
```
# NIMBOT PRINTER INFO (only 1 supported right now)
NIIMBOT_MODEL=""
NIIMBOT_MAC_ADDR="" 
NIIMBOT_HTTP_SERVER="IP:PORT" (HTTP OPTION)
```

On Linux Install niimblue-node
```
sudo apt install nodejs npm
npm install -g node-gyp
npm install -g @mmote/niimblue-node
```

Start Server
```
niimblue-cli server -h <MACHINE_IP> -p <PORT>  # 0.0.0.0 5000
```

OR

Create service file /etc/systemd/system/niimblue_server.service
```
[Unit]
Description=Niimblue Node Server
After=network.target

[Service]
Type=simple
User=<USER_NAME>
WorkingDirectory=/
ExecStart=niimblue-cli server -h MACHINE_IP -p PORT
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```


Register and start service
```
sudo systemctl daemon-reload
sudo systemctl enable niimblue_server.service
sudo systemctl start niimblue_server.service
```


Debug
```
journalctl -u niimblue_server.service -f
```