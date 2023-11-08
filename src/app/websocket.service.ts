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
    this.socket = new WebSocketSubject('ws://localhost:3000');
  }

  connect() {
    return this.socket;
  }
  
  // 先判斷要怎樣投票的API (贊成反對 / 剪刀石頭布 / 抽籤)
  startVote(voteType: string, topic: string): Observable<any> {
    const params = new HttpParams()
      .set('voteType', voteType)
      .set('topic', topic);
    return this.http.get('http://localhost:3000/api/start-vote', { params });
  }

  // 贊成反對API 開始 ---------------------------------------- 
  // 贊成反對的API (有總數的那種)
  submitVote(name: string, choice: string) {
    const data = { name, choice }; // 将用户的选择包含在数据中
    return this.http.post('http://localhost:3000/api/submit-vote', data);
  }

  // 結束贊成反對 計算總數且給結果的API
  endVote() {
    return this.http.get('http://localhost:3000/api/end-vote');
  }
  // 贊成反對API 結束 ---------------------------------------- 

  resetVote() {
    return this.http.post('http://localhost:3000/api/reset-vote', {});
  }

  // 剪刀石頭布API 開始 ---------------------------------------- 
  // 剪刀石頭布API
  rockPaperScissors(name: string, choice: string) {
    const players = [{ name, choice }]; // 将玩家信息放入一个数组
    const requestBody = { players };
    return this.http.post('http://localhost:3000/api/rockPaperScissors', requestBody);
  }

  // 取得剪刀石頭布的參賽名單 API
  getRockPaperScissorsPlayers(){
    return this.http.get('http://localhost:3000/api/rockPaperScissors/getPlayers');
  }

  // 剪刀石頭布的結果API
  rockPaperScissorsResult() {
    return this.http.get('http://localhost:3000/api/rockPaperScissors/result');
  }

  // 清除剪刀石頭布的參賽名單API
  resetRockPaperScissorsPlayers() {
    return this.http.post('http://localhost:3000/api/rockPaperScissors/reset', {});
  }
  // 剪刀石頭布API 結束 ---------------------------------------- 



  // 抽籤API 開始 ---------------------------------------- 
  // 儲存抽籤名字的API 
  submitNameForLottery(name: string): Observable<any> {
    const requestBody = { name };
    return this.http.post('http://localhost:3000/api/submit-name-for-lottery', requestBody);
  }

  // 查詢抽籤名單API
  getLotteryList() {
    return this.http.get('http://localhost:3000/api/get-lottery-list');
  }

  // 抽奖API
  drawLottery() {
    return this.http.get('http://localhost:3000/api/draw-lottery');
  }

  // 重製抽籤名單 API
  resetLotteryList() {
    return this.http.post('http://localhost:3000/api/reset-lottery-list', {});
  }
  // 抽籤API 結束 ---------------------------------------- 
}
