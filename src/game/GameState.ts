import { TrainData } from './TrainData';

export interface GameState {
  playerCount: number;
  trains: TrainData[];
  engineValue: number;
}
