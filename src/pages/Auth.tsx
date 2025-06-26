import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface AuthProps {
  onLogin: () => void;
}

 function Auth({ onLogin }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) setMessage(error.message);
    else {
      setMessage(isSignup ? 'Signup successful! Check your email.' : 'Login successful!');
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-4">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          {isSignup ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-center text-sm text-gray-500">
          {isSignup ? 'Sign up to get started' : 'Login to continue'}
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <div className="text-sm text-red-500 text-center">{message}</div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition duration-300"
        >
          {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
        </button>

        <p className="text-sm text-center text-gray-600">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Login' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
export default Auth;