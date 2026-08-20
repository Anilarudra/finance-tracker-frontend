import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home as HomeIcon, UserPlus, User, Mail, Lock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import heroImage from '../assets/hero.png';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {

  e.preventDefault();

  setError('');
  setSuccess('');


  if (!username.trim() || !email.trim() || !password || !confirmPassword) {

    setError('Please fill all fields.');
    return;

  }


  if (password.length < 6) {

    setError('Password must contain minimum 6 characters.');
    return;

  }


  if (password !== confirmPassword) {

    setError('Passwords do not match.');
    return;

  }


  setIsLoading(true);


  try {

    await signup(
      username.trim(),
      email.trim(),
      password
    );


    setSuccess(
      'Account created successfully! Redirecting...'
    );


    setTimeout(()=>{

        navigate('/login');

    },2000);



  } catch(err){

    setError(
      err.message || "Registration failed"
    );

  }
  finally{

    setIsLoading(false);

  }

};

  return (
    <div className="auth-wrapper">
      <Link to="/" className="auth-home-link"><HomeIcon size={16} /> Home</Link>
      <div className="auth-decoration" aria-hidden="true">
        <img src={heroImage} alt="" />
        <div className="auth-decoration-copy"><Sparkles size={16} /><span>Start small.<br /><strong>Grow steadily.</strong></span></div>
        <div className="auth-decoration-line" />
      </div>
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <TrendingUp size={32} style={{ color: 'var(--primary)' }} />
            <h1 style={{ margin: 0 }}>FinanceFlow</h1>
          </div>
          <p>Create an account to start tracking wealth</p>
        </div>

        {success ? (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 20px 45px rgba(0,0,0,0.25)', padding: '2rem', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
              <CheckCircle2 size={56} style={{ color: 'var(--success)', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
              <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{success}</div>
              <p style={{ marginBottom: '1rem', color: '#475569' }}>You can now sign in with your new account.</p>
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Proceed to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <div className="field-group">
              <label htmlFor="username">Full Name</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="username"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  placeholder="Enter your name"
                  value={username}
                  autoComplete='off'
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <User size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  id="email"
                  
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  placeholder="e.g. you@example.com"
                  value={email}
                  autoComplete='off'
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                  placeholder="•••••••• (Min. 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', width: '100%' }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
              {!isLoading && <UserPlus size={18} />}
            </button>
          </form>
        )}

        {!success && (
          <div className="auth-footer">
            Already have an account? <Link to="/login">Sign In here</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
