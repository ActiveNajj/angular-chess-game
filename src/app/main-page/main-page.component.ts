import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChessCommunicationService } from '../chess-communication.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit, OnDestroy {
  iframe1Ref: HTMLIFrameElement | null = null;
  iframe2Ref: HTMLIFrameElement | null = null;
  currentTurn: string = 'w';
  gameOver: boolean = false;

  constructor(private chessService: ChessCommunicationService) {}

  ngOnInit(): void {
    this.currentTurn = this.chessService.getTurn();
    this.gameOver = this.chessService.isGameOver();
    
    // Listen for messages from iframes
    window.addEventListener('message', this.handleIframeMessage.bind(this));
    
    // Wait for iframes to load
    setTimeout(() => {
      this.iframe1Ref = document.getElementById('iframe1') as HTMLIFrameElement;
      this.iframe2Ref = document.getElementById('iframe2') as HTMLIFrameElement;
      this.initializeBoards();
    }, 1000);
  }

  ngOnDestroy(): void {
    window.removeEventListener('message', this.handleIframeMessage.bind(this));
  }

  private handleIframeMessage(event: MessageEvent): void {
    if (event.origin !== window.location.origin) return;

    const { type, move, playerId } = event.data;

    if (type === 'move') {
      // Validate move with chess service
      if (this.chessService.makeMove(move)) {
        this.currentTurn = this.chessService.getTurn();
        
        // Send move to the other iframe
        const targetIframe = playerId === 'player1' ? this.iframe2Ref : this.iframe1Ref;
        if (targetIframe) {
          targetIframe.contentWindow?.postMessage({
            type: 'update-board',
            fen: this.chessService.getFen(),
            turn: this.currentTurn
          }, window.location.origin);
        }

        // Check for game over
        if (this.chessService.isGameOver()) {
          this.gameOver = true;
          if (this.chessService.isCheckmate()) {
            this.showCheckmateAlert();
          }
        }

        // Update both boards with turn state
        this.updateBoardStates();
      }
    }
  }

  private initializeBoards(): void {
    const gameState = {
      type: 'init',
      fen: this.chessService.getFen(),
      turn: this.currentTurn
    };

    // Initialize player 1 board (white perspective)
    if (this.iframe1Ref) {
      this.iframe1Ref.contentWindow?.postMessage({
        ...gameState,
        playerId: 'player1',
        flipped: false
      }, window.location.origin);
    }

    // Initialize player 2 board (black perspective - flipped)
    if (this.iframe2Ref) {
      this.iframe2Ref.contentWindow?.postMessage({
        ...gameState,
        playerId: 'player2',
        flipped: true
      }, window.location.origin);
    }
  }

  private updateBoardStates(): void {
    const updateData = {
      type: 'update-turn',
      turn: this.currentTurn,
      fen: this.chessService.getFen()
    };

    if (this.iframe1Ref) {
      this.iframe1Ref.contentWindow?.postMessage(updateData, window.location.origin);
    }

    if (this.iframe2Ref) {
      this.iframe2Ref.contentWindow?.postMessage(updateData, window.location.origin);
    }
  }

  private showCheckmateAlert(): void {
    const winner = this.currentTurn === 'w' ? 'Black' : 'White';
    if (confirm(`Checkmate! ${winner} wins! Would you like to create a new game?`)) {
      this.createNewGame();
    }
  }

  createNewGame(): void {
    this.chessService.resetGame();
    this.currentTurn = 'w';
    this.gameOver = false;
    this.initializeBoards();
  }
}
