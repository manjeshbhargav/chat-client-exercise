import { EventEmitter } from 'events';

import pkg from 'websocket';
const { w3cwebsocket: WebSocket } = pkg;

const WEBSOCKET_URL = 'ws://127.0.0.1:3030';

export default class ChatClient extends EventEmitter {
  constructor(displayName, conversationId) {
    super();
    this.requestCount = 1;
    this.webSocket = new WebSocket(WEBSOCKET_URL);

    this.webSocket.onopen = () => {
      console.log('WebSocket Client Connected');

      this.sendEvent('join-conversation', {
        displayName,
        conversationId,
      });
    };

    this.webSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === 'response' && data.reqId === 1 && data.statusCode === 200) {
        this.emit('connected');
      }

      if (data.type === 'event' && data.name === 'new-message') {
        this.emit('send-message', data);
      }

      if (data.type === 'response' && data.body && data.statusCode === 200) {
        this.emit('get-messages', data);
      }
    };
  }

  checkEvent(requestId) {
    return new Promise((resolve, reject) => {
      if (requestId === 0) {
        resolve(true);
      }
    });
  }

  disconnect() {
    this.emit('disconnected');
    this.webSocket.close();
  }

  async sendEvent(commandType, args) {
    this.webSocket.send(
      JSON.stringify({
        command: commandType,
        reqId: this.requestCount,
        args,
      })
    );
    this.requestCount++;
  }

  getMessages() {
    return new Promise((resolve, reject) => {
      this.sendEvent('get-messages');

      this.on('get-messages', (data) => {
        console.log('getting messages');
        console.log(data);
        resolve(decodeURIComponent(data.body).split(','));
      });
    });
  }

  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      this.sendEvent('send-message', {
        text: message,
      });

      this.on('send-message', (data) => {
        console.log('Sending message');
        console.log(data);
        resolve('');
      });
    });
  }
}
