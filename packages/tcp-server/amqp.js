var amqp = require('amqplib/callback_api');

async function connect() {
  return new Promise((resolve, reject) => {
    amqp.connect(
      'amqp://egkktglj:0Bn4BzABuSOkhcDJOOGTSe6mZR39Qyl4@shrimp.rmq.cloudamqp.com/egkktglj',
      function (error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function (error1, channel) {
          if (error1) {
            throw error1;
          }

          channel.assertQueue('default', {
            durable: false
          });

          resolve(channel);
        });
      }
    );
  });
}

module.exports = connect;
