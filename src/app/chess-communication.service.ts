import { Injectable } from '@angular/core';
import { Chess } from 'chess.js';

@Injectable({
  providedIn: 'root'
})
export class ChessCommunicationService {
  private chess = new Chess();

  constructor() {
    this.loadGameState();
  }

  makeMove(move: any): boolean {
    const result = this.chess.move(move);
    if (result) {
      this.saveGameState();
      return true;
    }
    return false;
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  getTurn(): string {
    return this.chess.turn();
  }

  getFen(): string {
    return this.chess.fen();
  }

  resetGame(): void {
    this.chess.reset();
    this.saveGameState();
  }

  private saveGameState(): void {
    localStorage.setItem('chess-game-state', this.chess.fen());
  }

  private loadGameState(): void {
    const savedState = localStorage.getItem('chess-game-state');
    if (savedState) {
      this.chess.load(savedState);
    }
  }
}
