import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  ShieldCheck,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import heroImage from '../assets/hero.png';

const features = [
  {
    icon: Wallet,
    title: 'One clear overview',
    description: 'See every account, balance, and recent movement in one calm workspace.',
    color: 'mint',
  },
  {
    icon: Target,
    title: 'Budgets that adapt',
    description: 'Set practical limits and spot your spending rhythm before it gets away from you.',
    color: 'orange',
  },
  {
    icon: BarChart3,
    title: 'Progress you can feel',
    description: 'Turn everyday transactions into useful trends that make your next decision easier.',
    color: 'blue',
  },
];

const Home = () => (
  <main className="home-page">
    <nav className="home-nav" aria-label="Main navigation">
      <Link to="/" className="brand-mark">
        <span className="brand-icon"><TrendingUp size={18} /></span>
        <span>FinanceFlow</span>
      </Link>
      <div className="home-nav-actions">
        <Link to="/login" className="home-login">Log in</Link>
        <Link to="/signup" className="btn home-signup">Register <ArrowRight size={16} /></Link>
      </div>
    </nav>

    <section className="home-hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="eyebrow-dot" /> Personal finance, made visible</p>
        <h1>Make every dollar <em>make sense.</em></h1>
        <p className="hero-description">
          FinanceFlow brings your spending, saving, and goals into one focused space so you can move through life with a clearer plan.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">Start tracking free <ArrowRight size={18} /></Link>
          <Link to="/login" className="text-link">Already a member <ArrowRight size={16} /></Link>
        </div>
        <div className="trust-note"><ShieldCheck size={16} /> Your financial picture, kept private</div>
      </div>

      <div className="hero-visual" aria-label="FinanceFlow dashboard preview">
        <div className="visual-glow" />
        <img src={heroImage} alt="Layered abstract FinanceFlow mark" className="hero-image" />
        <div className="preview-card preview-balance">
          <div className="preview-label"><span className="status-dot" /> Total balance</div>
          <strong>$24,860.40</strong>
          <span className="positive-change">+12.8% this month</span>
        </div>
        <div className="preview-card preview-spending">
          <div className="preview-label">Spending this month <span>▾</span></div>
          <strong>$2,184.20</strong>
          <div className="mini-bars" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
        </div>
        <div className="preview-card preview-goal">
          <div className="goal-icon"><Check size={14} /></div>
          <div><strong>Emergency fund</strong><span>72% complete</span></div>
        </div>
      </div>
    </section>

    <section className="feature-section" aria-labelledby="features-heading">
      <div className="section-heading">
        <p className="eyebrow">A better money habit</p>
        <h2 id="features-heading">Everything you need to feel in control.</h2>
      </div>
      <div className="feature-grid">
        {features.map(({ icon: Icon, title, description, color }) => (
          <article className="feature-item" key={title}>
            <div className={`feature-icon ${color}`}><Icon size={21} /></div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>

    <footer className="home-footer">
      <span>FinanceFlow</span>
      <span>Plan clearly. Live freely.</span>
      <CreditCard size={18} />
    </footer>
  </main>
);

export default Home;