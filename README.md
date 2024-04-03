# grocery-store

Grocery Store

### `Prerequisites`

`npm` - recommended version ^10.5.0

`node` - recommended version ^20.12.0

`docker` - recommended version ^20.10.0

`docker-compose` - recommended version ^2.25.0

### `Initial setup`

Create `.env` file and copy contents from `.env.example`

### `Install packages`

Install all dependencies:

`npm install`

### `Lint`

Run eslint to validate code:

`npm run lint`

### `Build`

Build the app using:

`npm run build`

### `Run`

Run the app while using dockerized MongoDB

`docker compose up -d && npm run start`

### `Develop mode`

Run the app in dev mode with hot-reloading enabled while using dockerized MongoDB:

`docker compose up -d && npm run dev`

### `Initialize database`

Run script for database initialization:

`npm run init-database`

### `Run tests`

Run unit tests with coverage:

`npm run test`

### `Api docs`

Postman collection can be imported from:

`api-docs/Grocery store.postman_collection.json`
