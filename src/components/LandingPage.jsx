// src/components/LandingPage.jsx
import { useState, useEffect, useRef } from 'react';
import {
  Users, CalendarDays, DollarSign, MapPin, Building2,
  MessageSquare, BarChart3, Shield, ChevronRight,
  BookOpen, UserCheck, Bell, ArrowRight, Menu, X
} from 'lucide-react';

const C = {
  navy: '#0C1B3A', navyLight: '#162847', navyMid: '#1E3560',
  gold: '#C9A84C', goldLight: '#E8C96A', goldPale: '#FDF6E7',
  white: '#FFFFFF', offWhite: '#F8F7F4', cream: '#F3F1EC',
  text: '#0D1B2A', textSec: '#546E7A', textMuted: '#90A4AE',
  border: '#E0E4E8',
};

/* ── tiny hook: fires once when element enters viewport ── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── animated counter ── */
function Counter({ target, suffix = '', duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView(0.3);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [visible, target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── fade-in wrapper ── */
function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(28px)',
      transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════ */
export default function LandingPage({ onEnter }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif", background: C.offWhite, color: C.text, overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        .serif { font-family: 'Cormorant Garamond', Georgia, serif; }
        .gold-em { color: ${C.gold}; font-style: italic; }
        @keyframes floatA { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-10px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-14px)} }
        @keyframes floatC { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .float-a { animation: floatA 5s ease-in-out infinite; }
        .float-b { animation: floatB 6.5s ease-in-out infinite 0.8s; }
        .float-c { animation: floatC 4.5s ease-in-out infinite 1.4s; }
        .btn-gold {
          background: ${C.gold}; color: ${C.navy}; border: none;
          padding: 13px 28px; border-radius: 8px; font-size: 14px; font-weight: 600;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: background .2s, transform .15s;
        }
        .btn-gold:hover { background: ${C.goldLight}; transform: translateY(-1px); }
        .btn-outline {
          background: transparent; color: ${C.white}; border: 1.5px solid rgba(255,255,255,.35);
          padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          transition: border-color .2s, background .2s;
        }
        .btn-outline:hover { border-color: ${C.gold}; background: rgba(201,168,76,.12); }
        .feat-card {
          background: ${C.white}; border: 1px solid ${C.border};
          border-radius: 14px; padding: 24px;
          transition: box-shadow .25s, transform .25s;
        }
        .feat-card:hover { box-shadow: 0 8px 32px rgba(12,27,58,.10); transform: translateY(-3px); }
        .role-card {
          border-radius: 14px; padding: 24px 22px;
          transition: transform .2s, box-shadow .2s;
          cursor: default;
        }
        .role-card:hover { transform: translateY(-4px); box-shadow: 0 12px 36px rgba(12,27,58,.18); }
        .nav-link { font-size: 14px; color: rgba(255,255,255,.75); cursor: pointer; transition: color .2s; background:none; border:none; }
        .nav-link:hover { color: ${C.goldLight}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: ${C.cream}; }
        ::-webkit-scrollbar-thumb { background: ${C.gold}; border-radius: 3px; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'rgba(12,27,58,.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : 'none',
        transition: 'background .3s, backdrop-filter .3s',
        padding: '0 clamp(1.25rem, 5vw, 3rem)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/salem-logo.png" alt="SICC" style={{ width: 36, height: 36, objectFit: 'contain', mixBlendMode: 'screen' }} />
          <span className="serif" style={{ fontSize: 16, color: C.white, fontWeight: 400, letterSpacing: '0.01em' }}>SICC Admin</span>
        </div>

        {/* desktop links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desk-nav">
          {[['features', 'Features'], ['modules', 'Modules'], ['roles', 'Who Uses It'], ['about', 'About']].map(([id, label]) => (
            <button key={id} className="nav-link" onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>

        <button className="btn-gold" onClick={onEnter} style={{ padding: '9px 20px', fontSize: 13 }}>
          Sign In <ArrowRight size={14} />
        </button>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyMid} 55%, #1a3a6e 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(5rem, 10vw, 8rem) clamp(1.25rem, 5vw, 3rem) 5rem',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative orbs */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 480, height: 480, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}18 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-8%', width: 360, height: 360, borderRadius: '50%', background: `radial-gradient(circle, #185FA520 0%, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, width: '100%', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '4rem', alignItems: 'center' }}>

          {/* left copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,.15)',
              border: '1px solid rgba(201,168,76,.3)', borderRadius: 99, padding: '5px 14px 5px 8px',
              marginBottom: '1.5rem'
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.gold, animation: 'pulse 2s infinite', display: 'inline-block' }} />
              <span style={{ fontSize: 12, color: C.goldLight, fontWeight: 500 }}>Internal Administrative Portal</span>
            </div>

            <h1 className="serif" style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.2rem)', lineHeight: 1.08, color: C.white, fontWeight: 500, marginBottom: '1.25rem' }}>
              Salem International<br /><span className="gold-em">Christian Centre</span>
            </h1>

            <div style={{ width: 56, height: 3, background: C.gold, borderRadius: 2, marginBottom: '1.25rem' }} />

            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 460 }}>
              A dedicated platform for managing church operations — from member records and KDF zones to departmental activities, events, and pastoral follow-ups. Built for SICC leadership.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <button className="btn-gold" onClick={onEnter} style={{ fontSize: 15, padding: '13px 32px' }}>
                Enter Portal <ArrowRight size={16} />
              </button>
              <button className="btn-outline" onClick={() => scrollTo('features')}>
                Learn More <ChevronRight size={15} />
              </button>
            </div>

            {/* stats row */}
            <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,.1)' }}>
              {[
                { n: 41, suffix: '+', label: 'KDF Areas' },
                { n: 14, suffix: '', label: 'Departments' },
                { n: 5, suffix: '', label: 'Access Roles' },
              ].map(({ n, suffix, label }) => (
                <div key={label}>
                  <div className="serif" style={{ fontSize: '1.8rem', color: C.gold, lineHeight: 1 }}>
                    <Counter target={n} suffix={suffix} />
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* right — floating cards */}
          <div style={{ position: 'relative', height: 460 }}>

            {/* main dashboard card */}
            <div className="float-a" style={{
              position: 'absolute', top: '5%', left: '5%', right: '5%',
              background: C.white, borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 24px 64px rgba(0,0,0,.35)',
            }}>
              <div style={{ background: C.navy, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', fontWeight: 500 }}>Dashboard — Admin View</span>
                <span style={{ fontSize: 11, color: C.gold }}>● Live</span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Members', val: '348', color: '#185FA5' },
                    { label: 'KDF Zones', val: '41', color: C.gold },
                    { label: 'Depts', val: '14', color: '#2E7D32' },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ background: C.cream, borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 600, color }}>{val}</div>
                      <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                {[
                  { name: 'Adaeze Okonkwo', role: 'Choir Director', tag: 'Active', tc: '#2E7D32', bg: '#eaf3de' },
                  { name: 'Emmanuel Balogun', role: 'Deacon', tag: 'Worker', tc: C.gold, bg: '#FDF6E7' },
                  { name: 'Funke Nwosu', role: 'New Member', tag: 'New Convert', tc: '#185FA5', bg: '#E6F1FB' },
                ].map(({ name, role, tag, tc, bg }) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${C.border}` }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: C.navy, flexShrink: 0 }}>
                      {name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontSize: 10, color: C.textMuted }}>{role}</div>
                    </div>
                    <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 99, background: bg, color: tc, fontWeight: 500, whiteSpace: 'nowrap' }}>{tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* KDF floating card */}
            <div className="float-b" style={{
              position: 'absolute', bottom: '3%', right: '-2%', width: 175,
              background: C.navy, borderRadius: 12, padding: '14px',
              boxShadow: '0 16px 40px rgba(0,0,0,.4)', border: '1px solid rgba(255,255,255,.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${C.gold}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={15} color={C.gold} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: C.white }}>KDF Coverage</div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: C.gold, lineHeight: 1 }}>41</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>Zones across Lagos</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['Lekki', 'VGC', 'Ajah', 'Ikorodu'].map(z => (
                  <span key={z} style={{ fontSize: 9, background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.6)', padding: '2px 6px', borderRadius: 4 }}>{z}</span>
                ))}
              </div>
            </div>

            {/* follow-up floating card */}
            <div className="float-c" style={{
              position: 'absolute', bottom: '22%', left: '-4%', width: 155,
              background: C.white, borderRadius: 12, padding: '12px 14px',
              boxShadow: '0 12px 32px rgba(0,0,0,.2)', border: `1px solid ${C.border}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Bell size={13} color={C.gold} />
                <span style={{ fontSize: 11, fontWeight: 600, color: C.navy }}>Follow-ups</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.navy }}>3</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 8 }}>pending today</div>
              <div style={{ height: 1, background: C.border, marginBottom: 8 }} />
              <div style={{ fontSize: 9, color: '#E65100', fontWeight: 500 }}>↑ 2 due this week</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES OVERVIEW ── */}
      <section id="features" style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 12, color: C.gold, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '.75rem' }}>What It Does</div>
            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: C.navy, marginBottom: '.75rem', fontWeight: 400 }}>
              Everything SICC needs,<br /><span className="gold-em">in one place.</span>
            </h2>
            <p style={{ color: C.textSec, fontSize: 15, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              This portal brings together every administrative function of Salem International Christian Centre into a single, secure, role-based workspace.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: <Users size={22} color="#185FA5" />, bg: '#E6F1FB', title: 'Member Management', desc: 'Maintain complete records for every church member — personal info, spiritual status, affinity group, KDF zone, and ministry involvement.' },
            { icon: <MapPin size={22} color={C.gold} />, bg: C.goldPale, title: 'KDF Zone Tracking', desc: 'Manage all 41 Kingdom Dominion Fellowship zones across Lagos. Assign coordinators, track members per zone, and monitor outreach activity.' },
            { icon: <Building2 size={22} color="#6A1B9A" />, bg: '#F3E5F5', title: 'Department Coordination', desc: 'Oversee all 14 departments including Choir, Protocol, Ushering, Media, Prayer, WTS, and more. Track membership and leadership per unit.' },
            { icon: <UserCheck size={22} color="#2E7D32" />, bg: '#EAF3DE', title: 'Follow-up & Discipleship', desc: 'Log pastoral follow-ups for new converts and evangelism contacts. Record visit outcomes, phone calls, and WhatsApp engagements.' },
            { icon: <CalendarDays size={22} color="#185FA5" />, bg: '#E6F1FB', title: 'Events & Services', desc: 'Track Sunday services, mid-week programmes, prayer nights, conferences, and departmental meetings with attendance records.' },
            { icon: <BarChart3 size={22} color={C.gold} />, bg: C.goldPale, title: 'Reports & Analytics', desc: 'Visual dashboards for the Bishop, Admin, and Pastors to monitor growth, attendance trends, and church-wide metrics at a glance.' },
          ].map(({ icon, bg, title, desc }, i) => (
            <FadeIn key={title} delay={i * 0.08}>
              <div className="feat-card">
                <div style={{ width: 46, height: 46, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  {icon}
                </div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.navy, marginBottom: '.5rem' }}>{title}</div>
                <div style={{ fontSize: 13, color: C.textSec, lineHeight: 1.65 }}>{desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="modules" style={{ background: C.navy, padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ fontSize: 12, color: C.gold, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '.75rem' }}>How It Works</div>
              <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: C.white, marginBottom: '.75rem', fontWeight: 400 }}>
                Built around the way<br /><span className="gold-em">SICC actually operates.</span>
              </h2>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                The system mirrors your church's real structure — roles, departments, and KDF zones — so nothing needs to be re-learned.
              </p>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[
              { num: '01', icon: <Shield size={20} color={C.gold} />, title: 'You Sign In', desc: 'Each user logs in with their SICC credentials. The system immediately recognises your role — Bishop, Admin, Pastor, Dept. Leader, or KDF Coordinator.' },
              { num: '02', icon: <Users size={20} color={C.gold} />, title: 'Your View Loads', desc: 'Your personalised dashboard appears with only what is relevant to your role. No clutter. Just your data — members, zones, or department records.' },
              { num: '03', icon: <BookOpen size={20} color={C.gold} />, title: 'Manage & Record', desc: 'Add members, log attendance, record follow-ups, update departmental info, or view KDF zone reports — all from one screen.' },
              { num: '04', icon: <BarChart3 size={20} color={C.gold} />, title: 'Leadership Reviews', desc: 'Bishops and Admins see church-wide analytics. Pastors review pastoral activity. Every decision is backed by accurate, real-time data.' },
            ].map(({ num, icon, title, desc }, i) => (
              <FadeIn key={title} delay={i * 0.1}>
                <div style={{
                  background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)',
                  borderRadius: 14, padding: '24px 22px',
                  transition: 'background .2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: `${C.gold}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {icon}
                    </div>
                    <span className="serif" style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,.15)', fontWeight: 400 }}>{num}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.white, marginBottom: '.5rem' }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.65 }}>{desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ padding: 'clamp(4rem, 8vw, 6rem) clamp(1.25rem, 5vw, 3rem)', maxWidth: 1100, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: 12, color: C.gold, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '.75rem' }}>Access Roles</div>
            <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: C.navy, fontWeight: 400 }}>
              Who uses this portal?
            </h2>
          </div>
        </FadeIn>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem' }}>
          {[
            { role: 'Bishop', color: C.gold, bg: C.navy, desc: 'Full church-wide oversight. Views all analytics, members, departments, and KDF zones across the entire organisation.', icon: '✦' },
            { role: 'Administrator', color: '#185FA5', bg: '#EEF5FC', desc: 'Manages all records, users, and settings. Handles member registration, event scheduling, and departmental assignments.', icon: '⚙' },
            { role: 'Pastor', color: '#2E7D32', bg: '#F0F7ED', desc: 'Conducts pastoral follow-ups, views assigned member groups, and logs visitation activity and spiritual progress notes.', icon: '✝' },
            { role: 'Dept. Leader', color: '#6A1B9A', bg: '#F7F0FC', desc: 'Manages department-specific member lists, tracks attendance in departmental meetings, and updates unit activities.', icon: '◈' },
            { role: 'KDF Coordinator', color: '#C62828', bg: '#FDF0F0', desc: 'Oversees a specific KDF zone, manages zone members, and reports outreach and discipleship activities for their area.', icon: '◉' },
          ].map(({ role, color, bg, desc, icon }, i) => (
            <FadeIn key={role} delay={i * 0.07}>
              <div className="role-card" style={{ background: bg, border: `1px solid ${color}22` }}>
                <div style={{ fontSize: 22, marginBottom: '0.75rem', color }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: bg === C.navy ? C.white : color, marginBottom: '.5rem' }}>{role}</div>
                <div style={{ fontSize: 12, color: bg === C.navy ? 'rgba(255,255,255,.6)' : C.textSec, lineHeight: 1.65 }}>{desc}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── KDF HIGHLIGHT ── */}
      <section style={{ background: C.cream, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: 'clamp(4rem, 8vw, 5rem) clamp(1.25rem, 5vw, 3rem)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '4rem', alignItems: 'center' }}>
          <FadeIn>
            <div style={{ fontSize: 12, color: C.gold, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '.75rem' }}>KDF — Kingdom Dominion Fellowship</div>
            <h2 className="serif" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.3rem)', color: C.navy, fontWeight: 400, marginBottom: '1rem' }}>
              41 zones. <span className="gold-em">One system.</span>
            </h2>
            <p style={{ color: C.textSec, fontSize: 15, lineHeight: 1.75, marginBottom: '1.5rem' }}>
              SICC's KDF network spans 41 fellowship zones across Lagos — from Ikoyi and Lekki to Ibeju-Lekki, Ikorodu, and beyond. Each zone has a dedicated coordinator, and this portal tracks them all.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Assign and track zone coordinators', 'View all members per KDF area', 'Smart address matching to zones', 'Monitor zone-level outreach progress'].map(point => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: C.textSec }}>{point}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                'Obalende / Ikoyi / Lekki 1', 'Victoria Garden City',
                'Chevron / Chevy View', 'Thomas Estate',
                'Ajiran / Badore', 'Orchid / Oral Estate',
                'Crown Estate', 'Ikorodu',
              ].map((zone, i) => (
                <div key={zone} style={{
                  background: C.white, border: `1px solid ${C.border}`, borderRadius: 8,
                  padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8,
                  opacity: 1,
                  animation: `floatC ${3.5 + i * 0.3}s ease-in-out infinite ${i * 0.2}s`,
                }}>
                  <MapPin size={12} color={C.gold} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: C.textSec, lineHeight: 1.3 }}>{zone}</span>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', fontSize: 12, color: C.textMuted, marginTop: 4 }}>
                + 33 more zones
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: 'clamp(4rem, 8vw, 5rem) clamp(1.25rem, 5vw, 3rem)', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <FadeIn>
          <div style={{ fontSize: 12, color: C.gold, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600, marginBottom: '.75rem' }}>About This Portal</div>
          <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', color: C.navy, fontWeight: 400, marginBottom: '1rem' }}>
            Built specifically for <span className="gold-em">SICC</span>
          </h2>
          <p style={{ color: C.textSec, fontSize: 15, lineHeight: 1.8, maxWidth: 640, margin: '0 auto 1.5rem' }}>
            This is not a generic church software — it was designed from the ground up for Salem International Christian Centre. Every module, every field, and every role reflects exactly how SICC is structured and how its administration works day to day.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              { val: '41+', label: 'KDF Areas' },
              { val: '14', label: 'Departments' },
              { val: '5', label: 'Role Types' },
              { val: '100%', label: 'SICC-specific' },
            ].map(({ val, label }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: '2rem', color: C.navy }}>{val}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 3 }}>{label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`, padding: 'clamp(3.5rem, 7vw, 5rem) clamp(1.25rem, 5vw, 3rem)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 500, height: 500, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <FadeIn>
          <img src="/salem-logo.png" alt="SICC" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: '1.25rem', mixBlendMode: 'screen' }} />
          <h2 className="serif" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: C.white, fontWeight: 400, marginBottom: '.75rem' }}>
            Ready to get started?
          </h2>
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 15, marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
            Sign in with your SICC admin credentials to access your personalised dashboard.
          </p>
          <button className="btn-gold" onClick={onEnter} style={{ fontSize: 15, padding: '14px 36px' }}>
            Enter the Portal <ArrowRight size={16} />
          </button>
        </FadeIn>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: C.navy, borderTop: '1px solid rgba(255,255,255,.07)', padding: '1.75rem clamp(1.25rem, 5vw, 3rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/salem-logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain', mixBlendMode: 'screen' }} />
          <span className="serif" style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', fontWeight: 400 }}>Salem International Christian Centre</span>
        </div>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>SICC Admin Portal — For internal use only</span>
      </footer>
    </div>
  );
}
