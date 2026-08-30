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

    // コンボ連続正解音（ストリーク数に応じて音が高くなる）
    playStreak(combo = 1) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const baseFreq = 523.25 * Math.pow(1.059463, Math.min(combo, 12)); // 半音ずつ上昇

        const notes = [baseFreq, baseFreq * 1.2599, baseFreq * 1.4983]; // メジャーコード

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + i * 0.06;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.22, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.35);
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
