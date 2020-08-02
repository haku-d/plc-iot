const debug = require('debug')('app');
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const amqplib = require('amqplib');

const connectBroker = () => {
  return amqplib
    .connect(
      'amqp://egkktglj:0Bn4BzABuSOkhcDJOOGTSe6mZR39Qyl4@shrimp.rmq.cloudamqp.com/egkktglj'
    )
    .then((conn) => {
      process.once('SIGTERM', () => {
        console.log('rabbitmq:close connection...');
        conn.close();
      });

      conn.on('error', (err) => {
        console.log('conn err', err);
      });

      console.log('rabbitmq:connected');
      return conn;
    });
};

(async () => {
  const conn = await connectBroker();
  const channel = await conn.createChannel();

  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
  });

  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });

  http.listen(3000, () => {
    console.log('listening on *:3000');
  });

  channel.consume(
    'default',
    (msg) => {
      console.log('handle new message', msg.content.toString());
      const payload = msg.content.toString();
      io.emit('default', payload);
      channel.ack(msg);
    },
    { noAck: false }
  );
})();
