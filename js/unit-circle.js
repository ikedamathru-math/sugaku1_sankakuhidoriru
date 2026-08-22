/**
 * Dynamic Interactive Semicircle (0° to 180°) SVG Visualizer
 * Supports direct clicking on unit circle points as well as answer check reveal.
 */

class UnitCircleVisualizer {
    constructor(svgContainerId, onPointClickCallback = null) {
        this.container = document.getElementById(svgContainerId);
        this.onPointClick = onPointClickCallback;
        this.R = 120; // Semicircle radius
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
        this.container.innerHTML = `
            <svg viewBox="${(this.container && (this.container.id === 'reference-guide-circle' || this.container.id === 'quiz-unit-circle')) ? '-225 -225 450 450' : '-175 -155 350 178'}" class="unit-circle-svg" aria-label="単位円の図解">
                <defs>
                    <!-- Arrow markers -->
                    <marker id="arrow-axis" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
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
                <line x1="${this.R}" y1="${this.container && this.container.id === 'reference-guide-circle' ? -218 : (this.container && this.container.id === 'quiz-unit-circle' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? -148 : -218)}" x2="${this.R}" y2="${this.container && this.container.id === 'reference-guide-circle' ? 218 : (this.container && this.container.id === 'quiz-unit-circle' && window.matchMedia && window.matchMedia('(max-width: 767px)').matches ? 148 : 218)}" class="tan-guide-line" />
                <text x="${this.R + 6}" y="-135" class="tan-guide-text"><tspan class="math-var">x</tspan>=1</text>

                <!-- Main Axes (X & Y) - Clear margins to avoid overlap -->
                <line x1="-145" y1="0" x2="148" y2="0" class="axis-line" marker-end="url(#arrow-axis)" />
                <line x1="0" y1="${this.container && this.container.id === 'reference-guide-circle' ? 145 : 8}" x2="0" y2="-145" class="axis-line" marker-end="url(#arrow-axis)" />
                <text x="154" y="3" class="axis-label" dominant-baseline="central">x</text>
                <text x="-8" y="-142" class="axis-label" text-anchor="end">y</text>
                <text x="-8" y="18" class="axis-label origin origin-big" text-anchor="end">O</text>
                
                <!-- Unit Semicircle (0° to 180°) -->
                <path d="M ${this.R} 0 A ${this.R} ${this.R} 0 0 0 ${-this.R} 0" class="circle-path" />
                ${this.container && (this.container.id === 'reference-guide-circle' || this.container.id === 'quiz-unit-circle') ? `<path d="M ${-this.R} 0 A ${this.R} ${this.R} 0 0 0 ${this.R} 0" class="circle-path reference-lower-circle-path" />` : ''}

                <!-- Dynamic Layer (Angles, Triangles, Answer components) -->
                <g id="dynamic-circle-layer"></g>

                <!-- Interactive Points on Semicircle -->
                <g id="interactive-points-layer">
                    ${this.angles.map(deg => {
                        const rad = deg * Math.PI / 180;
                        const x = Math.cos(rad) * this.R;
                        const y = -Math.sin(rad) * this.R;
                        return `
                            <g class="circle-point-group" data-angle="${deg}">
                                <circle cx="${x}" cy="${y}" r="18" class="point-hit-area" />
                                <circle cx="${x}" cy="${y}" r="7" class="point-dot" />
                            </g>
                        `;
                    }).join('')}
                </g>
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
        if (svg && this.container && this.container.id === 'quiz-unit-circle') {
            const isPhone = window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
            svg.setAttribute('viewBox', isPhone ? '-158 -158 316 316' : '-225 -225 450 450');
        }

        // Reset point styles
        const pointGroups = this.container.querySelectorAll('.circle-point-group');
        pointGroups.forEach(grp => {
            grp.classList.remove('selected', 'correct', 'incorrect', 'selected-guide-point');
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
            const isPhoneQuiz = isQuizCircle && window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
            svg.setAttribute(
                'viewBox',
                isPhoneQuiz ? '-158 -158 316 316' : '-225 -225 450 450'
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
            if (d === 0)   { offsetX = 6;  offsetY = 15; } // below right end
            if (d === 180) { offsetX = -6; offsetY = 15; } // below left end
            if (d === 30)  { offsetX = 2;  offsetY = 0; }
            if (d === 45)  { offsetX = 2;  offsetY = -1; }
            if (d === 60)  { offsetX = 1;  offsetY = -1; }
            if (d === 90)  { offsetX = 10; offsetY = -6; } // slightly right and closer

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
            <text x="${atx}" y="${aty}" class="angle-text anim-fade-in" text-anchor="middle" dominant-baseline="central">${deg}°</text>

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
                <line x1="${this.R}" y1="${isExpandedCircle ? -218 : -148}" x2="${this.R}" y2="8" class="component-line tan-line active-func" />
                <g class="tan-badge anim-fade-in">
                    <rect x="${this.R + 6}" y="-78" width="88" height="20" rx="4" fill="#ffffff" stroke="#059669" stroke-width="1.2" />
                    <text x="${this.R + 50}" y="-64" class="component-label tan-label" text-anchor="middle">tan=なし</text>
                </g>
            `;
        } else {
            const tanVal = Math.tan(rad);
            const tanY = -tanVal * this.R;
            const tanLimit = isExpandedCircle ? 218 : 145;
            const displayTanY = Math.max(-tanLimit, Math.min(tanLimit, tanY));
            content += `
                <line x1="0" y1="0" x2="${this.R}" y2="${tanY}" class="tan-extend-line anim-fade-in" stroke-dasharray="3,3" />
                <line x1="${this.R}" y1="0" x2="${this.R}" y2="${displayTanY}" class="component-line tan-line active-func" />
                <circle cx="${this.R}" cy="${tanY}" r="4.5" class="tan-point anim-pop" />
            `;
            const badgeY = isExpandedCircle
                ? (tanY < 0
                    ? Math.max(-200, Math.min(-26, tanY / 2 - 10))
                    : Math.min(198, Math.max(24, tanY / 2 - 10)))
                : Math.min(6, Math.max(-140, tanY / 2 - 10));
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
            <circle cx="${px}" cy="${py}" r="5.5" class="point-p anim-pop" filter="url(#glow-p)" />
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
