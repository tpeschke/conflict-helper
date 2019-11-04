import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor(
    private socket: Socket
    ) { }

  sendInfo (data) {
    if (data.room !== '/') {
      this.socket.emit('turn', data)
    }
  }

  sendMessage(data) {
    if (data.room !== '/') {
      this.socket.emit('message', data)
    }
  }
}