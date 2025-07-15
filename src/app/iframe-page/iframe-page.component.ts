import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgxChessBoardView } from 'ngx-chess-board';

@Component({
  selector: 'app-iframe-page',
  templateUrl: './iframe-page.component.html',
  styleUrls: ['./iframe-page.component.css']
})
export class IframePageComponent implements OnInit, OnDestroy {
  @ViewChild('board', { static: false }) board!: NgxChessBoardView;
  
  playerId: string = '';
  isDisabled: boolean = false;
  isLightDisabled: boolean = false;
  isDarkDisabled: boolean = false;
  currentTurn: string = 'w';

  ngOnInit(): void {
    // Listen for messages from parent
    window.addEventListener('message', this.handleParentMessage.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleParentMessage.bind(this));
  }

  private handleParentMessage(event: MessageEvent): void {
    if (event.origin !== window.location.origin) return;

    const { type, fen, turn, playerId, flipped } = event.data;

    switch (type) {
      case 'init':
        this.playerId = playerId;
        this.currentTurn = turn;
        this.updateBoardState();
        
        // Handle board flipping manually
        if (flipped && this.board) {
          this.board.reverse();
        }
        
        if (fen && this.board) {
          this.board.setFEN(fen);
        }
        break;

      case 'update-board':
        this.currentTurn = turn;
        this.updateBoardState();
        if (fen && this.board) {
          this.board.setFEN(fen);
        }
        break;

      case 'update-turn':
        this.currentTurn = turn;
        this.updateBoardState();
        if (fen && this.board) {
          this.board.setFEN(fen);
        }
        break;
    }
  }

  private updateBoardState(): void {
    // Handle turn-based disabling
    if (this.playerId === 'player1') {
      // Player 1 controls white pieces
      this.isLightDisabled = this.currentTurn !== 'w';
      this.isDarkDisabled = true; // Player 1 can't move black pieces
      this.isDisabled = this.currentTurn !== 'w';
    } else {
      // Player 2 controls black pieces
      this.isLightDisabled = true; // Player 2 can't move white pieces
      this.isDarkDisabled = this.currentTurn !== 'b';
      this.isDisabled = this.currentTurn !== 'b';
    }
  }

  onMoveChange(move: any): void {
    if (this.isDisabled) return;

    // Send move to parent
    window.parent.postMessage({
      type: 'move',
      move: move,
      playerId: this.playerId
    }, window.location.origin);
  }
}
