## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Run test
```
npm test
```

### Run test coverage
```
npm run testcoverage
```

### Customize configuration
```
\config\roomConfig.js
```

### Run with docker on port 3000
```
docker-compose up
docker-compose down
docker ps
docker build -t my-node-app .
docker run -p 3000:3000 -d my-node-app
docker stop <container-id>
```