import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      setSuccess('Logged in successfully!');

      setTimeout(() => {
        navigate('/');
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-zinc-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-zinc-200 shadow-xl">

        {/* Header */}
        <div className="p-8 pb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight uppercase">
            Welcome to Snitch
          </h1>

          <p className="text-xs text-zinc-500 mt-2">
            Sign in to access your bag, saved wishlist, and orders
          </p>
        </div>

        {/* Form */}
        <div className="px-8 pb-8">

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@domain.com"
                  className="w-full pl-9 pr-3 py-3 text-sm border border-zinc-300 focus:border-black outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1">
                Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />

                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-3 text-sm border border-zinc-300 focus:border-black outline-none transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 pt-5 border-t border-zinc-200 text-center">
            <p className="text-xs text-zinc-500">
              Don't have an account?
            </p>

            <Link
              to="/register"
              className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-black hover:underline"
            >
              Create Account
            </Link>
          </div>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-black transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;