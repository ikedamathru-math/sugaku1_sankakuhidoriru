
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
        this.angleNotation = localStorage.getItem('trig-quiz-angle-notation') === 'radian' ? 'radian' : 'degree';

        // Settings State
        this.mode = '20-challenge'; // '20-challenge' | '3min-challenge' | '1min-secret'
        this.answerType = 'palette'; // 'choice4' | 'palette'
        this.targetFunctions = ['sin', 'cos', 'tan']; // Array of selected functions
        this.angleRange = '180'; // fixed: 0°〜180°
        this.timeLimitSetting = 0; // 3, 5, 10, or 0 (unlimited)
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
        this.lastCompletedSettings = null;
        this.paletteSettingsSecret = false;
        this.paletteSettingsOrder = [];
        this.paletteSettingsSelectedIndex = null;
        this.paletteDragIndex = null;
        this.pendingResultRankSound = null;

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
        this._bestChaseShown = new Set();
        this._awakeningAnnounced = false;
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
            btnPaletteSettings: document.getElementById('btn-palette-settings'),
            btnAngleNotation: document.getElementById('btn-angle-notation'),
            paletteSettingsOverlay: document.getElementById('palette-settings-overlay'),
            paletteSettingsTitle: document.getElementById('palette-settings-title'),
            paletteSettingsSubtitle: document.getElementById('palette-settings-subtitle'),
            paletteSettingsGrid: document.getElementById('palette-settings-grid'),
            btnPaletteSettingsClose: document.getElementById('btn-palette-settings-close'),
            btnPaletteSettingsReset: document.getElementById('btn-palette-settings-reset'),
            btnPaletteSettingsSave: document.getElementById('btn-palette-settings-save'),
            courseElapsedTimerHeader: document.getElementById('course-elapsed-timer-header'),
            courseElapsedTimerQuestion: document.getElementById('course-elapsed-timer-question'),

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
            personalBestVersion: document.getElementById('personal-best-version'),
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
        this.applyAngleNotation(false);
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
            this.dom.btnSound.classList.toggle('active', this.audio.enabled);
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
                if (this.bgmEnabled) this.audio.startBgm(this.mode === '1min-secret' ? 'secret' : this.bgmTrack);
            });
        }
        if (this.dom.btnBgmToggle) {
            this.dom.btnBgmToggle.addEventListener('click', () => {
                this.audio.playClick();
                this.bgmEnabled = !this.bgmEnabled;
                this.dom.btnBgmToggle.textContent = this.bgmEnabled ? '効果音 ON' : '効果音 OFF';
                this.dom.btnBgmToggle.classList.toggle('active', this.bgmEnabled);
                if (this.bgmEnabled) this.audio.startBgm(this.mode === '1min-secret' ? 'secret' : this.bgmTrack);
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

        if (this.dom.btnPaletteSettings) {
            this.dom.btnPaletteSettings.addEventListener('click', () => {
                this.audio.playClick();
                this.openPaletteSettings();
            });
        }
        if (this.dom.btnAngleNotation) {
            this.dom.btnAngleNotation.addEventListener('click', () => {
                this.audio.playClick();
                this.angleNotation = this.angleNotation === 'degree' ? 'radian' : 'degree';
                localStorage.setItem('trig-quiz-angle-notation', this.angleNotation);
                this.applyAngleNotation(true);
            });
        }
        if (this.dom.btnPaletteSettingsClose) {
            this.dom.btnPaletteSettingsClose.addEventListener('click', () => {
                this.audio.playClick();
                this.closePaletteSettings();
            });
        }
        if (this.dom.paletteSettingsOverlay) {
            this.dom.paletteSettingsOverlay.addEventListener('click', event => {
                if (event.target === this.dom.paletteSettingsOverlay) this.closePaletteSettings();
            });
        }
        if (this.dom.btnPaletteSettingsReset) {
            this.dom.btnPaletteSettingsReset.addEventListener('click', () => {
                this.audio.playClick();
                this.paletteSettingsOrder = this.getDefaultPaletteOrder(this.paletteSettingsSecret);
                this.paletteSettingsSelectedIndex = null;
                this.renderPaletteSettingsEditor();
            });
        }
        if (this.dom.btnPaletteSettingsSave) {
            this.dom.btnPaletteSettingsSave.addEventListener('click', () => {
                this.audio.playClick();
                this.savePaletteOrder(this.paletteSettingsSecret, this.paletteSettingsOrder);
                if (this.currentQuestion && this.answerType === 'palette') this.renderPalette();
                this.closePaletteSettings();
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

        // Restart Quiz Button: repeat exactly the settings used in the just-finished attempt.
        this.dom.btnRestartQuiz.addEventListener('click', () => {
            this.clearAutoAdvance();
            this.audio.playClick();
            this.restoreLastCompletedSettings();
            this.startQuiz(true);
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
                if (event.target === this.dom.achievementOverlay) event.stopPropagation();
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

    restoreLastCompletedSettings() {
        const settings = this.lastCompletedSettings;
        if (!settings) return;

        this.mode = settings.mode;
        this.answerType = settings.answerType;
        this.targetFunctions = [...settings.targetFunctions];
        this.timeLimitSetting = 0;
        this.secretModeActive = Boolean(settings.secretModeActive);
        this.angleNotation = settings.angleNotation || this.angleNotation;
        this.applyAngleNotation(false);

        // Restore the visible UI as well so the next attempt and the top screen stay consistent.
        this.dom.modeTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === this.mode);
        });
        this.dom.answerTypeInputs.forEach(input => {
            input.checked = input.value === this.answerType;
        });
        this.dom.funcCheckboxes.forEach(input => {
            input.checked = this.targetFunctions.includes(input.value);
        });
        this.dom.timeLimitInputs.forEach(input => {
            input.checked = input.value === String(this.timeLimitSetting);
        });
        this.syncSelectionCards();
    }

    updateSettingsFromUI() {
        if (this.mode === '1min-secret') {
            this.answerType = 'palette';
            this.targetFunctions = ['sin', 'cos', 'tan'];
        } else {
            const selectedAnswerType = document.querySelector('input[name="answer-type"]:checked');
            if (selectedAnswerType) this.answerType = selectedAnswerType.value;
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

        // 1問ごとの制限時間は廃止。コース全体の計時だけを使用する。
        this.timeLimitSetting = 0;
    }


    initReferenceGuide() {
        if (this.dom.referenceScreen && !this.referenceGuideVisualizer) {
            this.referenceGuideVisualizer = new window.UnitCircleVisualizer(
                'reference-guide-circle',
                (deg) => this.updateReferenceGuide(deg)
            );
            this.referenceGuideVisualizer.setAngles(this.getCircleAnglePool());
            this.referenceGuideVisualizer.setInteractive(true);
            this.updateReferenceGuide(this.secretModeActive && this.angleNotation === 'degree' ? window.SECRET_ANGLES[0] : 45);
        }
    }

    updateReferenceGuide(deg) {
        const data = window.getTrigData(deg);
        if (!data) return;
        this.referenceGuideAngle = deg;

        if (this.referenceGuideVisualizer) {
            this.referenceGuideVisualizer.update(deg, 'all');
            this.referenceGuideVisualizer.setInteractive(true);
        }

        if (this.dom.referenceCurrentAngle) {
            this.dom.referenceCurrentAngle.innerHTML = this.formatAngleHtml(deg);
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
        if (this.dom.referenceSinAngle) this.dom.referenceSinAngle.innerHTML = this.formatAngleHtml(deg);
        if (this.dom.referenceCosAngle) this.dom.referenceCosAngle.innerHTML = this.formatAngleHtml(deg);
        if (this.dom.referenceTanAngle) this.dom.referenceTanAngle.innerHTML = this.formatAngleHtml(deg);
        if (this.dom.referenceSideSinAngle) this.dom.referenceSideSinAngle.innerHTML = this.formatAngleHtml(deg);
        if (this.dom.referenceSideCosAngle) this.dom.referenceSideCosAngle.innerHTML = this.formatAngleHtml(deg);
        if (this.dom.referenceSideTanAngle) this.dom.referenceSideTanAngle.innerHTML = this.formatAngleHtml(deg);
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

    startQuiz(preserveSettings = false) {
        this.clearAutoAdvance();
        this.stopGlobalChallengeTimer();
        this.stopCourseElapsedTimer();
        if (!preserveSettings) this.updateSettingsFromUI();
        this.timeLimitSetting = 0;
        this.visualizer?.setAngles(this.getCircleAnglePool());
        if (!this.secretModeActive && this.mode !== '1min-secret') {
            this.normalModeSettings = {
                mode: this.mode,
                answerType: this.answerType,
                targetFunctions: [...this.targetFunctions],
                timeLimitSetting: 0
            };
        }
        const isTwentyChallenge = this.mode === '20-challenge';
        if (this.dom.courseElapsedTimerHeader) this.dom.courseElapsedTimerHeader.hidden = !isTwentyChallenge;
        if (this.dom.courseElapsedTimerQuestion) this.dom.courseElapsedTimerQuestion.hidden = !isTwentyChallenge;
        if (this.dom.courseElapsedTimerStop) this.dom.courseElapsedTimerStop.hidden = !isTwentyChallenge;
        this.quizStartedAt = Date.now();
        this.quizFinishedAt = 0;
        this.totalPausedMs = 0;
        this.questionIndex = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.setSecretAwakening(false);
        this._bestChaseShown = new Set();
        this._awakeningAnnounced = false;
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

        if (this.bgmEnabled) this.audio.startBgm(this.mode === '1min-secret' ? 'secret' : this.bgmTrack);
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

    getActiveAnglePool() {
        if (this.angleNotation !== 'radian') {
            return this.secretModeActive ? [...window.SECRET_ANGLES] : [...window.ANGLES];
        }
        const standardTurn = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
        if (!this.secretModeActive) return standardTurn;
        const secondTurn = standardTurn.slice(1).map(angle => angle + 360);
        const difficult = [...window.SECRET_ANGLES, ...window.SECRET_ANGLES.map(angle => angle + 360)];
        return [...standardTurn, ...secondTurn, ...difficult].sort((a, b) => a - b);
    }

    getCircleAnglePool() {
        const source = this.getActiveAnglePool();
        return [...new Set(source.map(angle => window.normalizeAngle(angle)))].sort((a, b) => a - b);
    }

    formatAngleHtml(angle) {
        return window.formatAngleHtml(angle, this.angleNotation);
    }

    formatAngleText(angle) {
        return window.formatAngleText(angle, this.angleNotation);
    }

    bestStorageKey(baseKey) {
        return this.angleNotation === 'radian' ? `${baseKey}-radian` : baseKey;
    }

    anglesShareTerminalSide(a, b) {
        return window.normalizeAngle(a) === window.normalizeAngle(b);
    }

    applyAngleNotation(refresh = true) {
        const radian = this.angleNotation === 'radian';
        document.body.classList.toggle('radian-mode', radian);
        if (this.dom.btnAngleNotation) {
            this.dom.btnAngleNotation.innerHTML = radian
                ? '<span>数Ⅱ</span><span>弧度法</span>'
                : '<span>数Ⅰ</span><span>度数法</span>';
            this.dom.btnAngleNotation.classList.toggle('active', radian);
            this.dom.btnAngleNotation.setAttribute('aria-pressed', String(radian));
            this.dom.btnAngleNotation.setAttribute('aria-label', radian ? '数Ⅱ 弧度法。数Ⅰ 度数法へ切り替える' : '数Ⅰ 度数法。数Ⅱ 弧度法へ切り替える');
            this.dom.btnAngleNotation.title = radian ? '度数法へ切り替える' : '弧度法へ切り替える';
        }
        if (this.dom.personalBestVersion) this.dom.personalBestVersion.textContent = radian ? '弧度法ver.' : '度数法ver.';
        const circleAngles = this.getCircleAnglePool();
        this.visualizer?.setAngles(circleAngles);
        this.referenceVisualizer?.setAngles(circleAngles);
        this.referenceGuideVisualizer?.setAngles(circleAngles);
        this.buildReferenceTable();
        this.updatePersonalBestDisplay();
        if (refresh && this.dom.referenceScreen?.classList.contains('active')) {
            const next = circleAngles.includes(window.normalizeAngle(this.referenceGuideAngle))
                ? window.normalizeAngle(this.referenceGuideAngle)
                : circleAngles[0];
            this.updateReferenceGuide(next);
        }
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
            const data = window.getTrigData(q.angle)[q.func];
            return {
                angle: q.angle,
                func: q.func,
                correctValueId: data.valueId,
                explanation: data.explanation
            };
        }

        if (this.mode === '1min-secret') {
            if (this.angleNotation === 'radian') {
                const roll = Math.random();
                const standardFirstTurn = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
                const standardSecondTurn = standardFirstTurn.slice(1).map(angle => angle + 360);
                const difficultRadians = [...window.SECRET_ANGLES, ...window.SECRET_ANGLES.map(angle => angle + 360)];
                const angles = roll < 0.60 ? standardFirstTurn : (roll < 0.85 ? standardSecondTurn : difficultRadians);
                const pool = angles.flatMap(angle => this.targetFunctions.map(func => {
                    const data = window.getTrigData(angle)?.[func];
                    return data ? { angle, func, valueId: data.valueId, explanation: data.explanation } : null;
                })).filter(Boolean);
                const question = this.takeUnusedQuestion(pool, roll < 0.60 ? 'radian-first' : (roll < 0.85 ? 'radian-second' : 'radian-hard'));
                return { angle: question.angle, func: question.func, correctValueId: question.valueId, explanation: question.explanation };
            }
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

        const angles = this.angleNotation === 'radian'
            ? [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360]
            : [0, 30, 45, 60, 90, 120, 135, 150, 180];

        const funcs = this.targetFunctions;

        const pool = angles.flatMap(angle => funcs.map(func => ({
            angle,
            func,
            valueId: window.getTrigData(angle)[func].valueId,
            explanation: window.getTrigData(angle)[func].explanation
        })));
        const question = this.takeUnusedQuestion(pool, 'standard');
        const { angle, func } = question;
        const data = window.getTrigData(angle)[func];
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
        this.dom.questionAngle.innerHTML = this.formatAngleHtml(this.currentQuestion.angle);

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

    getPaletteStorageKey(secretMode = false) {
        return secretMode ? 'trig-quiz-palette-order-secret-v1' : 'trig-quiz-palette-order-normal-v1';
    }

    getPaletteStandardValues() {
        return ['-1', '-sqrt3/2', '-1/sqrt2', '-1/2', '0', '1/2', '1/sqrt2', 'sqrt3/2', '1', '-sqrt3', '-1/sqrt3', 'none', '1/sqrt3', 'sqrt3'];
    }

    getPaletteSecretAddedValues() {
        return [
            'sqrt5-1/4', 'sqrt5+1/4', '2-sqrt3', '2+sqrt3',
            'sqrt6-sqrt2/4', 'sqrt6+sqrt2/4', 'sqrt2-1', 'sqrt2+1',
            'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2', 'tan36', 'tan72',
            'sqrt(10-2sqrt5)/4', 'sqrt(10+2sqrt5)/4', 'tan54', 'tan18'
        ];
    }

    getDefaultPaletteOrder(secretMode = false) {
        if (!secretMode) {
            // 5列×3段。中央の空きを含め、従来のスマホ配置に近い初期配置。
            return [
                '-sqrt3', '-1/sqrt3', 'none', '1/sqrt3', 'sqrt3',
                '-1', '-sqrt3/2', '__empty__', 'sqrt3/2', '1',
                '-1/sqrt2', '-1/2', '0', '1/2', '1/sqrt2'
            ];
        }
        return [
            '-sqrt3', '-1/sqrt3', 'none', '1/sqrt3', 'sqrt3',
            '-1', '-sqrt3/2', '-1/sqrt2', '-1/2', '0',
            '1/2', '1/sqrt2', 'sqrt3/2', '1',
            ...this.getPaletteSecretAddedValues()
        ];
    }

    getSecretPaletteSlot(index) {
        const defaultValueId = this.getDefaultPaletteOrder(true)[index];
        const standardPortrait = {
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
        if (index < 14) {
            return { group: 'standard', portrait: standardPortrait[defaultValueId], wide: standardWide[defaultValueId] };
        }

        const addedIndex = index - 14;
        const addedWideOrder = [
            'sqrt5-1/4', 'sqrt5+1/4', 'sqrt6-sqrt2/4', 'sqrt6+sqrt2/4',
            'sqrt(2-sqrt2)/2', 'sqrt(2+sqrt2)/2', 'sqrt(10-2sqrt5)/4', 'sqrt(10+2sqrt5)/4',
            '2-sqrt3', '2+sqrt3', 'sqrt2-1', 'sqrt2+1', 'tan36', 'tan72', 'tan54', 'tan18'
        ];
        const wideIndex = addedWideOrder.indexOf(defaultValueId);
        return {
            group: 'added',
            portrait: [Math.floor(addedIndex / 4) + 1, (addedIndex % 4) + 1],
            wide: [Math.floor(wideIndex / 8) + 1, (wideIndex % 8) + 1]
        };
    }

    loadPaletteOrder(secretMode = false) {
        const key = this.getPaletteStorageKey(secretMode);
        const allowed = new Set(this.getDefaultPaletteOrder(secretMode));
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || 'null');
            if (!Array.isArray(parsed) || parsed.length !== allowed.size) return null;
            if (new Set(parsed).size !== parsed.length) return null;
            if (!parsed.every(id => allowed.has(id))) return null;
            return parsed;
        } catch (_) {
            return null;
        }
    }

    savePaletteOrder(secretMode, order) {
        const key = this.getPaletteStorageKey(secretMode);
        const defaultOrder = this.getDefaultPaletteOrder(secretMode);
        const isDefaultOrder = order.length === defaultOrder.length
            && order.every((valueId, index) => valueId === defaultOrder[index]);

        // The built-in palette has separate portrait/landscape layouts. Keeping
        // its sequence as a "custom" layout would flatten those placements and
        // make Reset look different after rotating the device.
        if (isDefaultOrder) {
            localStorage.removeItem(key);
            return;
        }
        localStorage.setItem(key, JSON.stringify(order));
    }

    getPaletteDisplayHtml(valueId) {
        if (valueId === '__empty__') return '<span class="palette-settings-empty-label">空き</span>';
        return window.formatValueHtml(valueId, this.useRationalized);
    }

    openPaletteSettings() {
        if (!this.dom.paletteSettingsOverlay || !this.dom.paletteSettingsGrid) return;
        this.paletteSettingsSecret = Boolean(this.secretModeActive);
        this.paletteSettingsOrder = this.loadPaletteOrder(this.paletteSettingsSecret) || this.getDefaultPaletteOrder(this.paletteSettingsSecret);
        this.paletteSettingsSelectedIndex = null;
        this.paletteDragIndex = null;
        if (this.dom.paletteSettingsTitle) this.dom.paletteSettingsTitle.textContent = this.paletteSettingsSecret ? '裏パレット設定' : 'パレット設定';
        if (this.dom.paletteSettingsSubtitle) this.dom.paletteSettingsSubtitle.textContent = this.paletteSettingsSecret ? '裏版専用の値パレット配置' : '通常版専用の値パレット配置';
        this.renderPaletteSettingsEditor();
        this.dom.paletteSettingsOverlay.hidden = false;
        this.dom.paletteSettingsOverlay.classList.add('active');
        document.body.classList.add('palette-settings-open');
    }

    closePaletteSettings() {
        if (!this.dom.paletteSettingsOverlay) return;
        this.dom.paletteSettingsOverlay.classList.remove('active');
        this.dom.paletteSettingsOverlay.hidden = true;
        document.body.classList.remove('palette-settings-open');
        this.paletteSettingsSelectedIndex = null;
        this.paletteDragIndex = null;
    }

    swapPaletteSettingsItems(a, b) {
        if (a === b || a == null || b == null) return;
        const order = this.paletteSettingsOrder;
        if (!order[a] || !order[b]) return;
        [order[a], order[b]] = [order[b], order[a]];
        this.paletteSettingsSelectedIndex = null;
        this.renderPaletteSettingsEditor();
    }

    renderPaletteSettingsEditor() {
        const grid = this.dom.paletteSettingsGrid;
        if (!grid) return;
        grid.innerHTML = '';
        grid.classList.toggle('secret-palette-settings-grid', this.paletteSettingsSecret);
        let secretStandardGrid = null;
        let secretAddedGrid = null;
        if (this.paletteSettingsSecret) {
            secretStandardGrid = document.createElement('div');
            secretStandardGrid.className = 'palette-settings-secret-standard';
            secretStandardGrid.setAttribute('aria-label', '有名角の値');
            secretAddedGrid = document.createElement('div');
            secretAddedGrid.className = 'palette-settings-secret-added';
            secretAddedGrid.setAttribute('aria-label', '裏版で追加された値');
            grid.append(secretStandardGrid, secretAddedGrid);
        }
        this.paletteSettingsOrder.forEach((valueId, index) => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'palette-setting-item';
            if (valueId === '__empty__') item.classList.add('is-empty-slot');
            if (index === this.paletteSettingsSelectedIndex) item.classList.add('is-selected');
            item.dataset.index = String(index);
            item.dataset.valueId = valueId;
            item.draggable = true;
            item.innerHTML = this.getPaletteDisplayHtml(valueId);
            let targetGrid = grid;
            if (this.paletteSettingsSecret) {
                const slot = this.getSecretPaletteSlot(index);
                item.style.setProperty('--palette-p-row', slot.portrait[0]);
                item.style.setProperty('--palette-p-col', slot.portrait[1]);
                item.style.setProperty('--palette-w-row', slot.wide[0]);
                item.style.setProperty('--palette-w-col', slot.wide[1]);
                targetGrid = slot.group === 'standard' ? secretStandardGrid : secretAddedGrid;
            }
            item.addEventListener('click', () => {
                this.audio.playClick();
                if (this.paletteSettingsSelectedIndex == null) {
                    this.paletteSettingsSelectedIndex = index;
                    this.renderPaletteSettingsEditor();
                    return;
                }
                if (this.paletteSettingsSelectedIndex === index) {
                    this.paletteSettingsSelectedIndex = null;
                    this.renderPaletteSettingsEditor();
                    return;
                }
                this.swapPaletteSettingsItems(this.paletteSettingsSelectedIndex, index);
            });
            item.addEventListener('dragstart', event => {
                this.paletteDragIndex = index;
                item.classList.add('is-dragging');
                if (event.dataTransfer) {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', String(index));
                }
            });
            item.addEventListener('dragend', () => {
                this.paletteDragIndex = null;
                item.classList.remove('is-dragging');
            });
            item.addEventListener('dragover', event => {
                event.preventDefault();
                if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
            });
            item.addEventListener('drop', event => {
                event.preventDefault();
                const source = this.paletteDragIndex ?? Number(event.dataTransfer?.getData('text/plain'));
                if (Number.isInteger(source)) this.swapPaletteSettingsItems(source, index);
            });
            targetGrid.appendChild(item);
        });
    }

    renderSavedPalette(order, secretMode, compactValues, veryCompactValues, topValues, middleValues) {
        if (secretMode) {
            this.dom.paletteContainer.innerHTML = '<div class="palette-standard-grid" aria-label="自分専用の有名角の値"></div><div class="palette-secret-grid" aria-label="自分専用の裏版追加値"></div>';
            const standardGrid = this.dom.paletteContainer.querySelector('.palette-standard-grid');
            const addedGrid = this.dom.paletteContainer.querySelector('.palette-secret-grid');
            order.forEach((valueId, index) => {
                const slot = this.getSecretPaletteSlot(index);
                const btn = document.createElement('button');
                const sizeClass = veryCompactValues.has(valueId) ? 'value-very-compact' : (compactValues.has(valueId) ? 'value-compact' : 'value-standard');
                const priorityClass = this.getPaletteSecretAddedValues().includes(valueId)
                    ? (topValues.has(valueId) ? 'priority-top' : (middleValues.has(valueId) ? 'priority-middle' : 'priority-hard'))
                    : 'priority-standard';
                btn.className = `palette-btn ${priorityClass} ${sizeClass}`;
                btn.dataset.valueId = valueId;
                btn.style.setProperty('--palette-p-row', slot.portrait[0]);
                btn.style.setProperty('--palette-p-col', slot.portrait[1]);
                btn.style.setProperty('--palette-w-row', slot.wide[0]);
                btn.style.setProperty('--palette-w-col', slot.wide[1]);
                btn.innerHTML = window.formatValueHtml(valueId, this.useRationalized);
                btn.addEventListener('click', () => this.handlePaletteSelect(valueId, btn));
                (slot.group === 'standard' ? standardGrid : addedGrid).appendChild(btn);
            });
            return;
        }
        this.dom.paletteContainer.innerHTML = '<div class="palette-custom-grid" aria-label="自分専用の値パレット"></div>';
        const grid = this.dom.paletteContainer.querySelector('.palette-custom-grid');
        order.forEach(valueId => {
            if (valueId === '__empty__') {
                const spacer = document.createElement('span');
                spacer.className = 'palette-empty-slot';
                spacer.setAttribute('aria-hidden', 'true');
                grid.appendChild(spacer);
                return;
            }
            const btn = document.createElement('button');
            const sizeClass = veryCompactValues.has(valueId) ? 'value-very-compact' : (compactValues.has(valueId) ? 'value-compact' : 'value-standard');
            const priorityClass = secretMode && this.getPaletteSecretAddedValues().includes(valueId)
                ? (topValues.has(valueId) ? 'priority-top' : (middleValues.has(valueId) ? 'priority-middle' : 'priority-hard'))
                : 'priority-standard';
            btn.className = `palette-btn ${priorityClass} ${sizeClass}`;
            btn.dataset.valueId = valueId;
            btn.innerHTML = window.formatValueHtml(valueId, this.useRationalized);
            btn.addEventListener('click', () => this.handlePaletteSelect(valueId, btn));
            grid.appendChild(btn);
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

        const isSecretPalette = this.mode === '1min-secret';
        const savedPaletteOrder = this.loadPaletteOrder(isSecretPalette);
        if (savedPaletteOrder) {
            this.renderSavedPalette(savedPaletteOrder, isSecretPalette, compactValues, veryCompactValues, topValues, middleValues);
            return;
        }

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
        if (this.dom.courseElapsedTimerQuestion) this.dom.courseElapsedTimerQuestion.hidden = false;
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
            if (this.dom.courseElapsedTimerQuestion) this.dom.courseElapsedTimerQuestion.hidden = true;
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
        if (this.dom.courseElapsedTimerQuestion) this.dom.courseElapsedTimerQuestion.textContent = label;
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
            : this.anglesShareTerminalSide(this.selectedAngle, this.currentQuestion.angle);
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
            // 不正解確認中も、この選択肢をもう一度押せば次へ進めるようにする。
            // 採点の二重実行は各クリック処理の isAnswered 判定で防ぐ。
            btn.setAttribute('aria-disabled', 'true');

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
            const d = parseFloat(grp.dataset.angle);
            grp.classList.remove('selected');
            if (this.anglesShareTerminalSide(d, this.currentQuestion.angle)) {
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

            if ([3, 5, 10].includes(this.streak)) this.showComboAnimation(this.streak);

            const justAwakened = this.mode === '1min-secret' && this.streak === 10;
            if (this.mode === '1min-secret' && this.streak >= 10) this.setSecretAwakening(true);

            this.updateBestChaseFeedback();

            // 正解音は毎問共通。コンボはテロップで知らせる。
            this.audio.playCorrect();

            // 裏版10連続時の特別感は、テロップと発光で見せる。
        } else {
            this.streak = 0;
            this.setSecretAwakening(false);
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
        this.setSecretAwakening(false);
        this.audio.playIncorrect();
        if (this.mode === 'endless') { this.lives--; this.updateLivesDisplay(); }

        this.visualizer.update(this.currentQuestion.angle, this.currentQuestion.func, null);

        // 時間切れでも正解位置・正解値と単位円の解説を表示する。
        const answerButtons = this.answerType === 'palette'
            ? this.dom.paletteContainer.querySelectorAll('.palette-btn')
            : this.dom.choicesContainer.querySelectorAll('.choice-btn');
        answerButtons.forEach(btn => {
            btn.classList.remove('selected');
            btn.setAttribute('aria-disabled', 'true');
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
                const angle = parseFloat(grp.dataset.angle);
                grp.classList.remove('selected');
                if (this.anglesShareTerminalSide(angle, this.currentQuestion.angle)) {
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



    ensureEngagementUi() {
        // Static telop rail is present in index.html. Keep a safe fallback for older cached HTML.
        let popup = document.getElementById('engagement-popup');
        if (popup) return popup;
        const card = this.dom?.quizScreen?.querySelector('.quiz-main-card');
        if (!card) return null;
        const rail = document.createElement('div');
        rail.id = 'engagement-rail';
        rail.className = 'engagement-rail engagement-rail-lower';
        rail.setAttribute('aria-live', 'polite');
        popup = document.createElement('div');
        popup.id = 'engagement-popup';
        popup.className = 'engagement-popup';
        rail.appendChild(popup);
        const footer = card.querySelector('.quiz-footer');
        if (footer) card.insertBefore(rail, footer);
        else card.appendChild(rail);
        return popup;
    }

    showBestChaseMessage(message, key) {
        if (!message) return;
        if (!this._bestChaseShown) this._bestChaseShown = new Set();
        if (key && this._bestChaseShown.has(key)) return;
        if (key) this._bestChaseShown.add(key);
        const badge = this.ensureEngagementUi();
        if (!badge) return;
        badge.textContent = message;
        badge.classList.remove('active', 'new-best', 'combo-pop');
        void badge.offsetWidth;
        if (message.includes('NEW BEST')) badge.classList.add('new-best');
        badge.classList.add('active');
        clearTimeout(this._bestChaseTimer);
        this._bestChaseTimer = setTimeout(() => badge.classList.remove('active'), 1250);
    }

    updateBestChaseFeedback() {

        const correctCount = this.history.filter(h => h.isCorrect).length;

        if (this.mode === '3min-challenge') {
            const best = Number(localStorage.getItem('trig-quiz-best-2min-challenge') || 0);
            if (!best) return;
            if (correctCount === Math.max(1, best - 3)) this.showBestChaseMessage('BESTまであと3！', '2min-3');
            if (correctCount === Math.max(1, best - 1)) this.showBestChaseMessage('BESTまであと1！', '2min-1');
            if (correctCount === best + 1) this.showBestChaseMessage('NEW BEST!', '2min-new');
            return;
        }

        if (this.mode === '1min-secret') {
            const best = Number(localStorage.getItem('trig-quiz-best-1min-secret') || 0);
            if (!best) return;
            if (correctCount === Math.max(1, best - 3)) this.showBestChaseMessage('BESTまであと3！', 'secret-3');
            if (correctCount === Math.max(1, best - 1)) this.showBestChaseMessage('BESTまであと1！', 'secret-1');
            if (correctCount === best + 1) this.showBestChaseMessage('NEW BEST!', 'secret-new');
            return;
        }

        if (this.mode === '20-challenge') {
            const bestTime = Number(localStorage.getItem('trig-quiz-best-20-challenge') || 0);
            if (!bestTime) return;
            const elapsed = this.getElapsedQuizTimeSeconds();
            if (correctCount === 15 && elapsed > 0 && elapsed < bestTime * 0.75) {
                this.showBestChaseMessage('BEST更新ペース！', '20-pace');
            }
            if (correctCount === 20 && elapsed > 0 && elapsed < bestTime) {
                this.showBestChaseMessage('NEW BEST!', '20-new');
            }
        }
    }

    setSecretAwakening(enabled) {
        const on = Boolean(enabled && this.mode === '1min-secret');
        this.dom.quizScreen?.classList.toggle('secret-awakened', on);
        document.body.classList.toggle('secret-awakened-play', on);
    }


    pulseUnitCircle(strong = false) {
        const circle = document.getElementById('quiz-unit-circle');
        if (!circle) return;
        circle.classList.remove('combo-ring-pulse', 'combo-ring-pulse-strong');
        void circle.offsetWidth;
        circle.classList.add(strong ? 'combo-ring-pulse-strong' : 'combo-ring-pulse');
        setTimeout(() => circle.classList.remove('combo-ring-pulse', 'combo-ring-pulse-strong'), strong ? 1100 : 650);
    }

    showComboAnimation(combo) {
        const popup = this.ensureEngagementUi();
        if (popup) {
            popup.textContent = `${combo} COMBO!`;
            popup.classList.remove('active', 'new-best', 'combo-pop');
            void popup.offsetWidth;
            popup.classList.add('combo-pop', 'active');
            clearTimeout(this._engagementPopupTimer);
            this._engagementPopupTimer = setTimeout(() => popup.classList.remove('active'), 1100);
        }
        if (combo === 5) this.pulseUnitCircle(false);
        if (combo === 10) this.pulseUnitCircle(true);
    }

    // ==========================================
    // Quiz Result Screen
    // ==========================================

    playPendingResultRankSound() {
        const rank = this.pendingResultRankSound;
        this.pendingResultRankSound = null;
        if (!rank) return;
        this.audio.playResultRank(rank);
    }

    launchConfetti() {
        const canvas = this.dom.confettiCanvas;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        const scale = Math.min(2, window.devicePixelRatio || 1);
        const width = window.innerWidth;
        const height = window.innerHeight;
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        const colors = ['#facc15', '#22c55e', '#38bdf8', '#fb7185', '#a78bfa', '#f97316'];
        const pieces = Array.from({ length: 90 }, () => ({
            x: Math.random() * width,
            y: -20 - Math.random() * height * .35,
            w: 5 + Math.random() * 6,
            h: 8 + Math.random() * 8,
            vx: (Math.random() - .5) * 3,
            vy: 3 + Math.random() * 4,
            spin: (Math.random() - .5) * .22,
            angle: Math.random() * Math.PI,
            color: colors[Math.floor(Math.random() * colors.length)]
        }));
        const startedAt = performance.now();
        const draw = now => {
            ctx.clearRect(0, 0, width, height);
            pieces.forEach(piece => {
                piece.x += piece.vx;
                piece.y += piece.vy;
                piece.angle += piece.spin;
                ctx.save();
                ctx.translate(piece.x, piece.y);
                ctx.rotate(piece.angle);
                ctx.fillStyle = piece.color;
                ctx.fillRect(-piece.w / 2, -piece.h / 2, piece.w, piece.h);
                ctx.restore();
            });
            if (now - startedAt < 1800) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, width, height);
        };
        requestAnimationFrame(draw);
    }

    finishQuiz() {
        this.setSecretAwakening(false);
        // 保存処理中に裏モードが解放されても、終了したクイズのモードは変えない。
        const completedMode = this.mode;
        this.lastCompletedSettings = {
            mode: completedMode,
            answerType: this.answerType,
            targetFunctions: [...this.targetFunctions],
            timeLimitSetting: this.timeLimitSetting,
            secretModeActive: this.secretModeActive,
            angleNotation: this.angleNotation
        };
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
        const wasSecretModeUnlocked = this.secretModeUnlocked;
        const isNewBest = this.savePersonalBest(completedMode);
        const secretModeJustUnlocked = !wasSecretModeUnlocked && this.secretModeUnlocked;
        this.showScreen('result');

        const achievementEvents = [];
        if (secretModeJustUnlocked) achievementEvents.push({ type: 'unlock' });
        if (isNewBest) achievementEvents.push({ type: 'best' });
        if (growthEvent) achievementEvents.push({ type: 'growth', ...growthEvent });

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
        // S+ uses the S result sound; record-unranked falls back to the C result sound.
        this.pendingResultRankSound = rank === 'S+' ? 'S' : (['S','A','B','C'].includes(rank) ? rank : 'C');
        if (completedMode !== '3min-challenge' && completedMode !== '1min-secret') {
            this.dom.resultScoreText.textContent = this.score.toLocaleString();
        }
        this.dom.resultAccuracyText.textContent = `${accuracy}% (${correctCount}/${total}問)`;
        const resultTitle = this.dom.resultScreen?.querySelector('h2');
        if (resultTitle) resultTitle.textContent = completedMode === '1min-secret'
            ? '裏・1分チャレンジ結果'
            : (completedMode === '3min-challenge' ? '2分チャレンジ結果' : '結果発表！');
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
            
            const qStr = `${h.func} ${this.formatAngleText(h.angle)}`;
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

        // Result sound priority:
        // - If a personal-best/growth popup exists, wait until the user finishes all popups
        //   and presses the final 「結果を見る」 button.
        // - If there is no popup, play the S/A/B/C sound on the result screen immediately.
        if (achievementEvents.length) {
            this.pendingAchievementEvents = achievementEvents;
            setTimeout(() => {
                const queued = this.pendingAchievementEvents || [];
                this.pendingAchievementEvents = [];
                this.showAchievementSequence(queued);
            }, 180);
        } else {
            setTimeout(() => this.playPendingResultRankSound(), 180);
        }

        if (rank === 'S' || rank === 'S+') {
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
            ? { sPlus: 30, s: 20, a: 15, b: 10 }
            : { sPlus: 80, s: 40, a: 30, b: 20 };
        if (correctCount >= thresholds.sPlus) return { rank: 'S+', rankClass: 'rank-s-plus' };
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
        const notationKey = this.angleNotation === 'radian' ? `${key}-radian` : key;
        const current = Number(localStorage.getItem(notationKey) || 0);
        const next = Math.min(50, current + 1);
        if (next === current) return null;
        localStorage.setItem(notationKey, String(next));
        const oldStage = Math.min(10, Math.floor(current / 5));
        const newStage = Math.min(10, Math.floor(next / 5));
        // 成長カウント自体は条件を満たすたびに増やすが、ポップは5の倍数だけ表示する。
        if (next % 5 !== 0) return null;
        return {
            secretMode: mode === '1min-secret',
            angleNotation: this.angleNotation,
            oldCount: current,
            newCount: next,
            oldStage,
            newStage
        };
    }

    renderPersonalBestPlant(secretMode) {
        if (!this.dom.personalBestPlant) return;
        const baseKey = secretMode ? 'trig-quiz-plant-secret-attempts' : 'trig-quiz-plant-normal-attempts';
        const key = this.angleNotation === 'radian' ? `${baseKey}-radian` : baseKey;
        const count = Math.min(50, Math.max(0, Number(localStorage.getItem(key) || 0)));
        const stage = Math.min(10, Math.floor(count / 5));
        const stageLabels = ['たね', '芽', '茎', '小さな葉', '葉', 'つぼみ', '育ったつぼみ', '花びら', '開花', 'もうすぐ満開', '満開'];
        this.dom.personalBestPlant.classList.toggle('secret-plant', secretMode);
        this.dom.personalBestPlant.classList.toggle('radian-plant', this.angleNotation === 'radian');
        this.dom.personalBestPlant.setAttribute('aria-label', `${this.angleNotation === 'radian' ? '数Ⅱ・弧度法' : '数Ⅰ・度数法'}、${secretMode ? '裏モード' : '通常モード'}の花：${count}回、${stageLabels[stage]}`);
        this.dom.personalBestPlant.innerHTML = `
            <span class="plant-sprite-viewport" aria-hidden="true">
                <span class="plant-sprite-sheet" style="--plant-stage:${stage};--plant-row:${secretMode ? 1 : 0}"></span>
            </span>
            <span class="plant-progress">${count}回<br><small>${stageLabels[stage]}</small></span>`;
    }

    showAchievementSequence(events = []) {
        this.achievementQueue = events.filter(Boolean);
        if (!this.dom.achievementOverlay) return;

        // Keep the overlay as a direct child of body so transformed/scaled screens cannot hide it.
        if (this.dom.achievementOverlay.parentElement !== document.body) {
            document.body.appendChild(this.dom.achievementOverlay);
        }

        if (!this.achievementQueue.length) {
            this.dom.achievementOverlay.hidden = true;
            this.dom.achievementOverlay.setAttribute('hidden', '');
            this.dom.achievementOverlay.style.setProperty('display', 'none', 'important');
            this.dom.achievementOverlay.classList.remove('is-visible');
            this.dom.achievementOverlay.setAttribute('aria-hidden', 'true');
            return;
        }
        this.showNextAchievement();
    }

    showNextAchievement() {
        if (!this.dom.achievementOverlay) return;
        const event = this.achievementQueue.shift();
        if (!event) {
            this.dom.achievementCard?.classList.remove('is-best', 'is-growth', 'is-unlock', 'achievement-pop');
            if (this.dom.achievementBestImage) this.dom.achievementBestImage.hidden = true;
            if (this.dom.achievementGrowthVisual) {
                this.dom.achievementGrowthVisual.hidden = true;
                this.dom.achievementGrowthVisual.classList.remove('secret-unlock-visual', 'secret-growth', 'radian-growth');
                this.dom.achievementGrowthVisual.innerHTML = '';
            }
            this.dom.achievementOverlay.hidden = true;
            this.dom.achievementOverlay.setAttribute('hidden', '');
            this.dom.achievementOverlay.style.setProperty('display', 'none', 'important');
            this.dom.achievementOverlay.classList.remove('is-visible');
            this.dom.achievementOverlay.setAttribute('aria-hidden', 'true');
            // This branch is reached after the final popup's 「結果を見る」 button is pressed.
            this.playPendingResultRankSound();
            return;
        }

        this.dom.achievementOverlay.hidden = false;
        this.dom.achievementOverlay.removeAttribute('hidden');
        this.dom.achievementOverlay.style.setProperty('display', 'grid', 'important');
        this.dom.achievementOverlay.style.setProperty('visibility', 'visible', 'important');
        this.dom.achievementOverlay.style.setProperty('opacity', '1', 'important');
        this.dom.achievementOverlay.style.setProperty('pointer-events', 'auto', 'important');
        this.dom.achievementOverlay.classList.add('is-visible');
        this.dom.achievementOverlay.setAttribute('aria-hidden', 'false');
        // 前の演出の画像・鍵・花を必ず消してから、次の演出を描画する。
        // 特に「裏版解放 → 自己ベスト」の順では、鍵が残るとボタンが枠外へ押し出される。
        this.dom.achievementGrowthVisual.classList.remove('secret-unlock-visual', 'secret-growth', 'radian-growth');
        this.dom.achievementGrowthVisual.innerHTML = '';
        this.dom.achievementCard.classList.toggle('is-best', event.type === 'best');
        this.dom.achievementCard.classList.toggle('is-growth', event.type === 'growth');
        this.dom.achievementCard.classList.toggle('is-unlock', event.type === 'unlock');
        this.dom.achievementBestImage.hidden = event.type !== 'best';
        this.dom.achievementGrowthVisual.hidden = event.type !== 'growth' && event.type !== 'unlock';
        this.dom.btnAchievementClose.textContent = this.achievementQueue.length ? '次の演出へ' : '結果を見る';

        if (event.type === 'best') {
            this.dom.achievementCopy.innerHTML = '<strong>自己ベストを更新しました！</strong><span>すばらしい記録です</span>';
        } else if (event.type === 'unlock') {
            this.dom.achievementGrowthVisual.classList.add('secret-unlock-visual');
            this.dom.achievementGrowthVisual.innerHTML = '<span class="secret-unlock-icon" aria-hidden="true">🔓</span><strong>裏版</strong>';
            this.dom.achievementCopy.innerHTML = '<strong>SS達成！ 裏版が解放されました</strong><span>表版の2コースでS以上を達成しました</span>';
        } else {
            const stageLabels = ['たね', '芽', '茎', '小さな葉', '葉', 'つぼみ', '育ったつぼみ', '花びら', '開花', 'もうすぐ満開', '満開'];
            const stageChanged = event.newStage > event.oldStage;
            const title = stageChanged
                ? `「${stageLabels[event.newStage]}」に成長！`
                : '花の成長ポイントが増えました！';
            this.dom.achievementGrowthVisual.classList.toggle('secret-growth', event.secretMode);
            this.dom.achievementGrowthVisual.classList.toggle('radian-growth', event.angleNotation === 'radian');
            this.dom.achievementGrowthVisual.innerHTML = `
                <span class="plant-sprite-viewport" aria-hidden="true">
                    <span class="plant-sprite-sheet" style="--plant-stage:${event.newStage};--plant-row:${event.secretMode ? 1 : 0}"></span>
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
            const key = this.bestStorageKey('trig-quiz-best-20-challenge');
            const correctKey = this.bestStorageKey('trig-quiz-best-20-correct');
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
            const key = this.bestStorageKey('trig-quiz-best-2min-challenge');
            const totalKey = this.bestStorageKey('trig-quiz-best-2min-total');
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
            const key = this.bestStorageKey('trig-quiz-best-1min-secret');
            const totalKey = this.bestStorageKey('trig-quiz-best-1min-secret-total');
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

        const best20 = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-20-challenge')));
        const storedBest20Correct = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-20-correct')));
        // Existing records were already limited to 18+ correct; preserve them when migrating.
        const best20Correct = storedBest20Correct || (best20 ? 18 : 0);
        const best3min = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-2min-challenge')));
        const best3minTotalStored = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-2min-total')));
        const best3minTotal = best3minTotalStored || best3min;
        const best3minQualifies = best3min > 0 && best3minTotal > 0 && best3min / best3minTotal >= 0.8;
        const bestSecret = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-1min-secret')));
        const bestSecretTotalStored = Number(localStorage.getItem(this.bestStorageKey('trig-quiz-best-1min-secret-total')));
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
        // 数Ⅰ（度数法）と数Ⅱ（弧度法）は、それぞれの記録だけで裏版を解放する。
        const hasNormalSS = (best20Rank === 'S' || best20Rank === 'S+')
            && (best2minRank === 'S' || best2minRank === 'S+');
        const hasEarnedCrown = hasNormalSS;
        this.secretCrownEarned = bestSecretRank === 'S' || bestSecretRank === 'S+';

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
            const labels = { 'S+': '80問以上・正答率80%以上', S: '40問以上・正答率80%以上', A: '30問以上・正答率80%以上', B: '20問以上・正答率80%以上', C: '20問未満・正答率80%以上', '—': '記録なし' };
            this.dom.personalBest2minRankMark.textContent = best2minRank;
            this.dom.personalBest2minRankMark.setAttribute('aria-label', labels[best2minRank]);
            this.dom.personalBest2minRankMark.title = labels[best2minRank];
        }
        if (this.dom.personalBestSecretRankMark) {
            const labels = { 'S+': '30問以上・正答率80%以上', S: '20問以上・正答率80%以上', A: '15問以上・正答率80%以上', B: '10問以上・正答率80%以上', C: '10問未満・正答率80%以上', '—': '記録なし' };
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

        // If the music toggle is ON, switch the track immediately when changing
        // between normal and secret worlds (even on the top screen).
        if (this.bgmEnabled) {
            this.audio.startBgm(active ? 'secret' : this.bgmTrack);
        }

        document.body.classList.toggle('secret-mode-unlocked', active);
        document.body.classList.toggle('secret-mode-available', this.secretModeUnlocked);
        if (this.dom.modeWorldSwitcher) this.dom.modeWorldSwitcher.hidden = !this.secretModeUnlocked;
        if (this.dom.btnNormalMode) {
            this.dom.btnNormalMode.textContent = '裏版';
            this.dom.btnNormalMode.title = '表版に切り替える';
            this.dom.btnNormalMode.hidden = !active;
        }
        if (this.dom.btnSecretMode) {
            this.dom.btnSecretMode.textContent = '表版';
            this.dom.btnSecretMode.title = '裏版に切り替える';
            this.dom.btnSecretMode.hidden = !this.secretModeUnlocked || active;
        }
        if (this.dom.btnReference) this.dom.btnReference.textContent = active ? '裏確認表' : '確認表';
        if (this.dom.btnPaletteSettings) this.dom.btnPaletteSettings.textContent = active ? '裏パレット設定' : 'パレット設定';
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
            const normalSettings = this.normalModeSettings || {
                mode: this.mode === '1min-secret' ? '20-challenge' : this.mode,
                answerType: this.answerType || 'palette',
                targetFunctions: Array.from(this.dom.funcCheckboxes).filter(input => input.checked).map(input => input.value),
                timeLimitSetting: Number.isFinite(this.timeLimitSetting) ? this.timeLimitSetting : 0
            };
            if (this.mode === '1min-secret') this.mode = normalSettings?.mode || '20-challenge';
            normalModeTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.mode === this.mode));
            this.dom.answerTypeInputs.forEach(input => {
                input.disabled = false;
                input.closest('.pill-option').hidden = false;
                input.checked = input.value === (normalSettings?.answerType || 'palette');
            });
            this.answerType = normalSettings?.answerType || 'palette';
            const normalFunctions = normalSettings?.targetFunctions?.length ? normalSettings.targetFunctions : ['sin', 'cos', 'tan'];
            this.dom.funcCheckboxes.forEach(input => {
                input.disabled = false;
                input.checked = normalFunctions.includes(input.value);
            });
            this.targetFunctions = [...normalFunctions];
            this.dom.timeLimitInputs.forEach(input => {
                input.disabled = false;
                input.closest('.pill-option').hidden = input.value === '2';
                input.checked = input.value === String(normalSettings?.timeLimitSetting ?? 0);
            });
            this.timeLimitSetting = 0;
            this.syncSelectionCards();
            this.buildReferenceTable();
            if (this.referenceGuideVisualizer) {
                const normalAngles = this.getCircleAnglePool();
                this.referenceGuideVisualizer.setAngles(normalAngles);
                const normalDefault = normalAngles.includes(45) ? 45 : normalAngles[0];
                this.referenceGuideAngle = normalDefault;
                this.updateReferenceGuide(normalDefault);
            }
            if (this.referenceVisualizer) {
                const normalAngles = this.getCircleAnglePool();
                this.referenceVisualizer.setAngles(normalAngles);
            }
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
        if (this.referenceGuideVisualizer) {
            const secretAngles = this.getCircleAnglePool();
            this.referenceGuideVisualizer.setAngles(secretAngles);
            const secretDefault = secretAngles[0];
            this.referenceGuideAngle = secretDefault;
            this.updateReferenceGuide(secretDefault);
        }
        if (this.referenceVisualizer) {
            const secretAngles = this.getCircleAnglePool();
            this.referenceVisualizer.setAngles(secretAngles);
        }
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
                    ${group.items.map(([name, valueId]) => {
                        const match = name.match(/^(sin|cos|tan)\s+([\d.]+)°$/);
                        const angleName = match && this.angleNotation === 'radian'
                            ? `${match[1]} ${this.formatAngleHtml(Number(match[2]))}`
                            : name;
                        return `<div class="memory-expression"><strong>${angleName}</strong><span class="memory-equals">＝</span><span class="memory-value">${window.formatValueHtml(valueId, this.useRationalized)}</span></div>`;
                    }).join('')}
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
        const referenceAngles = this.getActiveAnglePool();
        referenceAngles.forEach(deg => {
            const data = window.getTrigData(deg);
            if (!data) return;
            const row = document.createElement('tr');
            row.dataset.angle = deg;

            const sinVal = window.formatValueHtml(data.sin.valueId, this.useRationalized);
            const cosVal = window.formatValueHtml(data.cos.valueId, this.useRationalized);
            const tanVal = window.formatValueHtml(data.tan.valueId, this.useRationalized);

            row.innerHTML = `
                <td class="cell-angle"><strong>${this.formatAngleHtml(deg)}</strong></td>
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
        if (this.referenceGuideVisualizer) {
            const refAngles = this.getCircleAnglePool();
            this.referenceGuideVisualizer.setAngles(refAngles);
            if (!refAngles.includes(this.referenceGuideAngle)) {
                this.referenceGuideAngle = refAngles.includes(45) ? 45 : refAngles[0];
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
