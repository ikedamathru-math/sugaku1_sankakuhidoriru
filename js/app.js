
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
        this.secretModeUnlocked = false;
        this.secretModeActive = false;
        this.secretCrownEarned = false;
        this.normalModeSettings = null;

        // Settings State
        this.mode = '20-challenge'; // '20-challenge' | '3min-challenge' | '1min-secret'
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
        this.courseElapsedInterval = null;
        this.achievementQueue = [];

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
            courseElapsedTimerHeader: document.getElementById('course-elapsed-timer-header'),

            // Start screen controls
            modeTabs: document.querySelectorAll('.mode-tab'),
            answerTypeInputs: document.querySelectorAll('input[name="answer-type"]'),
            funcCheckboxes: document.querySelectorAll('input[name="filter-func"]'),
            timeLimitInputs: document.querySelectorAll('input[name="time-limit"]'),
            timeLimitGroup: document.getElementById('time-limit-group'),
            rationalizeToggle: document.getElementById('toggle-rationalize'),
            btnStartQuiz: document.getElementById('btn-start-quiz'),
            startBtnIcon: document.querySelector('#btn-start-quiz .start-btn-icon'),
            personalBestTime: document.getElementById('personal-best-time'),
            personalBestDetail: document.getElementById('personal-best-detail'),
            personalBestRankMark: document.getElementById('personal-best-rank-mark'),
            personalBest2minRankMark: document.getElementById('personal-best-2min-rank-mark'),
            personalBestSecretDetail: document.getElementById('personal-best-secret-detail'),
            personalBestSecretRankMark: document.getElementById('personal-best-secret-rank-mark'),
            personalBestNote: document.getElementById('personal-best-note'),
            personalBestPlant: document.getElementById('personal-best-plant'),
            secretModeBadge: document.getElementById('secret-mode-badge'),
            modeWorldSwitcher: document.getElementById('mode-world-switcher'),
            btnNormalMode: document.getElementById('btn-normal-mode'),
            btnSecretMode: document.getElementById('btn-secret-mode'),
            secretMemoryTable: document.getElementById('secret-memory-table'),

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
            courseElapsedTimerStop: document.getElementById('course-elapsed-timer-stop'),

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
            achievementOverlay: document.getElementById('achievement-overlay'),
            achievementCard: document.getElementById('achievement-card'),
            achievementBestImage: document.getElementById('achievement-best-image'),
            achievementGrowthVisual: document.getElementById('achievement-growth-visual'),
            achievementCopy: document.getElementById('achievement-copy'),
            btnAchievementClose: document.getElementById('btn-achievement-close'),

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
        const refit = () => requestAnimationFrame(() => {
            this.fitStartScreenToViewport();
            this.syncVisualTimerPlacement();
        });
        window.addEventListener('resize', refit);
        window.addEventListener('orientationchange', refit);
    }

    syncVisualTimerPlacement() {
        const questionDisplay = this.dom.questionFunc?.closest('.question-display');
        if (!this.dom.visualTimer || !questionDisplay) return;
        if (this.dom.quizProgressText) {
            questionDisplay.insertBefore(this.dom.visualTimer, this.dom.quizProgressText);
        }
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
        if (this.dom.btnNormalMode) {
            this.dom.btnNormalMode.addEventListener('click', () => {
                this.audio.playClick();
                this.setModeView(false);
            });
        }
        if (this.dom.btnSecretMode) {
            this.dom.btnSecretMode.addEventListener('click', () => {
                if (!this.secretModeUnlocked) return;
                this.audio.playClick();
                this.setModeView(true);
            });
        }

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
                this.clearAutoAdvance();
                this.stopTimer();
                this.stopGlobalChallengeTimer();
                this.stopCourseElapsedTimer();
                this.globalChallengeEnded = false;
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

        if (this.dom.btnAchievementClose) {
            this.dom.btnAchievementClose.addEventListener('click', () => this.showNextAchievement());
        }
        if (this.dom.achievementOverlay) {
            this.dom.achievementOverlay.addEventListener('click', event => {
                if (event.target === this.dom.achievementOverlay) this.showNextAchievement();
            });
        }

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
        if (this.mode === '1min-secret') {
            this.answerType = 'palette';
            this.targetFunctions = ['sin', 'cos', 'tan'];
        }
        const checkedFuncs = Array.from(this.dom.funcCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        if (this.mode === '1min-secret') {
            this.targetFunctions = ['sin', 'cos', 'tan'];
        } else if (checkedFuncs.length === 0) {
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
            if (this.secretModeActive) {
                this.referenceGuideVisualizer.setAngles(window.SECRET_ANGLES);
            }
            this.referenceGuideVisualizer.setInteractive(true);
            this.updateReferenceGuide(this.secretModeActive ? window.SECRET_ANGLES[0] : 45);
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
        this.stopCourseElapsedTimer();
        this.updateSettingsFromUI();
        const isTwentyChallenge = this.mode === '20-challenge';
        if (this.dom.courseElapsedTimerHeader) this.dom.courseElapsedTimerHeader.hidden = !isTwentyChallenge;
        if (this.dom.courseElapsedTimerStop) this.dom.courseElapsedTimerStop.hidden = !isTwentyChallenge;
        this.quizStartedAt = Date.now();
        this.quizFinishedAt = 0;
        this.totalPausedMs = 0;
        this.questionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.lives = 3;
        this.history = [];
        this.usedQuestionKeys = { standard: new Set(), secret: new Set() };
        this.attemptCounted = false;
        this.reviewQueue = null;
        this.isReviewSession = false;
        this.isAnswered = false;
        this.isPaused = false;
        this.pauseStartedAt = 0;
        this.dom.quizScreen.classList.remove('quiz-paused');
        this.dom.quizScreen.classList.toggle('three-minute-mode', this.mode === '3min-challenge' || this.mode === '1min-secret');
        document.body.classList.toggle('quiz-20-mode', this.mode === '20-challenge');
        // Keep the hourglass in the layout-specific position, including after
        // rotating between portrait and landscape.
        this.syncVisualTimerPlacement();
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
        } else if (this.mode === '1min-secret') {
            this.totalQuestions = Number.POSITIVE_INFINITY;
            this.answerType = 'palette';
            this.targetFunctions = ['sin', 'cos', 'tan'];
            this.timeLimitSetting = 0;
            this.dom.quizModeBadge.textContent = '⚡ 裏・1分チャレンジ';
            this.dom.timerContainer.style.display = 'none';
            this.dom.livesContainer.style.display = 'none';
            this.timePerQuestion = 0;
            this.globalTimeLeft = 60;
            this.globalChallengeEnded = false;
            if (this.dom.globalTimerText) {
                this.dom.globalTimerText.style.display = 'none';
                this.dom.globalTimerText.textContent = '残り 1:00';
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
        if (this.mode === '3min-challenge' || this.mode === '1min-secret') this.startGlobalChallengeTimer();
        if (this.mode === '20-challenge') this.startCourseElapsedTimer();
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
        if ((this.mode === '3min-challenge' || this.mode === '1min-secret') && this.globalChallengeEnded) {
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
        } else if (this.mode === '3min-challenge' || this.mode === '1min-secret') {
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

        if (this.mode === '1min-secret') {
            const useAddedAngle = this.questionIndex % 5 === 0;
            const pool = useAddedAngle
                ? (window.SECRET_QUESTION_POOL || [])
                : window.ANGLES.flatMap(angle => this.targetFunctions.map(func => ({
                    angle,
                    func,
                    valueId: window.TRIG_DATA[angle][func].valueId,
                    explanation: window.TRIG_DATA[angle][func].explanation
                })));
            const question = this.takeUnusedQuestion(pool, useAddedAngle ? 'secret' : 'standard');
            return {
                angle: question.angle,
                func: question.func,
                correctValueId: question.valueId,
                explanation: question.explanation
            };
        }

        const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];

        const funcs = this.targetFunctions;

        const pool = angles.flatMap(angle => funcs.map(func => ({
            angle,
            func,
            valueId: window.TRIG_DATA[angle][func].valueId,
            explanation: window.TRIG_DATA[angle][func].explanation
        })));
        const question = this.takeUnusedQuestion(pool, 'standard');
        const { angle, func } = question;
        const data = window.TRIG_DATA[angle][func];
        const correctValueId = data.valueId;

        return {
            angle,
            func,
            correctValueId,
            explanation: data.explanation
        };
    }

    takeUnusedQuestion(pool, bucketName) {
        const used = this.usedQuestionKeys?.[bucketName] || new Set();
        const keyOf = question => `${question.angle}-${question.func}`;
        let available = pool.filter(question => !used.has(keyOf(question)));
        if (!available.length) {
            used.clear();
            available = pool.filter(question => {
                if (!this.currentQuestion) return true;
                return keyOf(question) !== keyOf(this.currentQuestion);
            });
        }
        const question = available[Math.floor(Math.random() * available.length)];
        used.add(keyOf(question));
        if (!this.usedQuestionKeys) this.usedQuestionKeys = { standard: new Set(), secret: new Set() };
        this.usedQuestionKeys[bucketName] = used;
        return question;
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
        // 基本編の4択には、従来の有名角で使う値だけを出す。
        // VALUE_DEFSには裏編の難しい値も含まれるため、候補を明示的に分離する。
        const allIds = window.STANDARD_VALUE_IDS || Object.keys(window.VALUE_DEFS);

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
        const standardValues = ['-1', '-sqrt3/2', '-1/sqrt2', '-1/2', '0', '1/2', '1/sqrt2', 'sqrt3/2', '1', '-sqrt3', '-1/sqrt3', 'none', '1/sqrt3', 'sqrt3'];
        const standardPortrait = {
            '-sqrt3': [1, 1], '-1/sqrt3': [1, 2], 'none': ['1 / span 2', 3], '1/sqrt3': [1, 4], 'sqrt3': [1, 5],
            '-1': [2, 1], '-sqrt3/2': [2, 2], 'sqrt3/2': [2, 4], '1': [2, 5],
            '-1/sqrt2': [3, 1], '-1/2': [3, 2], '0': [3, 3], '1/2': [3, 4], '1/sqrt2': [3, 5]
        };
        const standardSecretPortrait = {
            '-sqrt3': [1, '1 / span 6'], '-1/sqrt3': [1, '7 / span 6'], 'none': [1, '13 / span 6'], '1/sqrt3': [1, '19 / span 6'], 'sqrt3': [1, '25 / span 6'],
            '-1': [2, '4 / span 6'], '0': [2, '13 / span 6'], '1': [2, '22 / span 6'],
            '-sqrt3/2': [3, '1 / span 5'], '-1/sqrt2': [3, '6 / span 5'], '-1/2': [3, '11 / span 5'],
            '1/2': [3, '16 / span 5'], '1/sqrt2': [3, '21 / span 5'], 'sqrt3/2': [3, '26 / span 5']
        };
        const standardWide = {
            '-sqrt3': [1, 1], '-1/sqrt3': [1, 3], 'none': [1, 5], '1/sqrt3': [1, 7], 'sqrt3': [1, 9],
            '-1': [2, 1], '-sqrt3/2': [2, 2], '-1/sqrt2': [2, 3], '-1/2': [2, 4], '0': [2, 5],
            '1/2': [2, 6], '1/sqrt2': [2, 7], 'sqrt3/2': [2, 8], '1': [2, 9]
        };
        const addedValues = [
            'sqrt5-1/4', 'sqrt5+1/4', '2-sqrt3', '2+sqrt3',
            'sqrt6-sqrt2/4', 'sqrt6+sqrt2/4', 'sqrt2-1', 'sqrt2+1',
            'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2', 'tan36', 'tan72',
            'sqrt(10-2sqrt5)/4', 'sqrt(10+2sqrt5)/4', 'tan54', 'tan18'
        ];
        const addedWideOrder = [
            'sqrt5-1/4', 'sqrt5+1/4', 'sqrt6-sqrt2/4', 'sqrt6+sqrt2/4',
            'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2', 'sqrt(10-2sqrt5)/4', 'sqrt(10+2sqrt5)/4',
            '2-sqrt3', '2+sqrt3', 'sqrt2-1', 'sqrt2+1', 'tan36', 'tan72', 'tan54', 'tan18'
        ];
        const topValues = new Set(['sqrt5-1/4', 'sqrt5+1/4', '2-sqrt3', '2+sqrt3', 'sqrt2-1', 'sqrt2+1']);
        const middleValues = new Set(['sqrt6-sqrt2/4', 'sqrt6+sqrt2/4', 'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2']);
        const compactValues = new Set(['sqrt6-sqrt2/4', 'sqrt6+sqrt2/4', 'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2', 'tan18', 'tan54']);
        const veryCompactValues = new Set(['tan72', 'tan36', 'sqrt(10-2sqrt5)/4', 'sqrt(10+2sqrt5)/4']);

        this.dom.paletteContainer.innerHTML = '<div class="palette-standard-grid" aria-label="有名角の三角比の値"></div>';
        if (this.mode === '1min-secret') {
            this.dom.paletteContainer.insertAdjacentHTML('beforeend', '<div class="palette-secret-grid" aria-label="裏編で追加された三角比の値"></div>');
        }
        const standardGrid = this.dom.paletteContainer.querySelector('.palette-standard-grid');
        const secretGrid = this.dom.paletteContainer.querySelector('.palette-secret-grid');
        const appendButton = (grid, valueId, portrait, wide, priorityClass = 'priority-standard') => {
            const btn = document.createElement('button');
            const sizeClass = veryCompactValues.has(valueId) ? 'value-very-compact' : (compactValues.has(valueId) ? 'value-compact' : 'value-standard');
            btn.className = `palette-btn ${priorityClass} ${sizeClass}`;
            btn.dataset.valueId = valueId;
            btn.style.setProperty('--palette-p-row', portrait[0]);
            btn.style.setProperty('--palette-p-col', portrait[1]);
            btn.style.setProperty('--palette-w-row', wide[0]);
            btn.style.setProperty('--palette-w-col', wide[1]);
            btn.innerHTML = window.formatValueHtml(valueId, this.useRationalized);
            btn.addEventListener('click', () => this.handlePaletteSelect(valueId, btn));
            grid.appendChild(btn);
        };

        standardValues.forEach(valueId => appendButton(
            standardGrid,
            valueId,
            this.mode === '1min-secret' ? standardSecretPortrait[valueId] : standardPortrait[valueId],
            standardWide[valueId]
        ));

        if (secretGrid) {
            addedValues.forEach((valueId, index) => {
                const wideIndex = addedWideOrder.indexOf(valueId);
                const priorityClass = topValues.has(valueId) ? 'priority-top' : (middleValues.has(valueId) ? 'priority-middle' : 'priority-hard');
                appendButton(
                    secretGrid,
                    valueId,
                    [Math.floor(index / 4) + 1, (index % 4) + 1],
                    [Math.floor(wideIndex / 8) + 1, (wideIndex % 8) + 1],
                    priorityClass
                );
            });
        }
    }

    startGlobalChallengeTimer() {
        this.stopGlobalChallengeTimer();
        this.globalTimeLeft = this.mode === '1min-secret' ? 60 : 120;
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
        if (this.mode !== '3min-challenge' && this.mode !== '1min-secret') return;
        const seconds = Math.max(0, Math.ceil(this.globalTimeLeft));
        const min = Math.floor(seconds / 60);
        const sec = String(seconds % 60).padStart(2, '0');
        if (this.dom.globalTimerText) {
            this.dom.globalTimerText.textContent = `残り ${min}:${sec}`;
        }
        const challengeTimeText = document.getElementById('challenge-time-text');
        if (challengeTimeText) challengeTimeText.textContent = `${min}:${sec}`;
    }

    startCourseElapsedTimer() {
        this.stopCourseElapsedTimer();
        if (this.dom.courseElapsedTimerHeader) this.dom.courseElapsedTimerHeader.hidden = false;
        if (this.dom.courseElapsedTimerStop) this.dom.courseElapsedTimerStop.hidden = false;
        this.updateCourseElapsedDisplay();
        this.courseElapsedInterval = setInterval(() => this.updateCourseElapsedDisplay(), 100);
    }

    stopCourseElapsedTimer() {
        if (this.courseElapsedInterval) {
            clearInterval(this.courseElapsedInterval);
            this.courseElapsedInterval = null;
        }
        if (this.mode !== '20-challenge') {
            if (this.dom.courseElapsedTimerHeader) this.dom.courseElapsedTimerHeader.hidden = true;
            if (this.dom.courseElapsedTimerStop) this.dom.courseElapsedTimerStop.hidden = true;
        }
    }

    updateCourseElapsedDisplay() {
        if (this.mode !== '20-challenge' || !this.quizStartedAt) return;
        const now = this.quizFinishedAt || Date.now();
        const activePauseMs = this.isPaused && this.pauseStartedAt ? now - this.pauseStartedAt : 0;
        const elapsedSeconds = Math.max(0, (now - this.quizStartedAt - (this.totalPausedMs || 0) - activePauseMs) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = String(Math.floor(elapsedSeconds % 60)).padStart(2, '0');
        const tenths = Math.floor((elapsedSeconds % 1) * 10);
        const label = `⏱ ${minutes}:${seconds}.${tenths}`;
        if (this.dom.courseElapsedTimerHeader) this.dom.courseElapsedTimerHeader.textContent = label;
        if (this.dom.courseElapsedTimerStop) this.dom.courseElapsedTimerStop.textContent = label;
    }

    startTimer() {
        this.stopTimer();
        this.questionStartTime = Date.now();

        if (this.dom.visualTimer) {
            this.dom.visualTimer.style.display = (this.mode === '3min-challenge' || this.mode === '1min-secret')
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

        // 時間切れでも正解位置・正解値と単位円の解説を表示する。
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
            }
        });
        if (this.answerType !== 'palette') {
            this.visualizer.container.querySelectorAll('.circle-point-group').forEach(grp => {
                const angle = parseInt(grp.dataset.angle, 10);
                grp.classList.remove('selected');
                if (angle === this.currentQuestion.angle) {
                    grp.classList.add('correct');
                    grp.setAttribute('aria-label', `${angle}度 正解`);
                }
            });
        }

        this.dom.explanationText.innerHTML = '';
        this.dom.explanationCard.classList.remove('active');
        this.dom.btnNextQuestion.style.display = 'none';
        setPointPNavigator('thinking');

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
        // 保存処理中に裏モードが解放されても、終了したクイズのモードは変えない。
        const completedMode = this.mode;
        this.stopTimer();
        this.stopGlobalChallengeTimer();
        this.quizFinishedAt = Date.now();
        this.updateCourseElapsedDisplay();
        this.stopCourseElapsedTimer();
        const total = this.history.length;
        const correctCount = this.history.filter(h => h.isCorrect).length;
        const accuracyRatio = total > 0 ? correctCount / total : 0;
        const growthEvent = this.recordPlantAttempt(completedMode, accuracyRatio, correctCount);
        this.clearAutoAdvance();
        this.audio.stopBgm();
        const isNewBest = this.savePersonalBest(completedMode);
        this.showScreen('result');
        this.dom.resultScreen?.classList.toggle('two-minute-result', completedMode === '3min-challenge' || completedMode === '1min-secret');

        const accuracy = Math.round(accuracyRatio * 100);
        if (completedMode === '3min-challenge' || completedMode === '1min-secret') {
            this.dom.resultScoreText.textContent = `${correctCount} 問`;
        }

        // Rank determination
        let rank = 'C';
        let rankClass = 'rank-c';
        if (completedMode === '3min-challenge' || completedMode === '1min-secret') {
            ({ rank, rankClass } = this.getTimedChallengeRank(
                correctCount,
                completedMode === '1min-secret',
                accuracy / 100
            ));
        } else {
            ({ rank, rankClass } = this.get20ChallengeRank(
                correctCount,
                this.getElapsedQuizTimeSeconds()
            ));
        }

        this.dom.resultRankBadge.textContent = rank;
        this.dom.resultRankBadge.className = `rank-badge ${rankClass}`;
        if (completedMode !== '3min-challenge' && completedMode !== '1min-secret') {
            this.dom.resultScoreText.textContent = this.score.toLocaleString();
        }
        this.dom.resultAccuracyText.textContent = `${accuracy}% (${correctCount}/${total}問)`;
        const resultTitle = this.dom.resultScreen?.querySelector('h2');
        if (resultTitle) resultTitle.textContent = completedMode === '1min-secret'
            ? '裏・1分チャレンジ結果'
            : (completedMode === '3min-challenge' ? '2分チャレンジ結果' : 'クイズ結果発表！');
        const scoreLabel = this.dom.resultScoreText?.parentElement?.querySelector('.result-stat-label');
        if (scoreLabel) scoreLabel.textContent = completedMode === '1min-secret'
            ? '1分間の正解数'
            : (completedMode === '3min-challenge' ? '2分間の正解数' : 'スコア');
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

        // 間違いを先に表示し、長い履歴でも見落とさないようにする。
        this.dom.resultHistoryList.innerHTML = '';
        const indexedHistory = this.history.map((answer, index) => ({ answer, questionNumber: index + 1 }));
        const wrongHistory = indexedHistory.filter(row => !row.answer.isCorrect);
        const correctHistory = indexedHistory.filter(row => row.answer.isCorrect);
        const appendSectionTitle = (label, count, className) => {
            const heading = document.createElement('div');
            heading.className = `history-section-title ${className}`;
            heading.textContent = `${label}（${count}問）`;
            this.dom.resultHistoryList.appendChild(heading);
        };
        if (wrongHistory.length) {
            appendSectionTitle('間違えた問題', wrongHistory.length, 'is-wrong');
        } else {
            const perfect = document.createElement('div');
            perfect.className = 'history-perfect-message';
            perfect.textContent = '全問正解です';
            this.dom.resultHistoryList.appendChild(perfect);
        }
        const renderHistoryRows = rows => rows.forEach(({ answer: h, questionNumber }) => {
            const item = document.createElement('div');
            item.className = `history-item ${h.isCorrect ? 'is-correct' : 'is-wrong'}`;
            
            const qStr = `${h.func} ${h.angle}°`;
            const correctVal = window.formatValueHtml(h.correct, this.useRationalized);
            const userVal = h.selected === 'TIMEOUT' ? '時間切れ' : window.formatValueHtml(h.selected, this.useRationalized);

            item.innerHTML = `
                <div class="hist-badge">${h.isCorrect ? '⭕ 正解' : '❌ 不正解'}</div>
                <div class="hist-q">第${questionNumber}問: <strong>${qStr}</strong></div>
                <div class="hist-ans">正解: <span class="val-correct">${correctVal}</span> ${!h.isCorrect ? `(解答: <span class="val-user">${userVal}</span>)` : ''}</div>
            `;
            this.dom.resultHistoryList.appendChild(item);
        });
        renderHistoryRows(wrongHistory);
        if (correctHistory.length) {
            appendSectionTitle('正解した問題', correctHistory.length, 'is-correct');
            renderHistoryRows(correctHistory);
        }

        // Save normal attempts only
        if (!this.isReviewSession) {
            if (typeof this.saveToLeaderboard === 'function') {
                this.saveToLeaderboard(this.nickname, this.score, accuracy, completedMode);
            }
        }

        // Fanfare & Confetti on S rank
        if (accuracy >= 80) {
            this.audio.playFanfare();
            this.launchConfetti();
        }

        const achievementEvents = [];
        if (isNewBest) achievementEvents.push({ type: 'best' });
        if (growthEvent) achievementEvents.push({ type: 'growth', ...growthEvent });
        this.showAchievementSequence(achievementEvents);
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

    get20ChallengeRank(correctCount, elapsedSeconds) {
        if (correctCount === 20 && elapsedSeconds <= 60) {
            return { rank: 'S+', rankClass: 'rank-s-plus' };
        }
        if (correctCount >= 18 && elapsedSeconds <= 90) {
            return { rank: 'S', rankClass: 'rank-s' };
        }
        if (correctCount >= 18 && elapsedSeconds <= 120) {
            return { rank: 'A', rankClass: 'rank-a' };
        }
        if (correctCount >= 12) {
            return { rank: 'B', rankClass: 'rank-b' };
        }
        return { rank: 'C', rankClass: 'rank-c' };
    }

    getTimedChallengeRank(correctCount, isSecret = false, accuracy = 1) {
        if (accuracy < 0.8) return { rank: '記録対象外', rankClass: 'rank-unranked' };
        const thresholds = isSecret
            ? { s: 20, a: 15, b: 10 }
            : { s: 40, a: 30, b: 20 };
        if (correctCount >= thresholds.s) return { rank: 'S', rankClass: 'rank-s' };
        if (correctCount >= thresholds.a) return { rank: 'A', rankClass: 'rank-a' };
        if (correctCount >= thresholds.b) return { rank: 'B', rankClass: 'rank-b' };
        return { rank: 'C', rankClass: 'rank-c' };
    }

    recordPlantAttempt(mode = this.mode, accuracy = 0, correctCount = 0) {
        if (this.attemptCounted || this.isReviewSession) return null;
        const completedTwentyQuestions = mode === '20-challenge' && this.questionIndex >= this.totalQuestions;
        const completedTimedChallenge = (mode === '3min-challenge' || mode === '1min-secret') && this.globalChallengeEnded;
        if (!completedTwentyQuestions && !completedTimedChallenge) return null;
        this.attemptCounted = true;
        if (accuracy < 0.6) return null;
        if (mode === '1min-secret' && correctCount < 12) return null;
        const key = mode === '1min-secret'
            ? 'trig-quiz-plant-secret-attempts'
            : 'trig-quiz-plant-normal-attempts';
        const current = Number(localStorage.getItem(key) || 0);
        const next = Math.min(50, current + 1);
        if (next === current) return null;
        localStorage.setItem(key, String(next));
        const oldStage = Math.min(10, Math.floor(current / 5));
        const newStage = Math.min(10, Math.floor(next / 5));
        // 回数は条件を満たすたびに加算するが、演出は見た目の段階が
        // 実際に変わる5回ごとのタイミングだけに表示する。
        if (newStage === oldStage) return null;
        return {
            secretMode: mode === '1min-secret',
            oldCount: current,
            newCount: next,
            oldStage,
            newStage
        };
    }

    renderPersonalBestPlant(secretMode) {
        if (!this.dom.personalBestPlant) return;
        const key = secretMode ? 'trig-quiz-plant-secret-attempts' : 'trig-quiz-plant-normal-attempts';
        const count = Math.min(50, Math.max(0, Number(localStorage.getItem(key) || 0)));
        const stage = Math.min(10, Math.floor(count / 5));
        const stageLabels = ['たね', '芽', '茎', '小さな葉', '葉', 'つぼみ', '育ったつぼみ', '花びら', '開花', 'もうすぐ満開', '満開'];
        this.dom.personalBestPlant.classList.toggle('secret-plant', secretMode);
        this.dom.personalBestPlant.setAttribute('aria-label', `${secretMode ? '裏モード' : '通常モード'}の花：${count}回、${stageLabels[stage]}`);
        this.dom.personalBestPlant.innerHTML = `
            <span class="plant-sprite-viewport" aria-hidden="true">
                <span class="plant-sprite-sheet" style="--plant-stage:${stage};--plant-row:${secretMode ? 1 : 0}"></span>
            </span>
            <span class="plant-progress">${count}回<br><small>${stageLabels[stage]}</small></span>`;
    }

    showAchievementSequence(events = []) {
        this.achievementQueue = events.filter(Boolean);
        if (!this.achievementQueue.length) {
            if (this.dom.achievementOverlay) this.dom.achievementOverlay.hidden = true;
            return;
        }
        this.showNextAchievement();
    }

    showNextAchievement() {
        if (!this.dom.achievementOverlay) return;
        const event = this.achievementQueue.shift();
        if (!event) {
            this.dom.achievementOverlay.hidden = true;
            return;
        }

        this.dom.achievementOverlay.hidden = false;
        this.dom.achievementCard.classList.toggle('is-best', event.type === 'best');
        this.dom.achievementCard.classList.toggle('is-growth', event.type === 'growth');
        this.dom.achievementBestImage.hidden = event.type !== 'best';
        this.dom.achievementGrowthVisual.hidden = event.type !== 'growth';
        this.dom.btnAchievementClose.textContent = this.achievementQueue.length ? '次の演出へ' : '結果を見る';

        if (event.type === 'best') {
            this.dom.achievementCopy.innerHTML = '<strong>自己ベストを更新しました！</strong><span>すばらしい記録です</span>';
        } else {
            const stageLabels = ['たね', '芽', '茎', '小さな葉', '葉', 'つぼみ', '育ったつぼみ', '花びら', '開花', 'もうすぐ満開', '満開'];
            const normalCenters = [[97,309.5],[92,307],[86,304.5],[76.5,288],[67,277.5],[74.5,269],[72,266.5],[69.5,266],[64,268.5],[80.5,266],[80,260]];
            const secretCenters = [[86.5,213.5],[82.5,208.5],[79,197.5],[70.5,186],[80,171],[69.5,168.5],[66,167],[64,164.5],[80,162.5],[80.5,158.5],[80,141]];
            const [centerX, centerY] = (event.secretMode ? secretCenters : normalCenters)[event.newStage];
            const plantX = `${(-centerX / 161 * 100).toFixed(2)}%`;
            const plantY = `${(-centerY / 443 * 100).toFixed(2)}%`;
            const stageChanged = event.newStage > event.oldStage;
            const title = stageChanged
                ? `花が「${stageLabels[event.newStage]}」に成長！`
                : '花の成長ポイントが増えました！';
            this.dom.achievementGrowthVisual.classList.toggle('secret-growth', event.secretMode);
            this.dom.achievementGrowthVisual.innerHTML = `
                <span class="plant-sprite-viewport" aria-hidden="true">
                    <span class="plant-sprite-sheet" style="--plant-stage:${event.newStage};--plant-row:${event.secretMode ? 1 : 0};--plant-x:${plantX};--plant-y:${plantY}"></span>
                </span>`;
            this.dom.achievementCopy.innerHTML = `<strong>${title}</strong><span>${event.newCount}回　${stageLabels[event.newStage]}</span>`;
        }

        requestAnimationFrame(() => {
            this.dom.achievementCard.classList.remove('achievement-pop');
            requestAnimationFrame(() => this.dom.achievementCard.classList.add('achievement-pop'));
        });
        this.dom.btnAchievementClose.focus({ preventScroll: true });
    }

    savePersonalBest(mode = this.mode) {
        let isNewBest = false;
        const correctCount = this.history.filter(h => h.isCorrect).length;
        const totalAnswered = this.history.length;
        const accuracy = totalAnswered > 0 ? correctCount / totalAnswered : 0;
        const hasAllFunctions = ['sin', 'cos', 'tan'].every(func => this.targetFunctions.includes(func));
        if (!hasAllFunctions) {
            this.updatePersonalBestDisplay();
            return false;
        }

        if (mode === '20-challenge') {
            if (correctCount < 18) {
                this.updatePersonalBestDisplay();
                return false;
            }
            const elapsed = this.getElapsedQuizTimeSeconds();
            if (!elapsed || !Number.isFinite(elapsed)) return false;
            const key = 'trig-quiz-best-20-challenge';
            const correctKey = 'trig-quiz-best-20-correct';
            const current = Number(localStorage.getItem(key));
            if (!current || elapsed < current) {
                localStorage.setItem(key, elapsed.toFixed(2));
                localStorage.setItem(correctKey, String(correctCount));
                isNewBest = true;
            }
        } else if (mode === '3min-challenge') {
            if (accuracy < 0.8) {
                this.updatePersonalBestDisplay();
                return false;
            }
            const key = 'trig-quiz-best-2min-challenge';
            const totalKey = 'trig-quiz-best-2min-total';
            const current = Number(localStorage.getItem(key) || 0);
            if (correctCount > current) {
                localStorage.setItem(key, String(correctCount));
                localStorage.setItem(totalKey, String(totalAnswered));
                isNewBest = true;
            }
        } else if (mode === '1min-secret') {
            if (accuracy < 0.8) {
                this.updatePersonalBestDisplay();
                return false;
            }
            const key = 'trig-quiz-best-1min-secret';
            const totalKey = 'trig-quiz-best-1min-secret-total';
            const current = Number(localStorage.getItem(key) || 0);
            if (correctCount > current) {
                localStorage.setItem(key, String(correctCount));
                localStorage.setItem(totalKey, String(totalAnswered));
                isNewBest = true;
            }
        }
        this.updatePersonalBestDisplay();
        return isNewBest;
    }

    updatePersonalBestDisplay() {
        if (!this.dom.personalBestTime || !this.dom.personalBestDetail) return;

        const best20 = Number(localStorage.getItem('trig-quiz-best-20-challenge'));
        const storedBest20Correct = Number(localStorage.getItem('trig-quiz-best-20-correct'));
        // Existing records were already limited to 18+ correct; preserve them when migrating.
        const best20Correct = storedBest20Correct || (best20 ? 18 : 0);
        const best3min = Number(localStorage.getItem('trig-quiz-best-2min-challenge'));
        const best3minTotalStored = Number(localStorage.getItem('trig-quiz-best-2min-total'));
        const best3minTotal = best3minTotalStored || best3min;
        const best3minQualifies = best3min > 0 && best3minTotal > 0 && best3min / best3minTotal >= 0.8;
        const bestSecret = Number(localStorage.getItem('trig-quiz-best-1min-secret'));
        const bestSecretTotalStored = Number(localStorage.getItem('trig-quiz-best-1min-secret-total'));
        const bestSecretTotal = bestSecretTotalStored || bestSecret;
        const bestSecretQualifies = bestSecret > 0 && bestSecretTotal > 0 && bestSecret / bestSecretTotal >= 0.8;
        const best20Rank = best20
            ? this.get20ChallengeRank(best20Correct, best20).rank
            : '—';
        const best2minRank = best3minQualifies
            ? this.getTimedChallengeRank(best3min, false).rank
            : '—';
        const bestSecretRank = bestSecretQualifies
            ? this.getTimedChallengeRank(bestSecret, true).rank
            : '—';
        const hasEarnedCrown = (best20Rank === 'S' || best20Rank === 'S+') && best2minRank === 'S';
        this.secretCrownEarned = bestSecretRank === 'S';

        this.applySecretModeState(hasEarnedCrown);
        this.renderPersonalBestPlant(this.secretModeActive);

        if (this.dom.startBtnIcon) {
            this.dom.startBtnIcon.src = this.secretCrownEarned
                ? 'assets/start-icon-crown.png'
                : 'assets/start-icon-white.png';
            this.dom.startBtnIcon.classList.toggle('is-crown-achieved', this.secretCrownEarned);
            this.dom.startBtnIcon.alt = this.secretCrownEarned ? '裏モードS達成' : '';
        }

        this.dom.personalBestTime.textContent = best20
            ? `${best20.toFixed(2)}秒`
            : '--,---秒';

        this.dom.personalBestDetail.textContent = best3min
            && best3minQualifies ? `${best3min}問`
            : '---問';

        if (this.dom.personalBestSecretDetail) {
            this.dom.personalBestSecretDetail.textContent = bestSecretQualifies ? `${bestSecret}問` : '---問';
        }

        if (this.dom.personalBestRankMark) {
            const labels = {
                'S+': '20問正解・60秒以内',
                S: '18問以上・90秒以内',
                A: '18問以上・120秒以内',
                B: '12問以上',
                C: '11問以下',
                '—': '記録なし'
            };
            this.dom.personalBestRankMark.textContent = best20Rank;
            this.dom.personalBestRankMark.setAttribute('aria-label', labels[best20Rank]);
            this.dom.personalBestRankMark.title = labels[best20Rank];
        }
        if (this.dom.personalBest2minRankMark) {
            const labels = { S: '40問以上・正答率80%以上', A: '30問以上・正答率80%以上', B: '20問以上・正答率80%以上', C: '20問未満・正答率80%以上', '—': '記録なし' };
            this.dom.personalBest2minRankMark.textContent = best2minRank;
            this.dom.personalBest2minRankMark.setAttribute('aria-label', labels[best2minRank]);
            this.dom.personalBest2minRankMark.title = labels[best2minRank];
        }
        if (this.dom.personalBestSecretRankMark) {
            const labels = { S: '20問以上・正答率80%以上', A: '15問以上・正答率80%以上', B: '10問以上・正答率80%以上', C: '10問未満・正答率80%以上', '—': '記録なし' };
            this.dom.personalBestSecretRankMark.textContent = bestSecretRank;
            this.dom.personalBestSecretRankMark.setAttribute('aria-label', labels[bestSecretRank]);
            this.dom.personalBestSecretRankMark.title = labels[bestSecretRank];
        }

        if (this.dom.personalBestNote) {
            this.dom.personalBestNote.textContent = this.secretModeActive
                ? '※正答率80％以上の記録のみ反映'
                : '※全三角比選択。20問は18問以上、2分は正答率80％以上のみ反映';
        }
    }

    applySecretModeState(unlocked) {
        this.secretModeUnlocked = unlocked;
        if (!unlocked) this.secretModeActive = false;
        if (this.dom.modeWorldSwitcher) this.dom.modeWorldSwitcher.hidden = !unlocked;
        this.setModeView(this.secretModeActive && unlocked);
    }

    setModeView(secretActive) {
        const nextSecretActive = Boolean(secretActive && this.secretModeUnlocked);
        if (nextSecretActive && !this.secretModeActive) {
            this.normalModeSettings = {
                mode: this.mode === '1min-secret' ? '20-challenge' : this.mode,
                answerType: this.answerType,
                targetFunctions: Array.from(this.dom.funcCheckboxes).filter(input => input.checked).map(input => input.value),
                timeLimitSetting: this.timeLimitSetting
            };
        }
        this.secretModeActive = nextSecretActive;
        const active = this.secretModeActive;
        document.body.classList.toggle('secret-mode-unlocked', active);
        document.body.classList.toggle('secret-mode-available', this.secretModeUnlocked);
        if (this.dom.btnNormalMode) this.dom.btnNormalMode.hidden = !active;
        if (this.dom.btnSecretMode) this.dom.btnSecretMode.hidden = active;
        if (this.dom.btnReference) this.dom.btnReference.textContent = active ? '裏三角比確認表' : '三角比確認表';
        if (this.dom.referenceScreen) this.dom.referenceScreen.classList.toggle('secret-reference-mode', active);
        const referenceTitle = this.dom.referenceScreen?.querySelector('.reference-topbar-title');
        if (referenceTitle) referenceTitle.innerHTML = active
            ? '余角ペアで覚える・裏三角比'
            : '単位円の角度の<span class="tap-symbol-gap"> </span><svg aria-hidden="true" class="tap-point-symbol next-point-symbol" focusable="false" viewBox="0 0 16 16"><circle cx="8" cy="8" fill="#ffffff" r="6" stroke="#0284c7" stroke-width="2.5"></circle></svg><span class="tap-symbol-gap"> </span>をタップ';
        if (this.dom.secretMemoryTable) {
            this.dom.secretMemoryTable.hidden = !active;
            if (active) this.buildSecretMemoryTable();
        }

        const normalModeTabs = Array.from(this.dom.modeTabs).filter(tab => tab.dataset.mode !== '1min-secret');
        const secretModeTab = Array.from(this.dom.modeTabs).find(tab => tab.dataset.mode === '1min-secret');
        const choiceInput = Array.from(this.dom.answerTypeInputs).find(input => input.value === 'choice4');
        const paletteInput = Array.from(this.dom.answerTypeInputs).find(input => input.value === 'palette');
        const timeNone = Array.from(this.dom.timeLimitInputs).find(input => input.value === '0');
        const time10 = Array.from(this.dom.timeLimitInputs).find(input => input.value === '10');

        normalModeTabs.forEach(tab => { tab.hidden = active; });
        if (secretModeTab) {
            secretModeTab.hidden = !active;
            secretModeTab.classList.toggle('active', active);
        }

        document.querySelectorAll('.personal-best-entry-20, .personal-best-entry-3min').forEach(el => { el.hidden = active; });
        const secretBest = document.querySelector('.personal-best-entry-secret');
        if (secretBest) secretBest.hidden = !active;
        if (this.dom.timeLimitGroup) this.dom.timeLimitGroup.hidden = active;

        if (!active) {
            const normalSettings = this.normalModeSettings;
            if (this.mode === '1min-secret') this.mode = normalSettings?.mode || '20-challenge';
            normalModeTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === this.mode));
            this.dom.answerTypeInputs.forEach(input => {
                input.disabled = false;
                input.closest('.pill-option').hidden = false;
                input.checked = input.value === (normalSettings?.answerType || 'choice4');
            });
            this.answerType = normalSettings?.answerType || 'choice4';
            const normalFunctions = normalSettings?.targetFunctions?.length ? normalSettings.targetFunctions : ['sin', 'cos', 'tan'];
            this.dom.funcCheckboxes.forEach(input => {
                input.disabled = false;
                input.checked = normalFunctions.includes(input.value);
            });
            this.targetFunctions = [...normalFunctions];
            this.dom.timeLimitInputs.forEach(input => {
                input.disabled = false;
                input.closest('.pill-option').hidden = input.value === '2';
                input.checked = input.value === String(normalSettings?.timeLimitSetting ?? 10);
            });
            this.timeLimitSetting = normalSettings?.timeLimitSetting ?? 10;
            this.syncSelectionCards();
            this.buildReferenceTable();
            this.renderPersonalBestPlant(false);
            if (this.dom.personalBestNote) this.dom.personalBestNote.textContent = '※全三角比選択。20問は18問以上、2分は正答率80％以上のみ反映';
            return;
        }

        this.mode = '1min-secret';
        this.answerType = 'palette';
        if (choiceInput) {
            choiceInput.checked = false;
            choiceInput.closest('.pill-option').hidden = true;
        }
        if (paletteInput) {
            paletteInput.checked = true;
            paletteInput.closest('.pill-option').hidden = false;
        }
        this.dom.answerTypeInputs.forEach(input => { input.disabled = true; });
        this.dom.funcCheckboxes.forEach(input => { input.checked = true; input.disabled = true; });
        this.targetFunctions = ['sin', 'cos', 'tan'];

        this.timeLimitSetting = 0;
        this.dom.timeLimitInputs.forEach(input => {
            input.checked = input.value === '0';
            input.disabled = true;
        });
        if (timeNone) timeNone.checked = true;
        this.syncSelectionCards();
        this.buildReferenceTable();
        this.renderPersonalBestPlant(true);
        if (this.dom.personalBestNote) this.dom.personalBestNote.textContent = '※正答率80％以上の記録のみ反映';
    }

    buildSecretMemoryTable() {
        if (!this.dom.secretMemoryTable) return;
        const groups = [
            { level: 'top', label: '最重要', relation: '同じ値（余角）', reason: '正五角形・黄金比の基本', items: [['sin 18°', 'sqrt5-1/4'], ['cos 72°', 'sqrt5-1/4']] },
            { level: 'top', label: '最重要', relation: '同じ値（余角）', reason: '黄金比に直結する基本値', items: [['cos 36°', 'sqrt5+1/4'], ['sin 54°', 'sqrt5+1/4']] },
            { level: 'top', label: '最重要', relation: '余角・互いに逆数', reason: '加法定理の代表で形が簡単', items: [['tan 15°', '2-sqrt3'], ['tan 75°', '2+sqrt3']] },
            { level: 'top', label: '最重要', relation: '余角・互いに逆数', reason: '半角公式の代表値', items: [['tan 22.5°', 'sqrt2-1'], ['tan 67.5°', 'sqrt2+1']] },
            { level: 'middle', label: '重要', relation: '同じ値（余角）', reason: '加法定理で頻出', items: [['sin 15°', 'sqrt6-sqrt2/4'], ['cos 75°', 'sqrt6-sqrt2/4']] },
            { level: 'middle', label: '重要', relation: '同じ値（余角）', reason: '15°系をまとめて覚えられる', items: [['cos 15°', 'sqrt6+sqrt2/4'], ['sin 75°', 'sqrt6+sqrt2/4']] },
            { level: 'middle', label: '重要', relation: '同じ値（余角）', reason: '45°の半角として重要', items: [['sin 22.5°', 'sqrt(2-sqrt2)/2'], ['cos 67.5°', 'sqrt(2-sqrt2)/2']] },
            { level: 'middle', label: '重要', relation: '同じ値（余角）', reason: '半角公式の対になる値', items: [['cos 22.5°', 'sqrt(2+sqrt2)/2'], ['sin 67.5°', 'sqrt(2+sqrt2)/2']] },
            { level: 'hard', label: '超難問', relation: '余角・互いに逆数', reason: '五角形系の発展値', items: [['tan 18°', 'tan18'], ['tan 72°', 'tan72']] },
            { level: 'hard', label: '超難問', relation: '余角・互いに逆数', reason: '黄金比から導く発展値', items: [['tan 36°', 'tan36'], ['tan 54°', 'tan54']] },
            { level: 'hard', label: '超難問', relation: '同じ値（余角）', reason: '複雑なので導出確認向き', items: [['sin 36°', 'sqrt(10-2sqrt5)/4'], ['cos 54°', 'sqrt(10-2sqrt5)/4']] },
            { level: 'hard', label: '超難問', relation: '同じ値（余角）', reason: '複雑な五角形系の仕上げ', items: [['cos 18°', 'sqrt(10+2sqrt5)/4'], ['sin 72°', 'sqrt(10+2sqrt5)/4']] }
        ];
        this.dom.secretMemoryTable.innerHTML = groups.map(group => `
            <article class="memory-pair-card priority-${group.level}">
                <div class="memory-card-head"><span class="memory-priority">${group.label}</span><span class="memory-relation">${group.relation}</span></div>
                <div class="memory-pair-items">
                    ${group.items.map(([name, valueId]) => `<div class="memory-expression"><strong>${name}</strong><span class="memory-equals">＝</span><span class="memory-value">${window.formatValueHtml(valueId, this.useRationalized)}</span></div>`).join('')}
                </div>
                <p class="memory-reason">${group.reason}</p>
            </article>
        `).join('');
    }

    // ==========================================
    // Reference Modal (早見表)
    // ==========================================

    buildReferenceTable() {
        this.dom.referenceTableBody.innerHTML = '';
        const referenceAngles = this.secretModeActive ? window.SECRET_ANGLES : window.ANGLES;
        referenceAngles.forEach(deg => {
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
        if (this.secretModeActive && this.referenceGuideVisualizer) {
            this.referenceGuideVisualizer.setAngles(window.SECRET_ANGLES);
            if (!window.SECRET_ANGLES.includes(this.referenceGuideAngle)) {
                this.referenceGuideAngle = window.SECRET_ANGLES[0];
            }
        }
        if (this.dom.referenceFuncCards) {
            this.dom.referenceFuncCards.forEach(c => c.classList.toggle('active-reference-func', c.dataset.referenceFunc === this.referenceGuideFunc));
        }
        this.updateReferenceGuide(this.referenceGuideAngle || (this.secretModeActive ? window.SECRET_ANGLES[0] : 45));
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
