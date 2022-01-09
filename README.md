# WIP: Technical prowess showcase (work in progress)

Current stage: first demo (client & server)

Tools used:
* VS Code (remote development using SSH to the server)
* Postman
* Hyper-V (for the server VM)
* MongoDB Compass
* GraphQL Playground
* Docker
* Git

and more.

Technologies / frameworks used:
* Node.js – runtime (server development)
* Express – web application framework
* MongoDB – document-oriented database (NoSQL, JSON/BSON-based)
* GraphQL – data query and manipulation language – used for developing the API (alternative to REST)
* Redis (native) – used it for session id store (in-memory cache/database with persistence)
* TypeScript – superset of JavaScript – used it for static typing support
* MikroORM – object-realtional data mapping – translation between data from the database/API to properly typed objects
* React – front-end JavaScript library – used to develop the client
* NextJS – client app, server-side rendering
* Urql/Apollo – react query + GraphQL clients (with TypeScript) support
* ChakraUI – component/styling library for React
* pnpm – package manager (used it as an alternative to npm – first I tried using yarn but then I read that pnpm works better in some cases and decided to switch) – it uses a special repository and then links the libraries to the node_modules directory (much faster in many cases as it reuses what’s already present on the machine)
* nvm – node version manager
* Nginx – reverse proxy / application endpoint (it also offers support for load balancing but I didn’t use it in this project)

and more.

TODO: write a proper README
