import io from 'socket.io-client';

const API = process.env.REACT_APP_WS || 'http://localhost:3008';

let initSocket = null;

export default {
  get io() {
    if (!initSocket) initSocket = io(API);
    return initSocket;
  },
};
