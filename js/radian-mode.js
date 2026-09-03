(() => {
    const STANDARD_0_2PI = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
    const SECOND_TURN = [390,405,420,450,480,495,510,540,570,585,600,630,660,675,690,720];
    const HARD_BASE = [15,18,22.5,36,54,67.5,72,75];
    const HARD_0_4PI = [...HARD_BASE, ...HARD_BASE.map(a => a + 360)];
    const VISUAL_STANDARD = [0,30,45,60,90,120,135,150,180,210,225,240,270,300,315,330,360];
    const VISUAL_SECRET = [...VISUAL_STANDARD, ...HARD_BASE].sort((a,b)=>a-b);

    const gcd = (a,b) => { a=Math.abs(a); b=Math.abs(b); while (b) [a,b]=[b,a%b]; return a || 1; };
    const terminal = deg => ((deg % 360) + 360) % 360;

    function radianParts(deg) {
        if (deg === 0) return {zero:true,num:0,den:1};
        let num=Math.round(deg*2), den=360;
        const g=gcd(num,den); num/=g; den/=g;
        return {zero:false,num,den};
    }
    function radianText(deg) {
        const p=radianParts(deg);
        if (p.zero) return '0';
        if (p.den===1) return p.num===1 ? 'π' : `${p.num}π`;
        return p.num===1 ? `π/${p.den}` : `${p.num}/${p.den}π`;
    }
    function radianHtml(deg) {
        const p=radianParts(deg);
        if (p.zero) return '<span class="rad-number">0</span>';
        if (p.den===1) return p.num===1
            ? '<span class="rad-inline"><span class="rad-pi">π</span></span>'
            : `<span class="rad-inline"><span class="rad-number">${p.num}</span><span class="rad-pi">π</span></span>`;
        if (p.num===1) {
            return `<span class="rad-frac rad-frac-pi-numerator"><span class="rad-frac-num"><span class="rad-pi">π</span></span><span class="rad-frac-den rad-number">${p.den}</span></span>`;
        }
        return `<span class="rad-frac-mult"><span class="rad-frac rad-frac-number-only"><span class="rad-frac-num rad-number">${p.num}</span><span class="rad-frac-den rad-number">${p.den}</span></span><span class="rad-pi rad-pi-after-frac">π</span></span>`;
    }
    function angleHtml(deg) { return window.app?.angleNotation==='radian' ? radianHtml(deg) : `<span class="rad-number">${deg}</span>°`; }
    function angleText(deg) { return window.app?.angleNotation==='radian' ? radianText(deg) : `${deg}°`; }
    function svgRadianLabel(deg,x,y,className='angle-text',anchor='middle') {
        const p=radianParts(deg);
        // 0, 2π, 4π share the same terminal side. Offset only the text so labels remain readable.
        if (deg===360) y += 17;
        if (deg===720) y += 34;
        if (p.zero) return `<text x="${x}" y="${y}" class="${className} rad-svg-number" text-anchor="${anchor}" dominant-baseline="central">0</text>`;
        if (p.den===1) return `<text x="${x}" y="${y}" class="${className} rad-svg-label" text-anchor="${anchor}" dominant-baseline="central"><tspan class="rad-svg-number">${p.num===1?'':p.num}</tspan><tspan class="rad-svg-pi">π</tspan></text>`;
        if (p.num===1) {
            const width=Math.max(15,String(p.den).length*7.2), left=anchor==='start'?x:(anchor==='end'?x-width:x-width/2), cx=left+width/2;
            return `<g class="${className} rad-svg-frac rad-svg-frac-pi-num" transform="translate(${cx} ${y})"><text class="rad-svg-frac-num" x="0" y="-5" text-anchor="middle"><tspan class="rad-svg-pi">π</tspan></text><line class="rad-svg-frac-line" x1="${-width/2}" x2="${width/2}" y1="0" y2="0"></line><text class="rad-svg-frac-den rad-svg-number" x="0" y="9" text-anchor="middle">${p.den}</text></g>`;
        }
        const fw=Math.max(13,String(p.num).length*6.5,String(p.den).length*6.5), tw=fw+9, left=anchor==='start'?x:(anchor==='end'?x-tw:x-tw/2), cx=left+fw/2, piX=left+fw+1.5;
        return `<g class="${className} rad-svg-frac-mult"><g class="rad-svg-frac" transform="translate(${cx} ${y})"><text class="rad-svg-frac-num rad-svg-number" x="0" y="-5" text-anchor="middle">${p.num}</text><line class="rad-svg-frac-line" x1="${-fw/2}" x2="${fw/2}" y1="0" y2="0"></line><text class="rad-svg-frac-den rad-svg-number" x="0" y="9" text-anchor="middle">${p.den}</text></g><text x="${piX}" y="${y+2}" class="rad-svg-pi" text-anchor="start" dominant-baseline="central">π</text></g>`;
    }
    window.radianHtml=radianHtml;
    window.radianText=radianText;
    window.formatAngleHtml=angleHtml;
    window.formatAngleLabel=angleText;
    window.formatAngleSvg=svgRadianLabel;

    const D=window.TRIG_DATA;
    const entry=(s,c,t)=>({sin:{valueId:s},cos:{valueId:c},tan:{valueId:t}});
    Object.assign(D,{
        210:entry('-1/2','-sqrt3/2','1/sqrt3'),225:entry('-1/sqrt2','-1/sqrt2','1'),240:entry('-sqrt3/2','-1/2','sqrt3'),
        270:entry('-1','0','none'),300:entry('-sqrt3/2','1/2','-sqrt3'),315:entry('-1/sqrt2','1/sqrt2','-1'),330:entry('-1/2','sqrt3/2','-1/sqrt3'),360:entry('0','1','0')
    });
    [...SECOND_TURN,...HARD_0_4PI].forEach(a=>{
        if(D[a]) return;
        const base=terminal(a);
        const source=D[base] || D[a-360];
        if(source) D[a]={sin:{...source.sin},cos:{...source.cos},tan:{...source.tan}};
    });

    const P=TrigQuizApp.prototype;
    const notationKey=(base, app)=> app?.angleNotation==='radian' ? `${base}-radian` : base;

    const originalInit=P.init;
    P.init=function(){
        this.angleNotation=localStorage.getItem('trig-quiz-angle-notation-v2')==='radian'?'radian':'degree';
        originalInit.call(this);
        this.dom.btnDegreeMode=document.getElementById('btn-degree-mode');
        this.dom.btnRadianMode=document.getElementById('btn-radian-mode');
        this.dom.personalBestVersion=document.getElementById('personal-best-version');
        const choose=notation=>{
            if(this.angleNotation===notation) return;
            this.audio.playClick();
            this.angleNotation=notation;
            localStorage.setItem('trig-quiz-angle-notation-v2',notation);
            this.applyAngleNotation();
        };
        this.dom.btnDegreeMode?.addEventListener('click',()=>choose('degree'));
        this.dom.btnRadianMode?.addEventListener('click',()=>choose('radian'));
        this.applyAngleNotation();
    };

    P.applyAngleNotation=function(){
        if(this._applyingAngleNotation) return;
        this._applyingAngleNotation=true;
        try {
            const rad=this.angleNotation==='radian';
            document.body.classList.toggle('radian-mode',rad);
            this.dom.btnDegreeMode?.classList.toggle('active',!rad);
            this.dom.btnRadianMode?.classList.toggle('active',rad);
            if(this.dom.personalBestVersion) this.dom.personalBestVersion.textContent=rad?'弧度法 ver.':'度数法 ver.';
            const visualAngles=rad ? (this.secretModeActive?VISUAL_SECRET:VISUAL_STANDARD) : (this.secretModeActive?window.SECRET_ANGLES:window.ANGLES);
            this.visualizer?.setAngles(visualAngles);
            this.referenceGuideVisualizer?.setAngles(visualAngles);
            this.referenceVisualizer?.setAngles(visualAngles);
            this.buildReferenceTable();
            this.updatePersonalBestDisplay();
            if(this.currentQuestion && this.dom.quizScreen?.classList.contains('active')) this.renderQuestion();
            const preferred=rad?0:45;
            if(!D[this.referenceGuideAngle] || (rad && !visualAngles.some(a=>terminal(a)===terminal(this.referenceGuideAngle)))) this.referenceGuideAngle=preferred;
            if(D[this.referenceGuideAngle]) this.updateReferenceGuide(this.referenceGuideAngle);
            if(this.secretModeActive) this.buildSecretMemoryTable();
        } finally {
            this._applyingAngleNotation=false;
        }
    };

    const originalSetModeView=P.setModeView;
    P.setModeView=function(active){
        originalSetModeView.call(this,active);
        if(!this._applyingAngleNotation) this.applyAngleNotation?.();
    };

    const originalGenerate=P.generateQuestion;
    P.generateQuestion=function(){
        if(this.angleNotation!=='radian') return originalGenerate.call(this);
        if(this.reviewQueue?.length){
            const q=this.reviewQueue.shift(), data=D[q.angle][q.func];
            return {angle:q.angle,func:q.func,correctValueId:data.valueId,explanation:data.explanation};
        }
        const funcs=this.targetFunctions;
        let angles,bucket='radian-standard';
        if(this.mode==='1min-secret' || this.secretModeActive){
            const r=Math.random();
            if(r<0.70){ angles=STANDARD_0_2PI; bucket='radian-secret-first'; }
            else if(r<0.90){ angles=SECOND_TURN; bucket='radian-secret-second'; }
            else { angles=HARD_0_4PI; bucket='radian-secret-hard'; }
        } else angles=STANDARD_0_2PI;
        const pool=angles.flatMap(angle=>funcs.map(func=>({angle,func,valueId:D[angle][func].valueId,explanation:D[angle][func].explanation || `${func} ${radianText(angle)} の値を確認しましょう。`})));
        const q=this.takeUnusedQuestion(pool,bucket);
        return {angle:q.angle,func:q.func,correctValueId:q.valueId,explanation:q.explanation};
    };

    const originalRender=P.renderQuestion;
    P.renderQuestion=function(){
        if(this.angleNotation==='radian') this.visualizer?.setAngles(this.secretModeActive?VISUAL_SECRET:VISUAL_STANDARD);
        originalRender.call(this);
        if(this.currentQuestion&&this.dom.questionAngle) this.dom.questionAngle.innerHTML=angleHtml(this.currentQuestion.angle);
        if(this.dom.stepAngleLabel) this.dom.stepAngleLabel.textContent=this.angleNotation==='radian'?'① 弧度の位置を選ぶ':'① 角度の位置を選ぶ';
    };

    const originalUpdateRef=P.updateReferenceGuide;
    P.updateReferenceGuide=function(deg){
        // For a visible terminal point, always use a data-bearing representative.
        if(!D[deg] && this.angleNotation==='radian') deg=terminal(deg);
        originalUpdateRef.call(this,deg);
        const html=angleHtml(deg);
        ['referenceCurrentAngle','referenceSinAngle','referenceCosAngle','referenceTanAngle','referenceSideSinAngle','referenceSideCosAngle','referenceSideTanAngle'].forEach(k=>{if(this.dom[k])this.dom[k].innerHTML=html;});
    };

    P.buildReferenceTable=function(){
        if(!this.dom.referenceTableBody)return;
        this.dom.referenceTableBody.innerHTML='';
        const angles=this.angleNotation==='radian' ? STANDARD_0_2PI : (this.secretModeActive?window.SECRET_ANGLES:window.ANGLES);
        angles.forEach(deg=>{
            if(!D[deg])return;
            const row=document.createElement('tr'); row.dataset.angle=deg;
            row.innerHTML=`<td class="cell-angle"><strong>${angleHtml(deg)}</strong></td><td class="cell-sin">${window.formatValueHtml(D[deg].sin.valueId,this.useRationalized)}</td><td class="cell-cos">${window.formatValueHtml(D[deg].cos.valueId,this.useRationalized)}</td><td class="cell-tan">${window.formatValueHtml(D[deg].tan.valueId,this.useRationalized)}</td>`;
            row.addEventListener('click',()=>{this.audio.playClick();this.dom.referenceTableBody.querySelectorAll('tr').forEach(r=>r.classList.remove('active-row'));row.classList.add('active-row');this.referenceVisualizer.update(deg,'all');});
            this.dom.referenceTableBody.appendChild(row);
        });
    };

    const originalShowRef=P.showReferenceModal;
    P.showReferenceModal=function(){
        originalShowRef.call(this);
        const visualAngles=this.angleNotation==='radian'?(this.secretModeActive?VISUAL_SECRET:VISUAL_STANDARD):(this.secretModeActive?window.SECRET_ANGLES:window.ANGLES);
        this.referenceGuideVisualizer?.setAngles(visualAngles);
        this.referenceVisualizer?.setAngles(visualAngles);
        const title=this.dom.referenceScreen?.querySelector('.reference-topbar-title');
        if(title){
            title.innerHTML=this.angleNotation==='radian'
                ? '単位円の弧度の<span class="tap-symbol-gap"> </span><svg aria-hidden="true" class="tap-point-symbol next-point-symbol" focusable="false" viewBox="0 0 16 16"><circle cx="8" cy="8" fill="#ffffff" r="6" stroke="#0284c7" stroke-width="2.5"></circle></svg><span class="tap-symbol-gap"> </span>をタップ'
                : (this.secretModeActive?'余角ペアで覚える・裏三角比':'単位円の角度の<span class="tap-symbol-gap"> </span><svg aria-hidden="true" class="tap-point-symbol next-point-symbol" focusable="false" viewBox="0 0 16 16"><circle cx="8" cy="8" fill="#ffffff" r="6" stroke="#0284c7" stroke-width="2.5"></circle></svg><span class="tap-symbol-gap"> </span>をタップ');
        }
        if(this.angleNotation==='radian'){
            this.referenceGuideAngle=0;
            this.updateReferenceGuide(0);
        }
    };

    const originalBuildSecret=P.buildSecretMemoryTable;
    P.buildSecretMemoryTable=function(){
        originalBuildSecret.call(this);
        if(this.angleNotation!=='radian'||!this.dom.secretMemoryTable)return;
        this.dom.secretMemoryTable.querySelectorAll('.memory-expression strong').forEach(el=>{
            const m=el.textContent.match(/(\d+(?:\.5)?)°/); if(m) el.innerHTML=el.innerHTML.replace(m[0],radianHtml(Number(m[1])));
        });
    };

    // Separate records completely between degree and radian versions.
    P.savePersonalBest=function(mode=this.mode){
        let isNewBest=false;
        const correctCount=this.history.filter(h=>h.isCorrect).length, totalAnswered=this.history.length;
        const accuracy=totalAnswered>0?correctCount/totalAnswered:0;
        const all=['sin','cos','tan'].every(f=>this.targetFunctions.includes(f));
        if(!all){this.updatePersonalBestDisplay();return false;}
        if(mode==='20-challenge'){
            if(correctCount<18){this.updatePersonalBestDisplay();return false;}
            const elapsed=this.getElapsedQuizTimeSeconds(); if(!elapsed||!Number.isFinite(elapsed))return false;
            const key=notationKey('trig-quiz-best-20-challenge',this), ck=notationKey('trig-quiz-best-20-correct',this), current=Number(localStorage.getItem(key));
            if(!current||elapsed<current){localStorage.setItem(key,elapsed.toFixed(2));localStorage.setItem(ck,String(correctCount));isNewBest=true;}
        } else if(mode==='3min-challenge'){
            if(accuracy<.8){this.updatePersonalBestDisplay();return false;}
            const key=notationKey('trig-quiz-best-2min-challenge',this), tk=notationKey('trig-quiz-best-2min-total',this), current=Number(localStorage.getItem(key)||0);
            if(correctCount>current){localStorage.setItem(key,String(correctCount));localStorage.setItem(tk,String(totalAnswered));isNewBest=true;}
        } else if(mode==='1min-secret'){
            if(accuracy<.8){this.updatePersonalBestDisplay();return false;}
            const key=notationKey('trig-quiz-best-1min-secret',this), tk=notationKey('trig-quiz-best-1min-secret-total',this), current=Number(localStorage.getItem(key)||0);
            if(correctCount>current){localStorage.setItem(key,String(correctCount));localStorage.setItem(tk,String(totalAnswered));isNewBest=true;}
        }
        this.updatePersonalBestDisplay(); return isNewBest;
    };

    P.updatePersonalBestDisplay=function(){
        if(!this.dom.personalBestTime||!this.dom.personalBestDetail)return;
        const get=base=>Number(localStorage.getItem(notationKey(base,this)));
        const best20=get('trig-quiz-best-20-challenge'), stored20=get('trig-quiz-best-20-correct'), best20Correct=stored20||(best20?18:0);
        const best2=get('trig-quiz-best-2min-challenge'), total2=get('trig-quiz-best-2min-total')||best2, q2=best2>0&&total2>0&&best2/total2>=.8;
        const bestS=get('trig-quiz-best-1min-secret'), totalS=get('trig-quiz-best-1min-secret-total')||bestS, qS=bestS>0&&totalS>0&&bestS/totalS>=.8;
        const r20=best20?this.get20ChallengeRank(best20Correct,best20).rank:'—', r2=q2?this.getTimedChallengeRank(best2,false).rank:'—', rS=qS?this.getTimedChallengeRank(bestS,true).rank:'—';
        this.secretCrownEarned=rS==='S'; this.applySecretModeState((r20==='S'||r20==='S+')&&r2==='S'); this.renderPersonalBestPlant(this.secretModeActive);
        if(this.dom.startBtnIcon){this.dom.startBtnIcon.src=this.secretCrownEarned?'assets/start-icon-crown.png':'assets/start-icon-white.png';this.dom.startBtnIcon.classList.toggle('is-crown-achieved',this.secretCrownEarned);}
        this.dom.personalBestTime.textContent=best20?`${best20.toFixed(2)}秒`:'--,---秒';
        this.dom.personalBestDetail.textContent=q2?`${best2}問`:'---問';
        if(this.dom.personalBestSecretDetail)this.dom.personalBestSecretDetail.textContent=qS?`${bestS}問`:'---問';
        if(this.dom.personalBestRankMark)this.dom.personalBestRankMark.textContent=r20;
        if(this.dom.personalBest2minRankMark)this.dom.personalBest2minRankMark.textContent=r2;
        if(this.dom.personalBestSecretRankMark)this.dom.personalBestSecretRankMark.textContent=rS;
        if(this.dom.personalBestNote)this.dom.personalBestNote.textContent=this.secretModeActive?'※正答率80％以上の記録のみ反映':'※全三角比選択。20問は18問以上、2分は正答率80％以上のみ反映';
        if(this.dom.personalBestVersion)this.dom.personalBestVersion.textContent=this.angleNotation==='radian'?'弧度法 ver.':'度数法 ver.';
    };

    const originalBestChase=P.updateBestChaseFeedback;
    P.updateBestChaseFeedback=function(){
        if(this.angleNotation!=='radian') return originalBestChase.call(this);
        const correct=this.history.filter(h=>h.isCorrect).length;
        if(this.mode==='3min-challenge'){
            const best=Number(localStorage.getItem(notationKey('trig-quiz-best-2min-challenge',this))||0); if(!best)return;
            if(correct===Math.max(1,best-3))this.showBestChaseMessage('BESTまであと3！','r2-3');
            if(correct===Math.max(1,best-1))this.showBestChaseMessage('BESTまであと1！','r2-1');
            if(correct===best+1)this.showBestChaseMessage('NEW BEST!','r2-new'); return;
        }
        if(this.mode==='1min-secret'){
            const best=Number(localStorage.getItem(notationKey('trig-quiz-best-1min-secret',this))||0); if(!best)return;
            if(correct===Math.max(1,best-3))this.showBestChaseMessage('BESTまであと3！','rs-3');
            if(correct===Math.max(1,best-1))this.showBestChaseMessage('BESTまであと1！','rs-1');
            if(correct===best+1)this.showBestChaseMessage('NEW BEST!','rs-new'); return;
        }
        if(this.mode==='20-challenge'){
            const best=Number(localStorage.getItem(notationKey('trig-quiz-best-20-challenge',this))||0); if(!best)return;
            const e=this.getElapsedQuizTimeSeconds(); if(correct===15&&e>0&&e<best*.75)this.showBestChaseMessage('BEST更新ペース！','r20-pace');
            if(correct===20&&e>0&&e<best)this.showBestChaseMessage('NEW BEST!','r20-new');
        }
    };

    const originalFinish=P.finishQuiz;
    P.finishQuiz=function(...args){
        const ret=originalFinish.apply(this,args);
        if(this.angleNotation==='radian'&&this.dom.resultHistoryList){
            const rows=this.history.filter(h=>!h.isCorrect).concat(this.history.filter(h=>h.isCorrect));
            this.dom.resultHistoryList.querySelectorAll('.hist-q strong').forEach((el,i)=>{const h=rows[i];if(h)el.innerHTML=`${h.func} ${radianHtml(h.angle)}`;});
        }
        return ret;
    };
})();
