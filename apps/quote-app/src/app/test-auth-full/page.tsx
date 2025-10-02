"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAuthPage() {
  const [testEmail, setTestEmail] = useState('bradley.doering@gmail.com');
  const [testPassword, setTestPassword] = useState('testpass123');
  const [testName, setTestName] = useState('Test Contractor');
  const [testCompany, setTestCompany] = useState('Test Company');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { user, profile, session, loading: authLoading, signUp, signIn } = useAuth();

  const addResult = (step: string, success: boolean, data: any) => {
    const result = {
      timestamp: new Date().toISOString(),
      step,
      success,
      data
    };
    setResults(prev => [result, ...prev]);
  };

  const testSignup = async () => {
    setLoading(true);
    addResult('Starting Signup Test', true, { email: testEmail });

    try {
      const result = await signUp(testEmail, testPassword, {
        full_name: testName,
        company_name: testCompany
      });

      if (result.error) {
        addResult('Signup Failed', false, { error: result.error.message });
      } else {
        addResult('Signup Success', true, { message: 'Check email for verification' });
      }
    } catch (error) {
      addResult('Signup Exception', false, { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    addResult('Starting Login Test', true, { email: testEmail });

    try {
      const result = await signIn(testEmail, testPassword);

      if (result.error) {
        addResult('Login Failed', false, { error: result.error.message });
      } else {
        addResult('Login Success', true, { message: 'Redirecting to dashboard' });
      }
    } catch (error) {
      addResult('Login Exception', false, { error: error instanceof Error ? error.message : 'Unknown error' });
    }

    setLoading(false);
  };

  const checkCurrentState = async () => {
    addResult('Current Auth State', true, {
      user: user ? { id: user.id, email: user.email } : null,
      profile: profile ? { email: profile.email, status: profile.status } : null,
      session: session ? 'active' : null,
      authLoading
    });
  };

  const checkProfiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/auth');
      const data = await response.json();
      addResult('Database Check', true, data);
    } catch (error) {
      addResult('Database Check Failed', false, { error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">🧪 Authentication System Test</h1>

        {/* Email Bounce Warning */}
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">⚠️ IMPORTANT:</strong> Testing is restricted to bradley.doering@gmail.com only to prevent email bounces and Supabase restrictions.
        </div>

        {/* Current Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>User:</strong> {user ? `${user.email} (${user.id.slice(0, 8)}...)` : 'None'}
            </div>
            <div>
              <strong>Profile:</strong> {profile ? `${profile.email} (${profile.status})` : 'None'}
            </div>
            <div>
              <strong>Auth Loading:</strong> {authLoading ? 'Yes' : 'No'}
            </div>
          </div>
          <button
            onClick={checkCurrentState}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Status
          </button>
        </div>

        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                type="text"
                value={testCompany}
                onChange={(e) => setTestCompany(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testSignup}
              disabled={loading}
              className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Signup'}
            </button>
            <button
              onClick={testLogin}
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test Login'}
            </button>
            <button
              onClick={checkProfiles}
              disabled={loading}
              className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Check Database
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <strong className={result.success ? 'text-green-700' : 'text-red-700'}>
                    {result.step}
                  </strong>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="text-xs mt-2 overflow-x-auto text-gray-600">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}