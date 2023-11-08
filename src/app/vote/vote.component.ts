import { Component, OnInit, SimpleChanges } from '@angular/core';
import { WebsocketService } from '../websocket.service';
import { Subject, Subscription, delay, interval, of } from 'rxjs';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  isVotingStarted: boolean = false;
  isVotingEnded: boolean = false;
  isVotingRPSEnded: boolean = false;
  voteTopic: string | null = null;
  voteType: string | null = null;
  messageVisible: boolean = false;
  getVoteResult: boolean = false;
  isHideRPSButton: boolean = false;
  isHideAgreeOrDisagreeButton: boolean = false;
  isHideLotteryButton: boolean = false;
  isHideVoteAgreeOrDisagree : boolean = false;
  showResult: boolean = false;
  showResetText: boolean = false;
  vote: string = '';
  message: string = '';
  votingTopic: string = '';
  voteMessage: string = '';
  typeMessage: string = '';
  lotteryName: string = '';
  lotteryWinner: string = '';
  lotteryErrorMessage: string = '';
  agreeCount: number = 0;
  disagreeCount: number = 0;
  winner: string = '';
  finalResult: string = '';
  players: string = '';
  errorMsg: string = '';
  rockPaperScissorsPlayerName: string = '';
  intervalId: any;
  ws = new WebSocket('ws://localhost:3000');
  countdown: number = 15;
  countdownInterval: any;
  lotteryCountdown: number = 30;
  lotteryCountdownInterval: any;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.connect()
    this.startVoteCountdown();
    this.startLotteryCountdown();
    this.startRockpaperscissorsCountdown();
  }
  
  startRockpaperscissorsCountdown(){
    setInterval(() => {
      this.websocketService.getRockPaperScissorsPlayers().subscribe((response:any) => {
        this.intervalId = response.players.length
        this.isHideRPSButton = false;
        if (this.intervalId == 2) {
          this.rockPaperScissorsResult();
        }
      });
    }, 3000);
  }

  startVoteCountdown() {
    this.countdown = this.countdown;
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      this.isHideAgreeOrDisagreeButton = false;
      if (this.countdown === 0) {
        this.endVote();
      }
    }, 1000);
  }

  startLotteryCountdown() {
    this.lotteryCountdown = this.lotteryCountdown;
    this.lotteryCountdownInterval = setInterval(() => {
    this.lotteryCountdown--;
      if (this.lotteryCountdown === 0) {
        this.isHideLotteryButton = true; // 设置 isHideLotteryButton 为 true
        this.drawLottery();
      }
    }, 1000);
  }


  connect(){
    this.ws.onopen = () => {
      console.log('[open connection]')
    }
  }

  // 先判斷要怎樣投票的API (贊成反對 / 剪刀石頭布 / 抽籤)
  startVote(voteType: string, topic: string) {
    this.voteType = voteType;
    if (topic.trim() === '') {
      this.typeMessage = '↑請先輸入投票主題後選擇投票類型';
      this.messageVisible = true;
        setTimeout(() => {
          this.messageVisible = false;
        }, 3000);
      return;
    }
    if (voteType === 'agreeOrDisagree') {
      this.countdown = 15;
      this.resetVote();      
    } else if ( voteType === 'lottery' ) {
      this.lotteryCountdown = 30;
      this.resetLotteryList();
    } else if ( voteType === 'rockPaperScissors') {
      this.resetRockPaperScissorsPlayers();
    }
    this.websocketService.startVote(voteType, topic).subscribe((response: any) => {
      if (response.message) {
        this.message = response.message;
        const match = response.message.match(/投票主題 : (.+)/);
        if (match) {
          this.voteTopic = match[1];
          this.isVotingStarted = true;
        }
      }
    });
  }
  
  // 贊成反對API 開始 ---------------------------------------- 
  // 贊成反對的API (有總數的那種)
  submitVote(choice: string): any {
    if (this.vote.trim() !== '') {
      this.websocketService.submitVote(this.vote, choice).subscribe((response: any) => {
        console.log(response)
        if (response.message === 'Vote submitted.') {
          alert('已投票');
          setTimeout(() => {
            this.voteMessage = '';
          }, 3000);
        }
        this.isVotingEnded = true;
      },(error: any) => {
        if (error.status === 400 && error.error && error.error.message === 'You have already voted.') {
          if (error.error.message === 'You have already voted.') {
            alert('你已經投過票了，請勿重複投票');
            setTimeout(() => {
              this.errorMsg = '';
            }, 3000);
            }
          }
        }
      );
    }
  }

  // 結束贊成反對 計算總數且給結果的API
  endVote() {
    this.websocketService.endVote().subscribe((response: any) => {
      console.log('結束投票');
      if (response.total && response.total.results) {
        if (response.winner === 'agree') {
          this.winner = '贊成';
        } else if (response.winner === 'disagree') {
          this.winner = '反對';
        } else if (response.winner === 'draw') {
          this.winner = '平手';
        }
        this.agreeCount = response.total.results.agree;
        this.disagreeCount = response.total.results.disagree;
      }
      this.getVoteResult = true;
      this.isHideAgreeOrDisagreeButton = true;
      this.isHideVoteAgreeOrDisagree = true;
      this.isVotingEnded = true;
    });
  }
  
  resetVote() {
    this.websocketService.resetVote().subscribe((response) => {
      console.log(response);
    });
  }

  // 投贊成 
  voteAgree() {
    if (this.vote.trim() === '') {
      this.voteMessage = '請輸入名字後投票';
      this.messageVisible = true;
      setTimeout(() => {
        this.messageVisible = false;
      }, 3000);
    } else {
      const choice = 'agree';
      this.submitVote(choice);
    }
  }

  // 投反對
  voteDisagree() {
    if (this.vote.trim() === '') {
      this.voteMessage = '請輸入名字後投票';
      this.messageVisible = true;
      setTimeout(() => {
        this.messageVisible = false;
        this.errorMsg = '';
      }, 3000);
    } else {
      const choice = 'disagree';
      this.submitVote(choice);
    }
  }
  // 贊成反對API 結束 ---------------------------------------- 
  

  // 剪刀石頭布API 開始 ---------------------------------------- 
  // 剪刀石頭布API
  rockPaperScissors(name: string, choice: string) {  
    this.websocketService.rockPaperScissors(name, choice).subscribe((response: any) => {
      if (response.message === 'Choice received from the player.') {
        this.errorMsg = '已儲存選擇';
        setTimeout(() => {
          this.errorMsg = '';
        }, 3000);
      }
    },(error: any) => {
      if (error.status === 400 && error.error && error.error.message === 'Need exactly two players for comparison.') {
        if (error.error.message === 'Need exactly two players for comparison.') {
          this.errorMsg = '至少需要兩名玩家才可以進行猜拳，請等待另一位玩家。'
            setTimeout(() => {
              this.errorMsg = '';
            }, 3000);
          } 
        } else if (error.status === 400 && error.error && error.error.message === 'Cannot store more than two players.') {
          if (error.error.message === 'Cannot store more than two players.') {
            this.errorMsg = '已經兩名玩家在等待猜拳，請先獲取結果後重試。'
              setTimeout(() => {
                this.errorMsg = '';
              }, 3000);
            this.isHideRPSButton = false;
          }
        } else if (error.status === 400 && error.error && error.error.message === 'Player name already exists in the list.') {
          if (error.error.message === 'Player name already exists in the list.') {
            this.errorMsg = '玩家已在等待猜拳中，請勿重複點選'
              setTimeout(() => {
                this.errorMsg = '';
              }, 3000);
            this.isHideRPSButton = false;
          }
        }
      }
    );
  }

  
  // 剪刀石頭布的結果API
  rockPaperScissorsResult() {
    this.websocketService.rockPaperScissorsResult().subscribe((response: any) => {
      this.finalResult = response.finalResult; 
      this.getRockPaperScissorsPlayers();
      this.showResult = true;
      this.isHideRPSButton = true
    },
    (error: any) => {
      if (error.status === 400 && error.error && error.error.message === 'Need exactly two players for comparison.') {
        if (error.error.message === 'Need exactly two players for comparison.') {
          this.errorMsg = '至少需要兩名玩家才可以進行猜拳，請等待另一位玩家。'
          this.isHideRPSButton = false;
          this.showResult = false;
          setTimeout(() => {
            this.errorMsg = '';
            }, 3000);
          } 
        } else if (error.status === 400 && error.error && error.error.message === 'Cannot store more than two players.') {
          if (error.error.message === 'Cannot store more than two players.') {
            this.errorMsg = '已經兩名玩家在等待猜拳，請先獲取結果後重試。'
            this.isHideRPSButton = false;
            this.showResult = false;
            setTimeout(() => {
              this.errorMsg = '';
              }, 3000);
          }
        }
      }
    );
  }

  // 取得剪刀石頭布的參賽名單 API
  getRockPaperScissorsPlayers() {
    this.websocketService.getRockPaperScissorsPlayers().subscribe((response:any) => {
      this.players = response.players;
    });

  }

  // 重製剪刀石頭布的參賽名單 API
  resetRockPaperScissorsPlayers() {
    this.websocketService.resetRockPaperScissorsPlayers().subscribe((response) => {
      console.log(response);
    });
  }

  //出石頭
  voteRock() {
    const name = this.rockPaperScissorsPlayerName;
    if (name.trim() === '') {
      this.voteMessage = '↑請先輸入名字後選擇剪刀/石頭/布';
      this.messageVisible = true;
      setTimeout(() => {
        this.messageVisible = false;
      }, 3000);
      return
    } else{
      const choice = 'rock';
      this.rockPaperScissors(name, choice);
      this.isVotingRPSEnded = true;
      this.showResult = false;
    }
  }

  //出布
  votePaper() {
    const name = this.rockPaperScissorsPlayerName;
    if (name.trim() === '') {
      this.voteMessage = '↑請先輸入名字後選擇剪刀/石頭/布';
      this.messageVisible = true;
      setTimeout(() => {
        this.messageVisible = false;
      }, 3000);
      return
    } else{
      const choice = 'paper';
      this.rockPaperScissors(name, choice);
      this.isVotingRPSEnded = true;
      this.showResult = false;
    }
  }

  //出剪刀
  voteScissors() {
    const name = this.rockPaperScissorsPlayerName;
    if (name.trim() === '') {
      this.voteMessage = '↑請先輸入名字後選擇剪刀/石頭/布';
      this.messageVisible = true;
      setTimeout(() => {
        this.messageVisible = false;
      }, 3000);
      return
    } else{
      const choice = 'scissors';
      this.rockPaperScissors(name, choice);
      this.isVotingRPSEnded = true;
      this.showResult = false;
    }
  }
  // 剪刀石頭布API 結束 ---------------------------------------- 
  
  
  // 抽籤API 開始 ---------------------------------------- 
  
  // Input抽籤名字的function
  submitName() {
    this.submitNameForLottery(this.lotteryName);
  }
  
  // 設定幾秒error msg隱藏的function
  clearErrorMessageAfterDelay(delayMs: number) {
    // 使用 RxJS 的 delay 操作符清除错误消息
    of(null)
      .pipe(delay(delayMs))
      .subscribe(() => {
        this.lotteryErrorMessage = ''; // 清除错误消息
      });
  }

  // 儲存抽籤名字的API 
  submitNameForLottery(lotteryName: string) {
    this.websocketService.submitNameForLottery(lotteryName).subscribe(
      () => {
        console.log(`Name submitted for lottery: ${lotteryName}`);
        this.getLotteryList();
        alert('已加入待抽籤清單')
        this.clearErrorMessageAfterDelay(3000);
      },
      (error) => {
        if(error.error.message === 'Name already exists in the lottery.') {
          alert('名單已在待抽籤清單內，請勿重複新增')
        }
        this.clearErrorMessageAfterDelay(3000);
      }
    );
  }

  // 查詢抽籤名單API
  getLotteryList() {
    this.websocketService.getLotteryList().subscribe((data) => {
      console.log('Lottery names:', data);
    });
  }
  
  // 抽籤API
  drawLottery() {
    this.websocketService.drawLottery().subscribe((data: any) => {
      if (data && data.winner && typeof data.winner === 'string') {
        this.lotteryWinner = data.winner;
        console.log('Winner:', this.lotteryWinner);
      } else {
        console.error('Invalid data structure in drawLottery response.');
      }
    },
    (error) => {
      if(error.error.message === 'No names to draw from.') {
        this.lotteryErrorMessage = '待抽獎名單為空，請先新增名單，三秒後回到首頁'
        setTimeout(() => {
          this.back()
        }, 3000);
      }
      this.isHideLotteryButton = true;
    });
  }

  //重製抽籤名單API
  resetLotteryList() {
    this.websocketService.resetLotteryList().subscribe((data) => {
      console.log(data);
    });
  }

  back() {
    this.isVotingStarted = false
    this.isVotingEnded = false;
    this.messageVisible = false;
    this.isVotingRPSEnded = false;
    this.getVoteResult = false;
    this.votingTopic = '';
    this.vote = '';
    this.voteType = '';
    this.lotteryName = '';
    this.rockPaperScissorsPlayerName = '';
    this.errorMsg = '';
    this.isHideAgreeOrDisagreeButton = false;
    this.isHideLotteryButton = false;
    this.isHideRPSButton = false;
    this.isHideVoteAgreeOrDisagree = false;
    this.isVotingEnded = false;
    this.countdown = 15;
    this.lotteryCountdown = 30;
  }
}
