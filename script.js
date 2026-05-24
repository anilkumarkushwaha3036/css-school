// ==========================================================================
// CSS SCHOOL: INTEGRATED STATE CONTROLLER & GAME ENGINE
// ==========================================================================

let activeRoute = 'box-model';
let activeTarget = 'outer';
let currentSizing = 'border-box';

// ROUTER SYSTEM
function switchRoute(routeName) {
    activeRoute = routeName;
    
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const navBtn = Array.from(document.querySelectorAll('.nav-item')).find(btn => 
        btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(routeName)
    );
    if (navBtn) navBtn.classList.add('active');

    document.querySelectorAll('.route-panel').forEach(panel => panel.classList.remove('active'));
    const targetPanel = document.getElementById(`route-${routeName}`);
    if (targetPanel) targetPanel.classList.add('active');

    // Clean any manually typed styles to prevent conflicts when changing tabs!
    clearManualCSS();

    if (routeName === 'box-model') {
        setTimeout(applyStyles, 100);
    } else if (routeName === 'flexbox') {
        applyFlexStyles();
    } else if (routeName === 'position') {
        updatePosMode('static');
    } else if (routeName === 'grid') {
        applyGridStyles();
    } else if (routeName === 'color') {
        applyColorStyles();
    } else if (routeName === 'typography') {
        updateTypography();
    } else if (routeName === 'transform') {
        applyTransformStyles();
    } else if (routeName === 'game') {
        loadGameLevel(currentGameLevel);
    }
}

// TWO-WAY LIVE EDITOR ENGINE (CODEPEN-STYLE INJECTION)
function clearInlineStylesForRoute(route) {
    if (route === 'box-model') {
        const outer = document.getElementById('outer-element');
        const inner = document.getElementById('inner-element');
        if (outer) outer.removeAttribute('style');
        if (inner) inner.removeAttribute('style');
    } else if (route === 'flexbox') {
        const container = document.getElementById('flex-container');
        if (container) {
            container.removeAttribute('style');
            container.querySelectorAll('.flex-item').forEach(item => item.removeAttribute('style'));
        }
    } else if (route === 'position') {
        const target = document.getElementById('pos-target');
        if (target) target.removeAttribute('style');
    } else if (route === 'grid') {
        const container = document.getElementById('grid-container');
        if (container) container.removeAttribute('style');
    } else if (route === 'color') {
        const preview = document.getElementById('color-preview');
        if (preview) preview.removeAttribute('style');
    } else if (route === 'typography') {
        const p = document.getElementById('type-preview-p');
        const h = document.getElementById('type-preview-heading');
        if (p) p.removeAttribute('style');
        if (h) h.removeAttribute('style');
    } else if (route === 'transform') {
        const target = document.getElementById('transform-target');
        if (target) target.removeAttribute('style');
    }
}

function applyManualCSSEdit(textareaId) {
    const codeText = document.getElementById(textareaId).value;
    
    // Clear inline overriding styles so style-injector stylesheet takes absolute priority
    clearInlineStylesForRoute(activeRoute);
    
    let styleTag = document.getElementById('live-styles-injector');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'live-styles-injector';
        document.head.appendChild(styleTag);
    }
    styleTag.innerHTML = codeText;

    // Trigger overlay layout updates in real-time if on the box model route
    if (activeRoute === 'box-model') {
        setTimeout(renderHighlightOverlays, 50);
    }
}

function clearManualCSS() {
    const styleTag = document.getElementById('live-styles-injector');
    if (styleTag) styleTag.innerHTML = '';
}


// ===================================================
// MODULE 1: BOX MODEL LAB LOGIC
// ===================================================
const state = {
    outer: {
        padding: { top: 20, right: 20, bottom: 20, left: 20, all: 20, split: false },
        margin: { top: 20, right: 20, bottom: 20, left: 20, all: 20, split: false },
        border: 2, width: 400, height: 400
    },
    inner: {
        padding: { top: 15, right: 15, bottom: 15, left: 15, all: 15, split: false },
        margin: { top: 20, right: 20, bottom: 20, left: 20, all: 20, split: false },
        border: 2, width: 200, height: 200
    }
};

const explanations = {
    all: {
        title: "The CSS Box Model",
        text: "Every HTML element is structured in layered boxes. The **Content** is in the center, wrapped by **Padding** (internal cushioning), wrapped by a **Border** (walls), wrapped by **Margin** (invisible personal space spacing that pushes neighbors away).",
        theme: "all-theme"
    },
    padding: {
        title: "Padding (The Bubble Wrap Cushion)",
        text: "Padding sits **INSIDE** the element's border. Think of it as bubble wrap cushion layers inside a wooden crate. (1) It **shares the background color** of the element. (2) It pushes content **inward**, creating breathing room inside the box.",
        theme: "padding-theme"
    },
    margin: {
        title: "Margin (The Social Distancing Yard)",
        text: "Margin is empty space **OUTSIDE** the element's border. Think of it as personal space boundaries or a front yard. (1) It is **completely transparent**; it never has a color of its own and shows whatever background is behind the box.",
        theme: "margin-theme"
    }
};

function switchConcept(concept) {
    document.querySelectorAll('#route-box-model .tab-btn').forEach(btn => btn.classList.remove('active'));
    const targetIndex = concept === 'all' ? 0 : (concept === 'padding' ? 1 : 2);
    document.querySelectorAll('#route-box-model .tab-btn')[targetIndex].classList.add('active');

    const card = document.getElementById('analogy-card');
    if (!card) return;
    card.style.opacity = '0';
    
    setTimeout(() => {
        const data = explanations[concept];
        document.getElementById('analogy-title').innerText = data.title;
        document.getElementById('analogy-text').innerHTML = data.text;
        card.className = "analogy-box " + data.theme;
        card.style.opacity = '1';
    }, 150);

    if (concept === 'padding') setHighlight('padding');
    else if (concept === 'margin') setHighlight('margin');
    else clearHighlight();
}

function toggleSplit(type) {
    const isSplit = document.getElementById(`split-${type}`).checked;
    state[activeTarget][type].split = isSplit;

    const individualDiv = document.getElementById(`${type}-individual`);
    if (isSplit) {
        individualDiv.classList.remove('hidden');
        const val = state[activeTarget][type].all;
        ['top', 'right', 'bottom', 'left'].forEach(side => {
            const slider = document.getElementById(`${type.substring(0,3)}-${side}`);
            slider.value = val;
            state[activeTarget][type][side] = val;
            document.getElementById(`val-${type.substring(0,3)}-${side}`).innerText = val + 'px';
        });
    } else {
        individualDiv.classList.add('hidden');
        const val = state[activeTarget][type].top;
        state[activeTarget][type].all = val;
        document.getElementById(`pad-all`).value = val;
        document.getElementById(`val-pad-all`).innerText = val + 'px';
    }
    applyStyles();
}

function updateTarget() {
    activeTarget = document.querySelector('input[name="control-target"]:checked').value;
    const targetState = state[activeTarget];
    
    document.getElementById('split-padding').checked = targetState.padding.split;
    document.getElementById('split-margin').checked = targetState.margin.split;
    
    toggleSplitVisibility('padding', targetState.padding.split);
    toggleSplitVisibility('margin', targetState.margin.split);

    document.getElementById('pad-all').value = targetState.padding.all;
    document.getElementById('val-pad-all').innerText = targetState.padding.all + 'px';
    ['top', 'right', 'bottom', 'left'].forEach(side => {
        document.getElementById(`pad-${side}`).value = targetState.padding[side];
        document.getElementById(`val-pad-${side}`).innerText = targetState.padding[side] + 'px';
    });

    document.getElementById('mar-all').value = targetState.margin.all;
    document.getElementById('val-mar-all').innerText = targetState.margin.all + 'px';
    ['top', 'right', 'bottom', 'left'].forEach(side => {
        document.getElementById(`mar-${side}`).value = targetState.margin[side];
        document.getElementById(`val-mar-${side}`).innerText = targetState.margin[side] + 'px';
    });

    applyStyles();
}

function toggleSplitVisibility(type, splitState) {
    const individualDiv = document.getElementById(`${type}-individual`);
    if (splitState) individualDiv.classList.remove('hidden');
    else individualDiv.classList.add('hidden');
}

function updateBoxModel(type, side, value) {
    const val = parseInt(value);
    const shortType = type.substring(0, 3);
    
    if (side === 'all') {
        state[activeTarget][type].all = val;
        document.getElementById(`val-${shortType}-all`).innerText = val + 'px';
        
        if (!state[activeTarget][type].split) {
            ['top', 'right', 'bottom', 'left'].forEach(s => {
                state[activeTarget][type][s] = val;
                document.getElementById(`${shortType}-${s}`).value = val;
                document.getElementById(`val-${shortType}-${s}`).innerText = val + 'px';
            });
        }
    } else {
        state[activeTarget][type][side] = val;
        document.getElementById(`val-${shortType}-${side}`).innerText = val + 'px';
    }
    applyStyles();
    setHighlight(type);
}

function updateSizing() {
    currentSizing = document.querySelector('input[name="box-sizing"]:checked').value;
    applyStyles();
}

function applyStyles() {
    // Sliders take priority, clear user's manual typing rules
    clearManualCSS();

    const outer = document.getElementById('outer-element');
    const inner = document.getElementById('inner-element');
    if (!outer || !inner) return;

    const oP = state.outer.padding;
    const oM = state.outer.margin;
    outer.style.paddingTop = oP.top + 'px';
    outer.style.paddingRight = oP.right + 'px';
    outer.style.paddingBottom = oP.bottom + 'px';
    outer.style.paddingLeft = oP.left + 'px';

    outer.style.marginTop = oM.top + 'px';
    outer.style.marginRight = oM.right + 'px';
    outer.style.marginBottom = oM.bottom + 'px';
    outer.style.marginLeft = oM.left + 'px';
    outer.style.boxSizing = currentSizing;

    const iP = state.inner.padding;
    const iM = state.inner.margin;
    inner.style.paddingTop = iP.top + 'px';
    inner.style.paddingRight = iP.right + 'px';
    inner.style.paddingBottom = iP.bottom + 'px';
    inner.style.paddingLeft = iP.left + 'px';

    inner.style.marginTop = iM.top + 'px';
    inner.style.marginRight = iM.right + 'px';
    inner.style.marginBottom = iM.bottom + 'px';
    inner.style.marginLeft = iM.left + 'px';
    inner.style.boxSizing = currentSizing;

    const targetState = state[activeTarget];
    
    document.getElementById('diag-mar-top').innerText = targetState.margin.top;
    document.getElementById('diag-mar-right').innerText = targetState.margin.right;
    document.getElementById('diag-mar-bottom').innerText = targetState.margin.bottom;
    document.getElementById('diag-mar-left').innerText = targetState.margin.left;

    document.getElementById('diag-pad-top').innerText = targetState.padding.top;
    document.getElementById('diag-pad-right').innerText = targetState.padding.right;
    document.getElementById('diag-pad-bottom').innerText = targetState.padding.bottom;
    document.getElementById('diag-pad-left').innerText = targetState.padding.left;

    let displayWidth = targetState.width;
    let displayHeight = targetState.height;
    
    if (currentSizing === 'border-box') {
        const borderTotalX = targetState.border * 2;
        const paddingTotalX = targetState.padding.left + targetState.padding.right;
        displayWidth = Math.max(0, targetState.width - borderTotalX - paddingTotalX);

        const borderTotalY = targetState.border * 2;
        const paddingTotalY = targetState.padding.top + targetState.padding.bottom;
        displayHeight = Math.max(0, targetState.height - borderTotalY - paddingTotalY);
    }

    document.getElementById('diag-width').innerText = Math.round(displayWidth);
    document.getElementById('diag-height').innerText = Math.round(displayHeight);

    renderCSSCode();
    renderHighlightOverlays();
}

function renderHighlightOverlays() {
    const outer = document.getElementById('outer-element');
    const inner = document.getElementById('inner-element');
    const boundary = document.getElementById('preview-boundary');
    if (!outer || !inner || !boundary) return;
    
    const boundaryRect = boundary.getBoundingClientRect();

    const mGuide = document.getElementById('guide-margin');
    const pGuide = document.getElementById('guide-padding');

    const targetEl = activeTarget === 'outer' ? outer : inner;
    const targetRect = targetEl.getBoundingClientRect();
    const targetState = state[activeTarget];

    const pLeft = targetRect.left - boundaryRect.left;
    const pTop = targetRect.top - boundaryRect.top;
    
    pGuide.style.left = pLeft + 'px';
    pGuide.style.top = pTop + 'px';
    pGuide.style.width = targetRect.width + 'px';
    pGuide.style.height = targetRect.height + 'px';
    
    pGuide.style.setProperty('--pt', targetState.padding.top + 'px');
    pGuide.style.setProperty('--pr', targetState.padding.right + 'px');
    pGuide.style.setProperty('--pb', targetState.padding.bottom + 'px');
    pGuide.style.setProperty('--pl', targetState.padding.left + 'px');
    pGuide.style.setProperty('--bt', targetState.border + 'px');

    const mLeft = pLeft - targetState.margin.left;
    const mTop = pTop - targetState.margin.top;
    const mWidth = targetRect.width + targetState.margin.left + targetState.margin.right;
    const mHeight = targetRect.height + targetState.margin.top + targetState.margin.bottom;

    mGuide.style.left = mLeft + 'px';
    mGuide.style.top = mTop + 'px';
    mGuide.style.width = mWidth + 'px';
    mGuide.style.height = mHeight + 'px';

    mGuide.style.setProperty('--mt', targetState.margin.top + 'px');
    mGuide.style.setProperty('--mr', targetState.margin.right + 'px');
    mGuide.style.setProperty('--mb', targetState.margin.bottom + 'px');
    mGuide.style.setProperty('--ml', targetState.margin.left + 'px');
}

function setHighlight(layer) {
    document.getElementById('guide-margin').classList.add('hidden');
    document.getElementById('guide-padding').classList.add('hidden');
    
    if (layer === 'margin') document.getElementById('guide-margin').classList.remove('hidden');
    else if (layer === 'padding') document.getElementById('guide-padding').classList.remove('hidden');
    
    document.querySelectorAll('#route-box-model .diagram-layer').forEach(d => d.classList.remove('highlighted-active'));
    const targetDiag = document.querySelector(`.devtools-box-model .diagram-layer.${layer}-layer`);
    if (targetDiag) targetDiag.classList.add('highlighted-active');
}

function clearHighlight() {
    document.getElementById('guide-margin').classList.add('hidden');
    document.getElementById('guide-padding').classList.add('hidden');
    document.querySelectorAll('#route-box-model .diagram-layer').forEach(d => d.classList.remove('highlighted-active'));
}

function renderCSSCode() {
    const o = state.outer;
    const i = state.inner;

    let outerPad = formatCSSValue(o.padding);
    let outerMar = formatCSSValue(o.margin);
    let innerPad = formatCSSValue(i.padding);
    let innerMar = formatCSSValue(i.margin);

    const codeStr = `.outer {
    background-color: rgb(62, 223, 50);
    width: ${o.width}px;
    height: ${o.height}px;
    box-sizing: ${currentSizing};
    border: ${o.border}px solid #3b82f6;
    padding: ${outerPad};
    margin: ${outerMar};
}

.inner {
    background-color: red;
    width: ${i.width}px;
    height: ${i.height}px;
    box-sizing: ${currentSizing};
    border: ${i.border}px solid #3b82f6;
    padding: ${innerPad};
    margin: ${innerMar};
}`;
    const el = document.getElementById('css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 2: FLEXBOX ARENA ENGINE
// ===================================================
const flexState = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    gap: '10px',
    itemCount: 3,
    selectedItem: 1,
    items: {
        1: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' },
        2: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' },
        3: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' },
        4: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' },
        5: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' },
        6: { flexGrow: 0, flexShrink: 1, alignSelf: 'auto' }
    }
};

function updateFlex(property, value) {
    flexState[property] = value;
    
    if (property === 'flexDirection' || property === 'justifyContent' || property === 'alignItems' || property === 'flexWrap') {
        const searchClass = property === 'flexDirection' ? 'flex-dir' : 
                            property === 'justifyContent' ? 'flex-jc' : 
                            property === 'alignItems' ? 'flex-ai' : 'flex-wrap';
        document.querySelectorAll(`[id^="${searchClass}"]`).forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`${searchClass}-${value}`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    if (property === 'gap') {
        document.getElementById('val-flex-gap').innerText = value;
    }

    applyFlexStyles();
}

function addFlexItem() {
    if (flexState.itemCount >= 6) return;
    flexState.itemCount++;
    
    const container = document.getElementById('flex-container');
    const newId = flexState.itemCount;
    
    const div = document.createElement('div');
    div.className = 'flex-item';
    div.id = `item-${newId}`;
    div.setAttribute('onclick', `selectFlexItem(${newId})`);
    div.innerHTML = `<span class="item-badge">Item ${newId}</span><div class="item-stats">g:0 | s:1</div>`;
    
    container.appendChild(div);
    selectFlexItem(newId);
    applyFlexStyles();
}

function removeFlexItem() {
    if (flexState.itemCount <= 1) return;
    const container = document.getElementById('flex-container');
    const item = document.getElementById(`item-${flexState.itemCount}`);
    if (item) container.removeChild(item);
    
    flexState.itemCount--;
    if (flexState.selectedItem > flexState.itemCount) {
        selectFlexItem(flexState.itemCount);
    }
    applyFlexStyles();
}

function selectFlexItem(index) {
    flexState.selectedItem = index;
    
    document.querySelectorAll('.flex-item').forEach(item => item.classList.remove('active-flex-item'));
    const activeEl = document.getElementById(`item-${index}`);
    if (activeEl) activeEl.classList.add('active-flex-item');

    const itemState = flexState.items[index];
    document.getElementById('item-grow').value = itemState.flexGrow;
    document.getElementById('val-grow').innerText = itemState.flexGrow;
    document.getElementById('item-shrink').value = itemState.flexShrink;
    document.getElementById('val-shrink').innerText = itemState.flexShrink;
    document.getElementById('item-self').value = itemState.alignSelf;
}

function updateActiveItemProp(property, value) {
    const index = flexState.selectedItem;
    flexState.items[index][property] = value;
    
    if (property === 'flexGrow') document.getElementById('val-grow').innerText = value;
    if (property === 'flexShrink') document.getElementById('val-shrink').innerText = value;

    applyFlexStyles();
}

function applyFlexStyles() {
    clearManualCSS();
    
    const container = document.getElementById('flex-container');
    if (!container) return;

    container.style.flexDirection = flexState.flexDirection;
    container.style.justifyContent = flexState.justifyContent;
    container.style.alignItems = flexState.alignItems;
    container.style.flexWrap = flexState.flexWrap;
    container.style.gap = flexState.gap;

    for (let i = 1; i <= flexState.itemCount; i++) {
        const item = document.getElementById(`item-${i}`);
        if (item) {
            const itemState = flexState.items[i];
            item.style.flexGrow = itemState.flexGrow;
            item.style.flexShrink = itemState.flexShrink;
            item.style.alignSelf = itemState.alignSelf;
            
            const stats = item.querySelector('.item-stats');
            if (stats) {
                stats.innerText = `g:${itemState.flexGrow} | s:${itemState.flexShrink}` + 
                                  (itemState.alignSelf !== 'auto' ? ` | self:${itemState.alignSelf}` : '');
            }
        }
    }

    renderFlexboxCode();
}

function renderFlexboxCode() {
    let itemsCSS = '';
    for (let i = 1; i <= flexState.itemCount; i++) {
        const s = flexState.items[i];
        if (s.flexGrow !== 0 || s.flexShrink !== 1 || s.alignSelf !== 'auto') {
            itemsCSS += `\n.flex-item:nth-child(${i}) {
    flex-grow: ${s.flexGrow};
    flex-shrink: ${s.flexShrink};` + (s.alignSelf !== 'auto' ? `\n    align-self: ${s.alignSelf};` : '') + `\n}`;
        }
    }

    const codeStr = `.flex-container {
    display: flex;
    flex-direction: ${flexState.flexDirection};
    justify-content: ${flexState.justifyContent};
    align-items: ${flexState.alignItems};
    flex-wrap: ${flexState.flexWrap};
    gap: ${flexState.gap};
}
${itemsCSS}`;
    const el = document.getElementById('flex-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 3: POSITIONING LAB ENGINE
// ===================================================
const posState = {
    mode: 'static',
    top: 'auto',
    left: 'auto',
    zIndex: 'auto'
};

function updatePosMode(mode) {
    posState.mode = mode;
    
    document.querySelectorAll('[id^="pos-"]').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`pos-${mode}`).classList.add('active');

    const parent = document.getElementById('pos-parent');
    const sliders = ['pos-top', 'pos-left', 'pos-z'];

    if (mode === 'static') {
        sliders.forEach(s => document.getElementById(s).disabled = true);
        document.getElementById('pos-desc').innerHTML = `<code>static</code> is the standard positioning flow. It ignores all offsets.`;
        parent.classList.remove('active-parent-highlight');
    } else {
        sliders.forEach(s => document.getElementById(s).removeAttribute('disabled'));
        
        posState.top = '0';
        posState.left = '0';
        posState.zIndex = '1';
        
        document.getElementById('pos-top').value = 0;
        document.getElementById('pos-left').value = 0;
        document.getElementById('pos-z').value = 1;
        document.getElementById('val-pos-top').innerText = '0px';
        document.getElementById('val-pos-left').innerText = '0px';
        document.getElementById('val-pos-z').innerText = '1';

        if (mode === 'relative') {
            document.getElementById('pos-desc').innerHTML = `<code>relative</code>: Moves around relative to *where it would have been* in normal flow. Still occupies its original space!`;
            parent.classList.remove('active-parent-highlight');
        } else if (mode === 'absolute') {
            document.getElementById('pos-desc').innerHTML = `<code>absolute</code>: Element pops **entirely out of normal flow**. It positions itself relative to its nearest non-static parent. Notice parent dashed highlight!`;
            parent.classList.add('active-parent-highlight');
        } else if (mode === 'fixed') {
            document.getElementById('pos-desc').innerHTML = `<code>fixed</code>: Element pops entirely out of normal flow and is bound **relative to the browser viewport**. Scroll to see it remain locked!`;
            parent.classList.remove('active-parent-highlight');
        } else if (mode === 'sticky') {
            document.getElementById('pos-desc').innerHTML = `<code>sticky</code>: Behaves like <code>relative</code> in flow until the screen scrolls and it hits a coordinate threshold (e.g. <code>top: 0</code>), then it sticks!`;
            parent.classList.remove('active-parent-highlight');
        }
    }

    applyPositionStyles();
}

function updatePosOffset(offsetType, value) {
    let formattedValue = value;
    if (offsetType !== 'zIndex') {
        formattedValue = value + 'px';
        document.getElementById(`val-pos-${offsetType}`).innerText = formattedValue;
    } else {
        document.getElementById(`val-pos-z`).innerText = value;
    }

    posState[offsetType] = formattedValue;
    applyPositionStyles();
}

function applyPositionStyles() {
    clearManualCSS();

    const target = document.getElementById('pos-target');
    if (!target) return;

    target.style.position = posState.mode;
    
    if (posState.mode === 'static') {
        target.style.top = 'auto';
        target.style.left = 'auto';
        target.style.zIndex = 'auto';
        
        document.getElementById('val-pos-top').innerText = 'auto';
        document.getElementById('val-pos-left').innerText = 'auto';
        document.getElementById('val-pos-z').innerText = 'auto';
    } else {
        target.style.top = posState.top;
        target.style.left = posState.left;
        target.style.zIndex = posState.zIndex;
    }

    renderPositionCode();
}

function renderPositionCode() {
    let offsetCSS = '';
    if (posState.mode !== 'static') {
        offsetCSS = `\n    top: ${posState.top};\n    left: ${posState.left};\n    z-index: ${posState.zIndex};`;
    }

    const codeStr = `.parent {
    position: relative; /* Containing box parent anchor */
}

.pos-target-element {
    position: ${posState.mode};${offsetCSS}
}`;
    const el = document.getElementById('pos-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 4: GRID SPACE ENGINE
// ===================================================
const gridState = {
    gridTemplateColumns: '1fr 1fr 1fr',
    columnGap: '16px',
    rowGap: '16px'
};

function updateGridCols(template) {
    gridState.gridTemplateColumns = template;
    
    document.querySelectorAll('[id^="grid-col-"]').forEach(btn => btn.classList.remove('active'));
    if (template.includes('1fr 1fr 1fr')) document.getElementById('grid-col-1').classList.add('active');
    else if (template.includes('100px 1fr 100px')) document.getElementById('grid-col-2').classList.add('active');
    else if (template.includes('1fr 2fr 1fr')) document.getElementById('grid-col-3').classList.add('active');
    else if (template.includes('repeat')) document.getElementById('grid-col-4').classList.add('active');

    applyGridStyles();
}

function updateGridGap(gapType, value) {
    gridState[gapType] = value;
    
    if (gapType === 'columnGap') document.getElementById('val-grid-colgap').innerText = value;
    else document.getElementById('val-grid-rowgap').innerText = value;

    applyGridStyles();
}

function applyGridStyles() {
    clearManualCSS();
    
    const container = document.getElementById('grid-container');
    if (!container) return;

    container.style.gridTemplateColumns = gridState.gridTemplateColumns;
    container.style.columnGap = gridState.columnGap;
    container.style.rowGap = gridState.rowGap;

    renderGridCode();
}

function renderGridCode() {
    const codeStr = `.grid-preview-arena {
    display: grid;
    grid-template-columns: ${gridState.gridTemplateColumns};
    column-gap: ${gridState.columnGap};
    row-gap: ${gridState.rowGap};
}`;
    const el = document.getElementById('grid-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 5: COLORS, RADIUS & SHADOWS LAB ENGINE [UPDATED]
// ===================================================
const colorState = {
    mode: 'solid',
    hue: 160,
    saturation: 80,
    lightness: 50,
    opacity: 1.0,
    gradAngle: 45,
    gradColor1: '#10b981',
    gradColor2: '#0ea5e9'
};

function updateColorMode(mode) {
    colorState.mode = mode;
    
    const solidControls = document.getElementById('col-solid-controls');
    const gradControls = document.getElementById('col-gradient-controls');

    if (mode === 'solid') {
        solidControls.classList.remove('hidden');
        gradControls.classList.add('hidden');
        updateSolidColor();
    } else {
        solidControls.classList.add('hidden');
        gradControls.classList.remove('hidden');
        updateGradientColor();
    }
}

function updateSolidColor() {
    colorState.hue = document.getElementById('col-hue').value;
    colorState.saturation = document.getElementById('col-sat').value;
    colorState.lightness = document.getElementById('col-light').value;

    document.getElementById('val-col-hue').innerText = colorState.hue + '°';
    document.getElementById('val-col-sat').innerText = colorState.saturation + '%';
    document.getElementById('val-col-light').innerText = colorState.lightness + '%';

    applyColorStyles();
}

function updateGradientColor() {
    colorState.gradAngle = document.getElementById('grad-angle').value;
    colorState.gradColor1 = document.getElementById('grad-c1').value;
    colorState.gradColor2 = document.getElementById('grad-c2').value;

    document.getElementById('val-grad-angle').innerText = colorState.gradAngle + '°';

    applyColorStyles();
}

function updateOpacity() {
    const val = document.getElementById('col-op').value;
    colorState.opacity = (val / 100).toFixed(2);
    document.getElementById('val-col-op').innerText = colorState.opacity;

    applyColorStyles();
}

function applyColorStyles() {
    clearManualCSS();

    const preview = document.getElementById('color-preview');
    const info = document.getElementById('color-info');
    if (!preview || !info) return;

    let backgroundStyle = '';
    let descriptionText = '';

    if (colorState.mode === 'solid') {
        const hsla = `hsla(${colorState.hue}, ${colorState.saturation}%, ${colorState.lightness}%, ${colorState.opacity})`;
        backgroundStyle = hsla;
        descriptionText = hsla;
    } else {
        const c1 = hexToRgba(colorState.gradColor1, colorState.opacity);
        const c2 = hexToRgba(colorState.gradColor2, colorState.opacity);
        backgroundStyle = `linear-gradient(${colorState.gradAngle}deg, ${c1}, ${c2})`;
        descriptionText = `linear-gradient(${colorState.gradAngle}deg, ${colorState.gradColor1}, ${colorState.gradColor2})`;
    }

    // Capture radius & widths
    const radius = document.getElementById('fx-radius').value + 'px';
    const borderW = document.getElementById('fx-border-w').value + 'px';
    document.getElementById('val-fx-radius').innerText = radius;
    document.getElementById('val-fx-border-w').innerText = borderW;

    // Capture Box Shadows
    const shX = document.getElementById('sh-x').value + 'px';
    const shY = document.getElementById('sh-y').value + 'px';
    const shBlur = document.getElementById('sh-blur').value + 'px';
    const shSpread = document.getElementById('sh-spread').value + 'px';
    const shCol = document.getElementById('sh-color').value;
    const shInset = document.getElementById('sh-inset').checked ? 'inset' : '';

    document.getElementById('val-sh-x').innerText = shX;
    document.getElementById('val-sh-y').innerText = shY;
    document.getElementById('val-sh-blur').innerText = shBlur;
    document.getElementById('val-sh-spread').innerText = shSpread;

    const shadowStyle = `${shInset} ${shX} ${shY} ${shBlur} ${shSpread} ${shCol}`.trim();

    // Render Preview Element Styles
    preview.style.background = backgroundStyle;
    preview.style.borderRadius = radius;
    preview.style.border = `${borderW} solid rgba(255, 255, 255, 0.25)`;
    preview.style.boxShadow = shadowStyle;
    
    info.innerText = descriptionText;

    renderColorCode(backgroundStyle, radius, borderW, shadowStyle);
}

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderColorCode(bgStyle, radius, borderW, shadowStyle) {
    const codeStr = `.color-preview-box {
    background: ${bgStyle};
    border-radius: ${radius};
    border: ${borderW} solid rgba(255, 255, 255, 0.25);
    box-shadow: ${shadowStyle};
}`;
    const el = document.getElementById('color-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 6: TYPOGRAPHY STUDIO ENGINE
// ===================================================
const typeState = {
    fontFamily: "'Outfit', sans-serif",
    textAlign: 'left',
    fontSize: 24,
    letterSpacing: 0,
    lineHeight: 1.4,
    blur: 4,
    shadowColor: '#a855f7'
};

function updateTypeAlign(align) {
    typeState.textAlign = align;
    document.querySelectorAll('[id^="align-"]').forEach(btn => btn.classList.remove('active'));
    const alignBtn = document.getElementById(`align-${align}`);
    if (alignBtn) alignBtn.classList.add('active');

    updateTypography();
}

function updateTypography() {
    typeState.fontFamily = document.getElementById('type-font').value;
    typeState.fontSize = document.getElementById('type-size').value;
    typeState.letterSpacing = document.getElementById('type-spacing').value;
    typeState.lineHeight = (document.getElementById('type-height').value / 10).toFixed(1);
    typeState.blur = document.getElementById('type-blur').value;
    typeState.shadowColor = document.getElementById('type-shadow-color').value;

    document.getElementById('val-type-size').innerText = typeState.fontSize + 'px';
    document.getElementById('val-type-spacing').innerText = typeState.letterSpacing + 'px';
    document.getElementById('val-type-height').innerText = typeState.lineHeight;
    document.getElementById('val-type-blur').innerText = typeState.blur + 'px';

    applyTypeStyles();
}

function applyTypeStyles() {
    clearManualCSS();

    const p = document.getElementById('type-preview-p');
    const h = document.getElementById('type-preview-heading');
    if (!p || !h) return;

    p.style.fontFamily = typeState.fontFamily;
    p.style.fontSize = typeState.fontSize + 'px';
    p.style.letterSpacing = typeState.letterSpacing + 'px';
    p.style.lineHeight = typeState.lineHeight;
    p.style.textAlign = typeState.textAlign;

    h.style.fontFamily = typeState.fontFamily;
    
    const shadowCSS = `0px 0px ${typeState.blur}px ${typeState.shadowColor}`;
    h.style.textShadow = shadowCSS;

    renderTypographyCode(shadowCSS);
}

function renderTypographyCode(textShadow) {
    const codeStr = `.type-preview-paragraph {
    font-family: ${typeState.fontFamily};
    font-size: ${typeState.fontSize}px;
    letter-spacing: ${typeState.letterSpacing}px;
    line-height: ${typeState.lineHeight};
    text-align: ${typeState.textAlign};
}

.type-preview-heading {
    font-family: ${typeState.fontFamily};
    text-shadow: ${textShadow};
}`;
    const el = document.getElementById('type-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 7: TRANSFORMS & TIMELINE ANIM ENGINE
// ===================================================
const trState = {
    rotate: 0,
    scale: 1.0,
    skew: 0,
    preset: 'spin',
    duration: 2.5,
    isPlaying: false
};

function toggleTimelinePlay() {
    trState.isPlaying = !trState.isPlaying;
    const btn = document.getElementById('btn-anim-play');
    if (!btn) return;

    if (trState.isPlaying) {
        btn.innerText = 'Pause Timeline';
        btn.className = 'btn btn-danger';
    } else {
        btn.innerText = 'Play Timeline';
        btn.className = 'btn btn-emerald';
    }
    applyTransformStyles();
}

function applyTransformStyles() {
    clearManualCSS();

    trState.rotate = document.getElementById('tr-rot').value;
    trState.scale = (document.getElementById('tr-scale').value / 10).toFixed(1);
    trState.skew = document.getElementById('tr-skew').value;
    trState.preset = document.getElementById('anim-preset').value;
    trState.duration = (document.getElementById('anim-dur').value / 10).toFixed(1);

    document.getElementById('val-tr-rot').innerText = trState.rotate + '°';
    document.getElementById('val-tr-scale').innerText = trState.scale;
    document.getElementById('val-tr-skew').innerText = trState.skew + '°';
    document.getElementById('val-anim-dur').innerText = trState.duration + 's';

    const target = document.getElementById('transform-target');
    if (!target) return;

    target.style.animation = 'none';
    void target.offsetWidth; 

    const trStr = `rotate(${trState.rotate}deg) scale(${trState.scale}) skewX(${trState.skew}deg)`;
    target.style.transform = trStr;

    if (trState.isPlaying) {
        target.style.animation = `${trState.preset} ${trState.duration}s infinite linear`;
    }

    renderTransformCode(trStr);
}

function renderTransformCode(trStr) {
    let animCSS = '';
    if (trState.isPlaying) {
        animCSS = `\n    animation: ${trState.preset} ${trState.duration}s infinite linear;`;
    }

    const codeStr = `.anim-target-rocket {
    transform: ${trStr};${animCSS}
}`;
    const el = document.getElementById('transform-css-output');
    if (el) el.value = codeStr;
}


// ===================================================
// MODULE 8: LAYOUT QUEST GAME ENGINE (20 LEVELS)
// ===================================================
let currentGameLevel = 1;

const levels = {
    1: {
        title: "Level 1: Box Model Cushioning [Easy]",
        instructions: "Align the active vector dot (✦) with the Target Zone. Set a `padding` of `30px` and a `margin` of `20px` to fit it exactly!",
        scene: "box",
        selector: ".game-lvl1-active {",
        defaultVal: "padding: 0px;\nmargin: 0px;",
        validate: function() {
            const active = document.getElementById('game-lvl1-active');
            const target = document.getElementById('game-lvl1-target');
            return checkLayoutAlignment(active, target);
        }
    },
    2: {
        title: "Level 2: Flex Centering Arena [Easy]",
        instructions: "Three elements are piled on the left. Center them exactly over the targets! Initialize the layout by setting `display: flex;` and align them horizontally using `justify-content: center;` and vertically with `align-items: center;`.",
        scene: "flex",
        selector: ".game-flex-arena {",
        defaultVal: "display: block;",
        validate: function() {
            const act1 = document.getElementById('game-flex-item-1');
            const tar1 = document.getElementById('flex-target-spot-1');
            const act2 = document.getElementById('game-flex-item-2');
            const tar2 = document.getElementById('flex-target-spot-2');
            const act3 = document.getElementById('game-flex-item-3');
            const tar3 = document.getElementById('flex-target-spot-3');
            return checkLayoutAlignment(act1, tar1) && checkLayoutAlignment(act2, tar2) && checkLayoutAlignment(act3, tar3);
        }
    },
    3: {
        title: "Level 3: Flex Spacing Flow [Easy]",
        instructions: "Distribute your elements evenly! The targets are spread across the row. Set `display: flex;` and use `justify-content: space-between;` to push spacing between items exactly over targets.",
        scene: "flex",
        selector: ".game-flex-arena {",
        defaultVal: "display: flex;",
        validate: function() {
            const act1 = document.getElementById('game-flex-item-1');
            const tar1 = document.getElementById('flex-target-spot-1');
            const act2 = document.getElementById('game-flex-item-2');
            const tar2 = document.getElementById('flex-target-spot-2');
            const act3 = document.getElementById('game-flex-item-3');
            const tar3 = document.getElementById('flex-target-spot-3');
            return checkLayoutAlignment(act1, tar1) && checkLayoutAlignment(act2, tar2) && checkLayoutAlignment(act3, tar3);
        }
    },
    4: {
        title: "Level 4: Flying Absolute Coordinates [Easy]",
        instructions: "Fly your rocket into the target. Set the position mode to absolute and anchor offsets `right: 0px;` and `bottom: 0px;` to snap it in place!",
        scene: "position",
        selector: ".game-pos-item-active {",
        defaultVal: "position: static;",
        validate: function() {
            const active = document.getElementById('game-pos-active-dot');
            const target = document.getElementById('game-pos-target-dot');
            return checkLayoutAlignment(active, target);
        }
    },
    5: {
        title: "Level 5: Containing Block Relative Anchor [Easy]",
        instructions: "The target sits inside the relative containing block parent (.game-pos-parent). Currently the parent has standard static position, so absolute items escape to the viewport bottom! Bind them by making the parent relative (`position: relative`), and the child absolute (`position: absolute; right: 0px; bottom: 0px;`).",
        scene: "position",
        selector: "/* Edit BOTH parent and child classes below */\n.game-pos-parent {\n\n}\n.game-pos-item-active {",
        defaultVal: "}\n.game-pos-parent {\n    position: static;\n}\n.game-pos-item-active {\n    position: absolute;\n    right: 0px;\n    bottom: 0px;",
        validate: function() {
            const active = document.getElementById('game-pos-active-dot');
            const target = document.getElementById('game-pos-target-dot');
            return checkLayoutAlignment(active, target);
        }
    },
    6: {
        title: "Level 6: Gradient Color Match Synthesis [Easy]",
        instructions: "Synthesize the target gradient background! Write a linear-gradient background property running at `45deg`, starting with `#10b981` (emerald green) and ending with `#0ea5e9` (cyan blue).",
        scene: "color",
        selector: ".game-color-active {",
        defaultVal: "background: #ef4444;",
        validate: function() {
            const act = document.getElementById('game-color-active-box');
            const tar = document.getElementById('game-color-target-box');
            const actBg = window.getComputedStyle(act).backgroundImage;
            const tarBg = window.getComputedStyle(tar).backgroundImage;
            return actBg.replace(/\s+/g, '') === tarBg.replace(/\s+/g, '');
        }
    },
    7: {
        title: "Level 7: Neon Glowing Typography [Easy]",
        instructions: "Make the title stand out! Give it a font weight of `800` (heavy bold) and glowing `text-shadow` layers with horizontal offset `0px`, vertical offset `0px`, blur radius `10px`, and color `#a855f7` (purple).",
        scene: "type",
        selector: ".game-type-active {",
        defaultVal: "font-weight: 400;\ntext-shadow: none;",
        validate: function() {
            const act = document.getElementById('game-type-active-text');
            const tar = document.getElementById('game-type-target-text');
            const actWeight = window.getComputedStyle(act).fontWeight;
            const tarWeight = window.getComputedStyle(tar).fontWeight;
            const actShadow = window.getComputedStyle(act).textShadow;
            const tarShadow = window.getComputedStyle(tar).textShadow;
            return actWeight === tarWeight && actShadow.replace(/\s+/g, '') === tarShadow.replace(/\s+/g, '');
        }
    },
    8: {
        title: "Level 8: Flex Direction Column Alignment [Medium]",
        instructions: "Stack your three active elements vertically and center them horizontally and vertically! Set `display: flex; flex-direction: column; justify-content: center; align-items: center;`.",
        scene: "flex",
        selector: ".game-flex-arena {",
        defaultVal: "display: flex;\nflex-direction: row;",
        validate: function() {
            const act1 = document.getElementById('game-flex-item-1');
            const tar1 = document.getElementById('flex-target-spot-1');
            const act2 = document.getElementById('game-flex-item-2');
            const tar2 = document.getElementById('flex-target-spot-2');
            const act3 = document.getElementById('game-flex-item-3');
            const tar3 = document.getElementById('flex-target-spot-3');
            return checkLayoutAlignment(act1, tar1) && checkLayoutAlignment(act2, tar2) && checkLayoutAlignment(act3, tar3);
        }
    },
    9: {
        title: "Level 9: 2D Transform Coordinates Alignment [Medium]",
        instructions: "Write a stacked `transform` property to skew the cogs spaceship along the X-axis by `30deg`, scale it by `1.2` times, and rotate it by `45deg`! Order: rotate -> scale -> skewX",
        scene: "transform",
        selector: ".game-tr-item-active {",
        defaultVal: "transform: rotate(0deg);",
        validate: function() {
            const active = document.getElementById('game-tr-active-cogs');
            const target = document.getElementById('game-tr-target-cogs');
            return checkLayoutAlignment(active, target);
        }
    },
    10: {
        title: "Level 10: Glide Transition Interpolation [Medium]",
        instructions: "Create a smooth transition sliding effect! Add a transition for all properties of duration `0.5s` and timing function `ease-in-out` inside the active spaceship.",
        scene: "transition",
        selector: ".game-trans-item-active {",
        defaultVal: "/* Add transition rule */\n",
        validate: function() {
            const act = document.getElementById('game-trans-active-box');
            const transitionProp = window.getComputedStyle(act).transitionProperty;
            const transitionDur = window.getComputedStyle(act).transitionDuration;
            return transitionProp.includes('all') && parseFloat(transitionDur) > 0.1;
        }
    },
    11: {
        title: "Level 11: Ultimate Responsive Cards Layout [Medium]",
        instructions: "Make cards share space side-by-side! Set their width to `50%` so they dynamically scale on both wide and narrow screen parent viewports exactly matching targets.",
        scene: "responsive",
        selector: ".game-resp-active-card {",
        defaultVal: "width: 100px;",
        validate: function() {
            const c1 = document.getElementById('resp-active-card-1');
            const t1 = document.getElementById('resp-target-spot-1');
            const c2 = document.getElementById('resp-active-card-2');
            const t2 = document.getElementById('resp-target-spot-2');
            return checkLayoutAlignment(c1, t1) && checkLayoutAlignment(c2, t2);
        }
    },
    12: {
        title: "Level 12: Flex Space-Evenly Alignment [Medium]",
        instructions: "Align your three flex items cleanly over their target spots! Set `display: flex; justify-content: space-evenly;` so the spacing between all items and borders is perfectly equal.",
        scene: "flex",
        selector: ".game-flex-arena {",
        defaultVal: "display: flex;\njustify-content: flex-start;",
        validate: function() {
            const act1 = document.getElementById('game-flex-item-1');
            const tar1 = document.getElementById('flex-target-spot-1');
            const act2 = document.getElementById('game-flex-item-2');
            const tar2 = document.getElementById('flex-target-spot-2');
            const act3 = document.getElementById('game-flex-item-3');
            const tar3 = document.getElementById('flex-target-spot-3');
            return checkLayoutAlignment(act1, tar1) && checkLayoutAlignment(act2, tar2) && checkLayoutAlignment(act3, tar3);
        }
    },
    13: {
        title: "Level 13: Positioning Relative Offsets [Medium]",
        instructions: "Shift your active element relative to where it naturally rests in document flow! Set `position: relative;` and specify offsets `top: 40px;` and `left: 40px;`.",
        scene: "position",
        selector: ".game-pos-item-active {",
        defaultVal: "position: static;",
        validate: function() {
            const active = document.getElementById('game-pos-active-dot');
            const target = document.getElementById('game-pos-target-dot');
            return checkLayoutAlignment(active, target);
        }
    },
    14: {
        title: "Level 14: Flex Wrap & Grid Gap Rows [Medium]",
        instructions: "Let items wrap cleanly into multiple rows when space shrinks! Set `display: flex; flex-wrap: wrap;` and define a cell spacing `gap: 15px;` to match targets.",
        scene: "flex",
        selector: ".game-flex-arena {",
        defaultVal: "display: flex;\nflex-wrap: nowrap;",
        validate: function() {
            const act = document.getElementById('game-flex-arena');
            const style = window.getComputedStyle(act);
            return style.flexWrap === 'wrap' && (style.gap.includes('15px') || style.rowGap.includes('15px'));
        }
    },
    15: {
        title: "Level 15: Absolute Centering Transform Hack [Advanced]",
        instructions: "Center your spaceship exactly inside the parent containing block (.game-pos-parent)! Set `position: absolute; left: 50%; top: 50%;` and offset its half-boundaries with `transform: translate(-50%, -50%);`.",
        scene: "position",
        selector: ".game-pos-item-active {",
        defaultVal: "position: absolute;\nleft: 0;\ntop: 0;",
        validate: function() {
            const active = document.getElementById('game-pos-active-dot');
            const target = document.getElementById('game-pos-target-dot');
            return checkLayoutAlignment(active, target);
        }
    },
    16: {
        title: "Level 16: Box Model Border-Box Fit [Advanced]",
        instructions: "Create a box of exactly `100px` total width and height! The element currently has `padding` and `borders` expanding it. Bind them inside standard outer dimensions using `box-sizing: border-box; width: 100px; height: 100px;`.",
        scene: "box",
        selector: ".game-lvl1-active {",
        defaultVal: "box-sizing: content-box;\nwidth: 100px;\nheight: 100px;",
        validate: function() {
            const active = document.getElementById('game-lvl1-active');
            const target = document.getElementById('game-lvl1-target');
            const activeStyle = window.getComputedStyle(active);
            return activeStyle.boxSizing === 'border-box' && checkLayoutAlignment(active, target);
        }
    },
    17: {
        title: "Level 17: Typographic Tracking & Line Height [Advanced]",
        instructions: "Fine-tune paragraph layout! Set the font-weight to `600` (semibold), letter spacing to `4px` (tracking), and line height to `2.0` (double-spaced leading) to match typography guidelines.",
        scene: "type",
        selector: ".game-type-active {",
        defaultVal: "letter-spacing: 0px;\nline-height: 1.0;\nfont-weight: 400;",
        validate: function() {
            const act = document.getElementById('game-type-active-text');
            const tar = document.getElementById('game-type-target-text');
            const actSpacing = window.getComputedStyle(act).letterSpacing;
            const tarSpacing = window.getComputedStyle(tar).letterSpacing;
            const actLineHeight = window.getComputedStyle(act).lineHeight;
            const tarLineHeight = window.getComputedStyle(tar).lineHeight;
            const actWeight = window.getComputedStyle(act).fontWeight;
            return actSpacing === tarSpacing && Math.abs(parseFloat(actLineHeight) - parseFloat(tarLineHeight)) < 0.1 && actWeight === '600';
        }
    },
    18: {
        title: "Level 18: Keyframes Animation Timeline [Advanced]",
        instructions: "Inject animation keyframes! Write an infinite linear animation of duration `1.5s` using the predefined timeline preset `float`: `animation: float 1.5s infinite ease-in-out;`.",
        scene: "transform",
        selector: ".game-tr-item-active {",
        defaultVal: "animation: none;",
        validate: function() {
            const act = document.getElementById('game-tr-active-cogs');
            const style = window.getComputedStyle(act);
            return style.animationName === 'float' && style.animationPlayState === 'running';
        }
    },
    19: {
        title: "Level 19: Multi-Stop Gradient Synthesis [Advanced]",
        instructions: "Compile a linear gradient spanning at `90deg`, starting with `#10b981` at `0%`, `#0ea5e9` at `50%`, and finishing with `#a855f7` at `100%`! Use `background: linear-gradient(90deg, #10b981 0%, #0ea5e9 50%, #a855f7 100%);`.",
        scene: "color",
        selector: ".game-color-active {",
        defaultVal: "background: #ef4444;",
        validate: function() {
            const act = document.getElementById('game-color-active-box');
            const tar = document.getElementById('game-color-target-box');
            const actBg = window.getComputedStyle(act).backgroundImage;
            const tarBg = window.getComputedStyle(tar).backgroundImage;
            return actBg.replace(/\s+/g, '') === tarBg.replace(/\s+/g, '');
        }
    },
    20: {
        title: "Level 20: Stacking Transform Coordinates [Advanced]",
        instructions: "Final Challenge! Align spaceship coordinates using three stacked commands in order: translate X/Y, scale size, and rotate degrees: `transform: translate(20px, -20px) scale(0.8) rotate(90deg);`.",
        scene: "transform",
        selector: ".game-tr-item-active {",
        defaultVal: "transform: none;",
        validate: function() {
            const active = document.getElementById('game-tr-active-cogs');
            const target = document.getElementById('game-tr-target-cogs');
            return checkLayoutAlignment(active, target);
        }
    }
};

function loadGameLevel(levelNum) {
    currentGameLevel = levelNum;
    const lvl = levels[levelNum];

    document.getElementById('game-alert-banner').classList.add('hidden');
    document.getElementById('success-modal').classList.add('hidden');

    document.querySelectorAll('.level-tab-btn').forEach(btn => btn.classList.remove('active'));
    const activeTab = document.getElementById(`btn-lvl-${levelNum}`);
    if (activeTab) activeTab.classList.add('active');

    document.getElementById('game-active-level').innerText = `${levelNum} / 20`;
    document.getElementById('game-lvl-title').innerText = lvl.title;
    document.getElementById('game-lvl-instructions').innerText = lvl.instructions;
    document.getElementById('editor-selector-line').innerText = lvl.selector;

    const textarea = document.getElementById('game-editor-textarea');
    textarea.value = lvl.defaultVal;

    document.querySelectorAll('.game-level-view').forEach(v => v.classList.remove('active-view'));
    
    const scene = lvl.scene;
    if (scene === 'box') {
        document.getElementById('game-level-box-container').classList.add('active-view');
        const active = document.getElementById('game-lvl1-active');
        const target = document.getElementById('game-lvl1-target');
        active.style.cssText = '';
        
        if (levelNum === 1) {
            target.style.top = '20px';
            target.style.left = '20px';
            const tarInner = target.querySelector('.game-lvl1-inner-target');
            tarInner.style.cssText = 'width: 60px; height: 60px; margin: 20px; padding: 30px; box-sizing: border-box; background: rgba(14, 165, 233, 0.08);';
        } else if (levelNum === 16) {
            target.style.top = '40px';
            target.style.left = '40px';
            const tarInner = target.querySelector('.game-lvl1-inner-target');
            tarInner.style.cssText = 'width: 100px; height: 100px; box-sizing: border-box; padding: 20px; border: 5px solid rgba(14, 165, 233, 0.3); background: rgba(14, 165, 233, 0.08);';
        }
    } else if (scene === 'flex') {
        document.getElementById('game-level-flex-container').classList.add('active-view');
        const flexArena = document.getElementById('game-flex-arena');
        const flexTargets = document.getElementById('game-flex-targets');
        
        flexArena.style.cssText = '';
        
        if (levelNum === 2) {
            flexTargets.style.cssText = 'display: flex; flex-direction: row; justify-content: center; align-items: center;';
        } else if (levelNum === 3) {
            flexTargets.style.cssText = 'display: flex; flex-direction: row; justify-content: space-between; align-items: stretch;';
        } else if (levelNum === 8) {
            flexTargets.style.cssText = 'display: flex; flex-direction: column; justify-content: center; align-items: center;';
        } else if (levelNum === 12) {
            flexTargets.style.cssText = 'display: flex; flex-direction: row; justify-content: space-evenly; align-items: center;';
        } else if (levelNum === 14) {
            flexTargets.style.cssText = 'display: flex; flex-direction: row; flex-wrap: wrap; gap: 15px; justify-content: flex-start;';
        }
    } else if (scene === 'position') {
        document.getElementById('game-level-position-container').classList.add('active-view');
        const posParent = document.getElementById('game-pos-parent-box');
        const targetDot = document.getElementById('game-pos-target-dot');
        const activeDot = document.getElementById('game-pos-active-dot');

        activeDot.style.cssText = '';
        posParent.style.cssText = '';
        
        if (levelNum === 4) {
            posParent.classList.remove('relative-parent-game');
            targetDot.style.bottom = '0px';
            targetDot.style.right = '0px';
            targetDot.style.top = 'auto';
            targetDot.style.left = 'auto';
            targetDot.style.transform = 'none';
        } else if (levelNum === 5) {
            posParent.classList.add('relative-parent-game');
            targetDot.style.bottom = '0px';
            targetDot.style.right = '0px';
            targetDot.style.top = 'auto';
            targetDot.style.left = 'auto';
            targetDot.style.transform = 'none';
        } else if (levelNum === 13) {
            posParent.classList.remove('relative-parent-game');
            targetDot.style.top = '40px';
            targetDot.style.left = '40px';
            targetDot.style.bottom = 'auto';
            targetDot.style.right = 'auto';
            targetDot.style.transform = 'none';
        } else if (levelNum === 15) {
            posParent.classList.add('relative-parent-game');
            targetDot.style.top = '50%';
            targetDot.style.left = '50%';
            targetDot.style.transform = 'translate(-50%, -50%)';
            targetDot.style.bottom = 'auto';
            targetDot.style.right = 'auto';
        }
    } else if (scene === 'color') {
        document.getElementById('game-level-color-container').classList.add('active-view');
        const act = document.getElementById('game-color-active-box');
        const tar = document.getElementById('game-color-target-box');
        act.style.cssText = '';
        
        if (levelNum === 6) {
            tar.style.background = 'linear-gradient(45deg, #10b981, #0ea5e9)';
        } else if (levelNum === 19) {
            tar.style.background = 'linear-gradient(90deg, #10b981 0%, #0ea5e9 50%, #a855f7 100%)';
        }
    } else if (scene === 'type') {
        document.getElementById('game-level-type-container').classList.add('active-view');
        const act = document.getElementById('game-type-active-text');
        const tar = document.getElementById('game-type-target-text');
        act.style.cssText = '';
        
        if (levelNum === 7) {
            tar.style.cssText = 'font-weight: 800; text-shadow: 0px 0px 10px #a855f7;';
        } else if (levelNum === 17) {
            tar.style.cssText = 'letter-spacing: 4px; line-height: 2.0; font-weight: 600; text-shadow: none;';
        }
    } else if (scene === 'transform') {
        document.getElementById('game-level-transform-container').classList.add('active-view');
        const act = document.getElementById('game-tr-active-cogs');
        const tar = document.getElementById('game-tr-target-cogs');
        act.style.cssText = '';
        
        if (levelNum === 9) {
            tar.style.transform = `rotate(45deg) scale(1.2) skewX(30deg)`;
        } else if (levelNum === 18) {
            tar.style.transform = 'none';
            tar.style.animation = 'float 1.5s infinite ease-in-out';
        } else if (levelNum === 20) {
            tar.style.transform = `translate(20px, -20px) scale(0.8) rotate(90deg)`;
            tar.style.animation = 'none';
        }
    } else if (scene === 'transition') {
        document.getElementById('game-level-transition-container').classList.add('active-view');
        document.getElementById('game-trans-active-box').style.cssText = '';
    } else if (scene === 'responsive') {
        document.getElementById('game-level-responsive-container').classList.add('active-view');
        document.getElementById('resp-active-card-1').style.cssText = '';
        document.getElementById('resp-active-card-2').style.cssText = '';
    }

    applyGameCSSLive();
}

function applyGameCSSLive() {
    const levelNum = currentGameLevel;
    const userCode = document.getElementById('game-editor-textarea').value;
    const lvl = levels[levelNum];
    const scene = lvl.scene;
    
    if (scene === 'box') {
        const el = document.getElementById('game-lvl1-active');
        if (el) el.style.cssText = userCode;
    } else if (scene === 'flex') {
        const el = document.getElementById('game-flex-arena');
        if (el) el.style.cssText = userCode;
    } else if (scene === 'position') {
        if (levelNum === 5) {
            injectGameCSS(userCode);
        } else {
            const el = document.getElementById('game-pos-active-dot');
            if (el) el.style.cssText = userCode;
        }
    } else if (scene === 'color') {
        const el = document.getElementById('game-color-active-box');
        if (el) el.style.cssText = userCode;
    } else if (scene === 'type') {
        const el = document.getElementById('game-type-active-text');
        if (el) el.style.cssText = userCode;
    } else if (scene === 'transform') {
        const el = document.getElementById('game-tr-active-cogs');
        if (el) el.style.cssText = userCode;
    } else if (scene === 'transition') {
        injectGameCSS(userCode);
    } else if (scene === 'responsive') {
        injectGameCSS(userCode);
    }
}

function injectGameCSS(codeText) {
    let styleTag = document.getElementById('game-injected-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'game-injected-styles';
        document.head.appendChild(styleTag);
    }
    
    const levelNum = currentGameLevel;
    if (levelNum === 5) {
        styleTag.innerHTML = codeText;
    } else if (levelNum === 10) {
        styleTag.innerHTML = `.game-trans-item-active { ${codeText} } \n .game-trans-arena-wrapper:hover .game-trans-item-active { transform: translate(160px, 160px); }`;
    } else if (levelNum === 11) {
        styleTag.innerHTML = `.game-resp-active-card { ${codeText} }`;
    } else {
        styleTag.innerHTML = '';
    }
}

function resetGameLevel() {
    loadGameLevel(currentGameLevel);
}

function checkLayoutAlignment(activeEl, targetEl) {
    if (!activeEl || !targetEl) return false;
    
    const activeRect = activeEl.getBoundingClientRect();
    const targetRect = targetEl.getBoundingClientRect();

    const dx = Math.abs(activeRect.left - targetRect.left);
    const dy = Math.abs(activeRect.top - targetRect.top);
    const dw = Math.abs(activeRect.width - targetRect.width);
    const dh = Math.abs(activeRect.height - targetRect.height);

    return (dx < 3.5 && dy < 3.5 && dw < 3.5 && dh < 3.5);
}

function checkGameAnswer() {
    const lvl = levels[currentGameLevel];
    const isSolved = lvl.validate();

    const alert = document.getElementById('game-alert-banner');
    
    if (isSolved) {
        alert.classList.add('hidden');
        triggerConfetti();
        document.getElementById('success-modal').classList.remove('hidden');
    } else {
        alert.classList.remove('hidden');
        alert.className = "game-alert alert-error";
        document.getElementById('game-alert-msg').innerText = "Oops, spacing coordinates are not quite aligned yet. Review values and try again!";
        
        const viewport = document.getElementById('game-viewport');
        viewport.classList.add('wobble-fail');
        setTimeout(() => viewport.classList.remove('wobble-fail'), 500);
    }
}

function nextGameLevel() {
    document.getElementById('success-modal').classList.add('hidden');
    if (currentGameLevel < 20) {
        loadGameLevel(currentGameLevel + 1);
    } else {
        const alert = document.getElementById('game-alert-banner');
        alert.classList.remove('hidden');
        alert.className = "game-alert alert-success";
        document.getElementById('game-alert-msg').innerText = "CONGRATULATIONS! You completed all 20 levels of Layout Quest and mastered CSS!";
        triggerConfetti();
        setTimeout(triggerConfetti, 800);
        setTimeout(triggerConfetti, 1600);
    }
}


// ===================================================
// CONFETTI RENDER ENGINE
// ===================================================
function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#10b981', '#a855f7', '#f59e0b', '#0ea5e9', '#ef4444', '#ffe17d'];
    const particles = [];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.random() * 10 - 5,
            tiltAngleIncremental: Math.random() * 0.07 + 0.02,
            tiltAngle: 0
        });
    }

    let animationId;
    let frames = 0;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.tiltAngle += p.tiltAngleIncremental;
            p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
            p.x += Math.sin(p.tiltAngle);
            p.tilt = Math.sin(p.tiltAngle - index / 3) * 15;

            ctx.beginPath();
            ctx.lineWidth = p.r;
            ctx.strokeStyle = p.color;
            ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            ctx.stroke();
        });

        frames++;
        if (frames < 180) {
            animationId = requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            cancelAnimationFrame(animationId);
        }
    }

    draw();
}


// INITIALIZATION
window.addEventListener('load', () => {
    applyStyles();
    applyFlexStyles();
    applyGridStyles();
    updatePosMode('static');
    updateColorMode('solid');
    updateTypography();
    applyTransformStyles();
    
    window.addEventListener('resize', () => {
        if (activeRoute === 'box-model') {
            renderHighlightOverlays();
        }
    });
});
