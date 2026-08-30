/**
 * Trigonometric Quiz Audio System (Web Audio API)
 * Synthesizes all sounds without external audio assets.
 */

class QuizAudio {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.currentBgm = 'none';
        this.bgmTimer = null;
        this.bgmNodes = [];
        this.bgmElement = null;
        this.bgmPausedAt = 0;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleSound(enable) {
        this.enabled = enable !== undefined ? enable : !this.enabled;
        return this.enabled;
    }

    // 正解音（明るい2音アルペジオ）
    playCorrect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [587.33, 880]; // D5, A5

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + i * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.36, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.25);
        });
    }

    // 連続正解音：3〜4 / 5〜9 / 10+ で明確に変化
    playStreak(combo = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        let notes;
        let type = 'triangle';
        let level = 0.28;
        let step = 0.055;
        let length = 0.30;

        if (combo >= 10) {
            // 10連続以降：短いファンファーレ感のある4音
            notes = [659.25, 783.99, 987.77, 1318.51]; // E5 G5 B5 E6
            type = 'triangle';
            level = 0.34;
            step = 0.055;
            length = 0.40;
        } else if (combo >= 5) {
            // 5〜9連続：3音で勢いを強める
            notes = [622.25, 783.99, 1046.50]; // D#5 G5 C6
            type = 'triangle';
            level = 0.31;
            step = 0.06;
            length = 0.34;
        } else {
            // 3〜4連続：通常正解より一段高い2音
            notes = [659.25, 987.77]; // E5 B5
            type = 'sine';
            level = 0.30;
            step = 0.07;
            length = 0.29;
        }

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const startAt = now + i * step;

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startAt);

            gain.gain.setValueAtTime(level, startAt);
            gain.gain.exponentialRampToValueAtTime(0.001, startAt + length);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(startAt);
            osc.stop(startAt + length);
        });

        // 5連続以上は低いアタックを薄く重ねて「勢い」を付ける
        if (combo >= 5) {
            const bass = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bass.type = 'sine';
            bass.frequency.setValueAtTime(combo >= 10 ? 164.81 : 196.00, now);
            bassGain.gain.setValueAtTime(combo >= 10 ? 0.19 : 0.13, now);
            bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            bass.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bass.start(now);
            bass.stop(now + 0.22);
        }
    }

    // 裏版10連続に到達した瞬間だけ鳴る覚醒音
    playAwakening() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [
            { f: 146.83, t: 0.00, d: 0.48, v: 0.22, type: 'sawtooth' }, // D3
            { f: 293.66, t: 0.03, d: 0.42, v: 0.18, type: 'triangle' }, // D4
            { f: 440.00, t: 0.14, d: 0.42, v: 0.20, type: 'triangle' }, // A4
            { f: 587.33, t: 0.26, d: 0.48, v: 0.24, type: 'triangle' }, // D5
            { f: 880.00, t: 0.38, d: 0.58, v: 0.27, type: 'sine' },     // A5
        ];

        notes.forEach(({f, t, d, v, type}) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const st = now + t;
            osc.type = type;
            osc.frequency.setValueAtTime(f, st);
            gain.gain.setValueAtTime(v, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + d);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(st);
            osc.stop(st + d);
        });
    }

    // 不正解音（落ち着いた低音バズ）
    playIncorrect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.25);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    // タイマー警告音
    playTick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.03);
    }

    // ボタンクリック音
    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(350, now + 0.04);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }

    // 終了ファンファーレ
    playFanfare() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [
            { f: 523.25, t: 0, d: 0.15 },    // C5
            { f: 659.25, t: 0.14, d: 0.15 }, // E5
            { f: 783.99, t: 0.28, d: 0.15 }, // G5
            { f: 1046.50, t: 0.44, d: 0.6 }  // C6
        ];

        notes.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + note.t;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, start);

            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + note.d);
        });
    }

    // 結果発表音（S/A/B/Cで別音源）
    playResultRank(rank = 'C') {
        if (!this.enabled) return;
        const normalized = rank === 'S+' ? 'S' : String(rank || 'C').toUpperCase();
        const files = {
            S: 'assets/audio/result-s.wav',
            A: 'assets/audio/result-a.wav',
            B: 'assets/audio/result-b.wav',
            C: 'assets/audio/result-c.wav'
        };
        const src = files[normalized] || files.C;
        const el = new Audio(src);
        el.volume = 0.82;
        el.play().catch(() => {});
    }

    // ===== Background music (selected WAV tracks) =====
    startBgm(track = 'race') {
        this.stopBgm();
        const sources = {
            race: 'assets/audio/race.wav',
            sprint: 'assets/audio/sprint.wav',
            secret: 'assets/audio/secret-dark-hero.wav'
        };
        const src = sources[track] || sources.race;

        this.currentBgm = track;
        this.bgmElement = new Audio(src);
        this.bgmElement.loop = true;
        this.bgmElement.volume = 0.36;
        this.bgmElement.play().catch(() => {});
    }

    pauseBgm() {
        if (!this.bgmElement) return;
        this.bgmElement.pause();
        this.bgmPausedAt = this.bgmElement.currentTime || 0;
    }

    resumeBgm() {
        if (!this.bgmElement) return;
        if (this.bgmPausedAt) this.bgmElement.currentTime = this.bgmPausedAt;
        this.bgmElement.play().catch(() => {});
    }

    stopBgm() {
        if (this.bgmTimer) {
            window.clearInterval(this.bgmTimer);
            this.bgmTimer = null;
        }
        this.bgmNodes.forEach(node => {
            try { node.osc.stop(); } catch (e) {}
            try { node.osc.disconnect(); } catch (e) {}
            try { node.gain.disconnect(); } catch (e) {}
        });
        this.bgmNodes = [];

        if (this.bgmElement) {
            try { this.bgmElement.pause(); } catch (e) {}
            try { this.bgmElement.currentTime = 0; } catch (e) {}
            this.bgmElement = null;
        }
        this.bgmPausedAt = 0;
        this.currentBgm = 'none';
    }

}

window.quizAudio = new QuizAudio();
