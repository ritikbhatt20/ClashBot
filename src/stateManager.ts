import fs from 'fs';
import path from 'path';
import { UserState } from './types';

const STATE_FILE = path.join(__dirname, 'userState.json');

export class StateManager {
  private state: { [userId: number]: UserState };

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): { [userId: number]: UserState } {
    try {
      if (fs.existsSync(STATE_FILE)) {
        const data = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
    return {};
  }

  private saveState(): void {
    try {
      fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  getState(userId: number): UserState | undefined {
    return this.state[userId];
  }

  setState(userId: number, newState: UserState): void {
    this.state[userId] = newState;
    this.saveState();
  }

  clearState(userId: number): void {
    delete this.state[userId];
    this.saveState();
  }

  getAllState(): { [userId: number]: UserState } {
    return this.state;
  }
}
