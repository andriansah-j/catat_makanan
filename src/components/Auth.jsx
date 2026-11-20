import React, { useState } from 'react';
import { UserPlus, LogIn, UtensilsCrossed } from 'lucide-react';

export default function Auth({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;
    
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setIsLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <div className="bg-primary/20 p-4 rounded-full mb-6 ring-4 ring-primary/30 shadow-lg shadow-primary/20">
        <UtensilsCrossed size={48} className="text-primary" />
      </div>
      
      <div className="glass-panel w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">
          {isRegister ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-muted mb-8">
          {isRegister ? 'Start tracking your food receipts today.' : 'Log in to continue tracking.'}
        </p>

        {error && (
          <div className="bg-danger/20 border border-danger/50 text-danger px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group !mb-0">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. budigunawan"
            />
          </div>

          <div className="form-group !mb-0">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 mt-4" disabled={isLoading}>
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
               isRegister ? <><UserPlus size={18} /> Register</> : <><LogIn size={18} /> Login</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-muted">
          {isRegister ? 'Already have an account?' : 'New to Food Receipt Tracker?'}
          <button 
            type="button"
            className="text-primary font-medium ml-2 hover:underline focus:outline-none"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
          >
            {isRegister ? 'Log In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
