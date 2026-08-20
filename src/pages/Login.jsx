import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home as HomeIcon, LogIn, User, Lock, TrendingUp, Wallet } from 'lucide-react';
import heroImage from '../assets/hero.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please input both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      console.log("Login error:", err);
      console.log("Message:", err.message);

      // setError("TEST ERROR");

      setError(err.message || "Invalid Credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <Link to="/" className="auth-home-link"><HomeIcon size={16} /> Home</Link>
      <div className="auth-decoration" aria-hidden="true">
        <img src={heroImage} alt="" />
        <div className="auth-decoration-copy"><Wallet size={16} /><span>Build a clearer<br /><strong>money story.</strong></span></div>
        <div className="auth-decoration-line" />
      </div>
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={32} style={{ color: 'var(--primary)' }} />
            <h1 style={{ margin: 0 }}>FinanceFlow</h1>
          </div>
          <p>Login to secure your financial tracker</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                
                color: "#dc2626",
                
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                textAlign: "center",
                fontWeight: "600"
              }}
            >
              {error}
            </div>
          )}
          <div className="field-group">
            <label htmlFor="email">Enter email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="Enter your email"
                value={email}
                autoComplete='off'
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <User size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                className="form-control"
                style={{ paddingLeft: '2.5rem', width: '100%' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Sign In'}
            {!isLoading && <LogIn size={18} />}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
