var StaticServer = require('static-server');

var server = new StaticServer({
  rootPath: './public/',
  port: 3000
});

server.start(function () {
  console.log('servering started on port' + server.port);
});