import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { ArrowRight, Shield, Code2, Star, Bug, Lightbulb, TrendingUp } from 'lucide-react';
import codeLensLogo from '../logo.jpeg';

/* ─── Three.js Scene ─────────────────────────────────────────────────── */
function useThreeScene(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 40);

    // Particle Field
    const COUNT = 2200;
    const positions = new Float32Array(COUNT * 3);
    const colors    = new Float32Array(COUNT * 3);
    const sizes     = new Float32Array(COUNT);

    const palette = [
      new THREE.Color('#06b6d4'),
      new THREE.Color('#8b5cf6'),
      new THREE.Color('#ec4899'),
      new THREE.Color('#0ea5e9'),
      new THREE.Color('#a78bfa'),
    ];

    for (let i = 0; i < COUNT; i++) {
      const r     = 30 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
      sizes[i] = 0.6 + Math.random() * 1.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float uTime;
        uniform float uPixelRatio;
        void main() {
          vColor = color;
          vec3 pos = position;
          float wave = sin(uTime * 0.4 + pos.x * 0.05) * 0.6
                     + cos(uTime * 0.3 + pos.y * 0.05) * 0.6;
          pos.z += wave;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
          gl_Position  = projectionMatrix * mvPosition;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          float d = distance(gl_PointCoord, vec2(0.5));
          if (d > 0.5) discard;
          float alpha = 1.0 - smoothstep(0.2, 0.5, d);
          gl_FragColor = vec4(vColor, alpha * 0.85);
        }`,
    });

    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    const icoGeo  = new THREE.IcosahedronGeometry(12, 1);
    const icoMat  = new THREE.MeshBasicMaterial({ color: '#06b6d4', wireframe: true, transparent: true, opacity: 0.08 });
    const ico     = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const icoGeo2 = new THREE.IcosahedronGeometry(18, 1);
    const icoMat2 = new THREE.MeshBasicMaterial({ color: '#8b5cf6', wireframe: true, transparent: true, opacity: 0.05 });
    const ico2    = new THREE.Mesh(icoGeo2, icoMat2);
    scene.add(ico2);

    const torGeo  = new THREE.TorusGeometry(22, 0.15, 8, 80);
    const torMat  = new THREE.MeshBasicMaterial({ color: '#ec4899', transparent: true, opacity: 0.2 });
    const torus   = new THREE.Mesh(torGeo, torMat);
    torus.rotation.x = Math.PI / 4;
    scene.add(torus);

    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouse);

    const onResize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      mat.uniforms.uTime.value = t;
      particles.rotation.y = t * 0.04 + mouseX * 0.12;
      particles.rotation.x = mouseY * 0.08;
      ico.rotation.y  = t * 0.12;
      ico.rotation.x  = t * 0.07;
      ico2.rotation.y = -t * 0.08;
      ico2.rotation.z =  t * 0.05;
      torus.rotation.z = t * 0.06;
      torus.rotation.y = t * 0.03 + mouseX * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geo.dispose(); mat.dispose();
      icoGeo.dispose(); icoMat.dispose();
      icoGeo2.dispose(); icoMat2.dispose();
      torGeo.dispose(); torMat.dispose();
    };
  }, []);
}

/* ─── Sub-components ─────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <div className={`card p-6 anim-fade-up-d${delay} transition-all duration-300`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="font-display font-600 text-white mb-2 text-[15px]">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const StatCard = ({ value, label }) => (
  <div className="text-center">
    <div className="gradient-text font-display text-4xl font-bold mb-1">{value}</div>
    <div className="text-slate-500 text-sm">{label}</div>
  </div>
);

const CodeLine = ({ code, delay, color }) => (
  <div
    className="absolute font-mono text-xs whitespace-nowrap opacity-0 pointer-events-none"
    style={{
      animation: `floatUp ${8 + Math.random() * 6}s ${delay}s linear infinite`,
      left: `${Math.random() * 90}%`,
      bottom: '-40px',
      color,
    }}
  >
    {code}
  </div>
);

const FLOATING_LINES = [
  { code: 'const review = await ai.analyze(code);',        color: '#06b6d466' },
  { code: 'if (bugs.length === 0) celebrate();',           color: '#8b5cf666' },
  { code: 'score: 98, explanation: "Excellent!"',          color: '#ec489966' },
  { code: 'function optimizeCode(input) {',                color: '#0ea5e966' },
  { code: 'return suggestions.map(fix => apply(fix));',    color: '#a78bfa66' },
  { code: 'const { bugs, score } = await ai.review();',   color: '#06b6d466' },
  { code: 'console.log("No vulnerabilities found ✓");',   color: '#22c55e66' },
  { code: 'export default class CodeAnalyzer {',           color: '#8b5cf666' },
];

const STEPS = [
  { n: '01', title: 'Paste your code',  desc: 'Paste any code snippet or upload a file. Supports 10+ languages including JS, Python, Java, Go, Rust and more.' },
  { n: '02', title: 'AI analysis',      desc: 'Advanced AI analyses your code for bugs, security vulnerabilities, and overall code quality instantly.' },
  { n: '03', title: 'Get results',      desc: 'Receive a detailed report with a quality score, bug list, improvement suggestions, and fully optimized code.' },
];

/* ─── Main Landing Page ──────────────────────────────────────────────── */
export default function Landing() {
  const canvasRef = useRef(null);
  useThreeScene(canvasRef);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{ background: 'rgba(2,4,8,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <img src={codeLensLogo} alt="CodeLens" className="w-10 h-10 rounded-xl object-cover" style={{ boxShadow: '0 0 20px rgba(6,182,212,0.35)' }} />
          <span className="font-display font-bold text-lg text-white">
            Code<span className="gradient-text">Lens</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"  className="btn-ghost text-sm py-2 px-4">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">
            Get Started <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />

        {/* Floating code lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {FLOATING_LINES.map((l, i) => (
            <CodeLine key={i} code={l.code} color={l.color} delay={i * 1.5} />
          ))}
        </div>

        {/* Radial glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)'
        }} />

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8 anim-fade-up"
            style={{ borderColor: 'rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.06)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400 text-xs font-medium">AI-Powered Code Review</span>
          </div>

          <h1 className="font-display font-bold leading-tight mb-6 anim-fade-up-d1"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 4.5rem)' }}>
            <span className="text-white">Review Code.</span><br />
            <span className="gradient-text">Ship Perfection.</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto anim-fade-up-d2">
            AI-powered code analysis that detects bugs, suggests improvements,
            and delivers optimized code — in seconds. Built for engineers who ship.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap anim-fade-up-d3">
            <Link to="/signup" className="btn-primary text-base py-3.5 px-7">
              Start Reviewing Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-ghost text-base py-3.5 px-7">
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-8 mt-14 anim-fade-up-d4 flex-wrap">
            {[['10+', 'Languages'], ['< 15s', 'Review Time'], ['Free', 'To Start']].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="gradient-text font-display font-bold text-xl">{v}</div>
                <div className="text-slate-600 text-xs mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }} />
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-3">What you get</div>
            <h2 className="font-display font-bold text-3xl text-white">
              Everything you need to write <span className="gradient-text">better code</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard delay={1} icon={Bug}        color="bg-red-500/10 text-red-400"     title="Bug Detection"     desc="Catches runtime errors, null pointer exceptions, security vulnerabilities, and undefined behaviour before they reach production." />
            <FeatureCard delay={2} icon={Lightbulb}  color="bg-amber-500/10 text-amber-400" title="Smart Suggestions" desc="Actionable improvements for performance, readability, design patterns, and modern best practices." />
            <FeatureCard delay={3} icon={Code2}      color="bg-cyan-500/10 text-cyan-400"   title="Optimized Code"    desc="Receive a fully rewritten, production-ready version of your code with syntax highlighting and one-click copy." />
            <FeatureCard delay={1} icon={TrendingUp} color="bg-violet-500/10 text-violet-400" title="Quality Score"   desc="A 0–100 score with an animated ring breaks down your code quality at a glance." />
            <FeatureCard delay={2} icon={Shield}     color="bg-green-500/10 text-green-400" title="Security Analysis" desc="Identifies injection risks, improper authentication, insecure data handling, and common vulnerability patterns." />
            <FeatureCard delay={3} icon={Star}       color="bg-pink-500/10 text-pink-400"   title="Review History"    desc="Every review is saved to your dashboard. Filter by language, compare scores, and track your improvement over time." />
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-label mb-3">How it works</div>
            <h2 className="font-display font-bold text-3xl text-white">
              From paste to perfection in <span className="gradient-text">3 steps</span>
            </h2>
          </div>
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <div key={i} className="card p-6 flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-display font-bold text-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(139,92,246,0.15))', border: '1px solid rgba(6,182,212,0.2)', color: '#06b6d4' }}>
                  {s.n}
                </div>
                <div>
                  <h3 className="font-display font-600 text-white text-base mb-1">{s.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto card p-10">
          <div className="grid grid-cols-3 gap-8">
            <StatCard value="10+"   label="Languages supported" />
            <StatCard value="< 15s" label="Average review time" />
            <StatCard value="0–100" label="Quality score range" />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative inline-block mb-10">
            <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto"
              style={{ boxShadow: '0 0 60px rgba(6,182,212,0.4)' }}>
              <img src={codeLensLogo} alt="CodeLens" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-[-20px] rounded-full border opacity-30"
              style={{ borderColor: '#06b6d4', animation: 'spin-slow 6s linear infinite' }}>
              <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full -translate-x-1/2"
                style={{ background: '#06b6d4' }} />
            </div>
            <div className="absolute inset-[-38px] rounded-full border opacity-20"
              style={{ borderColor: '#8b5cf6', animation: 'spin-rev 9s linear infinite' }}>
              <div className="absolute top-1/2 -right-1.5 w-2.5 h-2.5 rounded-full -translate-y-1/2"
                style={{ background: '#8b5cf6' }} />
            </div>
          </div>

          <h2 className="font-display font-bold text-4xl text-white mb-4">
            Ready to write<br /><span className="gradient-text">better code?</span>
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">
            Join developers who review code smarter. Free to start — no credit card required.
          </p>
          <Link to="/signup" className="btn-primary text-base py-4 px-9">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t px-6 py-8 text-center"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src={codeLensLogo} alt="CodeLens" className="w-6 h-6 rounded-lg object-cover" />
          <span className="font-display font-bold text-sm text-white">CodeLens</span>
        </div>
        <p className="text-slate-600 text-xs">
          Built with React + Node.js + AI · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}