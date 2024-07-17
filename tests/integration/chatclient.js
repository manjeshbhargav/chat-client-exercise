import * as assert from 'assert';
import * as sinon from 'sinon';
import ChatClient from '../../lib/chatclient.js';

describe('ChatClient', async function() {
  this.timeout(5000);
  it('should run', (done) => {
    const conversationId = Math.random().toString(36).slice(2);

    // Join a chat room
    const aliceClient = new ChatClient('Alice', conversationId);

    // Emit an event when the client has connected to the room
    aliceClient.on('connected', async () => {

      const messageToSend = 'Hello from Alice!';

      // Send a message
      await aliceClient.sendMessage(messageToSend);

      // Get most recent messages
      const messageSent = (await aliceClient.getMessages()).map(msg => msg.split(': ')[1]);

      assert.equal(messageSent, messageToSend);

      /* TODO: Not sure if this is right, but if we are not listening for the event,
        before calling aliceClient.disconnect(), the event would be emitted, but it
        won't have anyone to listen for it.
        That's why I moved the order.
      */
      // Emit an event when the client has been disconnected
      aliceClient.on('disconnected', () => {
        done();
      });

      // Disconnect the client
      aliceClient.disconnect();
    });
  });
});
