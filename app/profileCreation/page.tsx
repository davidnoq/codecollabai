"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/config/supabaseClient';

export default function ProfileCreation() {
    const router = useRouter();

    // Profile information states
    const [displayName, setDisplayName] = useState('');
    const [yearInSchool, setYearInSchool] = useState<number | ''>('');

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // User state
    const [user, setUser] = useState<any>(null);

    // Initialization state
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            console.log('Initializing ProfileCreation component...');
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) {
                console.error('Session error:', sessionError.message);
                setError(sessionError.message);
                setIsInitializing(false);
                return;
            }

            if (session) {
                console.log('User session found:', session.user);
                setUser(session.user);

                // Check if profile already exists using maybeSingle
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                if (profileError) {
                    console.error('Profile query error:', profileError.message);
                    setError(profileError.message);
                    setIsInitializing(false);
                    return;
                }

                if (profile) {
                    console.log('Profile already exists:', profile);
                    // Profile already exists, redirect to dashboard
                    router.push('/dashboard');
                } else {
                    console.log('No existing profile found for user.');
                    // User needs to create a profile
                    setIsInitializing(false);
                }
            } else {
                console.log('No session found. Initiating sign-in...');
                // Initiate Email Sign-In (Redirect to Sign-In Page)
                router.push('/auth/signin');
                setIsInitializing(false);
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            console.log(`Auth state changed: ${event}`);
            if (session) {
                console.log('New session:', session.user);
                setUser(session.user);
                // Check if profile exists using maybeSingle
                supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle()
                    .then(({ data: profile, error: profileError }) => {
                        if (profileError) {
                            console.error('Profile query error:', profileError.message);
                            setError(profileError.message);
                            setIsInitializing(false);
                            return;
                        }

                        if (profile) {
                            console.log('Profile already exists:', profile);
                            // Profile exists, redirect to dashboard
                            router.push('/dashboard');
                        } else {
                            console.log('No existing profile found for user.');
                            // User needs to create a profile
                            setIsInitializing(false);
                        }
                    });
            } else {
                console.log('Session ended.');
                setUser(null);
                setIsInitializing(false);
            }
        });

        initialize();

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log('Form submission started');

        if (!user) {
            console.error('User not authenticated');
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        // Validate Year in School
        if (typeof yearInSchool !== 'number' || yearInSchool < 1 || yearInSchool > 8) {
            console.error('Invalid year in school:', yearInSchool);
            setError('Please enter a valid year in school (1-8)');
            setLoading(false);
            return;
        }

        try {
            console.log('Attempting to upsert profile...');
            const { error: upsertError } = await supabase.from('profiles').upsert({
                id: user.id, // Ensure this matches auth.uid()
                display_name: displayName,
                year_in_school: yearInSchool,
            });

            if (upsertError) {
                console.error('Upsert error:', upsertError.message);
                throw upsertError;
            }

            console.log('Profile upserted successfully. Redirecting to dashboard...');
            router.push('/dashboard');
        } catch (err: any) {
            console.error('Error during profile upsert:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
            console.log('Form submission ended');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {isInitializing ? (
                // Display a loading indicator while initializing
                <div className="text-center">
                    <p className="text-gray-700">Loading...</p>
                </div>
            ) : (
                // Render the form only after initialization
                <form 
                    onSubmit={handleSubmit} 
                    className="bg-white p-6 rounded shadow-md w-full max-w-md"
                >
                    <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
                    
                    {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                    {user ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700">Display Name</label>
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 border rounded"
                                    placeholder="Enter your display name"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700">Year in School</label>
                                <input 
                                    type="number" 
                                    value={yearInSchool}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '') {
                                            setYearInSchool('');
                                        } else {
                                            setYearInSchool(Number(value));
                                        }
                                    }}
                                    required
                                    className="w-full px-3 py-2 border rounded"
                                    min={1}
                                    max={8}
                                    placeholder="e.g., 3"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-blue-700 text-white py-2 rounded"
                            >
                                {loading ? 'Submitting...' : 'Submit'}
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-700 text-center">Redirecting to sign in...</p>
                    )}
                </form>
            )}
        </div>
    );
}
