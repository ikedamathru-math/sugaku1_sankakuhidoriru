
function setPointPNavigator(state = 'guide') {
    const img = document.getElementById('point-p-image');
    if (!img) return;
    img.src = 'assets/point-p/default.svg';
}


/**
 * Trigonometric Ratio Quiz Application Controller
 */

class TrigQuizApp {
    constructor() {
        this.audio = window.quizAudio;
        this.visualizer = null;
        this.referenceVisualizer = null;
        this.referenceGuideVisualizer = null;
        this.referenceGuideFunc = 'all';
        this.referenceGuideAngle = 45;
        this.lastScreenBeforeReference = 'start';

        // Settings State
        this.mode = '20-challenge'; // '20-challenge' | '3min-challenge'
        this.answerType = 'choice4'; // 'choice4' | 'palette'
        this.targetFunctions = ['sin', 'cos', 'tan']; // Array of selected functions
        this.angleRange = '180'; // fixed: 0°〜180°
        this.timeLimitSetting = 10; // 3, 5, 10, or 0 (unlimited)
        this.useRationalized = false; // true: √2/2, false: 1/√2
        this.bgmTrack = 'race';
        this.bgmEnabled = false;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.globalTimerInterval = null;
        this.globalTimeLeft = 120;
        this.globalChallengeEnded = false;

        // Quiz State
        this.currentQuestion = null;
        this.questionIndex = 0;
        this.quizStartedAt = Date.now();
        this.quizFinishedAt = 0;
        this.totalPausedMs = 0;
        this.totalQuestions = 20;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.lives = 3;
        this.isAnswered = false;
        this.history = []; // Array of { angle, func, selected, correct, isCorrect, timeTakenMs }
        // Dual answer state
        this.selectedAngle = null; // angle chosen on unit‑circle
        this.selectedChoiceId = null; // valueId chosen from 4‑choice
        this.clickedChoiceBtn = null; // reference to the button element
        this.timerInterval = null;
        this.autoAdvanceTimer = null;
        this.awaitingTapAdvance = false;
        this.timeLeft = 10;
        this.timePerQuestion = 10;
        this.questionStartTime = 0;
        this.reviewQueue = null;
        this.isReviewSession = false;
        this.quizStartedAt = 0;
        this.quizFinishedAt = 0;
        this.totalPausedMs = 0;

        // Cache DOM elements
        this.dom = {
            // Screens
            startScreen: document.getElementById('start-screen'),
            quizScreen: document.getElementById('quiz-screen'),
            resultScreen: document.getElementById('result-screen'),
            referenceScreen: document.getElementById('reference-screen'),
            referenceModal: document.getElementById('reference-modal'),

            // Header elements
            btnSound: document.getElementById('btn-sound'),
            btnReference: document.getElementById('btn-reference'),
            btnReferenceBack: document.getElementById('btn-reference-back'),
            headerBgmSelect: document.getElementById('header-bgm-select'),
            btnBgmToggle: document.getElementById('btn-bgm-toggle'),

            // Start screen controls
            modeTabs: document.querySelectorAll('.mode-tab'),
            answerTypeInputs: document.querySelectorAll('input[name="answer-type"]'),
            funcCheckboxes: document.querySelectorAll('input[name="filter-func"]'),
            timeLimitInputs: document.querySelectorAll('input[name="time-limit"]'),
            rationalizeToggle: document.getElementById('toggle-rationalize'),
            btnStartQuiz: document.getElementById('btn-start-quiz'),
            personalBestTime: document.getElementById('personal-best-time'),
            personalBestDetail: document.getElementById('personal-best-detail'),
            personalBestRankMark: document.getElementById('personal-best-rank-mark'),
            personalBestNote: document.getElementById('personal-best-note'),

            // Quiz screen elements
            quizModeBadge: document.getElementById('quiz-mode-badge'),
            quizProgressText: document.getElementById('quiz-progress-text'),
            globalTimerText: document.getElementById('global-timer-text'),
            timerContainer: document.getElementById('timer-container'),
            timerBar: document.getElementById('timer-bar'),
            visualTimer: document.getElementById('visual-timer'),
            livesContainer: document.getElementById('lives-container'),
            livesDisplay: document.getElementById('lives-display'),
            questionFunc: document.getElementById('question-func'),
            questionAngle: document.getElementById('question-angle'),
            comboBadge: document.getElementById('combo-badge'),
            choicesContainer: document.getElementById('choices-container'),
            paletteContainer: document.getElementById('palette-container'),
            explanationCard: document.getElementById('explanation-card'),
            explanationText: document.getElementById('explanation-text'),
            btnNextQuestion: document.getElementById('btn-next-question'),
            tapNextHint: document.getElementById('tap-next-hint'),
            btnQuitQuiz: document.getElementById('btn-quit-quiz'),

            // Result screen elements
            resultRankBadge: document.getElementById('result-rank-badge'),
            resultScoreText: document.getElementById('result-score-text'),
            resultAccuracyText: document.getElementById('result-accuracy-text'),
            resultMaxStreakText: document.getElementById('result-max-streak-text'),
            resultHistoryList: document.getElementById('result-history-list'),
            learningAnalysis: document.getElementById('learning-analysis'),
            btnReviewWrong: document.getElementById('btn-review-wrong'),
            btnRestartQuiz: document.getElementById('btn-restart-quiz'),
            btnBackToHome: document.getElementById('btn-back-to-home'),

            // Reference Modal
            referenceTableBody: document.getElementById('reference-table-body'),
            btnCloseReference: document.getElementById('btn-close-reference'),
            referenceExplanation: document.getElementById('reference-explanation'),
            referenceSideSinAngle: document.getElementById('reference-side-sin-angle'),
            referenceSideCosAngle: document.getElementById('reference-side-cos-angle'),
            referenceSideTanAngle: document.getElementById('reference-side-tan-angle'),
            referenceSideSinValue: document.getElementById('reference-side-sin-value'),
            referenceSideCosValue: document.getElementById('reference-side-cos-value'),
            referenceSideTanValue: document.getElementById('reference-side-tan-value'),
            circleAnswerSection: document.getElementById('circle-answer-section'),
            choiceAnswerSection: document.getElementById('choice-answer-section'),
            paletteAnswerSection: document.getElementById('palette-answer-section'),
            stepAngleLabel: document.getElementById('step-angle-label'),
            stepValueLabel: document.getElementById('step-value-label'),
            stopChoiceButtons: document.getElementById('stop-choice-buttons'),
            btnStopResume: document.getElementById('btn-stop-resume'),
            btnStopHome: document.getElementById('btn-stop-home'),
            // Confetti
            confettiCanvas: document.getElementById('confetti-canvas')
        };

        this.init();
    }

    init() {
        // 単位円の点クリックでの選択コールバックを登録
        this.visualizer = new UnitCircleVisualizer('quiz-unit-circle', (deg, pointEl) => this.handleCircleSelect(deg, pointEl));
        this.referenceVisualizer = new UnitCircleVisualizer('reference-unit-circle');

        this.bindEvents();
        this.bindViewportFit();
        this.bindAudioUnlock();
        this.buildReferenceTable();
        this.updateSettingsFromUI();
        this.syncSelectionCards();
        this.updatePersonalBestDisplay();
        requestAnimationFrame(() => this.fitStartScreenToViewport());
        this.initReferenceGuide();
        if (this.dom.btnBgmToggle) {
            this.dom.btnBgmToggle.textContent = this.bgmEnabled ? '効果音 ON' : '効果音 OFF';
        }
        // BGM is fixed to the single track '全力疾走'
        this.bgmTrack = 'race';
}


    bindViewportFit() {
        const refit = () => requestAnimationFrame(() => this.fitStartScreenToViewport());
        window.addEventListener('resize', refit);
        window.addEventListener('orientationchange', refit);
    }

    bindAudioUnlock() {
        const unlock = () => {
            this.audio.init();
            document.removeEventListener('click', unlock);
            document.removeEventListener('touchstart', unlock);
        };
        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('touchstart', unlock, { once: true });
    }

    syncSelectionCards() {
        this.dom.answerTypeInputs.forEach(input => {
            const card = input.closest('.pill-option');
            if (card) card.classList.toggle('selected-card', input.checked);
        });
        this.dom.funcCheckboxes.forEach(input => {
            const card = input.closest('.pill-option');
            if (card) card.classList.toggle('selected-card', input.checked);
        });
        this.dom.timeLimitInputs.forEach(input => {
            const card = input.closest('.pill-option');
            if (card) card.classList.toggle('selected-card', input.checked);
        });
    }

    bindEvents() {
        // Mode Tabs
        this.dom.modeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.audio.playClick();
                this.dom.modeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.mode = tab.dataset.mode;
            });
        });

        // Answer Type (4-Choice vs Palette)
        this.dom.answerTypeInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.audio.playClick();
                this.answerType = input.value;
                this.syncSelectionCards();
            });
        });

        // Function filters
        this.dom.funcCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                this.audio.playClick();
                this.updateSettingsFromUI();
                this.syncSelectionCards();
            });
        });

        // Time limit settings
        this.dom.timeLimitInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.audio.playClick();
                this.timeLimitSetting = parseInt(input.value, 10);
                this.syncSelectionCards();
            });
        });

        // Rationalization toggle
        if (this.dom.rationalizeToggle) {
            this.dom.rationalizeToggle.addEventListener('change', (e) => {
                this.audio.playClick();
                this.useRationalized = e.target.checked;
                this.buildReferenceTable();
                if (this.currentQuestion) {
                    if (this.answerType === 'choice4') this.render4Choices();
                    else this.renderPalette();
                }
            });
        }

        if (this.dom.btnSound) {
            this.dom.btnSound.textContent = this.audio.enabled ? '操作音 ON' : '操作音 OFF';
            this.dom.btnSound.classList.toggle('active', this.audio.soundEnabled);
        }

        // Sound toggle
        this.dom.btnSound.addEventListener('click', () => {
            const enabled = this.audio.toggleSound();
            this.dom.btnSound.textContent = enabled ? '操作音 ON' : '操作音 OFF';
            this.dom.btnSound.classList.toggle('active', enabled);
            if (enabled) this.audio.playClick();
        });

        // Header BGM controls
        if (this.dom.headerBgmSelect) {
            this.dom.headerBgmSelect.addEventListener('change', () => {
                this.bgmTrack = this.dom.headerBgmSelect.value;
                localStorage.setItem('trig-quiz-bgm-track', this.bgmTrack);
                if (this.bgmEnabled) this.audio.startBgm(this.bgmTrack);
            });
        }
        if (this.dom.btnBgmToggle) {
            this.dom.btnBgmToggle.addEventListener('click', () => {
                this.audio.playClick();
                this.bgmEnabled = !this.bgmEnabled;
                this.dom.btnBgmToggle.textContent = this.bgmEnabled ? '効果音 ON' : '効果音 OFF';
                this.dom.btnBgmToggle.classList.toggle('active', this.bgmEnabled);
                if (this.bgmEnabled) this.audio.startBgm(this.bgmTrack);
                else this.audio.stopBgm();
            });
        }
        // Reference Sheet Screen
        this.dom.btnReference.addEventListener('click', () => {
            this.audio.playClick();
            this.showReferenceModal();
        });
        if (this.dom.btnReferenceBack) {
            this.dom.btnReferenceBack.addEventListener('click', () => {
                this.audio.playClick();
                this.hideReferenceModal();
            });
        }
        if (this.dom.btnCloseReference) {
            this.dom.btnCloseReference.addEventListener('click', () => {
                this.audio.playClick();
                this.hideReferenceModal();
            });
        }

        // Start Quiz Button
        this.dom.btnStartQuiz.addEventListener('click', () => {
            this.audio.playClick();
            this.startQuiz();
        });

        // Next Question Button (Manual skip)
        this.dom.btnNextQuestion.addEventListener('click', () => {
            this.clearAutoAdvance();
            this.audio.playClick();
            this.nextQuestion();
        });

        this.dom.quizScreen.addEventListener('click', (event) => {
            if (this.isPaused) {
                if (event.target.closest('#btn-quit-quiz')) return;
                if (event.target.closest('#btn-stop-home')) return;
                if (!event.target.closest('#btn-stop-resume')) this.dom.btnStopResume?.click();
                return;
            }
            if (!this.awaitingTapAdvance || !this.isAnswered || this.isPaused) return;
            if (event.target.closest('#stop-control-wrap')) return;
            this.awaitingTapAdvance = false;
            if (this.dom.tapNextHint) this.dom.tapNextHint.style.display = 'none';
            this.audio.playClick();
            this.nextQuestion();
        });

        // Stop / pause controls: keep the question visible
        this.dom.btnQuitQuiz.addEventListener('click', () => {
            if (this.isPaused) return;
            this.clearAutoAdvance();
            this.stopTimer();
            this.audio.playClick();
            this.audio.pauseBgm();
            this.isPaused = true;
            this.pauseStartedAt = Date.now();
            this.dom.quizScreen.classList.add('quiz-paused');
            this.dom.btnQuitQuiz.style.display = 'none';
            if (this.dom.stopChoiceButtons) this.dom.stopChoiceButtons.style.display = 'flex';
        });

        if (this.dom.btnStopResume) {
            this.dom.btnStopResume.addEventListener('click', () => {
                if (!this.isPaused) return;
                this.audio.playClick();
                const pausedMs = this.pauseStartedAt ? Date.now() - this.pauseStartedAt : 0;
                this.questionStartTime += pausedMs;
                this.totalPausedMs += pausedMs;
                this.isPaused = false;
                this.pauseStartedAt = 0;
                this.dom.quizScreen.classList.remove('quiz-paused');
                this.dom.btnQuitQuiz.style.display = 'inline-flex';
                if (this.dom.stopChoiceButtons) this.dom.stopChoiceButtons.style.display = 'none';
                this.resumeTimer();
                if (this.bgmEnabled) this.audio.resumeBgm();
            });
        }
        if (this.dom.btnStopHome) {
            this.dom.btnStopHome.addEventListener('click', () => {
                this.audio.playClick();
                this.isPaused = false;
                this.pauseStartedAt = 0;
                this.dom.quizScreen.classList.remove('quiz-paused');
                this.dom.btnQuitQuiz.style.display = 'inline-flex';
                if (this.dom.stopChoiceButtons) this.dom.stopChoiceButtons.style.display = 'none';
                this.audio.stopBgm();
                this.showScreen('start');
            });
        }

        // Restart Quiz Button
        this.dom.btnRestartQuiz.addEventListener('click', () => {
            this.clearAutoAdvance();
            this.audio.playClick();
            this.startQuiz();
        });

        // Back to Home Button
        this.dom.btnBackToHome.addEventListener('click', () => {
            this.clearAutoAdvance();
            this.audio.playClick();
            this.showScreen('start');
        });

        // Review only missed questions
        if (this.dom.btnReviewWrong) {
            this.dom.btnReviewWrong.addEventListener('click', () => {
                this.audio.playClick();
                this.startWrongReview();
            });
        }

        // Keyboard navigation
        window.addEventListener('keydown', (e) => {
            if (this.dom.quizScreen.classList.contains('active')) {
                if (!this.isAnswered) {
                    if (['1', '2', '3', '4'].includes(e.key)) {
                        const index = parseInt(e.key) - 1;
                        const buttons = this.dom.choicesContainer.querySelectorAll('.choice-btn');
                        if (buttons[index]) {
                            buttons[index].click();
                        }
                    }
                } else if (this.isAnswered && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    this.clearAutoAdvance();
                    this.nextQuestion();
                }
            }
        });
    }

    updateSettingsFromUI() {
        const checkedFuncs = Array.from(this.dom.funcCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (checkedFuncs.length === 0) {
            this.dom.funcCheckboxes[0].checked = true;
            this.targetFunctions = ['sin'];
        } else {
            this.targetFunctions = checkedFuncs;
        }

        const selectedTimeLimit = document.querySelector('input[name="time-limit"]:checked');
        if (selectedTimeLimit) {
            this.timeLimitSetting = parseInt(selectedTimeLimit.value, 10);
        }
    }


    initReferenceGuide() {
        if (this.dom.referenceScreen && !this.referenceGuideVisualizer) {
            this.referenceGuideVisualizer = new window.UnitCircleVisualizer(
                'reference-guide-circle',
                (deg) => this.updateReferenceGuide(deg)
            );
            this.referenceGuideVisualizer.setInteractive(true);
            this.updateReferenceGuide(45);
        }
    }

    updateReferenceGuide(deg) {
        if (!window.TRIG_DATA || !window.TRIG_DATA[deg]) return;
        this.referenceGuideAngle = deg;
        const data = window.TRIG_DATA[deg];

        if (this.referenceGuideVisualizer) {
            this.referenceGuideVisualizer.update(deg, 'all');
            this.referenceGuideVisualizer.setInteractive(true);
        }

        if (this.dom.referenceCurrentAngle) {
            this.dom.referenceCurrentAngle.textContent = `${deg}°`;
        }
        if (this.dom.referenceSinValue) {
            this.dom.referenceSinValue.innerHTML = window.formatValueHtml(data.sin.valueId, this.useRationalized);
        }
        if (this.dom.referenceCosValue) {
            this.dom.referenceCosValue.innerHTML = window.formatValueHtml(data.cos.valueId, this.useRationalized);
        }
        if (this.dom.referenceTanValue) {
            this.dom.referenceTanValue.innerHTML = window.formatValueHtml(data.tan.valueId, this.useRationalized);
        }
        if (this.dom.referenceSinAngle) this.dom.referenceSinAngle.textContent = `${deg}°`;
        if (this.dom.referenceCosAngle) this.dom.referenceCosAngle.textContent = `${deg}°`;
        if (this.dom.referenceTanAngle) this.dom.referenceTanAngle.textContent = `${deg}°`;
        if (this.dom.referenceSideSinAngle) this.dom.referenceSideSinAngle.textContent = `${deg}°`;
        if (this.dom.referenceSideCosAngle) this.dom.referenceSideCosAngle.textContent = `${deg}°`;
        if (this.dom.referenceSideTanAngle) this.dom.referenceSideTanAngle.textContent = `${deg}°`;
        if (this.dom.referenceSideSinValue) {
            this.dom.referenceSideSinValue.innerHTML = window.formatValueHtml(data.sin.valueId, this.useRationalized);
            this.dom.referenceSideSinValue.classList.toggle('is-integer-value', ['-1', '0', '1'].includes(data.sin.valueId));
        }
        if (this.dom.referenceSideCosValue) {
            this.dom.referenceSideCosValue.innerHTML = window.formatValueHtml(data.cos.valueId, this.useRationalized);
            this.dom.referenceSideCosValue.classList.toggle('is-integer-value', ['-1', '0', '1'].includes(data.cos.valueId));
        }
        if (this.dom.referenceSideTanValue) {
            this.dom.referenceSideTanValue.innerHTML = window.formatValueHtml(data.tan.valueId, this.useRationalized);
            this.dom.referenceSideTanValue.classList.toggle('is-integer-value', ['-1', '0', '1'].includes(data.tan.valueId));
        }
        if (this.dom.referenceExplanation) {
            this.dom.referenceExplanation.innerHTML = '';
        }
    }

    fitStartScreenToViewport() {
        const card = this.dom.startScreen?.querySelector('.settings-card');
        if (!card) return;
        card.style.zoom = '1';
        card.style.transform = '';
        card.style.width = '';
    }

    showScreen(screenName) {
        this.dom.startScreen.classList.remove('active');
        this.dom.quizScreen.classList.remove('active');
        this.dom.resultScreen.classList.remove('active');
        if (this.dom.referenceScreen) this.dom.referenceScreen.classList.remove('active');

        if (screenName === 'start') {
            this.dom.startScreen.classList.add('active');
            this.stopGlobalChallengeTimer();
            this.audio.stopBgm();
            requestAnimationFrame(() => this.fitStartScreenToViewport());
        }
        if (screenName === 'quiz') this.dom.quizScreen.classList.add('active');
        if (screenName === 'reference' && this.dom.referenceScreen) {
            this.dom.referenceScreen.classList.add('active');
        }
        if (screenName === 'result') {
            this.dom.resultScreen.classList.add('active');
            this.audio.stopBgm();
        }
    }

    // ==========================================
    // Quiz Flow Management
    // ==========================================

    startQuiz() {
        this.clearAutoAdvance();
        this.stopGlobalChallengeTimer();
        this.updateSettingsFromUI();
        this.quizStartedAt = Date.now();
        this.quizFinishedAt = 0;
        this.totalPausedMs = 0;
        this.questionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.lives = 3;
        this.history = [];
        this.reviewQueue = null;
        this.isReviewSession = false;
        this.isAnswered = false;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.dom.quizScreen.classList.remove('quiz-paused');
        this.dom.quizScreen.classList.toggle('three-minute-mode', this.mode === '3min-challenge');
        this.dom.btnQuitQuiz.style.display = 'inline-flex';
        if (this.dom.stopChoiceButtons) this.dom.stopChoiceButtons.style.display = 'none';

        // UI Setup for Mode

        if (this.mode === '20-challenge') {
            this.totalQuestions = 20;
            const timeDesc = this.timeLimitSetting > 0 ? ` (${this.timeLimitSetting}秒/問)` : ' (時間無制限)';
            this.dom.quizModeBadge.textContent = `⚡ 20問コース${timeDesc}`;
            this.dom.timerContainer.style.display = this.timeLimitSetting > 0 ? 'block' : 'none';
            this.dom.livesContainer.style.display = 'none';
            this.timePerQuestion = this.timeLimitSetting > 0 ? this.timeLimitSetting : 10;
            if (this.dom.globalTimerText) this.dom.globalTimerText.style.display = 'none';
        } else if (this.mode === '3min-challenge') {
            this.totalQuestions = Number.POSITIVE_INFINITY;
            this.timeLimitSetting = 0;
            this.dom.quizModeBadge.textContent = '⏱️ 2分チャレンジ';
            this.dom.timerContainer.style.display = 'none';
            this.dom.livesContainer.style.display = 'none';
            this.timePerQuestion = 0;
            this.globalTimeLeft = 120;
            this.globalChallengeEnded = false;
            if (this.dom.globalTimerText) {
                this.dom.globalTimerText.style.display = 'none';
                this.dom.globalTimerText.textContent = '残り 2:00';
            }
        }

        this.showScreen('quiz');

        // スマホでトップ画面下部のスタートボタンを押しても、
        // クイズ開始時には必ず三角比の問題が見える位置へ戻す。
        if (window.matchMedia('(max-width: 760px)').matches) {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            requestAnimationFrame(() => {
                this.dom.quizScreen.scrollIntoView({
                    behavior: 'auto',
                    block: 'start'
                });
            });
        }

        if (this.bgmEnabled) this.audio.startBgm(this.bgmTrack);
        if (this.mode === '3min-challenge') this.startGlobalChallengeTimer();
        this.nextQuestion();
    }

    updateLivesDisplay() {
        let hearts = '';
        for (let i = 0; i < 3; i++) {
            hearts += i < this.lives ? '❤️' : '🖤';
        }
        this.dom.livesDisplay.textContent = hearts;
    }

    toFullWidthNumber(value) {
        return String(value).replace(/[0-9]/g, digit => String.fromCharCode(digit.charCodeAt(0) + 0xFEE0));
    }

    nextQuestion() {
        this.clearAutoAdvance();
        this.awaitingTapAdvance = false;
        if (this.dom.tapNextHint) this.dom.tapNextHint.style.display = 'none';

        // Check game end conditions
        if (this.isReviewSession && this.questionIndex >= this.totalQuestions) {
            this.finishQuiz();
            return;
        }
        if (this.mode === '20-challenge' && this.questionIndex >= this.totalQuestions) {
            this.finishQuiz();
            return;
        }
        if (this.mode === '3min-challenge' && this.globalChallengeEnded) {
            this.finishQuiz();
            return;
        }
        if (this.mode === 'endless' && this.lives <= 0) {
            this.finishQuiz();
            return;
        }

        this.questionIndex++;
        this.isAnswered = false;
        // Reset dual-answer state for new question
        this.selectedAngle = null;
        this.selectedChoiceId = null;
        this.clickedChoiceBtn = null;
        this.dom.explanationCard.classList.remove('active');
        this.dom.btnNextQuestion.style.display = 'none';

        // Update progress bar
        if (this.isReviewSession || this.mode === '20-challenge') {
            this.dom.quizProgressText.textContent = `${this.toFullWidthNumber(this.questionIndex)}問目`;
        } else if (this.mode === '3min-challenge') {
            const correctSoFar = this.history.filter(h => h.isCorrect).length;
            this.dom.quizProgressText.textContent = `正解 ${this.toFullWidthNumber(correctSoFar)}問`;
        } else {
            this.dom.quizProgressText.textContent = `${this.toFullWidthNumber(this.questionIndex)}問目`;
        }

        // Generate next question
        this.currentQuestion = this.generateQuestion();
        this.renderQuestion();
        this.startTimer();
    }

    generateQuestion() {
        if (this.reviewQueue && this.reviewQueue.length > 0) {
            const q = this.reviewQueue.shift();
            const data = window.TRIG_DATA[q.angle][q.func];
            return {
                angle: q.angle,
                func: q.func,
                correctValueId: data.valueId,
                explanation: data.explanation
            };
        }

        const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];

        const funcs = this.targetFunctions;

        let angle, func;
        let attempts = 0;
        do {
            angle = angles[Math.floor(Math.random() * angles.length)];
            func = funcs[Math.floor(Math.random() * funcs.length)];
            attempts++;
        } while (
            attempts < 10 &&
            this.currentQuestion &&
            this.currentQuestion.angle === angle &&
            this.currentQuestion.func === func
        );

        const data = window.TRIG_DATA[angle][func];
        const correctValueId = data.valueId;

        return {
            angle,
            func,
            correctValueId,
            explanation: data.explanation
        };
    }

    renderQuestion() {
        setPointPNavigator('guide');
        if (this.dom.quizScreen) {
            this.dom.quizScreen.classList.toggle('palette-mode', this.answerType === 'palette');
            this.dom.quizScreen.classList.toggle('choice-mode', this.answerType !== 'palette');
        }
        if (this.answerType === 'palette') {
            if (this.dom.circleAnswerSection) this.dom.circleAnswerSection.style.display = 'none';
            if (this.dom.choiceAnswerSection) this.dom.choiceAnswerSection.style.display = 'none';
            if (this.dom.paletteAnswerSection) this.dom.paletteAnswerSection.style.display = 'block';
        } else {
            if (this.dom.circleAnswerSection) this.dom.circleAnswerSection.style.display = 'flex';
            if (this.dom.choiceAnswerSection) this.dom.choiceAnswerSection.style.display = 'flex';
            if (this.dom.paletteAnswerSection) this.dom.paletteAnswerSection.style.display = 'none';
        }
        if (this.dom.stepAngleLabel) this.dom.stepAngleLabel.textContent = '① 角度の位置を選ぶ';
        if (this.dom.stepValueLabel) this.dom.stepValueLabel.textContent = '② 値を選ぶ';

        // Question display
        this.dom.questionFunc.textContent = `${this.currentQuestion.func}`;
        this.dom.questionFunc.className = `q-func func-${this.currentQuestion.func}`;
        // Show the angle so user knows which position to select on the unit circle
        this.dom.questionAngle.textContent = `${this.currentQuestion.angle}°`;

        // Unit circle: hide dynamic layer, enable interactive points
        this.visualizer.hideDynamic();

        // Answer panel
        if (this.answerType === 'palette') {
            this.dom.choicesContainer.style.display = 'none';
            this.dom.paletteContainer.style.display = 'flex';
            this.renderPalette();
        } else {
            this.dom.choicesContainer.style.display = 'grid';
            this.dom.paletteContainer.style.display = 'none';
            this.render4Choices();
        }

        // Show hint prompt
        this.updateDualHint();
    }


    render4Choices() {
        const correctId = this.currentQuestion.correctValueId;
        const allIds = Object.keys(window.VALUE_DEFS);

        let candidates = allIds.filter(id => id !== correctId);

        let distractors = [];
        if (correctId.startsWith('-')) {
            const posId = correctId.slice(1);
            if (candidates.includes(posId)) distractors.push(posId);
        } else if (correctId !== '0' && correctId !== 'none') {
            const negId = `-${correctId}`;
            if (candidates.includes(negId)) distractors.push(negId);
        }

        const remaining = candidates
            .filter(id => !distractors.includes(id))
            .sort(() => Math.random() - 0.5);

        while (distractors.length < 3 && remaining.length > 0) {
            distractors.push(remaining.pop());
        }

        const choices = [correctId, ...distractors].sort(() => Math.random() - 0.5);

        this.dom.choicesContainer.innerHTML = '';
        choices.forEach((valueId, idx) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.dataset.valueId = valueId;
            btn.innerHTML = `
                <span class="choice-num">${idx + 1}</span>
                <span class="choice-val">${window.formatValueHtml(valueId, this.useRationalized)}</span>
            `;
            btn.addEventListener('click', () => this.handleChoiceSelect(valueId, btn));
            this.dom.choicesContainer.appendChild(btn);
        });
    }

    renderPalette() {
        const rowSinCos = ['-1', '-sqrt3/2', '-1/sqrt2', '-1/2', '0', '1/2', '1/sqrt2', 'sqrt3/2', '1'];
        const rowTan = ['-sqrt3', '-1', '-1/sqrt3', '0', '1/sqrt3', '1', 'sqrt3', 'none'];

        this.dom.paletteContainer.innerHTML = `
            <div class="palette-row-block">
                <div class="palette-row-title">sin / cos の値</div>
                <div class="palette-row-grid row-sin-cos" id="palette-row-1"></div>
            </div>
            <div class="palette-row-block">
                <div class="palette-row-title">tan の値</div>
                <div class="palette-row-grid row-tan" id="palette-row-2"></div>
            </div>
        `;

        const row1El = this.dom.paletteContainer.querySelector('#palette-row-1');
        const row2El = this.dom.paletteContainer.querySelector('#palette-row-2');

        rowSinCos.forEach(valueId => {
            const btn = document.createElement('button');
            btn.className = 'palette-btn';
            btn.dataset.valueId = valueId;
            btn.innerHTML = window.formatValueHtml(valueId, this.useRationalized);
            btn.addEventListener('click', () => this.handlePaletteSelect(valueId, btn));
            row1El.appendChild(btn);
        });

        rowTan.forEach(valueId => {
            const btn = document.createElement('button');
            btn.className = 'palette-btn';
            btn.dataset.valueId = valueId;
            btn.innerHTML = window.formatValueHtml(valueId, this.useRationalized);
            btn.addEventListener('click', () => this.handlePaletteSelect(valueId, btn));
            row2El.appendChild(btn);
        });
    }

    startGlobalChallengeTimer() {
        this.stopGlobalChallengeTimer();
        this.globalTimeLeft = 120;
        this.globalChallengeEnded = false;
        this.updateGlobalChallengeDisplay();

        this.globalTimerInterval = setInterval(() => {
            if (this.isPaused) return;
            this.globalTimeLeft -= 0.1;
            if (this.globalTimeLeft <= 0) {
                this.globalTimeLeft = 0;
                this.globalChallengeEnded = true;
                this.updateGlobalChallengeDisplay();
                this.stopGlobalChallengeTimer();
                this.stopTimer();
                this.clearAutoAdvance();
                this.finishQuiz();
                return;
            }
            this.updateGlobalChallengeDisplay();
        }, 100);
    }

    stopGlobalChallengeTimer() {
        if (this.globalTimerInterval) {
            clearInterval(this.globalTimerInterval);
            this.globalTimerInterval = null;
        }
    }

    updateGlobalChallengeDisplay() {
        if (this.mode !== '3min-challenge') return;
        const seconds = Math.max(0, Math.ceil(this.globalTimeLeft));
        const min = Math.floor(seconds / 60);
        const sec = String(seconds % 60).padStart(2, '0');
        if (this.dom.globalTimerText) {
            this.dom.globalTimerText.textContent = `残り ${min}:${sec}`;
        }
        const challengeTimeText = document.getElementById('challenge-time-text');
        if (challengeTimeText) challengeTimeText.textContent = `${min}:${sec}`;
    }

    startTimer() {
        this.stopTimer();
        this.questionStartTime = Date.now();

        if (this.dom.visualTimer) {
            this.dom.visualTimer.style.display = this.mode === '3min-challenge'
                ? 'inline-flex'
                : ((this.isReviewSession || this.timeLimitSetting <= 0) ? 'none' : 'inline-flex');
            this.dom.visualTimer.style.setProperty('--remaining', 1);
            this.dom.visualTimer.style.setProperty('--elapsed', 0);
            this.dom.visualTimer.style.setProperty('--remaining-angle', '360deg');
            this.dom.visualTimer.style.setProperty('--elapsed-angle', '0deg');
            this.dom.visualTimer.classList.remove('warning');
            this.dom.visualTimer.classList.remove('watching');
        }

        if (this.isReviewSession || this.timeLimitSetting <= 0) return;

        this.timeLeft = this.timePerQuestion;
        this.dom.timerBar.style.width = '100%';
        this.dom.timerBar.classList.remove('warning');

        this.resumeTimer();
    }

    resumeTimer() {
        if (this.isReviewSession || this.timeLimitSetting <= 0 || this.isAnswered || this.isPaused) return;

        this.stopTimer();

        this.timerInterval = setInterval(() => {
            this.timeLeft -= 0.1;
            const pct = Math.max(0, (this.timeLeft / this.timePerQuestion) * 100);
            this.dom.timerBar.style.width = `${pct}%`;
            if (this.dom.visualTimer) {
                const remaining = pct / 100;
                this.dom.visualTimer.style.setProperty('--remaining', remaining);
                this.dom.visualTimer.style.setProperty('--elapsed', 1 - remaining);
                this.dom.visualTimer.style.setProperty('--remaining-angle', `${pct * 3.6}deg`);
                this.dom.visualTimer.style.setProperty('--elapsed-angle', `${(1 - remaining) * 360}deg`);
                const isWatching = pct <= 50;
                this.dom.visualTimer.classList.toggle('watching', isWatching);
            }

            if (this.timeLeft <= 2.5 && !this.dom.timerBar.classList.contains('warning')) {
                this.dom.timerBar.classList.add('warning');
                if (this.dom.visualTimer) this.dom.visualTimer.classList.add('warning');
                this.audio.playTick();
            }

            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    clearAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
    }

    // ユーザーが単位円上の点をクリックしたとき
    handleCircleSelect(deg, pointEl) {
        if (this.isAnswered || this.isPaused || this.answerType === 'palette') return;
        this.selectedAngle = deg;

        this.visualizer.container.querySelectorAll('.circle-point-group').forEach(g => g.classList.remove('selected'));
        pointEl.classList.add('selected');

        this.updateDualHint();
        this.tryFinalizeAnswer();
    }

    updateDualHint() {
        // Guidance labels remain fixed above their answer areas.
    }

    // ユーザーが4択ボタンをクリックしたとき
    handleChoiceSelect(valueId, btn) {
        if (this.isAnswered || this.isPaused) return;
        this.selectedChoiceId = valueId;
        this.clickedChoiceBtn = btn;

        // ボタンの見た目を選択状態にする
        this.dom.choicesContainer.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        this.updateDualHint();
        this.tryFinalizeAnswer();
    }

    // 数式パレットで値を選択
    handlePaletteSelect(valueId, btn) {
        if (this.isAnswered || this.isPaused) return;
        this.selectedChoiceId = valueId;
        this.clickedChoiceBtn = btn;
        this.dom.paletteContainer.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.updateDualHint();
        this.tryFinalizeAnswer();
    }

    // 両方の選択が揃ったら採点実行
    tryFinalizeAnswer() {
        if (this.isAnswered) return;
        if (this.answerType === 'palette') {
            if (this.selectedChoiceId === null) return;
        } else {
            if (this.selectedAngle === null || this.selectedChoiceId === null) return;
        }

        this.isAnswered = true;
        this.stopTimer();
        this.clearAutoAdvance();

        const timeTakenMs = Date.now() - this.questionStartTime;

        // 4択は「角度＋値」、数式パレットは「値のみ」で採点
        const circleCorrect = this.answerType === 'palette'
            ? true
            : (this.selectedAngle === this.currentQuestion.angle);
        const valueCorrect = (this.selectedChoiceId === this.currentQuestion.correctValueId);
        const isCorrect = this.answerType === 'palette'
            ? valueCorrect
            : (circleCorrect && valueCorrect);

        // Record history
        this.history.push({
            angle: this.currentQuestion.angle,
            func: this.currentQuestion.func,
            selectedAngle: this.selectedAngle,
            selected: this.selectedChoiceId,
            correct: this.currentQuestion.correctValueId,
            isCorrect,
            circleCorrect,
            valueCorrect,
            timeTakenMs
        });

        // 回答ボタンのハイライト（4択 / 数式パレット共通）
        const answerButtons = this.answerType === 'palette'
            ? this.dom.paletteContainer.querySelectorAll('.palette-btn')
            : this.dom.choicesContainer.querySelectorAll('.choice-btn');
        answerButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = true;

            if (btn.dataset.valueId === this.currentQuestion.correctValueId) {
                btn.classList.add('correct');
                btn.setAttribute('aria-label', `${btn.textContent.trim()} 正解`);
                const mark = document.createElement('span');
                mark.className = 'answer-result-mark correct-mark';
                mark.textContent = '○';
                btn.appendChild(mark);
            } else if (btn === this.clickedChoiceBtn && !valueCorrect) {
                btn.classList.add('incorrect');
                btn.setAttribute('aria-label', `${btn.textContent.trim()} あなたの解答・不正解`);
                const mark = document.createElement('span');
                mark.className = 'answer-result-mark incorrect-mark';
                mark.textContent = '×';
                btn.appendChild(mark);
            }
        });

        // 単位円ポイントのハイライト（4択のみ）
        if (this.answerType !== 'palette') this.visualizer.container.querySelectorAll('.circle-point-group').forEach(grp => {
            const d = parseInt(grp.dataset.angle, 10);
            grp.classList.remove('selected');
            if (d === this.currentQuestion.angle) {
                grp.classList.add('correct');
                grp.setAttribute('aria-label', `${d}度 正解`);
            } else if (d === this.selectedAngle && !circleCorrect) {
                grp.classList.add('incorrect');
                grp.setAttribute('aria-label', `${d}度 あなたの解答・不正解`);
            }
        });

        // スコア・音声フィードバック
        if (isCorrect) {
            this.streak++;
            this.maxStreak = Math.max(this.maxStreak, this.streak);
            const speedBonus = this.timeLimitSetting > 0
                ? Math.max(0, Math.floor((this.timePerQuestion * 1000 - timeTakenMs) / 100))
                : 40;
            const streakBonus = this.streak * 20;
            this.score += 100 + speedBonus + streakBonus;

            this.audio.playCorrect();
        } else {
            this.streak = 0;
            this.audio.playIncorrect();
            if (this.mode === 'endless') {
                this.lives--;
                this.updateLivesDisplay();
            }
        }

        // 角度と解答を単位円に表示（解答と同時に単位円展開）
        this.visualizer.update(this.currentQuestion.angle, this.currentQuestion.func, this.selectedAngle);

        // 正誤は選択肢と単位円上の色・記号で示す。答えそのものは下部に重複表示しない。
        this.dom.explanationText.innerHTML = '';
        this.dom.explanationCard.classList.remove('active');
        this.dom.btnNextQuestion.style.display = 'none';

        // 点P君も正誤に合わせてリアクション
        setPointPNavigator(isCorrect ? 'happy' : 'thinking');


        // 正解時は正解音だけ鳴らし、解答表示の待ち時間なしで即次へ。
        if (isCorrect) {
            this.dom.btnNextQuestion.style.display = 'none';
            this.clearAutoAdvance();
            this.nextQuestion();
            return;
        }

        // 不正解時のみ少し確認時間を取る。
        this.dom.btnNextQuestion.style.display = 'none';
        if (this.dom.tapNextHint) this.dom.tapNextHint.style.display = 'flex';
        setTimeout(() => { this.awaitingTapAdvance = true; }, 0);
    }

    handleTimeout() {
        if (this.isAnswered) return;
        // 時間切れ：選択していない分をnullのまま採点（両方nullなので不正解）
        if (this.selectedAngle === null) this.selectedAngle = -1; // invalid
        if (this.selectedChoiceId === null) this.selectedChoiceId = 'TIMEOUT';
        this.isAnswered = true;
        this.stopTimer();
        this.clearAutoAdvance();

        const timeTakenMs = Date.now() - this.questionStartTime;
        this.history.push({
            angle: this.currentQuestion.angle,
            func: this.currentQuestion.func,
            selectedAngle: this.selectedAngle,
            selected: this.selectedChoiceId,
            correct: this.currentQuestion.correctValueId,
            isCorrect: false,
            circleCorrect: false,
            valueCorrect: false,
            timeTakenMs
        });

        this.streak = 0;
        this.audio.playIncorrect();
        if (this.mode === 'endless') { this.lives--; this.updateLivesDisplay(); }

        this.visualizer.update(this.currentQuestion.angle, this.currentQuestion.func, null);

        // 時間切れでは画面下の解説カードを表示しない。
        this.dom.explanationText.innerHTML = '';
        this.dom.explanationCard.classList.remove('active');
        this.dom.btnNextQuestion.style.display = 'none';
        this.dom.choicesContainer.querySelectorAll('.choice-btn').forEach(b => { b.disabled = true; });
        this.dom.paletteContainer.querySelectorAll('.palette-btn').forEach(b => { b.disabled = true; });

        if (this.dom.tapNextHint) this.dom.tapNextHint.style.display = 'flex';
        this.awaitingTapAdvance = true;
    }

    showComboAnimation(combo) {
        this.dom.comboBadge.textContent = `${combo} COMBO!! 🔥`;
        this.dom.comboBadge.classList.add('active');
        setTimeout(() => {
            this.dom.comboBadge.classList.remove('active');
        }, 1200);
    }

    // ==========================================
    // Quiz Result Screen
    // ==========================================

    finishQuiz() {
        this.stopTimer();
        this.stopGlobalChallengeTimer();
        this.quizFinishedAt = Date.now();
        this.clearAutoAdvance();
        this.audio.stopBgm();
        this.savePersonalBest();
        this.showScreen('result');
        this.dom.resultScreen?.classList.toggle('two-minute-result', this.mode === '3min-challenge');

        const total = this.history.length;
        const correctCount = this.history.filter(h => h.isCorrect).length;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        if (this.mode === '3min-challenge') {
            this.dom.resultScoreText.textContent = `${correctCount} 問`;
        }

        // Rank determination
        let rank = 'C';
        let rankClass = 'rank-c';
        if (this.mode === '3min-challenge') {
            if (correctCount >= 40) {
                rank = 'S';
                rankClass = 'rank-s';
            } else if (correctCount >= 30) {
                rank = 'A';
                rankClass = 'rank-a';
            } else if (correctCount >= 20) {
                rank = 'B';
                rankClass = 'rank-b';
            }
        } else {
            if (accuracy === 100 && total >= 20) {
                rank = 'S+';
                rankClass = 'rank-s-plus';
            } else if (accuracy >= 90) {
                rank = 'S';
                rankClass = 'rank-s';
            } else if (accuracy >= 75) {
                rank = 'A';
                rankClass = 'rank-a';
            } else if (accuracy >= 60) {
                rank = 'B';
                rankClass = 'rank-b';
            }
        }

        this.dom.resultRankBadge.textContent = rank;
        this.dom.resultRankBadge.className = `rank-badge ${rankClass}`;
        if (this.mode !== '3min-challenge') {
            this.dom.resultScoreText.textContent = this.score.toLocaleString();
        }
        this.dom.resultAccuracyText.textContent = `${accuracy}% (${correctCount}/${total}問)`;
        const resultTitle = this.dom.resultScreen?.querySelector('h2');
        if (resultTitle) resultTitle.textContent = this.mode === '3min-challenge'
            ? '2分チャレンジ結果'
            : 'クイズ結果発表！';
        const scoreLabel = this.dom.resultScoreText?.parentElement?.querySelector('.result-stat-label');
        if (scoreLabel) scoreLabel.textContent = this.mode === '3min-challenge' ? '2分間の正解数' : 'スコア';
        this.dom.resultMaxStreakText.textContent = `${this.maxStreak} 回`;

        // Learning analysis by function and error type
        const funcs = ['sin', 'cos', 'tan'];
        const funcLabels = { sin: 'sin', cos: 'cos', tan: 'tan' };
        const stats = funcs.map(func => {
            const rows = this.history.filter(h => h.func === func);
            const ok = rows.filter(h => h.isCorrect).length;
            return { func, total: rows.length, ok, pct: rows.length ? Math.round(ok / rows.length * 100) : null };
        });

        if (this.dom.learningAnalysis) {
            this.dom.learningAnalysis.innerHTML = `
                <div class="analysis-title">学習分析</div>
                <div class="analysis-pies">
                    ${stats.map(s => `
                        <div class="analysis-pie-card func-${s.func}">
                            <div class="analysis-pie" style="--pct:${s.pct ?? 0};">
                                <span>${s.pct === null ? '—' : `${s.pct}%`}</span>
                            </div>
                            <strong>${funcLabels[s.func]}</strong>
                            <small>${s.total ? `${s.ok}/${s.total}問` : '出題なし'}</small>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        const wrongs = this.history.filter(h => !h.isCorrect);
        if (this.dom.btnReviewWrong) {
            this.dom.btnReviewWrong.style.display = wrongs.length ? 'inline-flex' : 'none';
            this.dom.btnReviewWrong.textContent = `間違えた ${wrongs.length} 問だけ復習`;
        }

        // Render Review List
        this.dom.resultHistoryList.innerHTML = '';
        this.history.forEach((h, i) => {
            const item = document.createElement('div');
            item.className = `history-item ${h.isCorrect ? 'is-correct' : 'is-wrong'}`;
            
            const qStr = `${h.func} ${h.angle}°`;
            const correctVal = window.formatValueHtml(h.correct, this.useRationalized);
            const userVal = h.selected === 'TIMEOUT' ? '時間切れ' : window.formatValueHtml(h.selected, this.useRationalized);

            item.innerHTML = `
                <div class="hist-badge">${h.isCorrect ? '⭕ 正解' : '❌ 不正解'}</div>
                <div class="hist-q">第${i + 1}問: <strong>${qStr}</strong></div>
                <div class="hist-ans">正解: <span class="val-correct">${correctVal}</span> ${!h.isCorrect ? `(解答: <span class="val-user">${userVal}</span>)` : ''}</div>
            `;
            this.dom.resultHistoryList.appendChild(item);
        });

        // Save normal attempts only
        if (!this.isReviewSession) {
            this.saveToLeaderboard(this.nickname, this.score, accuracy, this.mode);
        }

        // Fanfare & Confetti on S rank
        if (accuracy >= 80) {
            this.audio.playFanfare();
            this.launchConfetti();
        }
    }

    startWrongReview() {
        const wrongs = this.history.filter(h => !h.isCorrect);
        if (!wrongs.length) return;

        this.reviewQueue = wrongs.map(h => ({ angle: h.angle, func: h.func }));
        this.isReviewSession = true;
        this.questionIndex = 0;
        this.totalQuestions = this.reviewQueue.length;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.history = [];
        this.isAnswered = false;
        this.timeLimitSetting = 0;
        this.dom.quizModeBadge.textContent = `🔁 間違えた問題の復習 ${this.totalQuestions}問`;
        this.dom.timerContainer.style.display = 'none';
        this.showScreen('quiz');
        this.nextQuestion();
    }

    // ==========================================
    // Leaderboard (localStorage)
    // ==========================================


    getElapsedQuizTimeSeconds() {
        if (!this.quizStartedAt) return 0;
        const end = this.quizFinishedAt || Date.now();
        return Math.max(0, (end - this.quizStartedAt - (this.totalPausedMs || 0)) / 1000);
    }

    savePersonalBest() {
        const correctCount = this.history.filter(h => h.isCorrect).length;
        if (correctCount < 18) {
            this.updatePersonalBestDisplay();
            return;
        }

        if (this.mode === '20-challenge') {
            const elapsed = this.getElapsedQuizTimeSeconds();
            if (!elapsed || !Number.isFinite(elapsed)) return;
            const key = 'trig-quiz-best-20-challenge';
            const current = Number(localStorage.getItem(key));
            if (!current || elapsed < current) {
                localStorage.setItem(key, elapsed.toFixed(2));
            }
        } else if (this.mode === '3min-challenge') {
            const key = 'trig-quiz-best-2min-challenge';
            const current = Number(localStorage.getItem(key) || 0);
            if (correctCount > current) {
                localStorage.setItem(key, String(correctCount));
            }
        }
        this.updatePersonalBestDisplay();
    }

    updatePersonalBestDisplay() {
        if (!this.dom.personalBestTime || !this.dom.personalBestDetail) return;

        const best20 = Number(localStorage.getItem('trig-quiz-best-20-challenge'));
        const best3min = Number(localStorage.getItem('trig-quiz-best-2min-challenge'));

        this.dom.personalBestTime.textContent = best20
            ? `${best20.toFixed(2)}秒`
            : '--,---秒';

        this.dom.personalBestDetail.textContent = best3min
            ? `${best3min}問`
            : '---問';

        if (this.dom.personalBestRankMark) {
            let mark = '—';
            let label = '記録なし';
            if (best20) {
                if (best20 <= 60) {
                    mark = '💮';
                    label = '1分以内';
                } else if (best20 <= 120) {
                    mark = '○';
                    label = '2分以内';
                } else if (best20 <= 180) {
                    mark = '△';
                    label = '3分以内';
                } else {
                    mark = '×';
                    label = '3分超';
                }
            }
            this.dom.personalBestRankMark.textContent = mark;
            this.dom.personalBestRankMark.setAttribute('aria-label', label);
            this.dom.personalBestRankMark.title = label;
        }

        if (this.dom.personalBestNote) {
            if (best20 || best3min) {
                this.dom.personalBestNote.textContent = '18問以上正解した記録のみ表示';
            } else {
                this.dom.personalBestNote.textContent = '18問以上正解したときに記録が表示されます';
            }
        }
    }

    // ==========================================
    // Reference Modal (早見表)
    // ==========================================

    buildReferenceTable() {
        this.dom.referenceTableBody.innerHTML = '';
        window.ANGLES.forEach(deg => {
            const row = document.createElement('tr');
            row.dataset.angle = deg;

            const sinVal = window.formatValueHtml(window.TRIG_DATA[deg].sin.valueId, this.useRationalized);
            const cosVal = window.formatValueHtml(window.TRIG_DATA[deg].cos.valueId, this.useRationalized);
            const tanVal = window.formatValueHtml(window.TRIG_DATA[deg].tan.valueId, this.useRationalized);

            row.innerHTML = `
                <td class="cell-angle"><strong>${deg}°</strong></td>
                <td class="cell-sin">${sinVal}</td>
                <td class="cell-cos">${cosVal}</td>
                <td class="cell-tan">${tanVal}</td>
            `;

            row.addEventListener('click', () => {
                this.audio.playClick();
                this.dom.referenceTableBody.querySelectorAll('tr').forEach(r => r.classList.remove('active-row'));
                row.classList.add('active-row');
                this.referenceVisualizer.update(deg, 'all');
            });

            this.dom.referenceTableBody.appendChild(row);
        });
    }


    showReferenceModal() {
        this.showScreen('reference');
        this.initReferenceGuide();
        if (this.dom.referenceFuncCards) {
            this.dom.referenceFuncCards.forEach(c => c.classList.toggle('active-reference-func', c.dataset.referenceFunc === this.referenceGuideFunc));
        }
        this.updateReferenceGuide(this.referenceGuideAngle || 45);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }


    hideReferenceModal() {
        if (this.dom.referenceScreen) {
            this.dom.referenceScreen.classList.remove('active');
        }
        this.dom.quizScreen.classList.remove('active');
        this.dom.resultScreen.classList.remove('active');
        this.dom.startScreen.classList.add('active');
        this.stopGlobalChallengeTimer();
        this.audio.stopBgm();
        requestAnimationFrame(() => this.fitStartScreenToViewport());
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
}

// Instantiate on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TrigQuizApp();
});
