import React, { useState } from 'react';
import { LogoPlaceholder } from './LogoPlaceholder';
import { isValidLoginEmail } from '../utils/filter';
import { MaterialIcon } from './MaterialIcon';

interface LoginGateProps {
  onLogin: (email: string) => void;
  defaultEmail?: string;
}

export const LoginGate: React.FC<LoginGateProps> = ({
  onLogin,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!isValidLoginEmail(cleanEmail)) {
      setError('Invalid email.');
      return;
    }
    setError(null);
    onLogin(cleanEmail);
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setError(null);
    onLogin(demoEmail);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
    >
      <div className="w-full max-w-md bg-white border border-[#E1E6EF] rounded-[14px] p-8 shadow-sm flex flex-col items-center text-center">
        {/* Logo placeholder */}
        <div className="-mb-2">
          <LogoPlaceholder variant="xxlarge" className="scale-125" />
        </div>

        {/* Headlines */}
        <h1 className="text-[2rem] font-bold text-[#041E42] tracking-tight leading-tight mb-2">
          F&amp;M Ultimate Flee Market
        </h1>

        <p className="text-sm text-[#6B7280] mb-8">
          Sign in with your F&amp;M email to continue
        </p>

        {/* Sign in form */}
        <form onSubmit={handleSubmit} className="w-full text-left">
          <label htmlFor="email-input" className="block text-xs font-semibold text-[#041E42] mb-1.5 uppercase tracking-wider">
            Campus Email
          </label>
          <div className="relative">
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="student@fandm.edu"
              className={`w-full px-4 py-3 bg-[#F1F4F9] border ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E1E6EF]'
              } rounded-[0.75rem] text-[#041E42] placeholder-[#6B7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#003DA5] focus:bg-white transition-colors`}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1.5" role="alert">
              <MaterialIcon name="error" size={16} className="text-red-600" />
              <span>{error}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full mt-5 py-3 px-6 bg-[#003DA5] hover:bg-[#041E42] text-white font-semibold text-sm rounded-[0.75rem] transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Enter</span>
            <MaterialIcon name="arrow_forward" size={18} />
          </button>
        </form>

        {/* Quick select for testing */}
        <div className="mt-8 pt-6 border-t border-[#E1E6EF] w-full text-left">
          <p className="text-xs text-[#6B7280] mb-2 font-medium">Quick sign in for demo:</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('student@fandm.edu')}
              className="text-xs py-1.5 px-3 bg-[#F1F4F9] hover:bg-[#E1E6EF] text-[#041E42] rounded-lg border border-[#E1E6EF] cursor-pointer"
            >
              student@fandm.edu (Student)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('staff@fandm.edu')}
              className="text-xs py-1.5 px-3 bg-[#F1F4F9] hover:bg-[#E1E6EF] text-[#041E42] rounded-lg border border-[#E1E6EF] cursor-pointer"
            >
              staff@fandm.edu (Staff)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
