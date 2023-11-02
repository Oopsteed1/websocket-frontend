import { Component, OnInit } from '@angular/core';
import { WebsocketService } from '../websocket.service';

@Component({
  selector: 'app-vote',
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss']
})
export class VoteComponent implements OnInit {
  vote: string = '';
  message: string = '';
  isVotingStarted: boolean = false;
  isVotingEnded: boolean  = false;
  votingTopic: string = '';
  voteTopic: string | null = null; // 初始化为 null 或其他默认值
  voteType: string | null = null;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    const socket = this.websocketService.connect();

    socket.subscribe(
      (message) => {
        this.message = message;
        if (message.includes('Voting has started')) {
          this.isVotingStarted = true;
        } else if (message.includes('Voting has ended')) {
          this.isVotingStarted = false;
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );

  }
  startVote(voteType: string, topic: string) {
    this.voteType = voteType;
    if (topic.trim() === '') {
      // 如果主题为空，不开始投票
      return;
    }
  
    this.websocketService.startVote(voteType, topic).subscribe((response: any) => {
      if (response.message) {
        const match = response.message.match(/Voting started for .+ with topic: (.+)\./);
        if (match) {
          this.voteTopic = match[1];
          this.isVotingStarted = true; // 设置投票已经开始
        }
      }
    });
  }

  endVote() {
    this.websocketService.endVote().subscribe(() => {
      console.log('Voting ended.');
    });
  }

  voteAgree() {
    this.submitVote('agree'); 
  }
  
  voteDisagree() {
    this.submitVote('disagree');
  }

  voteRock() {
    this.submitVote('rock');
  }

  votePaper() {
    this.submitVote('paper');
  }

  voteScissors() {
    this.submitVote('scissors');
  }
  public submitVote(choice: string): any {
    if (this.vote.trim() !== '') {
      this.websocketService.submitVote(this.vote, choice).subscribe(() => {
        console.log(`Vote submitted: ${choice}`);
        this.isVotingEnded = true;
      });
    }
  }
}
