import * as THREE from 'three';
import gsap from 'gsap';
import { createReel } from './reels.js';

// Camera travels from Z_START to Z_END as the tunnel section scrolls.
export const Z_START = 10;
export const Z_END = -150;
export const PORTAL_Z = [-55, -85, -115, -145];
export const FOCUS_OFFSET = 13; // camera z distance in front of a portal when "parked"

const BG = 0x050507;
const CONTENT_W = 8;
const CONTENT_H = 5;
const PAD = 0.7;

function hexVec(hex) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/* ---------------------------------------------------------------- shaders */

const tunnelVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vDepth;
  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vec4 mv = viewMatrix * wp;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const tunnelFrag = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uAccent;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vDepth;

  float line(float x, float w) {
    float d = abs(fract(x - 0.5) - 0.5) / fwidth(x);
    return 1.0 - min(d / w, 1.0);
  }

  void main() {
    float around = vUv.x * 36.0;
    float along = vWorld.z / 3.0;
    float g = max(line(around, 1.0) * 0.55, line(along, 1.0));
    // traveling energy rings
    float ring = smoothstep(0.92, 1.0, sin(vWorld.z * 0.25 + uTime * 2.5)) ;
    // speed streaks along the length of the tunnel
    float streak = line(around + sin(vWorld.z * 0.02) * 0.0, 1.5) * smoothstep(0.0, 1.0, uSpeed);
    vec3 base = vec3(0.16, 0.17, 0.22) * g;
    vec3 col = base + uAccent * (ring * 0.22 * g + streak * 0.5);
    float fog = exp(-vDepth * 0.022);
    float near = smoothstep(1.0, 10.0, vDepth);
    gl_FragColor = vec4(col * fog * near, 1.0);
  }
`;

const particleVert = /* glsl */ `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uPixel;
  attribute float aSeed;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.3 + aSeed * 40.0) * 0.3;
    p.y += cos(uTime * 0.25 + aSeed * 30.0) * 0.3;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float depth = -mv.z;
    // clamp so particles drifting past the lens don't become huge overdraw quads
    gl_PointSize = min((1.0 + aSeed * 2.2 + uSpeed * 2.0) * uPixel * (24.0 / max(depth, 0.5)), 14.0 * uPixel);
    gl_Position = projectionMatrix * mv;
    float tw = 0.55 + 0.45 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 100.0);
    vAlpha = tw * exp(-depth * 0.03) * smoothstep(0.5, 4.0, depth);
    vSeed = aSeed;
  }
`;

const particleFrag = /* glsl */ `
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    vec3 col = mix(vec3(0.93, 0.92, 0.89), uAccent, step(0.82, vSeed));
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

const portalVert = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uFly;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // gentle liquid wobble on hover / fly
    float w = (uHover * 0.08 + uFly * 0.4);
    p.z += sin(p.x * 0.9 + uTime * 2.0) * cos(p.y * 1.1 + uTime * 1.6) * w;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const portalFrag = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uTime;
  uniform float uHover;
  uniform float uFly;
  uniform float uOpacity;
  uniform vec3 uColor;
  uniform vec2 uSize;
  uniform float uPad;
  uniform vec2 uMouse;
  varying vec2 vUv;

  float sdRoundRect(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    vec2 inner = uSize * 0.5 - vec2(uPad);
    float d = sdRoundRect(p, inner, 0.28);

    vec2 c = p / (inner * 2.0);
    // parallax toward the mouse + zoom/barrel on hover & fly-through
    c -= uMouse * 0.012 * (0.4 + uHover);
    float zoom = 1.0 - uHover * 0.04 - uFly * 0.35;
    c *= zoom;
    c += c * dot(c, c) * (uHover * 0.12 + uFly * 0.9);
    vec2 cuv = c + 0.5;

    float ca = 0.0015 + uHover * 0.004 + uFly * 0.03;
    vec3 col;
    col.r = texture2D(uTex, cuv + vec2(ca, 0.0)).r;
    col.g = texture2D(uTex, cuv).g;
    col.b = texture2D(uTex, cuv - vec2(ca, 0.0)).b;

    // scanlines + glass sweep + vignette
    col *= 0.93 + 0.07 * sin(cuv.y * 900.0);
    float sweepPos = fract(uTime * 0.09) * 3.0 - 1.0;
    float sweep = smoothstep(0.08, 0.0, abs(cuv.x + cuv.y * 0.55 - sweepPos));
    col += sweep * 0.09;
    col *= mix(0.5, 1.0, smoothstep(0.85, 0.15, length(c) * 1.25));
    // desaturate a touch until hovered
    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(lum) * 0.75, col, 0.55 + 0.45 * uHover);
    // inner edge light (glass thickness)
    col += uColor * smoothstep(0.35, 0.0, -d) * (0.18 + 0.3 * uHover);
    // flood to brand colour while passing through
    col = mix(col, uColor * 1.2, smoothstep(0.55, 1.0, uFly) * 0.85);

    float inside = 1.0 - smoothstep(-0.005, 0.005, d);
    float border = smoothstep(0.035, 0.0, abs(d));
    float glow = exp(-max(d, 0.0) * 3.2) * (0.18 + 0.55 * uHover);

    vec3 outCol = col * inside + uColor * border * (0.55 + 0.9 * uHover) + uColor * glow * (1.0 - inside);
    float alpha = clamp(inside + border + glow * (1.0 - inside), 0.0, 1.0);
    gl_FragColor = vec4(outCol, alpha * uOpacity);
  }
`;

/* ------------------------------------------------------------------ world */

export class World {
  constructor(canvas, projects, { accent = '#D4FF3A', reducedMotion = false } = {}) {
    this.projects = projects;
    this.reducedMotion = reducedMotion;
    this.accent = hexVec(accent);

    // Resolution is the biggest GPU cost. Cap it, skip MSAA on high-DPI screens
    // (the shaders anti-alias their own lines), then adapt to the device at runtime.
    const dpr = window.devicePixelRatio || 1;
    this.maxDpr = Math.min(dpr, 1.5);
    this.dpr = this.maxDpr;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: dpr < 1.5,
      stencil: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(this.dpr);
    this.renderer.setClearColor(BG, 1);
    this.frameAvg = 1 / 60;
    this.adaptClock = 0;
    this.goodFor = 0;
    this.hidden = false; // true when the page content fully covers the canvas

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(BG, 0.028);
    this.camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);

    this.cam = { pos: new THREE.Vector3(0, 0, 70), look: new THREE.Vector3(0, 0, 50), fov: 50 };
    this.mode = 'idle'; // idle (preloader) | scroll | fly
    this.introDone = false;
    this.camZ = 70;
    this.targetZ = Z_START;
    this.speed = 0;
    this.time = 0;
    this.mouse = new THREE.Vector2();
    this.mouseSmooth = new THREE.Vector2();
    this.pointerNDC = new THREE.Vector2(-10, -10);
    this.raycaster = new THREE.Raycaster();
    this.hovered = -1;
    this.activeReel = -1; // reel that must keep updating while a case study is open

    this.buildTunnel();
    this.buildParticles();
    this.buildGates();
    this.buildPortals();
    this.resize();
  }

  /* ---------- builders */

  buildTunnel() {
    const geo = new THREE.CylinderGeometry(14, 14, 420, 72, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, -110);
    this.tunnelMat = new THREE.ShaderMaterial({
      vertexShader: tunnelVert,
      fragmentShader: tunnelFrag,
      side: THREE.BackSide,
      uniforms: { uTime: { value: 0 }, uSpeed: { value: 0 }, uAccent: { value: this.accent } },
    });
    this.scene.add(new THREE.Mesh(geo, this.tunnelMat));
  }

  buildParticles() {
    const count = window.innerWidth < 768 ? 800 : 1800;
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 1.5 + Math.random() * 11.5;
      const a = Math.random() * Math.PI * 2;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = 40 - Math.random() * 360;
      seed[i] = Math.random();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    this.particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0 },
        uPixel: { value: this.renderer.getPixelRatio() },
        uAccent: { value: this.accent },
      },
    });
    this.scene.add(new THREE.Points(geo, this.particleMat));
  }

  buildGates() {
    // thin rotating rings that mark depth along the tunnel
    this.gates = [];
    for (let z = -20; z > -300; z -= 30) {
      const g = new THREE.Group();
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(11.5, 0.02, 6, 160),
        new THREE.MeshBasicMaterial({ color: 0x8a8f9e, transparent: true, opacity: 0.35 }),
      );
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(11.5, 0.06, 6, 60, Math.PI * 0.35),
        new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(this.accent.x, this.accent.y, this.accent.z, THREE.SRGBColorSpace) }),
      );
      g.add(ring, arc);
      g.position.z = z;
      g.userData.spin = (Math.random() > 0.5 ? 1 : -1) * (0.05 + Math.random() * 0.08);
      g.rotation.z = Math.random() * Math.PI * 2;
      this.scene.add(g);
      this.gates.push(g);
    }
  }

  buildPortals() {
    const geo = new THREE.PlaneGeometry(CONTENT_W + PAD * 2, CONTENT_H + PAD * 2, 24, 16);
    const hitGeo = new THREE.PlaneGeometry(CONTENT_W + 0.4, CONTENT_H + 0.4);
    this.portals = this.projects.map((proj, i) => {
      const reel = createReel(proj.slug, proj.color);
      const tex = new THREE.CanvasTexture(reel.canvas);
      tex.minFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      const uniforms = {
        uTex: { value: tex },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uFly: { value: 0 },
        uOpacity: { value: 1 },
        uColor: { value: hexVec(proj.color) },
        uSize: { value: new THREE.Vector2(CONTENT_W + PAD * 2, CONTENT_H + PAD * 2) },
        uPad: { value: PAD },
        uMouse: { value: this.mouseSmooth },
      };
      const mat = new THREE.ShaderMaterial({
        vertexShader: portalVert,
        fragmentShader: portalFrag,
        uniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.index = i;
      const group = new THREE.Group();
      group.add(mesh);

      // floating glass "shard" frame behind the portal for depth
      const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(CONTENT_W + 0.6, CONTENT_H + 0.6)),
        new THREE.LineBasicMaterial({ color: new THREE.Color(proj.color), transparent: true, opacity: 0.25 }),
      );
      frame.position.z = -0.9;
      group.add(frame);

      // invisible 2-triangle plane for raycasting instead of the subdivided portal mesh
      const hit = new THREE.Mesh(hitGeo);
      hit.visible = false;
      hit.userData.index = i;
      group.add(hit);

      this.scene.add(group);
      const side = i % 2 === 0 ? 1 : -1;
      const portal = {
        i,
        proj,
        group,
        mesh,
        hit,
        frame,
        reelClock: Math.random() * 0.1,
        uniforms,
        tex,
        reel,
        side,
        z: PORTAL_Z[i],
        focusZ: PORTAL_Z[i] + FOCUS_OFFSET,
        base: new THREE.Vector3(),
        locked: false,
        video: null,
      };
      if (proj.video) this.attachVideo(portal, proj.video);
      return portal;
    });
  }

  attachVideo(portal, src) {
    const v = document.createElement('video');
    Object.assign(v, { src, muted: true, loop: true, playsInline: true, autoplay: true, crossOrigin: 'anonymous' });
    v.addEventListener(
      'canplay',
      () => {
        portal.video = v;
        portal.uniforms.uTex.value = new THREE.VideoTexture(v);
        v.play().catch(() => {});
      },
      { once: true },
    );
  }

  /* ---------- layout */

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.narrow = this.camera.aspect < 1;
    // portrait: stack portals in the centre and scale them down so they fit
    const scale = this.narrow ? Math.max(0.42, this.camera.aspect * 0.78) : 1;
    this.portals.forEach((p) => {
      p.base.set(this.narrow ? 0 : p.side * 4.6, this.narrow ? 0.6 : (p.i % 2 ? -0.3 : 0.4), p.z);
      p.group.scale.setScalar(scale);
      p.group.rotation.y = this.narrow ? 0 : -p.side * 0.32;
      if (!p.locked) p.group.position.copy(p.base);
    });
  }

  setDpr(v) {
    this.dpr = v;
    this.renderer.setPixelRatio(v);
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.particleMat.uniforms.uPixel.value = v;
  }

  // Lower the render resolution if the device can't hold ~50fps, raise it back
  // once frames are consistently fast. Runs at most once per second.
  adapt(dt) {
    this.frameAvg += (dt - this.frameAvg) * 0.08;
    this.adaptClock += dt;
    if (this.frameAvg < 1 / 56) this.goodFor += dt;
    else this.goodFor = 0;
    if (this.adaptClock < 1) return;
    this.adaptClock = 0;
    if (this.frameAvg > 1 / 48 && this.dpr > 0.75) this.setDpr(Math.max(0.75, this.dpr - 0.25));
    else if (this.goodFor > 4 && this.dpr < this.maxDpr) {
      this.setDpr(Math.min(this.maxDpr, this.dpr + 0.25));
      this.goodFor = 0;
    }
  }

  resetAdapt() {
    this.frameAvg = 1 / 60;
    this.adaptClock = 0;
    this.goodFor = 0;
  }

  // Compile every shader and upload every texture during the preloader so the
  // first time a portal comes into view doesn't hitch.
  warmup() {
    for (const p of this.portals) {
      p.reel.draw(0);
      p.tex.needsUpdate = true;
      this.renderer.initTexture(p.tex);
    }
    this.renderer.compile(this.scene, this.camera);
  }

  setPointer(x, y) {
    this.mouse.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1);
    this.pointerNDC.copy(this.mouse);
  }

  /* ---------- camera path */

  pathAt(z, out = { pos: new THREE.Vector3(), look: new THREE.Vector3() }, withMouse = true) {
    const px = Math.sin(z * 0.045) * 0.7;
    const py = Math.cos(z * 0.035) * 0.4;
    let lx = px * 0.4;
    let ly = py * 0.4;
    for (const p of this.portals) {
      const w = 1 - smooth(0, 12, Math.abs(z - p.focusZ));
      lx += p.base.x * 0.3 * w;
      ly += p.base.y * 0.25 * w;
    }
    const mx = withMouse ? this.mouseSmooth.x : 0;
    const my = withMouse ? this.mouseSmooth.y : 0;
    out.pos.set(px + mx * 0.7, py + my * 0.45, z);
    out.look.set(lx + mx * 0.25, ly + my * 0.15, z - 12);
    return out;
  }

  /* ---------- transitions */

  portalNormal(p) {
    const r = p.group.rotation.y;
    return new THREE.Vector3(Math.sin(r), 0, Math.cos(r));
  }

  flyInto(i) {
    const p = this.portals[i];
    this.mode = 'fly';
    p.locked = true;
    this.activeReel = i;
    const center = p.group.position.clone();
    const n = this.portalNormal(p);
    const approach = center.clone().addScaledVector(n, 6.5 * p.group.scale.x);
    const through = center.clone().addScaledVector(n, -2.5);
    const beyond = center.clone().addScaledVector(n, -14);
    const dur = this.reducedMotion ? 0.5 : 1;

    const tl = gsap.timeline();
    tl.to(p.uniforms.uHover, { value: 1, duration: 0.5 }, 0)
      .to(this.cam.pos, { x: approach.x, y: approach.y, z: approach.z, duration: 1.1 * dur, ease: 'power3.inOut' }, 0)
      .to(this.cam.look, { x: center.x, y: center.y, z: center.z, duration: 1.1 * dur, ease: 'power3.inOut' }, 0)
      .addLabel('push', 1.05 * dur)
      .to(p.uniforms.uFly, { value: 1, duration: 0.75 * dur, ease: 'power2.in' }, 'push-=0.1')
      .to(this.cam.pos, { x: through.x, y: through.y, z: through.z, duration: 0.75 * dur, ease: 'power3.in' }, 'push')
      .to(this.cam.look, { x: beyond.x, y: beyond.y, z: beyond.z, duration: 0.75 * dur, ease: 'power2.in' }, 'push')
      .to(this.cam, { fov: 100, duration: 0.75 * dur, ease: 'power3.in' }, 'push');
    return tl;
  }

  // Jump the camera inside portal i (used when switching projects in the case view)
  parkInside(i) {
    this.portals.forEach((p, k) => {
      if (k !== i) {
        p.locked = false;
        p.uniforms.uFly.value = 0;
      }
    });
    const p = this.portals[i];
    p.locked = true;
    p.uniforms.uFly.value = 1;
    p.uniforms.uHover.value = 1;
    this.activeReel = i;
    this.mode = 'fly';
    const n = this.portalNormal(p);
    this.cam.pos.copy(p.group.position).addScaledVector(n, -2.5);
    this.cam.look.copy(p.group.position).addScaledVector(n, -14);
    this.cam.fov = 100;
  }

  flyOut(i) {
    const p = this.portals[i];
    const n = this.portalNormal(p);
    const center = p.group.position.clone();
    // start just in front of the glass, looking at it, then pull back to the path
    this.cam.pos.copy(center).addScaledVector(n, 0.8);
    this.cam.look.copy(center);
    this.cam.fov = 95;
    p.uniforms.uFly.value = 1;
    const dest = this.pathAt(p.focusZ, undefined, false);
    const dur = this.reducedMotion ? 0.5 : 1;
    const tl = gsap.timeline({
      onComplete: () => {
        p.locked = false;
        this.camZ = p.focusZ;
        this.mode = 'scroll';
        this.activeReel = -1;
      },
    });
    tl.to(p.uniforms.uFly, { value: 0, duration: 1.2 * dur, ease: 'power3.out' }, 0)
      .to(this.cam, { fov: 50, duration: 1.4 * dur, ease: 'power3.out' }, 0)
      .to(this.cam.pos, { x: dest.pos.x, y: dest.pos.y, z: dest.pos.z, duration: 1.6 * dur, ease: 'expo.out' }, 0)
      .to(this.cam.look, { x: dest.look.x, y: dest.look.y, z: dest.look.z, duration: 1.6 * dur, ease: 'expo.out' }, 0)
      .to(p.uniforms.uHover, { value: 0, duration: 1 }, 0.6);
    return tl;
  }

  /* ---------- picking */

  pick() {
    if (this.mode !== 'scroll') return -1;
    this.raycaster.setFromCamera(this.pointerNDC, this.camera);
    const near = this.portals.filter((p) => p.group.position.z < this.camZ && this.camZ - p.group.position.z < 32);
    const hits = this.raycaster.intersectObjects(near.map((p) => p.hit), false);
    return hits.length ? hits[0].object.userData.index : -1;
  }

  /* ---------- frame */

  // project a portal's bottom-left corner to screen space for its DOM label
  labelPosition(i, out) {
    const p = this.portals[i];
    const v = new THREE.Vector3(-CONTENT_W / 2, -CONTENT_H / 2 - 0.35, 0);
    p.group.localToWorld(v);
    const dist = this.camera.position.z - p.group.position.z;
    v.project(this.camera);
    out.x = (v.x * 0.5 + 0.5) * window.innerWidth;
    out.y = (-v.y * 0.5 + 0.5) * window.innerHeight;
    out.visible = v.z < 1 && dist > 4 && dist < 30;
    out.dist = dist;
    return out;
  }

  tick(dt) {
    this.time += dt;
    const t = this.time;
    // slow cinematic dolly for the intro, then follow the (already smoothed) scroll tightly
    const k = 1 - Math.exp(-dt * (this.introDone ? 10 : 3.2));
    this.mouseSmooth.lerp(this.mouse, 1 - Math.exp(-dt * 3));

    const prevZ = this.camZ;
    if (this.mode === 'scroll' || this.mode === 'idle') {
      const target = this.mode === 'idle' ? 70 : this.targetZ;
      this.camZ += (target - this.camZ) * k;
      if (this.mode === 'scroll' && !this.introDone && Math.abs(target - this.camZ) < 1) this.introDone = true;
      const path = this.pathAt(this.camZ);
      this.cam.pos.copy(path.pos);
      this.cam.look.copy(path.look);
    } else {
      this.camZ = this.cam.pos.z;
    }
    const v = Math.abs(this.camZ - prevZ) / Math.max(dt, 1e-3);
    this.speed += (Math.min(v / 60, 1) - this.speed) * (1 - Math.exp(-dt * 6));

    if (this.mode === 'scroll') this.cam.fov = 50 + this.speed * 22;
    this.camera.position.copy(this.cam.pos);
    this.camera.lookAt(this.cam.look);
    if (Math.abs(this.camera.fov - this.cam.fov) > 0.01) {
      this.camera.fov = this.cam.fov;
      this.camera.updateProjectionMatrix();
    }

    this.tunnelMat.uniforms.uTime.value = t;
    this.tunnelMat.uniforms.uSpeed.value = this.speed;
    this.particleMat.uniforms.uTime.value = t;
    this.particleMat.uniforms.uSpeed.value = this.speed;
    for (const g of this.gates) g.rotation.z += g.userData.spin * dt;

    if (this.hidden) return; // page content covers the canvas: no picking, reels or rendering

    // hover
    const h = this.pick();
    this.hovered = h;
    for (const p of this.portals) {
      const u = p.uniforms;
      u.uTime.value = t;
      if (this.mode === 'scroll') u.uHover.value += ((h === p.i ? 1 : 0) - u.uHover.value) * (1 - Math.exp(-dt * 7));
      if (!p.locked) {
        p.group.position.set(
          p.base.x,
          p.base.y + Math.sin(t * 0.8 + p.i * 2) * 0.18,
          p.base.z,
        );
        p.group.rotation.z = Math.sin(t * 0.5 + p.i) * 0.015;
      }
    }
    this.updateReels(dt, t);

    if (!this.skipRender) {
      this.renderer.render(this.scene, this.camera);
      this.adapt(dt);
    }
  }

  // Each reel is a 2D canvas re-uploaded to the GPU whenever it changes, so only
  // the portal you're looking at animates at 30fps; distant ones tick at 8fps,
  // at most one of them per frame.
  updateReels(dt, t) {
    if (this.skipRender) return;
    let budget = 1;
    for (const p of this.portals) {
      if (p.video) continue;
      const dist = this.camZ - p.z;
      const flying = this.activeReel >= 0;
      const hot = flying ? p.i === this.activeReel : dist > 2 && dist < 40;
      const warm = !flying && dist > -4 && dist < 90;
      if (!hot && !warm) continue;
      p.reelClock += dt;
      if (p.reelClock < (hot ? 1 / 30 : 1 / 8)) continue;
      if (!hot && budget-- <= 0) continue;
      p.reelClock = 0;
      p.reel.draw(t);
      p.tex.needsUpdate = true;
    }
  }
}
