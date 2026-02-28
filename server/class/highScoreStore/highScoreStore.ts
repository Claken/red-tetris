import * as fs from 'node:fs';
import * as path from 'node:path';

const DATA_FILE = path.join(process.cwd(), 'data', 'highscores.json');

export class HighScoreStore {
  private static _instance: HighScoreStore;
  private _scores: Map<string, number> = new Map();

  private constructor() {
    this._load();
  }

  public static getInstance(): HighScoreStore {
    if (!HighScoreStore._instance) {
      HighScoreStore._instance = new HighScoreStore();
    }
    return HighScoreStore._instance;
  }

  public getHighScore(name: string): number {
    return this._scores.get(name) ?? 0;
  }

  public updateHighScore(name: string, score: number): boolean {
    const current = this._scores.get(name) ?? 0;
    if (score > current) {
      this._scores.set(name, score);
      this._save();
      return true;
    }
    return false;
  }

  public getTop5(): { name: string; score: number }[] {
    return [...this._scores.entries()]
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  private _load(): void {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const obj = JSON.parse(raw);
        for (const [name, score] of Object.entries(obj)) {
          if (typeof score === 'number') {
            this._scores.set(name, score);
          }
        }
      }
    } catch {
      this._scores = new Map();
    }
  }

  private _save(): void {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const obj: Record<string, number> = {};
      for (const [name, score] of this._scores.entries()) {
        obj[name] = score;
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save high scores:', e);
    }
  }
}
