/* ============================================================
   WHISPER FIELD — Interactive demos
   1) CUBE: phase picker (Generation / Presentation / Deconstruction),
      panoramic 4-wall (3 visible: L, C, R), particle canvases,
      grass canvas with delayed-glow follow + per-scene library
   2) CATENARY: visitor counter drives bloom level across a row of
      flower-shaped lights; light modes change palette; phone mockup
      mirrors the picker
   ============================================================ */
(function () {
    'use strict';

    const $  = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    // -----------------------------------------------------------
    // CUBE
    // -----------------------------------------------------------
    const local = (en, zh) => document.querySelector('.lang-option.active')?.dataset.lang === 'zh' ? zh : en;
    const cube = $('#whisper-cube-demo');
    if (cube) initCube();

    function initCube() {
        const phaseBtns = $$('.whisper-phase-btn', cube);
        const hudEyebrow = $('#whisper-hud-eyebrow');
        const hudFill = $('#whisper-hud-fill');
        const hudMeta = $('#whisper-hud-meta');
        const sceneGrid = $('#whisper-scene-grid');
        const delayInput = $('#whisper-delay');
        const delayOut = $('#whisper-delay-out');
        const radiusInput = $('#whisper-radius');
        const radiusOut = $('#whisper-radius-out');
        const cycleBtn = $('#whisper-cycle-btn');
        const cycleState = $('#whisper-cycle-state');
        const floor = $('#whisper-cube-floor');
        const floorGlow = $('#whisper-floor-glow');
        const floorHint = $('#whisper-floor-hint');
        const grassCanvas = $('#whisper-grass');
        const wallScenes = $$('.whisper-wall-scene', cube);
        const wallParticles = $$('.whisper-wall-particles', cube);

        const scenes = [
            {id: 'mountain', en: 'Mountain sunrise', zh: '山间日出'},
            {id: 'forest', en: 'Forest light', zh: '林间光'},
            {id: 'shore', en: 'Lakeshore', zh: '湖畔晨光'},
            {id: 'river', en: 'River stones', zh: '溪石'},
            {id: 'night', en: 'Starfield', zh: '星空'}
        ];
        let activeScene = scenes[0];
        const photo = scene => `../Assets/demo-scenes/whisper-${scene.id}.webp`;
        const wallBounds = [[0, .22], [.22, .78], [.78, 1]];

        // Trace high-contrast contours once per photograph so the particles
        // assemble into the actual horizon, rock edges or canopy.
        function loadContours(scene) {
            if (scene.image) return;
            const image = new Image();
            scene.image = image;
            image.onload = () => {
                const sampler = document.createElement('canvas');
                sampler.width = 260; sampler.height = 96;
                const ctx = sampler.getContext('2d');
                ctx.drawImage(image, 0, 0, sampler.width, sampler.height);
                const {data} = ctx.getImageData(0, 0, 260, 96);
                const contours = [];
                for (let y = 1; y < 95; y += 2) {
                    for (let x = 1; x < 259; x += 2) {
                        const i = 4 * (260 * y + x);
                        const dx = Math.abs(data[i+4] - data[i-4]);
                        const dy = Math.abs(data[i+1040] - data[i-1040]);
                        if (dx + dy > 23) contours.push([x / 260, y / 96]);
                    }
                }
                scene.contours = contours;
                if (scene === activeScene) rebuildWallTargets();
            };
            image.src = photo(scene);
        }

        const phases = {
            generation: {
                num: '01',
                title_en: 'Particles assembling the landscape',
                title_zh: '粒子正在聚成风景',
                fill: 22, sceneOpacity: 0.18,
                mode: 'assemble',
            },
            presentation: {
                num: '02',
                title_en: 'Landscape stable — particles rest',
                title_zh: '风景定格，粒子歇下',
                fill: 62, sceneOpacity: 1.0,
                mode: 'rest',
            },
            deconstruction: {
                num: '03',
                title_en: 'Landscape dispersing into particles',
                title_zh: '风景散成粒子',
                fill: 92, sceneOpacity: 0.35,
                mode: 'disperse',
            },
        };
        let activePhase = 'generation';
        const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
        let frame = null;
        let cycleOn = false;
        let cycleTimer = null;
        const phaseOrder = ['generation', 'presentation', 'deconstruction'];

        const sketch = $('#whisper-sketch');
        const sketchToggle = $('#whisper-sketch-toggle');
        function showSketch(visible) {
            sketch.hidden = !visible;
            sketchToggle.setAttribute('aria-pressed', String(visible));
            const label = sketchToggle.querySelector('span');
            label.dataset.en = visible ? 'Return to projection' : 'Concept drawing';
            label.dataset.zh = visible ? '返回投影' : '设计原图';
            label.textContent = local(label.dataset.en, label.dataset.zh);
        }
        sketchToggle.addEventListener('click', () => showSketch(sketch.hidden));
        function paintScenes() {
            sceneGrid.innerHTML = '';
            scenes.forEach(s => {
                const card = document.createElement('button');
                card.className = 'whisper-scene-card' + (s.id === activeScene.id ? ' active' : '');
                card.dataset.scene = s.id;
                card.setAttribute('aria-pressed', String(s.id === activeScene.id));
                // Thumbnail is the centre slice of the same panorama
                card.innerHTML = `
                    <div class="whisper-scene-thumb"><img src="${photo(s)}" alt="" loading="lazy"></div>
                    <span class="whisper-scene-name">${local(s.en, s.zh)}</span>
                `;
                card.addEventListener('click', () => {
                    activeScene = s;
                    showSketch(false);
                    paintScenes();
                    sceneGrid.querySelector(`[data-scene="${s.id}"]`).focus({preventScroll: true});
                    applyScene();
                });
                sceneGrid.appendChild(card);
            });
        }

        function applyScene() {
            hudEyebrow.textContent = local(activeScene.en, activeScene.zh);
            loadContours(activeScene);
            wallScenes.forEach(w => {
                w.className = 'whisper-wall-scene show';
                w.style.backgroundImage = `url('${photo(activeScene)}')`;
                w.style.opacity = phases[activePhase].sceneOpacity;
            });
            // Re-pick silhouette targets and re-seed particles from edges
            // so changing scenes always re-runs the assemble animation.
            rebuildWallTargets();
            wallParticles.forEach(seedFromEdges);
            wallState.forEach(st => st.phaseT = 0);

        }

        function applyPhase(name) {
            const prev = activePhase;
            activePhase = name;
            phaseBtns.forEach(b => {
                b.classList.toggle('active', b.dataset.phase === name);
                b.setAttribute('aria-pressed', String(b.dataset.phase === name));
            });
            const p = phases[name];
            hudEyebrow.textContent = local(activeScene.en, activeScene.zh);
            hudFill.style.width = p.fill + '%';
            hudMeta.textContent = local(p.title_en, p.title_zh);
            wallScenes.forEach(w => { w.style.opacity = p.sceneOpacity; });
            if (motionPreference.matches && !cycleOn) showStillScene();
            // Reset per-wall timers so the new phase animates from t=0
            wallState.forEach(st => st.phaseT = 0);
            // When entering Generation from any other phase, push particles
            // off-screen so they fly back in. When entering Deconstruction,
            // snap them to the silhouette so they "fall apart" from there.
            if (name === 'generation' && prev !== 'generation') {
                wallParticles.forEach(seedFromEdges);
            } else if (name === 'disperse' || name === 'deconstruction') {
                wallParticles.forEach(snapToTargets);
            }
        }

        phaseBtns.forEach(b => b.addEventListener('click', () => {
            stopCycle();
            showSketch(false);
            applyPhase(b.dataset.phase);
        }));

        function startCycle() {
            cycleOn = true;
            cycleBtn.setAttribute('aria-pressed', 'true');
            syncAnimation();
            cycleBtn.classList.add('on');
            cycleState.textContent = local('ON', '开启');
            cycleState.dataset.en = 'ON';
            cycleState.dataset.zh = '开启';
            let i = phaseOrder.indexOf(activePhase);
            cycleTimer = setInterval(() => {
                i = (i + 1) % phaseOrder.length;
                applyPhase(phaseOrder[i]);
            }, 4500);
        }
        function stopCycle() {
            cycleOn = false;
            cycleBtn.setAttribute('aria-pressed', 'false');
            syncAnimation();
            cycleBtn.classList.remove('on');
            cycleState.textContent = local('OFF', '关闭');
            cycleState.dataset.en = 'OFF';
            cycleState.dataset.zh = '关闭';
            clearInterval(cycleTimer);
        }
        cycleBtn.addEventListener('click', () => {
            if (cycleOn) stopCycle(); else startCycle();
        });

        // Range controls
        let delayMs = 120;
        let glowRadius = 90; // canvas pixels (cm visualised)
        delayInput.addEventListener('input', () => {
            delayMs = +delayInput.value;
            delayOut.textContent = delayMs;
        });
        radiusInput.addEventListener('input', () => {
            const cm = +radiusInput.value;
            glowRadius = 30 + cm * 4;
            radiusOut.textContent = cm;
            floorGlow.style.width = (glowRadius * 2) + 'px';
            floorGlow.style.height = (glowRadius * 2) + 'px';
        });

        /* -----------------------------------------------------------
           PARTICLE SYSTEM (silhouette-driven)

           Assemble and disperse the contours of each wall's photograph.
           ----------------------------------------------------------- */

        const PARTICLES_PER_WALL = 220;
        // Local timing per wall, used to drive the assemble/disperse curve.
        // Reset on every phase switch.
        const wallState = wallParticles.map(() => ({ phaseT: 0 }));

        wallParticles.forEach((cv, i) => {
            cv.ctx = cv.getContext('2d');
            cv.particles = [];
            cv.targets = [];
            cv.bursts = [];
            cv.bounds = wallBounds[i];
            // Click anywhere on the wall → small ripple burst (still
            // useful as a "co-creation" gesture)
            cv.parent = cv.parentElement;
            cv.parent.addEventListener('click', (e) => {
                const r = cv.parent.getBoundingClientRect();
                const x = (e.clientX - r.left) * (cv.width / r.width);
                const y = (e.clientY - r.top) * (cv.height / r.height);
                spawnBurst(cv, x, y, 18);
            });
        });

        function resizeWallCanvases() {
            wallParticles.forEach(cv => {
                const r = cv.parentElement.getBoundingClientRect();
                const dpr = Math.min(2, window.devicePixelRatio || 1);
                cv.width = Math.max(1, Math.floor(r.width * dpr));
                cv.height = Math.max(1, Math.floor(r.height * dpr));
                cv.style.width = r.width + 'px';
                cv.style.height = r.height + 'px';
                cv._dpr = dpr;
            });
            // After a resize, particles are off — re-seed them from the
            // edges so the next assemble animation reads correctly.
            if (typeof seedFromEdges === 'function') {
                wallParticles.forEach(cv => { if (cv.particles && cv.particles.length) seedFromEdges(cv); });
            }
        }
        window.addEventListener('resize', resizeWallCanvases);
        setTimeout(resizeWallCanvases, 50);
        // After init runs, the canvases just got sized — give targets +
        // particles a chance to reset once everything is laid out.
        setTimeout(() => {
            resizeWallCanvases();
            if (typeof rebuildWallTargets === 'function') rebuildWallTargets();
            wallParticles.forEach(seedFromEdges);
            wallState.forEach(st => st.phaseT = 0);
        }, 120);

        function vbToCanvas(cv, x, y) {
            return [(x - cv.bounds[0]) / (cv.bounds[1] - cv.bounds[0]) * cv.width, y * cv.height];
        }

        function spawnBurst(cv, x, y, n) {
            for (let k = 0; k < n; k++) {
                const a = Math.random() * Math.PI * 2;
                const s = 0.6 + Math.random() * 2.0;
                cv.bursts.push({
                    x, y,
                    vx: Math.cos(a) * s, vy: Math.sin(a) * s,
                    life: 1, decay: 0.018 + Math.random() * 0.02,
                    r: 0.8 + Math.random() * 1.6
                });
            }
        }

        // Re-pick targets for every wall when the scene changes.
        function rebuildWallTargets() {
            const contours = activeScene.contours;
            if (!contours) {
                wallParticles.forEach(cv => { cv.targets = []; cv.particles = []; });
                return;
            }
            wallParticles.forEach((cv, wi) => {
                const points = contours.filter(([x]) => x >= cv.bounds[0] && x <= cv.bounds[1]);
                cv.targets = points.length ? pickN(points, PARTICLES_PER_WALL, wi * 17 + 3) : [];
                // Initialise particles, each bound to one target
                cv.particles = cv.targets.map((t, idx) => ({
                    tx: t[0], ty: t[1],
                    // Random off-screen origin (top/left/right/bottom)
                    x: 0, y: 0,
                    vx: 0, vy: 0,
                    a: 0,
                    r: 0.7 + (idx % 7) * 0.12,
                    seed: Math.random(),
                }));
                seedFromEdges(cv);
            });
        }

        function seedFromEdges(cv) {
            cv.particles.forEach(p => {
                const side = Math.floor(Math.random() * 4);
                if (side === 0) { p.x = Math.random() * cv.width;  p.y = -10; }
                else if (side === 1) { p.x = cv.width + 10;        p.y = Math.random() * cv.height; }
                else if (side === 2) { p.x = Math.random() * cv.width; p.y = cv.height + 10; }
                else { p.x = -10; p.y = Math.random() * cv.height; }
                p.vx = 0; p.vy = 0; p.a = 0;
            });
        }

        function snapToTargets(cv) {
            cv.particles.forEach(p => {
                const [cx, cy] = vbToCanvas(cv, p.tx, p.ty);
                p.x = cx; p.y = cy;
                const a = Math.random() * Math.PI * 2;
                const s = 0.4 + Math.random() * 0.8;
                p.vx = Math.cos(a) * s;
                p.vy = Math.sin(a) * s;
                p.a = 1;
            });
        }

        function pickN(arr, n, salt) {
            // Deterministic-ish pick so wall i's target subset is
            // stable across re-renders while differing per wall.
            const out = [];
            const len = arr.length;
            const stride = Math.max(1, Math.floor(len / n));
            for (let k = 0; k < n; k++) {
                const idx = (k * stride + salt * 7) % len;
                out.push(arr[idx]);
            }
            return out;
        }

        function tickWalls(dt) {
            wallParticles.forEach((cv, wi) => {
                const ctx = cv.ctx;
                const w = cv.width, h = cv.height;
                if (!w || !h) return;
                ctx.clearRect(0, 0, w, h);

                const phase = phases[activePhase];
                const st = wallState[wi];
                st.phaseT = Math.min(1, st.phaseT + dt / 2.5); // ~2.5s phase ramp

                ctx.save();
                ctx.globalCompositeOperation = 'lighter';

                cv.particles.forEach(p => {
                    if (phase.mode === 'assemble') {
                        // Ease toward target; alpha rises
                        const [tx, ty] = vbToCanvas(cv, p.tx, p.ty);
                        const k = 0.04 + 0.05 * st.phaseT;
                        p.vx += (tx - p.x) * k * 0.18;
                        p.vy += (ty - p.y) * k * 0.18;
                        p.vx *= 0.84;
                        p.vy *= 0.84;
                        p.x += p.vx;
                        p.y += p.vy;
                        // Alpha = how close we are to the target
                        const d = Math.hypot(tx - p.x, ty - p.y);
                        const closeness = Math.max(0, 1 - d / 80);
                        p.a += (closeness - p.a) * 0.08;
                    } else if (phase.mode === 'rest') {
                        // Snap to target, fade out — the photograph carries the image
                        const [tx, ty] = vbToCanvas(cv, p.tx, p.ty);
                        p.x += (tx - p.x) * 0.2;
                        p.y += (ty - p.y) * 0.2;
                        p.a += (0 - p.a) * 0.05;
                    } else if (phase.mode === 'disperse') {
                        // Push outward from target
                        const [tx, ty] = vbToCanvas(cv, p.tx, p.ty);
                        const dx = p.x - tx;
                        const dy = p.y - ty;
                        const len = Math.hypot(dx, dy) || 1;
                        // Decaying outward acceleration
                        const push = 0.18 * (1 - st.phaseT * 0.6);
                        p.vx += (dx / len) * push;
                        p.vy += (dy / len) * push - 0.02; // slight upward lift
                        p.vx *= 0.96;
                        p.vy *= 0.96;
                        p.x += p.vx;
                        p.y += p.vy;
                        // Alpha: bright at first, then fade
                        const target = Math.max(0, 0.9 - st.phaseT * 0.9);
                        p.a += (target - p.a) * 0.06;
                    }
                    if (p.a > 0.02) {
                        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
                        grd.addColorStop(0, `rgba(180, 220, 255, ${p.a * 0.9})`);
                        grd.addColorStop(1, `rgba(180, 220, 255, 0)`);
                        ctx.fillStyle = grd;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // Click bursts: short-lived radial puffs, decoupled from the
                // silhouette particles so co-creation gestures never destroy
                // the assembled landscape.
                for (let i = cv.bursts.length - 1; i >= 0; i--) {
                    const b = cv.bursts[i];
                    b.x += b.vx;
                    b.y += b.vy;
                    b.vx *= 0.94;
                    b.vy *= 0.94;
                    b.life -= b.decay;
                    if (b.life <= 0) { cv.bursts.splice(i, 1); continue; }
                    ctx.fillStyle = `rgba(220, 240, 255, ${b.life * 0.55})`;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            });
        }

        // -----------------------------------------------------------
        // Floor: grass blades + delayed-glow follow
        // -----------------------------------------------------------
        const grass = grassCanvas;
        const gctx = grass.getContext('2d');
        const blades = [];
        function resizeFloor() {
            const r = grass.getBoundingClientRect();
            grass.width = Math.max(1, Math.floor(r.width));
            grass.height = Math.max(1, Math.floor(r.height));
            blades.length = 0;
            const N = Math.floor(grass.width * 0.35);
            for (let i = 0; i < N; i++) {
                blades.push({
                    x: Math.random() * grass.width,
                    y: grass.height - Math.random() * grass.height * 0.6,
                    h: 14 + Math.random() * 22,
                    sw: Math.random() * Math.PI * 2,
                    speed: 0.012 + Math.random() * 0.015,
                });
            }
        }
        window.addEventListener('resize', resizeFloor);
        setTimeout(() => { resizeFloor(); syncAnimation(); }, 60);

        let cursor = { x: -9999, y: -9999, t: 0 };
        let target = { x: -9999, y: -9999 };
        let glowOn = false;
        floor.addEventListener('pointermove', (e) => {
            const r = floor.getBoundingClientRect();
            target.x = e.clientX - r.left;
            target.y = e.clientY - r.top;
            glowOn = true;
            floorGlow.classList.add('active');
            if (motionPreference.matches && !cycleOn) { cursor.x = target.x; cursor.y = target.y; tickFloor(); }
            if (floorHint) floorHint.style.opacity = '0';
        });
        floor.addEventListener('pointerleave', () => {
            glowOn = false;
            floorGlow.classList.remove('active');
            target.x = -9999; target.y = -9999;
            if (motionPreference.matches && !cycleOn) tickFloor();
            if (floorHint) floorHint.style.opacity = '';
        });
        floor.addEventListener('click', (e) => {
            const r = floor.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            // Spawn a quick burst on the centre wall too — visible echo
            const cv = wallParticles[1];
            if (cv) {
                spawnBurst(cv, cv.width / 2, cv.height / 2, 40);
            }
            cursor.x = x; cursor.y = y;
        });

        function tickFloor() {
            // Delayed glow: lerp cursor toward target by an amount that
            // shrinks as delayMs grows — gives a tactile "follows but
            // hesitates" feel without a real timer.
            const k = Math.max(0.04, 0.5 - (delayMs / 600));
            cursor.x += (target.x - cursor.x) * k;
            cursor.y += (target.y - cursor.y) * k;
            floorGlow.style.transform = `translate(${cursor.x - glowRadius}px, ${cursor.y - glowRadius}px)`;

            const ctx = gctx;
            const w = grass.width, h = grass.height;
            if (!w || !h) return;
            ctx.clearRect(0, 0, w, h);

            const phase = phases[activePhase];
            const baseAlpha = activePhase === 'presentation' ? 0.55 : 0.85;
            for (let i = 0; i < blades.length; i++) {
                const b = blades[i];
                if (!motionPreference.matches || cycleOn) b.sw += b.speed;
                const sway = Math.sin(b.sw) * 1.6;
                const tipX = b.x + sway;
                const tipY = b.y - b.h;
                const dx = tipX - cursor.x;
                const dy = tipY - cursor.y;
                const d2 = dx * dx + dy * dy;
                const within = glowOn && d2 < glowRadius * glowRadius;
                const energy = within ? 1 - Math.sqrt(d2) / glowRadius : 0;

                ctx.beginPath();
                ctx.moveTo(b.x, b.y);
                ctx.lineTo(tipX, tipY);
                if (within) {
                    ctx.strokeStyle = `rgba(${120 + 100 * energy}, ${200 + 55 * energy}, 255, ${baseAlpha})`;
                    ctx.lineWidth = 1.5 + energy * 1.5;
                } else {
                    // Dim ambient grass; phase-dependent tone
                    const tone = activePhase === 'generation' ? '120, 200, 255' :
                                 activePhase === 'presentation' ? '120, 220, 180' :
                                 '180, 160, 220';
                    ctx.strokeStyle = `rgba(${tone}, 0.18)`;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();

                // Tip glow
                if (within) {
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(150, 220, 255, ${0.65 * energy})`;
                    ctx.arc(tipX, tipY, 1.4 + energy * 1.4, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        let lastT = performance.now();
        function showStillScene() {
            wallParticles.forEach(canvas => canvas.ctx.clearRect(0, 0, canvas.width, canvas.height));
            tickFloor();
        }

        function loop(now) {
            const dt = Math.min(0.05, (now - lastT) / 1000);
            lastT = now;
            tickWalls(dt);
            tickFloor();
            frame = requestAnimationFrame(loop);
        }

        let roomVisible = true;
        function syncAnimation() {
            if (!roomVisible || (motionPreference.matches && !cycleOn)) {
                cancelAnimationFrame(frame);
                frame = null;
                showStillScene();
            } else if (frame === null) {
                lastT = performance.now();
                frame = requestAnimationFrame(loop);
            }
        }
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => { roomVisible = entry.isIntersecting; syncAnimation(); }).observe(cube);
        }
        motionPreference.addEventListener('change', () => {
            if (motionPreference.matches) stopCycle();
            else syncAnimation();
        });
        window.addEventListener('resize', syncAnimation);
        cycleBtn.setAttribute('aria-pressed', 'false');
        syncAnimation();

        // Init
        paintScenes();
        applyScene();
        applyPhase('presentation');
        document.addEventListener('portfolio:language', () => {
            paintScenes();
            hudEyebrow.textContent = local(activeScene.en, activeScene.zh);
            hudMeta.textContent = local(phases[activePhase].title_en, phases[activePhase].title_zh);
        });
        // Initial radius from input
        radiusInput.dispatchEvent(new Event('input'));
    }

    // -----------------------------------------------------------
    // CATENARY
    // -----------------------------------------------------------
    const cat = $('#whisper-cat-demo');
    if (cat) initCatenary();

    function initCatenary() {
        const flowersHost = $('#whisper-cat-flowers');
        const peopleHost = $('#whisper-cat-people');
        const minus = $('#whisper-people-minus');
        const plus  = $('#whisper-people-plus');
        const countOut = $('#whisper-people-count');
        const bloomFill = $('#whisper-bloom-fill');
        const bloomPct  = $('#whisper-bloom-pct');
        const modesBar  = $('#whisper-cat-modes');
        const customRow = $('#whisper-custom-row');
        const customSwatch = $('#whisper-custom-swatch');
        const rgbR = $('#whisper-rgb-r'), rgbG = $('#whisper-rgb-g'), rgbB = $('#whisper-rgb-b');
        const rgbROut = $('#whisper-rgb-r-out'), rgbGOut = $('#whisper-rgb-g-out'), rgbBOut = $('#whisper-rgb-b-out');
        const phoneGrid = $('#whisper-cat-phone-grid');
        const phoneInfoTitle = $('#whisper-cat-phone-info-title');
        const phoneInfoDesc  = $('#whisper-cat-phone-info-desc');
        const phoneBtn = $('#whisper-cat-phone-btn');

        const MAX_PEOPLE = 8;
        let people = 0;
        let mode = 'rest';
        let custom = { r: 255, g: 142, b: 177 };

        const modes = {
            rest: {
                en: 'Rest', zh: '静默',
                desc_en: 'Lights stay calm. Flowers remain closed when no one is here.',
                desc_zh: '灯光安静下来，没人的时候花是合上的。',
                colors: ['#fff5d6', '#ffe9b5', '#ffd99c'],
            },
            rainbow: {
                en: 'Rainbow Butterfly', zh: '彩虹蝶翼',
                desc_en: 'Inspired by the neurodivergent infinity butterfly — a soft rainbow gradient travels through the canopy.',
                desc_zh: '灵感来自神经多样性的无限蝴蝶标志，一道柔和的彩虹渐变在花丛间流过。',
                colors: ['#ff5277', '#ff8a3a', '#ffd84a', '#5bd96b', '#4ab9ff', '#a86bff'],
            },
            awareness: {
                en: 'Awareness Ribbon', zh: '关注丝带',
                desc_en: 'Radiant orange-red gradients drawn from the ADHD awareness ribbon.',
                desc_zh: '取自 ADHD 关注丝带的橙红渐变，明亮又温暖。',
                colors: ['#ff7b3a', '#ffa84a', '#ffce6b', '#c93b1c'],
            },
            custom: {
                en: 'Paint Your Color', zh: '涂上你的颜色',
                desc_en: 'Pick a hue that feels like you — the canopy follows.',
                desc_zh: '选一种像你的颜色，整片花丛都会跟着变。',
                colors: () => [`rgb(${custom.r},${custom.g},${custom.b})`],
            },
        };

        // Build flower lights along three catenary curves
        // Each curve: anchored to two x positions, with sag.
        const curves = [
            { y0: 30, y1: 60, sag: 200, count: 13 },
            { y0: 60, y1: 90, sag: 220, count: 11 },
            { y0: 90, y1: 120, sag: 240, count: 9 },
        ];

        function catY(curve, t) {
            // Quadratic bezier with control point in middle for the sag
            const y = (1 - t) * (1 - t) * curve.y0 + 2 * (1 - t) * t * curve.sag + t * t * curve.y1;
            return y;
        }

        function buildFlowers() {
            flowersHost.innerHTML = '';
            const W = flowersHost.clientWidth || 800;
            const H = 240;
            const xL = W * 0.06;
            const xR = W * 0.94;
            curves.forEach((cv, ci) => {
                for (let i = 0; i < cv.count; i++) {
                    const t = (i + 0.5) / cv.count;
                    const x = xL + (xR - xL) * t;
                    const y = (catY(cv, t) / 240) * H;
                    // Mix between bulb (small dot) and flower (decorative) to look like the renders
                    const isFlower = (i + ci) % 2 === 0 || cv.count <= 9;
                    if (isFlower) {
                        const f = document.createElement('div');
                        f.className = 'whisper-cat-flower';
                        f.style.left = x + 'px';
                        f.style.top = y + 'px';
                        f.style.setProperty('--bloom', '0');
                        f.innerHTML = `
                            <svg viewBox="0 0 38 38">
                                <g class="petal-group">
                                    <ellipse class="petal" cx="19" cy="9"  rx="5" ry="9" style="--rot:0deg"></ellipse>
                                    <ellipse class="petal" cx="19" cy="9"  rx="5" ry="9" style="--rot:72deg"></ellipse>
                                    <ellipse class="petal" cx="19" cy="9"  rx="5" ry="9" style="--rot:144deg"></ellipse>
                                    <ellipse class="petal" cx="19" cy="9"  rx="5" ry="9" style="--rot:216deg"></ellipse>
                                    <ellipse class="petal" cx="19" cy="9"  rx="5" ry="9" style="--rot:288deg"></ellipse>
                                    <circle class="core" cx="19" cy="19" r="3.5"></circle>
                                </g>
                            </svg>
                        `;
                        flowersHost.appendChild(f);
                    } else {
                        const b = document.createElement('div');
                        b.className = 'whisper-cat-bulb';
                        b.style.left = x + 'px';
                        b.style.top = y + 'px';
                        b.innerHTML = '<div class="whisper-cat-bulb-core"></div>';
                        flowersHost.appendChild(b);
                    }
                }
            });
        }
        buildFlowers();
        window.addEventListener('resize', () => buildFlowers());

        // Build phone modes
        function buildPhoneModes() {
            phoneGrid.innerHTML = '';
            ['rest', 'rainbow', 'awareness', 'custom'].forEach(key => {
                const m = modes[key];
                const item = document.createElement('button');
                item.className = 'whisper-phone-item' + (mode === key ? ' active' : '');
                const swatchClass = key === 'rest' ? 'swatch-rest' :
                                     key === 'rainbow' ? 'swatch-rainbow' :
                                     key === 'awareness' ? 'swatch-awareness' :
                                     'swatch-custom';
                item.innerHTML = `<span class="whisper-phone-swatch ${swatchClass}"></span><span>${local(m.en,m.zh)}</span>`;
                item.addEventListener('click', () => setMode(key));
                phoneGrid.appendChild(item);
            });
        }

        function setMode(key) {
            mode = key;
            $$('.whisper-cat-mode', modesBar).forEach(b => b.classList.toggle('active', b.dataset.mode === key));
            $$('.whisper-phone-item', phoneGrid).forEach((b, i) => {
                const k = ['rest', 'rainbow', 'awareness', 'custom'][i];
                b.classList.toggle('active', k === key);
            });
            customRow.hidden = key !== 'custom';
            const m = modes[key];
            phoneInfoTitle.textContent = local(m.en,m.zh);
            phoneInfoDesc.textContent = local(m.desc_en,m.desc_zh);
            paintFlowers();
        }

        function paintFlowers() {
            const m = modes[mode];
            const cols = typeof m.colors === 'function' ? m.colors() : m.colors;
            const flowers = $$('.whisper-cat-flower', flowersHost);
            const bulbs = $$('.whisper-cat-bulb', flowersHost);
            const bloom = Math.min(1, people / MAX_PEOPLE);

            flowers.forEach((f, i) => {
                f.style.setProperty('--bloom', bloom.toFixed(2));
                const c = cols[i % cols.length];
                const petals = $$('.petal', f);
                petals.forEach(p => p.style.fill = c);
                const core = $('.core', f);
                if (core) {
                    core.style.fill = c;
                    core.style.color = c;
                }
            });
            bulbs.forEach((b, i) => {
                const c = cols[(i + 1) % cols.length];
                const core = $('.whisper-cat-bulb-core', b);
                if (core) {
                    if (mode === 'rest' && people === 0) {
                        core.style.background = 'rgba(255, 240, 200, 0.45)';
                        core.style.boxShadow = 'none';
                    } else {
                        core.style.background = c;
                        core.style.boxShadow = `0 0 ${4 + bloom * 10}px ${c}`;
                    }
                }
            });

            // Bloom meter
            const pct = Math.round(bloom * 100);
            bloomFill.style.width = pct + '%';
            bloomPct.textContent = pct + '%';
        }

        function setPeople(n) {
            people = Math.max(0, Math.min(MAX_PEOPLE, n));
            countOut.textContent = people;
            // Render people silhouettes
            peopleHost.innerHTML = '';
            for (let i = 0; i < people; i++) {
                const p = document.createElement('div');
                p.className = 'whisper-cat-person';
                p.style.height = (50 + Math.random() * 25) + '%';
                peopleHost.appendChild(p);
            }
            paintFlowers();
        }

        minus.addEventListener('click', () => setPeople(people - 1));
        plus.addEventListener('click', () => setPeople(people + 1));

        // Mode picker (bottom bar)
        $$('.whisper-cat-mode', modesBar).forEach(b => {
            b.addEventListener('click', () => setMode(b.dataset.mode));
        });
        // Phone Light-it-up just bumps the people count (illustrates "shared moment")
        phoneBtn.addEventListener('click', () => {
            if (people < MAX_PEOPLE) setPeople(people + 1);
            else paintFlowers();
        });

        // Custom RGB
        function refreshCustom() {
            custom.r = +rgbR.value; custom.g = +rgbG.value; custom.b = +rgbB.value;
            rgbROut.textContent = custom.r;
            rgbGOut.textContent = custom.g;
            rgbBOut.textContent = custom.b;
            const col = `rgb(${custom.r},${custom.g},${custom.b})`;
            customSwatch.style.background = col;
            $$('.whisper-cat-mode[data-mode="custom"] .whisper-cat-mode-swatch').forEach(s => s.style.background = col);
            $$('.whisper-phone-item .whisper-phone-swatch.swatch-custom').forEach(s => s.style.background = col);
            if (mode === 'custom') paintFlowers();
        }
        [rgbR, rgbG, rgbB].forEach(s => s.addEventListener('input', refreshCustom));
        refreshCustom();

        // Init
        buildPhoneModes();
        setMode('rest');
        setPeople(0);
        document.addEventListener('portfolio:language', () => {
            buildPhoneModes();
            setMode(mode);
        });
    }
})();
