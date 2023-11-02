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
  
  startVoteWithTopic() {
    // 检查投票主题是否为空
    if (this.votingTopic.trim() === '') {
      // 如果主题为空，不开始投票
      return;
    }

    // 触发投票并传递主题
    this.websocketService.startVote(this.votingTopic).subscribe(() => {
      this.isVotingStarted = true; // 开始投票后显示内容
      console.log('Voting started with topic: ' + this.votingTopic);
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

  public submitVote(choice: string): any {
    if (this.vote.trim() !== '') {
      this.websocketService.submitVote(this.vote, choice).subscribe(() => {
        console.log(`Vote submitted: ${choice}`);
        this.isVotingEnded = true;
      });
    }
  }
}
