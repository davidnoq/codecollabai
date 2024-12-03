"use client";

import { useState } from 'react';
import supabase from '@/config/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Redirect to profile creation or dashboard based on profile existence
            router.push('/profileCreation');
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <form 
                onSubmit={handleSignIn} 
                className="bg-white p-6 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-4 text-center">Sign In</h2>
                
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                <div className="mb-4">
                    <label className="block text-gray-700">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">Password</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border rounded"
                        placeholder="Enter your password"
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-700 text-white py-2 rounded"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
                <p className="text-center text-gray-700 mt-4">
                    Don't have an account? <a href="/auth/signup" className="text-blue-700">Sign Up</a>
                </p>
            </form>
        </div>
    );
}
