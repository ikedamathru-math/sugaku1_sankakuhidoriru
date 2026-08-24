/**
 * Dynamic Interactive Semicircle (0° to 180°) SVG Visualizer
 * Supports direct clicking on unit circle points as well as answer check reveal.
 */

class UnitCircleVisualizer {
    constructor(svgContainerId, onPointClickCallback = null) {
        this.container = document.getElementById(svgContainerId);
        this.onPointClick = onPointClickCallback;
        this.R = (svgContainerId === 'quiz-unit-circle' || svgContainerId === 'reference-guide-circle') ? 132 : 120;
        this.angles = [0, 30, 45, 60, 90, 120, 135, 150, 180];
        this.currentAngle = 45;
        this.currentFunc = 'sin';
        this.isInteractive = true;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.renderBase();
    }

    setInteractive(enabled) {
        this.isInteractive = enabled;
        if (!this.container) return;
        const pts = this.container.querySelectorAll('.circle-point-group');
        pts.forEach(p => {
            if (enabled) {
                p.classList.remove('disabled');
            } else {
                p.classList.add('disabled');
            }
        });
    }

    renderBase() {
        const isReferenceBase = this.container && this.container.id === 'reference-guide-circle';
        const isQuizBase = this.container && this.container.id === 'quiz-unit-circle';
        const isLargeBase = isReferenceBase || isQuizBase;
        const axisMarkerId = `arrow-axis-${this.container ? this.container.id : 'circle'}`;
        const axisPositiveEnd = isLargeBase ? 160 : 148;
        const axisNegativeYEnd = isLargeBase ? 150 : 8;
        const axisPositiveYEnd = isLargeBase ? -158 : -145;
        this.container.innerHTML = `
            <svg viewBox="${this.container && this.container.id === 'reference-guide-circle' ? ((window.matchMedia && window.matchMedia('(max-width: 599px)').matches) ? '-180 -240 360 480' : '-225 -240 450 480') : (this.container && this.container.id === 'quiz-unit-circle' ? ((window.matchMedia && window.matchMedia('(max-width: 599px)').matches) ? '-180 -206 360 412' : '-225 -225 450 450') : '-175 -155 350 178')}" class="unit-circle-svg" aria-label="単位円の図解">
                <defs>
                    <!-- Arrow markers -->
                    <marker id="${axisMarkerId}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748b" />
                    </marker>
                    <!-- Glow filters -->
                    <filter id="glow-p" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <!-- Grid & Standard guide rays (faint dashed) -->
                <g class="guide-rays">
                    ${this.angles.map(deg => {
                        const rad = deg * Math.PI / 180;
                        const x = Math.cos(rad) * this.R;
                        const y = -Math.sin(rad) * this.R;
                        return `<line x1="0" y1="0" x2="${x}" y2="${y}" class="ray-line" />`;
                    }).join('')}
                </g>

                <!-- Tangent guide line (x = 1) -->
                <line x1="${this.R}" y1="${this.container && this.container.id === 'reference-guide-circle' ? -232 : ((this.container && this.container.id === 'quiz-unit-circle' && window.matchMedia && window.matchMedia('(max-width: 599px)').matches) ? -205 : -218)}" x2="${this.R}" y2="${this.container && this.container.id === 'reference-guide-circle' ? 232 : ((this.container && this.container.id === 'quiz-unit-circle' && window.matchMedia && window.matchMedia('(max-width: 599px)').matches) ? 205 : 218)}" class="tan-guide-line" />
                <text x="${this.R + 6}" y="-135" class="tan-guide-text"><tspan class="math-var">x</tspan> = 1</text>

                <!-- Main Axes (X & Y) - Clear margins to avoid overlap -->
                <line x1="${isLargeBase ? -160 : -145}" y1="0" x2="${axisPositiveEnd}" y2="0" class="axis-line" marker-end="url(#${axisMarkerId})" />
                <line x1="0" y1="${axisNegativeYEnd}" x2="0" y2="${axisPositiveYEnd}" class="axis-line" marker-end="url(#${axisMarkerId})" />
                <text x="168" y="3" class="axis-label" dominant-baseline="central">x</text>
                <text x="-8" y="-158" class="axis-label" text-anchor="end">y</text>
                <text x="-8" y="18" class="axis-label origin origin-big" text-anchor="end">O</text>
                
                <!-- Unit Semicircle (0° to 180°) -->
                <path d="M ${this.R} 0 A ${this.R} ${this.R} 0 0 0 ${-this.R} 0" class="circle-path" />
                ${this.container && (this.container.id === 'reference-guide-circle' || this.container.id === 'quiz-unit-circle') ? `<path d="M ${-this.R} 0 A ${this.R} ${this.R} 0 0 0 ${this.R} 0" class="circle-path reference-lower-circle-path" />` : ''}

                <!-- Interactive Points on Semicircle -->
                <g id="interactive-points-layer">
                    ${this.angles.map(deg => {
                        const rad = deg * Math.PI / 180;
                        const x = Math.cos(rad) * this.R;
                        const y = -Math.sin(rad) * this.R;
                        return `
                            <g class="circle-point-group" data-angle="${deg}">
                                <circle cx="${x}" cy="${y}" r="${isLargeBase ? 24 : 18}" class="point-hit-area" />
                                <circle cx="${x}" cy="${y}" r="${isLargeBase ? 9 : 7}" class="point-dot" />
                            </g>
                        `;
                    }).join('')}
                </g>

                <!-- Dynamic feedback is drawn last so its answer panel stays in front. -->
                <g id="dynamic-circle-layer"></g>
            </svg>
        `;

        this.dynamicLayer = this.container.querySelector('#dynamic-circle-layer');
        this.bindPointEvents();
    }

    bindPointEvents() {
        const pointGroups = this.container.querySelectorAll('.circle-point-group');
        pointGroups.forEach(grp => {
            const deg = parseInt(grp.dataset.angle, 10);
            grp.addEventListener('click', (e) => {
                if (!this.isInteractive) return;
                if (this.onPointClick) {
                    this.onPointClick(deg, grp);
                }
            });
        });
    }

    /**
     * 出題中（回答前）：角度や直角三角形は伏せ、位置選択可能なポイントのみ表示
     */
    hideDynamic() {
        if (!this.dynamicLayer) return;
        this.dynamicLayer.innerHTML = '';
        this.setInteractive(true);

        // Smartphone 4-choice: enlarge the selectable unit circle by using a tighter viewBox.
        const svg = this.container ? this.container.querySelector('svg.unit-circle-svg') : null;
        if (svg && this.container && (this.container.id === 'quiz-unit-circle' || this.container.id === 'reference-guide-circle')) {
            const isPhone = window.matchMedia && window.matchMedia('(max-width: 599px)').matches;
            svg.setAttribute('viewBox', this.container.id === 'reference-guide-circle' ? (isPhone ? '-180 -240 360 480' : '-225 -240 450 480') : (isPhone ? '-180 -206 360 412' : '-225 -225 450 450'));
        }
        if (this.container) this.container.classList.remove('steep-tan-feedback');

        // Reset point styles
        const pointGroups = this.container.querySelectorAll('.circle-point-group');
        pointGroups.forEach(grp => {
            grp.classList.remove('selected', 'correct', 'incorrect', 'selected-guide-point', 'selected-func-sin', 'selected-func-cos', 'selected-func-tan', 'selected-wrong-angle');
        });
    }

    /**
     * 答え合わせ時：角度ラベル・動径・直角三角形・数値を一斉にアニメーション表示
     * @param {number} deg - 正解の角度 (0 to 180)
     * @param {string} func - 'sin' | 'cos' | 'tan'
     * @param {number|null} userSelectedDeg - ユーザーが選択した角度（任意）
     */
    update(deg, func = 'all', userSelectedDeg = null) {
        if (!this.dynamicLayer) return;
        this.currentAngle = deg;
        this.currentFunc = func;
        this.setInteractive(false);

        const rad = (deg * Math.PI) / 180;
        const px = Math.cos(rad) * this.R;
        const py = -Math.sin(rad) * this.R; // SVGは上がマイナス

        const circleId = this.container ? this.container.id : '';
        const isReferenceGuide = circleId === 'reference-guide-circle';
        const isQuizCircle = circleId === 'quiz-unit-circle';
        const isExpandedCircle = isReferenceGuide || isQuizCircle;
        const showFullCircleForObtuse = isExpandedCircle;
        const svg = this.container ? this.container.querySelector('svg.unit-circle-svg') : null;
        if (svg && isExpandedCircle) {
            const isPhoneQuiz = isQuizCircle && window.matchMedia && window.matchMedia('(max-width: 599px)').matches;
            const isSteepQuizTan = isQuizCircle && func === 'tan' && Math.abs(Math.tan(rad)) > 1.5;
            if (isQuizCircle) this.container.classList.toggle('steep-tan-feedback', isSteepQuizTan);
            svg.setAttribute(
                'viewBox',
                isReferenceGuide
                    ? ((window.matchMedia && window.matchMedia('(max-width: 599px)').matches) ? '-180 -240 360 480' : '-225 -240 450 480')
                    : (isPhoneQuiz ? '-180 -206 360 412' : '-225 -225 450 450')
            );
            svg.setAttribute(
                'aria-label',
                showFullCircleForObtuse
                    ? '単位円の図解。鈍角のtanをx軸の下側まで表示'
                    : '単位円の半円図解 (0°〜180°)'
            );
        }

        // 角度円弧
        const arcRadius = 26;
        const arcEndX = Math.cos(rad) * arcRadius;
        const arcEndY = -Math.sin(rad) * arcRadius;
        const arcPath = `M ${arcRadius} 0 A ${arcRadius} ${arcRadius} 0 0 0 ${arcEndX} ${arcEndY}`;

        // 角度テキスト（扇形の中央）
        const midRad = rad / 2;
        const arcTextR = 38;
        const atx = Math.cos(midRad) * arcTextR;
        const aty = -Math.sin(midRad) * arcTextR;

        // 三角比データ
        const data = window.TRIG_DATA[deg];
        const valSin = data ? window.formatValueText(data.sin.valueId) : '';
        const valCos = data ? window.formatValueText(data.cos.valueId) : '';
        const valTan = data ? window.formatValueText(data.tan.valueId) : '';

        const svgValueMarkup = (valueId, x, y, labelClass) => {
            const negative = valueId.startsWith('-');
            const normalized = negative ? valueId.slice(1) : valueId;
            const glyph = token => token.replace('sqrt2', '√2').replace('sqrt3', '√3');
            if (normalized.includes('/')) {
                const [num, den] = normalized.split('/');
                const shift = negative ? 6 : 0;
                return `
                    <g class="answer-focus-value ${labelClass}" transform="translate(${x} ${y})">
                        ${negative ? '<text x="-13" y="0" class="answer-minus-sign" text-anchor="middle" dominant-baseline="middle">−</text>' : ''}
                        <text x="${shift}" y="-10" text-anchor="middle" dominant-baseline="middle">${glyph(num)}</text>
                        <line x1="${shift - 10}" y1="0" x2="${shift + 10}" y2="0" class="answer-fraction-bar" />
                        <text x="${shift}" y="11" text-anchor="middle" dominant-baseline="middle">${glyph(den)}</text>
                    </g>
                `;
            }
            const text = normalized === 'none' ? 'なし' : glyph(normalized);
            return `<text x="${x}" y="${y}" class="answer-focus-label ${labelClass}" text-anchor="middle" dominant-baseline="central">${negative ? '−' : ''}${text}</text>`;
        };

        const answerBoxMarkup = (valueId, x, y, labelClass) => {
            const normalized = valueId.startsWith('-') ? valueId.slice(1) : valueId;
            const isFraction = normalized.includes('/');
            const parts = isFraction ? normalized.split('/') : [normalized];
            const longest = Math.max(...parts.map(part => part.replace('sqrt2', '√2').replace('sqrt3', '√3').length));
            const hasMinus = valueId.startsWith('-');
            const minWidth = hasMinus ? (isFraction ? 54 : 44) : (isFraction ? 46 : 36);
            const width = Math.max(minWidth, Math.min(88, longest * 12 + (hasMinus ? 18 : 8)));
            const height = isFraction ? 52 : 30;
            const bgClass = labelClass.replace('focus-label', 'value-bg');
            const valueY = y;
            return `
                <rect x="${x - width / 2}" y="${y - height / 2}" width="${width}" height="${height}" rx="7" class="answer-value-bg ${bgClass}" />
                ${svgValueMarkup(valueId, x, valueY, labelClass)}
            `;
        };

        // Quiz feedback: show only the length that answers the current function.
        if (isQuizCircle) {
            let focusContent = '';
            let wrongAngleMark = '';
            const resultMarkRadius = this.R + 22;
            const resultMarkPosition = angle => {
                const markRad = (angle * Math.PI) / 180;
                let x = Math.cos(markRad) * resultMarkRadius;
                let y = -Math.sin(markRad) * resultMarkRadius;
                if (angle === 0) { x = this.R + 18; y = -17; }
                if (angle === 90) { x = 17; y = -(this.R + 20); }
                if (angle === 180) { x = -(this.R + 18); y = -17; }
                return { x, y };
            };
            const correctMarkPos = resultMarkPosition(deg);
            const correctAngleMark = `<text x="${correctMarkPos.x}" y="${correctMarkPos.y}" class="correct-angle-symbol func-${func}" text-anchor="middle">○</text>`;
            const hasWrongAngle = Number.isFinite(userSelectedDeg) && userSelectedDeg !== deg;
            if (hasWrongAngle) {
                const wrongMarkPos = resultMarkPosition(userSelectedDeg);
                wrongAngleMark = `<text x="${wrongMarkPos.x}" y="${wrongMarkPos.y}" class="wrong-angle-cross" text-anchor="middle">×</text>`;
            }
            if (func === 'sin') {
                const labelX = px + (px >= 0 ? -34 : 34);
                const labelY = py / 2;
                focusContent = `
                    <line x1="0" y1="${py}" x2="${px}" y2="${py}" class="answer-value-guide sin-answer-guide" />
                    <line x1="0" y1="0" x2="${px}" y2="0" class="answer-triangle-line" />
                    <line x1="0" y1="0" x2="${px}" y2="${py}" class="answer-triangle-line" />
                    <line x1="${px}" y1="0" x2="${px}" y2="${py}" class="component-line sin-line answer-focus-line" />
                    ${answerBoxMarkup(data.sin.valueId, labelX, labelY, 'sin-focus-label')}
                `;
            } else if (func === 'cos') {
                const labelX = Math.abs(px) < 12 ? 40 : px / 2;
                const labelY = data.cos.valueId.includes('/') ? 32 : 22;
                focusContent = `
                    <line x1="${px}" y1="0" x2="${px}" y2="${py}" class="answer-value-guide cos-answer-guide" />
                    <line x1="0" y1="0" x2="${px}" y2="${py}" class="answer-triangle-line" />
                    <line x1="0" y1="0" x2="${px}" y2="0" class="component-line cos-line answer-focus-line" />
                    <circle cx="${px}" cy="${py}" r="9" class="answer-point-mask cos-answer-point-mask" />
                    ${answerBoxMarkup(data.cos.valueId, labelX, labelY, 'cos-focus-label')}
                `;
            } else if (deg === 90) {
                const tanFullLimit = window.matchMedia && window.matchMedia('(max-width: 599px)').matches ? 205 : 218;
                focusContent = `
                    <line x1="${this.R}" y1="${-tanFullLimit}" x2="${this.R}" y2="${tanFullLimit}" class="component-line tan-line answer-focus-line" />
                    ${answerBoxMarkup(data.tan.valueId, this.R - 36, -54, 'tan-focus-label')}
                `;
            } else {
                const tanY = -Math.tan(rad) * this.R;
                const isSteepTan = Math.abs(Math.tan(rad)) > 1.5;
                const tanLimit = isSteepTan ? 232 : (window.matchMedia && window.matchMedia('(max-width: 599px)').matches ? 205 : 218);
                const displayTanY = Math.max(-tanLimit, Math.min(tanLimit, tanY));
                const labelX = this.R - 34;
                const labelY = displayTanY / 2;
                const guideStartX = px < 0 ? px : 0;
                const guideStartY = px < 0 ? py : 0;
                focusContent = `
                    <line x1="0" y1="0" x2="${this.R}" y2="0" class="answer-triangle-line" />
                    <line x1="${guideStartX}" y1="${guideStartY}" x2="${this.R}" y2="${displayTanY}" class="answer-value-guide tan-answer-guide" />
                    <line x1="${this.R}" y1="0" x2="${this.R}" y2="${displayTanY}" class="component-line tan-line answer-focus-line" />
                    <circle cx="${this.R}" cy="${displayTanY}" r="7" class="tan-answer-intersection" />
                    ${answerBoxMarkup(data.tan.valueId, labelX, labelY, 'tan-focus-label')}
                `;
            }

            this.dynamicLayer.innerHTML = `
                <circle cx="${px}" cy="${py}" r="8.5" class="point-p answer-focus-point func-${func}" />
                ${focusContent}
                ${correctAngleMark}
                ${wrongAngleMark}
            `;

            const pointGroups = this.container.querySelectorAll('.circle-point-group');
            pointGroups.forEach(grp => {
                const d = parseInt(grp.dataset.angle, 10);
                grp.classList.remove('correct', 'incorrect', 'selected-guide-point', 'selected-func-sin', 'selected-func-cos', 'selected-func-tan', 'selected-wrong-angle');
                if (d === deg) grp.classList.add('selected-guide-point', `selected-func-${func}`);
                if (hasWrongAngle && d === userSelectedDeg) grp.classList.add('selected-wrong-angle');
            });
            return;
        }

        // 直角マーク
        let rightAngleMark = '';
        if (deg !== 0 && deg !== 90 && deg !== 180) {
            const sq = 6.5;
            const signX = px >= 0 ? -1 : 1;
            rightAngleMark = `
                <path d="M ${px + signX * sq} 0 L ${px + signX * sq} ${-sq} L ${px} ${-sq}" class="right-angle-mark" />
            `;
        }

        // Angle labels: place near arc, with fine-tuning per angle to avoid axis overlap
        const angleLabels = this.angles.map(d => {
            const r = d * Math.PI / 180;
            let labelR = this.R + 9; // close to arc
            if (d === 30 || d === 45 || d === 60) { labelR = this.R + 16; } // a little farther from the arc
            let lx = Math.cos(r) * labelR;
            let ly = -Math.sin(r) * labelR;

            // Fine-tune per angle to avoid axis overlap
            let offsetX = 0, offsetY = 0;
            if (d === 0)   { offsetX = 6;  offsetY = 15; } // blue label stays beside the right vertex
            if (d === 180) { offsetX = 5; offsetY = -10; } // upper-left of the vertex, inside the frame
            if (d === 30)  { offsetX = 2;  offsetY = 0; }
            if (d === 45)  { offsetX = 2;  offsetY = -1; }
            if (d === 60)  { offsetX = 1;  offsetY = -1; }
            if (d === 90)  { offsetX = 18; offsetY = -6; } // farther right of the y-axis

            let anchor = 'middle';
            if (d === 0) anchor = 'start';
            else if (d === 180) anchor = 'end';
            else if (d < 90) anchor = 'start';
            else if (d > 90) anchor = 'end';

            const isActive = d === deg;
            return `
                <text x="${lx + offsetX}" y="${ly + offsetY}"
                      class="guide-deg-label anim-fade-in ${isActive ? 'active-deg' : ''}"
                      text-anchor="${anchor}">${d}°</text>
            `;
        }).join('');

        let content = `

            <!-- Circle Angle Labels -->
            <g class="deg-labels-group">${angleLabels}</g>

            <!-- Angle Arc -->
            <path d="${arcPath}" class="angle-arc anim-fade-in" />
            <text x="${atx}" y="${deg === 0 ? aty + 15 : aty}" class="angle-text anim-fade-in" text-anchor="middle" dominant-baseline="central">${deg}°</text>

            <!-- Right Triangle Fill -->
            <polygon points="0,0 ${px},0 ${px},${py}" class="triangle-fill anim-fade-in" />
            ${rightAngleMark}

            <!-- Cos component (x on axis) -->
            <line x1="0" y1="0" x2="${px}" y2="0" class="component-line cos-line active-func" />

            <!-- Sin component (y vertical) -->
            <line x1="${px}" y1="0" x2="${px}" y2="${py}" class="component-line sin-line active-func" />

            <!-- Radius (Hypotenuse) -->
            <line x1="0" y1="0" x2="${px}" y2="${py}" class="radius-line" />
        `;
        // Tan 表示 (always show on the x=1 tangent line)
        if (deg === 90) {
            content += `
                <line x1="${this.R}" y1="${isReferenceGuide ? -232 : (isExpandedCircle ? -218 : -148)}" x2="${this.R}" y2="${isReferenceGuide ? 232 : 8}" class="component-line tan-line active-func" />
                <g class="tan-badge anim-fade-in">
                    <rect x="${this.R + 6}" y="-78" width="88" height="20" rx="4" fill="#ffffff" stroke="#059669" stroke-width="1.2" />
                    <text x="${this.R + 50}" y="-64" class="component-label tan-label" text-anchor="middle">tan=なし</text>
                </g>
            `;
        } else {
            const tanVal = Math.tan(rad);
            const tanY = -tanVal * this.R;
            const isPhoneQuizTan = isQuizCircle && window.matchMedia && window.matchMedia('(max-width: 599px)').matches;
            const tanLimit = isReferenceGuide ? 232 : (isPhoneQuizTan ? 205 : (isExpandedCircle ? 218 : 145));
            const displayTanY = Math.max(-tanLimit, Math.min(tanLimit, tanY));
            content += `
                <line x1="0" y1="0" x2="${this.R}" y2="${tanY}" class="tan-extend-line anim-fade-in" stroke-dasharray="3,3" />
                <line x1="${this.R}" y1="0" x2="${this.R}" y2="${displayTanY}" class="component-line tan-line active-func" />
                <circle cx="${this.R}" cy="${tanY}" r="4.5" class="tan-point" />
            `;
            const badgeY = isPhoneQuizTan
                ? (tanY < 0
                    ? Math.max(-188, Math.min(-22, tanY / 2 - 10))
                    : Math.min(168, Math.max(18, tanY / 2 - 10)))
                : (isExpandedCircle
                    ? (tanY < 0
                        ? Math.max(-200, Math.min(-26, tanY / 2 - 10))
                        : Math.min(198, Math.max(24, tanY / 2 - 10)))
                    : Math.min(6, Math.max(-140, tanY / 2 - 10)));
            content += `
                <g class="tan-badge anim-fade-in">
                    <rect x="${isExpandedCircle ? this.R + 2 : this.R + 6}" y="${badgeY}" width="${isExpandedCircle ? 82 : 88}" height="20" rx="4" fill="#ffffff" stroke="#059669" stroke-width="1.2" />
                    <text x="${isExpandedCircle ? this.R + 43 : this.R + 50}" y="${badgeY + 14}" class="component-label tan-label" text-anchor="middle">tan=${valTan}</text>
                </g>
            `;
        }

        // 点Pの座標バッジ
        let pLabelX = px;
        let pLabelY = py - 13;
        if (deg === 0) { pLabelX = px - 18; pLabelY = py - 14; }
        else if (deg === 180) { pLabelX = px + 22; pLabelY = py - 14; }
        else if (deg === 90) { pLabelX = px + 30; pLabelY = py + 4; }
        else if (deg < 90) { pLabelX = px - 24; pLabelY = py - 8; }
        else { pLabelX = px + 24; pLabelY = py - 8; }

        content += `
            <circle cx="${px}" cy="${py}" r="5.5" class="point-p" filter="url(#glow-p)" />
            <g class="p-coord-badge anim-fade-in">
                <rect x="${pLabelX - 36}" y="${pLabelY - 11}" width="72" height="18" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="1" />
                <text x="${pLabelX}" y="${pLabelY + 2}" class="point-label" text-anchor="middle">P(${valCos}, ${valSin})</text>
            </g>
        `;
        // 数値ラベル（cos & sin）
        const cosBadgeX = px === 0 ? 30 : (px > 0 ? Math.max(30, px / 2) : Math.min(-30, px / 2));
        const cosBadgeY = deg === 0 || deg === 180 ? -12 : 10;
        content += `
            <g class="cos-badge anim-fade-in">
                <rect x="${cosBadgeX - 34}" y="${cosBadgeY}" width="68" height="17" rx="4" fill="#ffffff" stroke="#0284c7" stroke-width="1.2" />
                <text x="${cosBadgeX}" y="${cosBadgeY + 12}" class="component-label cos-label" text-anchor="middle">cos=${valCos}</text>
            </g>
        `;
        const sinBadgeX = px >= 0 ? (px === 0 ? 34 : px - 36) : px + 36;
        const sinBadgeY = deg === 0 ? -20 : (deg === 180 ? -20 : (deg === 90 ? py/2 - 2 : py / 2 - 6));
        content += `
            <g class="sin-badge anim-fade-in">
                <rect x="${sinBadgeX - 34}" y="${sinBadgeY}" width="68" height="17" rx="4" fill="#ffffff" stroke="#e11d48" stroke-width="1.2" />
                <text x="${sinBadgeX}" y="${sinBadgeY + 12}" class="component-label sin-label" text-anchor="middle">sin=${valSin}</text>
            </g>
        `;

        this.dynamicLayer.innerHTML = content;

        // Highlight only the current point in a neutral blue for the guide screen
        const pointGroups = this.container.querySelectorAll('.circle-point-group');
        pointGroups.forEach(grp => {
            const d = parseInt(grp.dataset.angle, 10);
            grp.classList.remove('correct', 'incorrect', 'selected-guide-point');
            if (d === deg) {
                grp.classList.add('selected-guide-point');
            }
        });
    }
}

window.UnitCircleVisualizer = UnitCircleVisualizer;
