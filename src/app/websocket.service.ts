import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WebSocketSubject } from 'rxjs/internal/observable/dom/WebSocketSubject';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  
  private socket: WebSocketSubject<any>;

  constructor(
    private http: HttpClient
  ) {
    this.socket = new WebSocketSubject('ws://localhost:3000'); // WebSocket 服务器的地址
  }

  connect() {
    return this.socket;
  }

  startVote(voteType: string, topic: string): Observable<any> {
    // 创建一个 HttpParams 对象来包含查询参数
    const params = new HttpParams()
      .set('voteType', voteType)
      .set('topic', topic);
  
    // 发起 GET 请求，包括查询参数
    return this.http.get('http://localhost:3000/api/start-vote', { params });
  }

  endVote() {
    return this.http.get('http://localhost:3000/api/end-vote');
  }

  submitVote(vote: string, choice: string) {
    const data = { vote, choice }; // 将用户的选择包含在数据中
    return this.http.post('http://localhost:3000/api/submit-vote', data);
  }
}
