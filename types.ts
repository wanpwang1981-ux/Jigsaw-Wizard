export interface PieceState {
  id: number;
  correctIndex: number;
  // currentIndex is no longer needed for board position, but can be used for tray order.
  currentIndex: number;
  imgX: number;
  imgY: number;
  path: string;
  placed: boolean;
}

export enum Difficulty {
  EASY = 3,
  MEDIUM = 4,
  HARD = 5,
}
