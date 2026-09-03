/**
 * Trigonometric Ratio Dataset (0° to 180°)
 * Standard Angles: 0°, 30°, 45°, 60°, 90°, 120°, 135°, 150°, 180°
 */

const ANGLES = [0, 30, 45, 60, 90, 120, 135, 150, 180];
const FUNCTIONS = ['sin', 'cos', 'tan'];
const STANDARD_VALUE_IDS = [
    '0', '1/2', '-1/2', '1/sqrt2', '-1/sqrt2',
    'sqrt3/2', '-sqrt3/2', '1', '-1',
    '1/sqrt3', '-1/sqrt3', 'sqrt3', '-sqrt3', 'none'
];

const MINUS = '<span class="minus-sign">−</span>';

// 全ての取り得る値の定義（パレット・選択肢用）
const VALUE_DEFS = {
    '0': { id: '0', standard: '0', rationalized: '0', val: 0, label: '0' },
    '1/2': { id: '1/2', standard: '1/2', rationalized: '1/2', val: 0.5, html: '<span class="fraction"><span class="num">1</span><span class="den">2</span></span>' },
    '-1/2': { id: '-1/2', standard: '-1/2', rationalized: '-1/2', val: -0.5, html: `${MINUS}<span class="fraction"><span class="num">1</span><span class="den">2</span></span>` },
    
    '1/sqrt2': { 
        id: '1/sqrt2', 
        standard: '1/√2', 
        rationalized: '√2/2', 
        val: 1 / Math.SQRT2, 
        htmlStd: '<span class="fraction"><span class="num">1</span><span class="den">√2</span></span>',
        htmlRat: '<span class="fraction"><span class="num">√2</span><span class="den">2</span></span>'
    },
    '-1/sqrt2': { 
        id: '-1/sqrt2', 
        standard: '-1/√2', 
        rationalized: '-√2/2', 
        val: -1 / Math.SQRT2, 
        htmlStd: `${MINUS}<span class="fraction"><span class="num">1</span><span class="den">√2</span></span>`,
        htmlRat: `${MINUS}<span class="fraction"><span class="num">√2</span><span class="den">2</span></span>`
    },

    'sqrt3/2': { 
        id: 'sqrt3/2', 
        standard: '√3/2', 
        rationalized: '√3/2', 
        val: Math.sqrt(3) / 2, 
        html: '<span class="fraction"><span class="num">√3</span><span class="den">2</span></span>' 
    },
    '-sqrt3/2': { 
        id: '-sqrt3/2', 
        standard: '-√3/2', 
        rationalized: '-√3/2', 
        val: -Math.sqrt(3) / 2, 
        html: `${MINUS}<span class="fraction"><span class="num">√3</span><span class="den">2</span></span>` 
    },

    '1': { id: '1', standard: '1', rationalized: '1', val: 1, label: '1' },
    '-1': { id: '-1', standard: '-1', rationalized: '-1', val: -1, label: `${MINUS}1` },

    '1/sqrt3': { 
        id: '1/sqrt3', 
        standard: '1/√3', 
        rationalized: '√3/3', 
        val: 1 / Math.sqrt(3), 
        htmlStd: '<span class="fraction"><span class="num">1</span><span class="den">√3</span></span>',
        htmlRat: '<span class="fraction"><span class="num">√3</span><span class="den">3</span></span>'
    },
    '-1/sqrt3': { 
        id: '-1/sqrt3', 
        standard: '-1/√3', 
        rationalized: '-√3/3', 
        val: -1 / Math.sqrt(3), 
        htmlStd: `${MINUS}<span class="fraction"><span class="num">1</span><span class="den">√3</span></span>`,
        htmlRat: `${MINUS}<span class="fraction"><span class="num">√3</span><span class="den">3</span></span>`
    },

    'sqrt3': { id: 'sqrt3', standard: '√3', rationalized: '√3', val: Math.sqrt(3), label: '√3' },
    '-sqrt3': { id: '-sqrt3', standard: '-√3', rationalized: '-√3', val: -Math.sqrt(3), label: `${MINUS}√3` },

    'sqrt6-sqrt2/4': { id: 'sqrt6-sqrt2/4', standard: '(√6−√2)/4', rationalized: '(√6−√2)/4', val: (Math.sqrt(6) - Math.sqrt(2)) / 4, html: '<span class="fraction wide-fraction"><span class="num">√6−√2</span><span class="den">4</span></span>' },
    'sqrt6+sqrt2/4': { id: 'sqrt6+sqrt2/4', standard: '(√6+√2)/4', rationalized: '(√6+√2)/4', val: (Math.sqrt(6) + Math.sqrt(2)) / 4, html: '<span class="fraction wide-fraction"><span class="num">√6＋√2</span><span class="den">4</span></span>' },
    '2-sqrt3': { id: '2-sqrt3', standard: '2−√3', rationalized: '2−√3', val: 2 - Math.sqrt(3), label: '2−√3' },
    '2+sqrt3': { id: '2+sqrt3', standard: '2+√3', rationalized: '2+√3', val: 2 + Math.sqrt(3), label: '2＋√3' },
    'sqrt5-1/4': { id: 'sqrt5-1/4', standard: '(√5−1)/4', rationalized: '(√5−1)/4', val: (Math.sqrt(5) - 1) / 4, html: '<span class="fraction wide-fraction"><span class="num">√5−1</span><span class="den">4</span></span>' },
    'sqrt5+1/4': { id: 'sqrt5+1/4', standard: '(√5+1)/4', rationalized: '(√5+1)/4', val: (Math.sqrt(5) + 1) / 4, html: '<span class="fraction wide-fraction"><span class="num">√5＋1</span><span class="den">4</span></span>' },
    'sqrt2-1': { id: 'sqrt2-1', standard: '√2−1', rationalized: '√2−1', val: Math.sqrt(2) - 1, label: '√2−1' },
    'sqrt2+1': { id: 'sqrt2+1', standard: '√2+1', rationalized: '√2+1', val: Math.sqrt(2) + 1, label: '√2＋1' },
    'sqrt(2-sqrt2)/2': { id: 'sqrt(2-sqrt2)/2', standard: '√(2−√2)/2', rationalized: '√(2−√2)/2', val: Math.sqrt(2 - Math.sqrt(2)) / 2, html: '<span class="fraction wide-fraction"><span class="num">√<span class="radicand">2−√2</span></span><span class="den">2</span></span>' },
    'sqrt(2+sqrt2)/2': { id: 'sqrt(2+sqrt2)/2', standard: '√(2+√2)/2', rationalized: '√(2+√2)/2', val: Math.sqrt(2 + Math.sqrt(2)) / 2, html: '<span class="fraction wide-fraction"><span class="num">√<span class="radicand">2＋√2</span></span><span class="den">2</span></span>' },
    'sqrt(10+2sqrt5)/4': { id: 'sqrt(10+2sqrt5)/4', standard: '√(10+2√5)/4', rationalized: '√(10+2√5)/4', val: Math.sqrt(10 + 2 * Math.sqrt(5)) / 4, html: '<span class="fraction wide-fraction"><span class="num">√<span class="radicand">10＋2√5</span></span><span class="den">4</span></span>' },
    'sqrt(10-2sqrt5)/4': { id: 'sqrt(10-2sqrt5)/4', standard: '√(10−2√5)/4', rationalized: '√(10−2√5)/4', val: Math.sqrt(10 - 2 * Math.sqrt(5)) / 4, html: '<span class="fraction wide-fraction"><span class="num">√<span class="radicand">10−2√5</span></span><span class="den">4</span></span>' },
    'tan18': { id: 'tan18', standard: '1/√(5+2√5)', rationalized: '1/√(5+2√5)', val: Math.tan(Math.PI / 10), html: '<span class="fraction extra-wide-fraction"><span class="num">1</span><span class="den">√<span class="radicand">5＋2√5</span></span></span>' },
    'tan36': { id: 'tan36', standard: '√(5−2√5)', rationalized: '√(5−2√5)', val: Math.tan(Math.PI / 5), html: '√<span class="radicand">5−2√5</span>' },
    'tan54': { id: 'tan54', standard: '1/√(5−2√5)', rationalized: '1/√(5−2√5)', val: Math.tan(3 * Math.PI / 10), html: '<span class="fraction extra-wide-fraction"><span class="num">1</span><span class="den">√<span class="radicand">5−2√5</span></span></span>' },
    'tan72': { id: 'tan72', standard: '√(5+2√5)', rationalized: '√(5+2√5)', val: Math.tan(2 * Math.PI / 5), html: '√<span class="radicand">5＋2√5</span>' },

    'none': { id: 'none', standard: 'なし', rationalized: 'なし', val: null, label: 'なし' }
};

const SECRET_ANGLES = [15, 18, 22.5, 36, 54, 67.5, 72, 75];

// 角度ごとのデータテーブル
const TRIG_DATA = {
    0: {
        sin: { valueId: '0', explanation: '0°のとき点P(1, 0)となり、y座標は 0 です。' },
        cos: { valueId: '1', explanation: '0°のとき点P(1, 0)となり、x座標は 1 です。' },
        tan: { valueId: '0', explanation: 'tan 0° = sin 0° / cos 0° = 0 / 1 = 0 です（動径の傾きが0）。' }
    },
    30: {
        sin: { valueId: '1/2', explanation: '30°-60°-90°の直角三角形（斜辺2, 対辺1, 底辺√3）より、sin 30° = 1/2 です。' },
        cos: { valueId: 'sqrt3/2', explanation: '30°-60°-90°の直角三角形より、cos 30° = √3/2 です。' },
        tan: { valueId: '1/sqrt3', explanation: 'tan 30° = 対辺/隣辺 = 1/√3 (有理化すると √3/3) です。' }
    },
    45: {
        sin: { valueId: '1/sqrt2', explanation: '45°-45°-90°の直角二等辺三角形（辺比 1 : 1 : √2）より、sin 45° = 1/√2 (√2/2) です。' },
        cos: { valueId: '1/sqrt2', explanation: '45°-45°-90°の直角二等辺三角形より、cos 45° = 1/√2 (√2/2) です。' },
        tan: { valueId: '1', explanation: 'tan 45° = 対辺/隣辺 = 1/1 = 1 です（傾きが45°で1）。' }
    },
    60: {
        sin: { valueId: 'sqrt3/2', explanation: '60°-30°-90°の直角三角形より、点Pのy座標は √3/2 です。' },
        cos: { valueId: '1/2', explanation: '60°-30°-90°の直角三角形より、点Pのx座標は 1/2 です。' },
        tan: { valueId: 'sqrt3', explanation: 'tan 60° = 対辺/隣辺 = √3/1 = √3 です。' }
    },
    90: {
        sin: { valueId: '1', explanation: '90°のとき点P(0, 1)となり、y座標は 1（最大値）です。' },
        cos: { valueId: '0', explanation: '90°のとき点P(0, 1)となり、x座標は 0 です。' },
        tan: { valueId: 'none', explanation: 'x=0 となるため分母が0となり、tan 90° は定義されません（「なし」）。' }
    },
    120: {
        sin: { valueId: 'sqrt3/2', explanation: '120° = 180° - 60° です。第2象限でも y > 0 なので sin 120° = sin 60° = √3/2 です。' },
        cos: { valueId: '-1/2', explanation: '120° = 180° - 60° です。第2象限では x < 0 なので cos 120° = -cos 60° = -1/2 です。' },
        tan: { valueId: '-sqrt3', explanation: '120°の動径は傾きが負になり、tan 120° = -tan 60° = -√3 です。' }
    },
    135: {
        sin: { valueId: '1/sqrt2', explanation: '135° = 180° - 45° です。第2象限で y > 0 なので sin 135° = sin 45° = 1/√2 (√2/2) です。' },
        cos: { valueId: '-1/sqrt2', explanation: '135° = 180° - 45° です。第2象限で x < 0 なので cos 135° = -cos 45° = -1/√2 (-√2/2) です。' },
        tan: { valueId: '-1', explanation: '135°の傾きは -1 です（tan 135° = -tan 45° = -1）。' }
    },
    150: {
        sin: { valueId: '1/2', explanation: '150° = 180° - 30° です。第2象限で y > 0 なので sin 150° = sin 30° = 1/2 です。' },
        cos: { valueId: '-sqrt3/2', explanation: '150° = 180° - 30° です。第2象限で x < 0 なので cos 150° = -cos 30° = -√3/2 です。' },
        tan: { valueId: '-1/sqrt3', explanation: '150°の動径の傾きは -1/√3 (-√3/3) です。' }
    },
    180: {
        sin: { valueId: '0', explanation: '180°のとき点P(-1, 0)となり、y座標は 0 です。' },
        cos: { valueId: '-1', explanation: '180°のとき点P(-1, 0)となり、x座標は -1（最小値）です。' },
        tan: { valueId: '0', explanation: '180°の動径は水平（傾き0）なので、tan 180° = 0 です。' }
    }
};

Object.assign(TRIG_DATA, {
    15: {
        sin: { valueId: 'sqrt6-sqrt2/4' }, cos: { valueId: 'sqrt6+sqrt2/4' }, tan: { valueId: '2-sqrt3' }
    },
    18: {
        sin: { valueId: 'sqrt5-1/4' }, cos: { valueId: 'sqrt(10+2sqrt5)/4' }, tan: { valueId: 'tan18' }
    },
    22.5: {
        sin: { valueId: 'sqrt(2-sqrt2)/2' }, cos: { valueId: 'sqrt(2+sqrt2)/2' }, tan: { valueId: 'sqrt2-1' }
    },
    36: {
        sin: { valueId: 'sqrt(10-2sqrt5)/4' }, cos: { valueId: 'sqrt5+1/4' }, tan: { valueId: 'tan36' }
    },
    54: {
        sin: { valueId: 'sqrt5+1/4' }, cos: { valueId: 'sqrt(10-2sqrt5)/4' }, tan: { valueId: 'tan54' }
    },
    67.5: {
        sin: { valueId: 'sqrt(2+sqrt2)/2' }, cos: { valueId: 'sqrt(2-sqrt2)/2' }, tan: { valueId: 'sqrt2+1' }
    },
    72: {
        sin: { valueId: 'sqrt(10+2sqrt5)/4' }, cos: { valueId: 'sqrt5-1/4' }, tan: { valueId: 'tan72' }
    },
    75: {
        sin: { valueId: 'sqrt6+sqrt2/4' }, cos: { valueId: 'sqrt6-sqrt2/4' }, tan: { valueId: '2+sqrt3' }
    }
});

const SECRET_PRIORITY_TOP = new Set(['18-sin', '36-cos', '15-tan', '75-tan', '22.5-tan', '67.5-tan']);
const SECRET_PRIORITY_MIDDLE = new Set([
    '72-cos', '54-sin', '15-sin', '75-cos', '15-cos',
    '75-sin', '22.5-sin', '67.5-cos', '22.5-cos', '67.5-sin'
]);
const SECRET_QUESTION_POOL = SECRET_ANGLES.flatMap(angle =>
    FUNCTIONS.flatMap(func => {
        const key = `${angle}-${func}`;
        const weight = SECRET_PRIORITY_TOP.has(key) ? 8 : (SECRET_PRIORITY_MIDDLE.has(key) ? 3 : 1);
        const question = {
        angle,
        func,
        valueId: TRIG_DATA[angle][func].valueId,
        priority: SECRET_PRIORITY_TOP.has(key) ? '最重要' : (SECRET_PRIORITY_MIDDLE.has(key) ? '重要' : '超難問'),
        explanation: `${func} ${angle}° の正確な値を確認しましょう。`
        };
        return Array.from({ length: weight }, () => ({ ...question }));
    })
);

/**
 * HTML表示用の値フォーマットを取得
 * @param {string} valueId - 値ID (e.g. 'sqrt3/2', '1/sqrt2')
 * @param {boolean} useRationalized - 有理化表記フラグ (true: √2/2, false: 1/√2)
 * @returns {string} HTML文字列
 */
function formatValueHtml(valueId, useRationalized = false) {
    const def = VALUE_DEFS[valueId];
    if (!def) return valueId;

    if (def.html) return def.html;
    if (useRationalized && def.htmlRat) return def.htmlRat;
    if (!useRationalized && def.htmlStd) return def.htmlStd;
    if (def.label) return def.label;
    return useRationalized ? def.rationalized : def.standard;
}

/**
 * プレーンテキスト用の値フォーマットを取得
 */
function formatValueText(valueId, useRationalized = false) {
    const def = VALUE_DEFS[valueId];
    if (!def) return valueId;
    const raw = useRationalized ? def.rationalized : def.standard;

    const map = {
        '1/2': '½',
        '-1/2': '−½',
        'sqrt2/2': '√2⁄2',
        '-sqrt2/2': '−√2⁄2',
        'sqrt3/2': '√3⁄2',
        '-sqrt3/2': '−√3⁄2',
        '1/sqrt2': '1⁄√2',
        '-1/sqrt2': '−1⁄√2',
        '1/sqrt3': '1⁄√3',
        '-1/sqrt3': '−1⁄√3',
        'sqrt3/3': '√3⁄3',
        '-sqrt3/3': '−√3⁄3',
        '2/sqrt3': '2⁄√3',
        '-2/sqrt3': '−2⁄√3',
    };
    return map[valueId] || raw.replace('-', '−');
}

function normalizeAngle(deg) {
    const normalized = Number(deg) % 360;
    return normalized < 0 ? normalized + 360 : normalized;
}

function getTrigData(deg) {
    const normalized = normalizeAngle(deg);
    if (TRIG_DATA[normalized]) return TRIG_DATA[normalized];

    const rad = normalized * Math.PI / 180;
    const near = (a, b) => Math.abs(a - b) < 1e-7;
    const findValueId = value => {
        if (!Number.isFinite(value)) return 'none';
        const match = Object.values(VALUE_DEFS).find(def => def.val !== null && near(def.val, value));
        return match ? match.id : null;
    };
    const sinId = findValueId(Math.sin(rad));
    const cosId = findValueId(Math.cos(rad));
    const tanId = Math.abs(Math.cos(rad)) < 1e-7 ? 'none' : findValueId(Math.tan(rad));
    if (!sinId || !cosId || !tanId) return null;
    return {
        sin: { valueId: sinId, explanation: '同じ終辺をもつ角の単位円上の y 座標です。' },
        cos: { valueId: cosId, explanation: '同じ終辺をもつ角の単位円上の x 座標です。' },
        tan: { valueId: tanId, explanation: '同じ終辺をもつ角の動径の傾きです。' }
    };
}

function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) [a, b] = [b, a % b];
    return a || 1;
}

function radianParts(deg) {
    const scaled = Math.round(Number(deg) * 2);
    const denominatorBase = 360;
    const divisor = gcd(scaled, denominatorBase);
    return { numerator: scaled / divisor, denominator: denominatorBase / divisor };
}

function formatAngleHtml(deg, notation = 'degree') {
    if (notation !== 'radian') return `<span class="angle-number">${deg}</span><span class="degree-mark">°</span>`;
    const { numerator, denominator } = radianParts(deg);
    if (numerator === 0) return '<span class="angle-number">0</span>';
    const sign = numerator < 0 ? '<span class="angle-number">−</span>' : '';
    const n = Math.abs(numerator);
    if (denominator === 1) {
        return `${sign}${n === 1 ? '' : `<span class="angle-number">${n}</span>`}<span class="angle-pi">π</span>`;
    }
    if (n === 1) {
        return `${sign}<span class="angle-fraction"><span class="num angle-pi">π</span><span class="den angle-number">${denominator}</span></span>`;
    }
    return `${sign}<span class="angle-fraction"><span class="num angle-number">${n}</span><span class="den angle-number">${denominator}</span></span><span class="angle-pi angle-pi-after">π</span>`;
}

function formatAngleText(deg, notation = 'degree') {
    if (notation !== 'radian') return `${deg}°`;
    const { numerator, denominator } = radianParts(deg);
    if (numerator === 0) return '0';
    const sign = numerator < 0 ? '−' : '';
    const n = Math.abs(numerator);
    if (denominator === 1) return `${sign}${n === 1 ? '' : n}π`;
    return `${sign}${n === 1 ? '' : n}π/${denominator}`;
}

window.TRIG_DATA = TRIG_DATA;
window.VALUE_DEFS = VALUE_DEFS;
window.ANGLES = ANGLES;
window.FUNCTIONS = FUNCTIONS;
window.STANDARD_VALUE_IDS = STANDARD_VALUE_IDS;
window.SECRET_QUESTION_POOL = SECRET_QUESTION_POOL;
window.SECRET_ANGLES = SECRET_ANGLES;
window.formatValueHtml = formatValueHtml;
window.formatValueText = formatValueText;
window.normalizeAngle = normalizeAngle;
window.getTrigData = getTrigData;
window.formatAngleHtml = formatAngleHtml;
window.formatAngleText = formatAngleText;
window.radianParts = radianParts;
