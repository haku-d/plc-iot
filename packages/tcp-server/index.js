var net = require('net');

var connect = require('./amqp');

async function start() {
  // creates the server
  var server = net.createServer();
  var port = process.env.PORT || 5000;
  var channel = await connect();

  //emitted when server closes ...not emitted until all connections closes.
  server.on('close', function () {
    console.log('Server closed !');
  });

  // emitted when new client connects
  server.on('connection', function (socket) {
    console.log('Buffer size : ' + socket.bufferSize);

    console.log('---------server details -----------------');

    var address = server.address();
    var port = address.port;
    var family = address.family;
    var ipaddr = address.address;
    console.log('Server is listening at port' + port);
    console.log('Server ip :' + ipaddr);
    console.log('Server is IP4/IP6 : ' + family);

    var lport = socket.localPort;
    var laddr = socket.localAddress;
    console.log('Server is listening at LOCAL port' + lport);
    console.log('Server LOCAL ip :' + laddr);

    console.log('------------remote client info --------------');

    var rport = socket.remotePort;
    var raddr = socket.remoteAddress;
    var rfamily = socket.remoteFamily;

    console.log('REMOTE Socket is listening at port' + rport);
    console.log('REMOTE Socket ip :' + raddr);
    console.log('REMOTE Socket is IP4/IP6 : ' + rfamily);

    console.log('--------------------------------------------');

    server.getConnections(function (error, count) {
      console.log('Number of concurrent connections to the server : ' + count);
    });

    socket.setEncoding('utf8');

    socket.on('data', function (data) {
      var bread = socket.bytesRead;
      var bwrite = socket.bytesWritten;
      console.log('Bytes read : ' + bread);
      console.log('Bytes written : ' + bwrite);
      console.log('Data sent to server : ' + data);

      channel.sendToQueue('default', Buffer.from(data));

      //echo data
      var is_kernel_buffer_full = socket.write('Data ::' + data);
      if (is_kernel_buffer_full) {
        console.log(
          'Data was flushed successfully from kernel buffer i.e written successfully!'
        );
      } else {
        socket.pause();
      }
    });

    socket.on('drain', function () {
      console.log(
        'write buffer is empty now .. u can resume the writable stream'
      );
      socket.resume();
    });

    socket.on('error', function (error) {
      console.log('Error : ' + error);
    });

    socket.on('timeout', function () {
      console.log('Socket timed out !');
      socket.end('Timed out!');
      // can call socket.destroy() here too.
    });

    socket.on('end', function (data) {
      console.log('Socket ended from other end!');
      console.log('End data : ' + data);
    });

    socket.on('close', function (error) {
      var bread = socket.bytesRead;
      var bwrite = socket.bytesWritten;
      console.log('Bytes read : ' + bread);
      console.log('Bytes written : ' + bwrite);
      console.log('Socket closed!');
      if (error) {
        console.log('Socket was closed coz of transmission error');
      }
    });
  });

  // emits when any error occurs -> calls closed event immediately after this.
  server.on('error', function (error) {
    console.log('Error: ' + error);
  });

  //emits when server is bound with server.listen
  server.on('listening', function () {
    console.log(`Server is listening on ${port}!`);
  });

  //static port allocation
  server.listen(port);
}

start();
