import { useEffect, useRef } from 'react';
import {
  Vector3 as a,
  MeshPhysicalMaterial as c,
  InstancedMesh as d,
  Timer as e,
  AmbientLight as f,
  SphereGeometry as g,
  Scene as i,
  Color as l,
  Object3D as m,
  SRGBColorSpace as n,
  MathUtils as o,
  PMREMGenerator as p,
  Vector2 as r,
  WebGLRenderer as s,
  PerspectiveCamera as t,
  PointLight as u,
  ACESFilmicToneMapping as v,
  Plane as w,
  Raycaster as y
} from 'three';
import { RoomEnvironment as z } from 'three/examples/jsm/environments/RoomEnvironment.js';

class ThreeApp {
  #config; canvas; camera; cameraMinAspect; cameraMaxAspect; cameraFov; maxPixelRatio; minPixelRatio; scene; renderer; #composer;
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
  render = this.#defaultRender; onBeforeRender = () => {}; onAfterRender = () => {}; onAfterResize = () => {};
  #isVisible = false; #isAnimating = false; isDisposed = false; #intersectionObserver; #resizeObserver; #resizeTimeout; #timer = new e(); #frame = { elapsed: 0, delta: 0 }; #animationId;

  constructor(config) {
    this.#config = { ...config };
    this.#initCamera();
    this.#initScene();
    this.#initRenderer();
    this.resize();
    this.#initObservers();
  }
  #initCamera() { this.camera = new t(); this.cameraFov = this.camera.fov; }
  #initScene() { this.scene = new i(); }
  #initRenderer() {
    if (this.#config.canvas) this.canvas = this.#config.canvas;
    else if (this.#config.id) this.canvas = document.getElementById(this.#config.id);
    else { console.error('Three: Missing canvas or id'); return; }
    this.canvas.style.display = 'block';
    this.renderer = new s({ canvas: this.canvas, powerPreference: 'high-performance', ...(this.#config.rendererOptions ?? {}) });
    this.renderer.outputColorSpace = n;
  }
  #initObservers() {
    if (!(this.#config.size instanceof Object)) {
      window.addEventListener('resize', this.#onResize.bind(this));
      if (this.#config.size === 'parent' && this.canvas.parentNode) {
        this.#resizeObserver = new ResizeObserver(this.#onResize.bind(this));
        this.#resizeObserver.observe(this.canvas.parentNode);
      }
    }
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersect.bind(this), { root: null, rootMargin: '0px', threshold: 0 });
    this.#intersectionObserver.observe(this.canvas);
    document.addEventListener('visibilitychange', this.#onVisibility.bind(this));
  }
  #onIntersect(entries) { this.#isVisible = entries[0].isIntersecting; this.#isVisible ? this.#startLoop() : this.#stopLoop(); }
  #onVisibility() { if (this.#isVisible) { document.hidden ? this.#stopLoop() : this.#startLoop(); } }
  #onResize() { if (this.#resizeTimeout) clearTimeout(this.#resizeTimeout); this.#resizeTimeout = setTimeout(this.resize.bind(this), 100); }
  resize() {
    let width, height;
    if (this.#config.size instanceof Object) { width = this.#config.size.width; height = this.#config.size.height; }
    else if (this.#config.size === 'parent' && this.canvas.parentNode) { width = this.canvas.parentNode.offsetWidth; height = this.canvas.parentNode.offsetHeight; }
    else { width = window.innerWidth; height = window.innerHeight; }
    this.size.width = width; this.size.height = height; this.size.ratio = width / height;
    this.#updateCamera(); this.#updateRenderer(); this.onAfterResize(this.size);
  }
  #updateCamera() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) this.#adjustFov(this.cameraMinAspect);
      else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) this.#adjustFov(this.cameraMaxAspect);
      else this.camera.fov = this.cameraFov;
    }
    this.camera.updateProjectionMatrix(); this.updateWorldSize();
  }
  #adjustFov(targetAspect) {
    const tanHalfFov = Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
    this.camera.fov = 2 * o.radToDeg(Math.atan(tanHalfFov));
  }
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const fovRad = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(fovRad / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }
  #updateRenderer() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#composer?.setSize(this.size.width, this.size.height);
    let dpr = window.devicePixelRatio;
    if (this.maxPixelRatio && dpr > this.maxPixelRatio) dpr = this.maxPixelRatio;
    else if (this.minPixelRatio && dpr < this.minPixelRatio) dpr = this.minPixelRatio;
    this.renderer.setPixelRatio(dpr); this.size.pixelRatio = dpr;
  }
  #startLoop() {
    if (this.#isAnimating) return;
    const loop = () => {
      this.#animationId = requestAnimationFrame(loop);
      this.#timer.update(); this.#frame.delta = this.#timer.getDelta(); this.#frame.elapsed += this.#frame.delta;
      this.onBeforeRender(this.#frame); this.render(); this.onAfterRender(this.#frame);
    };
    this.#isAnimating = true; this.#timer.reset(); loop();
  }
  #stopLoop() { if (this.#isAnimating) { cancelAnimationFrame(this.#animationId); this.#isAnimating = false; } }
  #defaultRender() { this.renderer.render(this.scene, this.camera); }
  dispose() {
    window.removeEventListener('resize', this.#onResize.bind(this));
    this.#resizeObserver?.disconnect(); this.#intersectionObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.#onVisibility.bind(this));
    this.#stopLoop(); if (typeof this.#timer.dispose === 'function') this.#timer.dispose();
    this.scene.traverse(obj => {
      if (obj.isMesh) { obj.geometry?.dispose(); if (obj.material) { Object.values(obj.material).forEach(v2 => v2?.dispose?.()); obj.material.dispose(); } }
    });
    this.scene.clear(); this.renderer.dispose(); this.renderer.forceContextLoss(); this.isDisposed = true;
  }
}

// Pointer tracker
const pointerTrackers = new Map();
const globalPointer = new r();
let globalListening = false;

function createPointerTracker(config) {
  const tracker = { position: new r(), nPosition: new r(), hover: false, touching: false, onEnter() {}, onMove() {}, onClick() {}, onLeave() {}, ...config };
  if (!pointerTrackers.has(config.domElement)) {
    pointerTrackers.set(config.domElement, tracker);
    if (!globalListening) {
      document.body.addEventListener('pointermove', globalPointerMove);
      document.body.addEventListener('pointerleave', globalPointerLeave);
      document.body.addEventListener('click', globalClick);
      document.body.addEventListener('touchstart', globalTouchStart, { passive: false });
      document.body.addEventListener('touchmove', globalTouchMove, { passive: false });
      document.body.addEventListener('touchend', globalTouchEnd, { passive: false });
      document.body.addEventListener('touchcancel', globalTouchEnd, { passive: false });
      globalListening = true;
    }
  }
  tracker.dispose = () => {
    pointerTrackers.delete(config.domElement);
    if (pointerTrackers.size === 0) {
      document.body.removeEventListener('pointermove', globalPointerMove);
      document.body.removeEventListener('pointerleave', globalPointerLeave);
      document.body.removeEventListener('click', globalClick);
      document.body.removeEventListener('touchstart', globalTouchStart);
      document.body.removeEventListener('touchmove', globalTouchMove);
      document.body.removeEventListener('touchend', globalTouchEnd);
      document.body.removeEventListener('touchcancel', globalTouchEnd);
      globalListening = false;
    }
  };
  return tracker;
}

function globalPointerMove(e) { globalPointer.x = e.clientX; globalPointer.y = e.clientY; processPointer(); }
function processPointer() {
  for (const [elem, tracker] of pointerTrackers) {
    const rect = elem.getBoundingClientRect();
    if (isPointerInside(rect)) {
      updateTrackerPos(tracker, rect);
      if (!tracker.hover) { tracker.hover = true; tracker.onEnter(tracker); }
      tracker.onMove(tracker);
    } else if (tracker.hover && !tracker.touching) { tracker.hover = false; tracker.onLeave(tracker); }
  }
}
function globalClick(e) { globalPointer.x = e.clientX; globalPointer.y = e.clientY; for (const [elem, tk] of pointerTrackers) { const rect = elem.getBoundingClientRect(); updateTrackerPos(tk, rect); if (isPointerInside(rect)) tk.onClick(tk); } }
function globalPointerLeave() { for (const tk of pointerTrackers.values()) { if (tk.hover) { tk.hover = false; tk.onLeave(tk); } } }
function globalTouchStart(e) { if (!e.touches.length) return; e.preventDefault(); globalPointer.x = e.touches[0].clientX; globalPointer.y = e.touches[0].clientY; for (const [elem, tk] of pointerTrackers) { const rect = elem.getBoundingClientRect(); if (isPointerInside(rect)) { tk.touching = true; updateTrackerPos(tk, rect); if (!tk.hover) { tk.hover = true; tk.onEnter(tk); } tk.onMove(tk); } } }
function globalTouchMove(e) { if (!e.touches.length) return; e.preventDefault(); globalPointer.x = e.touches[0].clientX; globalPointer.y = e.touches[0].clientY; for (const [elem, tk] of pointerTrackers) { const rect = elem.getBoundingClientRect(); updateTrackerPos(tk, rect); if (isPointerInside(rect)) { if (!tk.hover) { tk.hover = true; tk.touching = true; tk.onEnter(tk); } tk.onMove(tk); } else if (tk.hover && tk.touching) { tk.onMove(tk); } } }
function globalTouchEnd() { for (const [, tk] of pointerTrackers) { if (tk.touching) { tk.touching = false; if (tk.hover) { tk.hover = false; tk.onLeave(tk); } } } }
function updateTrackerPos(tracker, rect) { tracker.position.x = globalPointer.x - rect.left; tracker.position.y = globalPointer.y - rect.top; tracker.nPosition.x = (tracker.position.x / rect.width) * 2 - 1; tracker.nPosition.y = -(tracker.position.y / rect.height) * 2 + 1; }
function isPointerInside(rect) { return globalPointer.x >= rect.left && globalPointer.x <= rect.left + rect.width && globalPointer.y >= rect.top && globalPointer.y <= rect.top + rect.height; }

// Physics
const { randFloat: rf, randFloatSpread: rfs } = o;
const _v0 = new a(), _v1 = new a(), _v2 = new a(), _v3 = new a(), _v4 = new a(), _v5 = new a(), _v6 = new a(), _v7 = new a(), _v8 = new a(), _v9 = new a();

class BallPhysics {
  constructor(cfg) {
    this.config = cfg;
    this.positionData = new Float32Array(3 * cfg.count).fill(0);
    this.velocityData = new Float32Array(3 * cfg.count).fill(0);
    this.sizeData = new Float32Array(cfg.count).fill(1);
    this.center = new a();
    this._initPositions(); this.setSizes();
  }
  _initPositions() {
    const { config: cfg, positionData: pd } = this;
    this.center.toArray(pd, 0);
    for (let i = 1; i < cfg.count; i++) { pd[i*3] = rfs(2*cfg.maxX); pd[i*3+1] = rfs(2*cfg.maxY); pd[i*3+2] = rfs(2*cfg.maxZ); }
  }
  setSizes() { const { config: cfg, sizeData: sd } = this; sd[0] = cfg.size0; for (let i = 1; i < cfg.count; i++) sd[i] = rf(cfg.minSize, cfg.maxSize); }
  update(frame) {
    const { config: cfg, center, positionData: pd, sizeData: sd, velocityData: vd } = this;
    let start = 0;
    if (cfg.controlSphere0) {
      start = 1;
      _v0.fromArray(pd, 0); _v0.lerp(center, 0.1).toArray(pd, 0);
      _v3.set(0,0,0).toArray(vd, 0);
    }
    for (let i = start; i < cfg.count; i++) {
      const b = i*3;
      _v1.fromArray(pd, b); _v4.fromArray(vd, b);
      _v4.y -= frame.delta * cfg.gravity * sd[i];
      _v4.multiplyScalar(cfg.friction); _v4.clampLength(0, cfg.maxVelocity);
      _v1.add(_v4); _v1.toArray(pd, b); _v4.toArray(vd, b);
    }
    for (let i = start; i < cfg.count; i++) {
      const b = i*3; _v1.fromArray(pd, b); _v4.fromArray(vd, b); const ri = sd[i];
      for (let j = i+1; j < cfg.count; j++) {
        const b2 = j*3; _v2.fromArray(pd, b2); _v5.fromArray(vd, b2); const rj = sd[j];
        _v6.copy(_v2).sub(_v1); const dist = _v6.length(); const minDist = ri+rj;
        if (dist < minDist) {
          const overlap = minDist - dist;
          _v7.copy(_v6).normalize().multiplyScalar(0.5*overlap);
          _v8.copy(_v7).multiplyScalar(Math.max(_v4.length(),1));
          _v9.copy(_v7).multiplyScalar(Math.max(_v5.length(),1));
          _v1.sub(_v7); _v4.sub(_v8); _v1.toArray(pd, b); _v4.toArray(vd, b);
          _v2.add(_v7); _v5.add(_v9); _v2.toArray(pd, b2); _v5.toArray(vd, b2);
        }
      }
      if (cfg.controlSphere0) {
        _v6.copy(_v0).sub(_v1); const d0 = _v6.length(); const sum0 = ri+sd[0];
        if (d0 < sum0) { const diff = sum0-d0; _v7.copy(_v6.normalize()).multiplyScalar(diff); _v8.copy(_v7).multiplyScalar(Math.max(_v4.length(),2)); _v1.sub(_v7); _v4.sub(_v8); }
      }
      if (Math.abs(_v1.x)+ri > cfg.maxX) { _v1.x = Math.sign(_v1.x)*(cfg.maxX-ri); _v4.x = -_v4.x*cfg.wallBounce; }
      if (cfg.gravity===0) { if (Math.abs(_v1.y)+ri > cfg.maxY) { _v1.y = Math.sign(_v1.y)*(cfg.maxY-ri); _v4.y = -_v4.y*cfg.wallBounce; } }
      else if (_v1.y-ri < -cfg.maxY) { _v1.y = -cfg.maxY+ri; _v4.y = -_v4.y*cfg.wallBounce; }
      const mxZ = Math.max(cfg.maxZ, cfg.maxSize);
      if (Math.abs(_v1.z)+ri > mxZ) { _v1.z = Math.sign(_v1.z)*(cfg.maxZ-ri); _v4.z = -_v4.z*cfg.wallBounce; }
      _v1.toArray(pd, b); _v4.toArray(vd, b);
    }
  }
}

function makeGradient(colors) {
  const cols = colors.map(c2 => new l(c2));
  return { getAt(t2) {
    const s2 = Math.max(0,Math.min(1,t2))*(cols.length-1);
    const idx = Math.floor(s2); const alpha = s2-idx;
    const c1 = cols[idx]; const c2 = cols[Math.min(idx+1,cols.length-1)];
    return new l(c1.r+alpha*(c2.r-c1.r), c1.g+alpha*(c2.g-c1.g), c1.b+alpha*(c2.b-c1.b));
  }};
}

const DEFAULTS = {
  count: 200, colors: [0x4422cc, 0x5533ee, 0x7744ff, 0xaaaacc, 0x0d0d0d, 0xccccdd, 0xffffff],
  ambientColor: 0xffffff, ambientIntensity: 1, lightIntensity: 200,
  materialParams: { metalness:0.5, roughness:0.5, clearcoat:1, clearcoatRoughness:0.15, envMapIntensity:0.4 },
  minSize:0.5, maxSize:1, size0:1, gravity:0.5, friction:0.9975, wallBounce:0.95,
  maxVelocity:0.15, maxX:5, maxY:5, maxZ:2, controlSphere0:false, followCursor:true
};

const _dummy = new m();

class BallMesh extends d {
  constructor(renderer2, opts={}) {
    const cfg = {...DEFAULTS, ...opts};
    const env = new p(renderer2).fromScene(new z()).texture;
    const mat = new c({envMap:env, ...cfg.materialParams});
    mat.envMapRotation.x = -Math.PI / 2;
    mat.envMapRotation.y = Math.PI / 3;
    super(new g(1, 32, 32), mat, cfg.count);
    this.config = cfg; this.physics = new BallPhysics(cfg);
    this.ambientLight = new f(cfg.ambientColor, cfg.ambientIntensity); this.add(this.ambientLight);
    this.light = new u(cfg.colors[0], cfg.lightIntensity); this.add(this.light);
    if (Array.isArray(cfg.colors) && cfg.colors.length>1) {
      const grad = makeGradient(cfg.colors);
      for (let i=0;i<cfg.count;i++) { this.setColorAt(i, grad.getAt(i/cfg.count)); if(i===0) this.light.color.copy(grad.getAt(0)); }
      if (this.instanceColor) this.instanceColor.needsUpdate = true;
    }
  }
  update(frame) {
    this.physics.update(frame);
    for (let i=0;i<this.count;i++) {
      _dummy.position.fromArray(this.physics.positionData, i*3);
      _dummy.scale.setScalar(i===0 && !this.config.followCursor ? 0 : this.physics.sizeData[i]);
      _dummy.updateMatrix(); this.setMatrixAt(i, _dummy.matrix);
      if (i===0) this.light.position.copy(_dummy.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

function createBallpit(canvas, opts={}) {
  const app = new ThreeApp({ canvas, size:'parent', rendererOptions:{antialias:true, alpha:true} });
  app.renderer.toneMapping = v;
  app.camera.position.set(0,0,20); app.camera.lookAt(0,0,0);
  app.cameraMaxAspect = 1.5; app.resize();

  const ballMesh = new BallMesh(app.renderer, opts);
  app.scene.add(ballMesh);

  const raycaster = new y(); const plane = new w(new a(0,0,1),0); const hitPt = new a();
  let paused = false;

  const pointer = createPointerTracker({
    domElement: canvas,
    onMove() {
      raycaster.setFromCamera(pointer.nPosition, app.camera);
      app.camera.getWorldDirection(plane.normal);
      raycaster.ray.intersectPlane(plane, hitPt);
      ballMesh.physics.center.copy(hitPt);
      ballMesh.config.controlSphere0 = true;
    },
    onLeave() { ballMesh.config.controlSphere0 = false; }
  });

  app.onBeforeRender = frame => { if (!paused) ballMesh.update(frame); };
  app.onAfterResize = size => { ballMesh.config.maxX = size.wWidth/2; ballMesh.config.maxY = size.wHeight/2; };

  return {
    app,
    togglePause() { paused = !paused; },
    dispose() { pointer.dispose(); app.dispose(); }
  };
}

export default function Ballpit({ className='', followCursor=true, ...props }) {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    const tid = setTimeout(() => {
      if (disposed || !canvasRef.current) return;
      // Guard: parent must have real dimensions
      const parent = canvas.parentElement;
      if (!parent || parent.offsetWidth === 0) return;
      try {
        instanceRef.current = createBallpit(canvas, { followCursor, ...props });
      } catch(err) {
        console.warn('Ballpit init error:', err);
      }
    }, 50);
    return () => {
      disposed = true;
      clearTimeout(tid);
      try { instanceRef.current?.dispose(); } catch {}
      instanceRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <canvas ref={canvasRef} className={className} style={{width:'100%', height:'100%', display:'block'}} />;
}
