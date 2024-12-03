"use client";

// Import necessary hooks and modules
import { useState, useEffect } from 'react';
import supabase from '@/config/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
    // Profile information states
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) throw sessionError;

                if (session) {
                    const { data: profileData, error: profileError } = await supabase
                        .from('profiles')
                        .select('display_name, year_in_school')
                        .eq('id', session.user.id)
                        .single();

                    if (profileError) throw profileError;

                    setProfile(profileData);
                } else {
                    router.push('/auth/signin');
                }
            } catch (err: any) {
                console.error('Error fetching profile:', err);
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleSignOut = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // Redirect to the home page or login page on your application
            router.push('/'); // Change this to the desired route
        } catch (err: any) {
            console.error('Sign-out error:', err);
            setError(err.message || 'An unexpected error occurred during sign out.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {profile ? (
                <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
                    <div className="mb-4 text-center">
                        {/* Removed GitHub Username and Profile Image */}
                        <p className="text-gray-700">Display Name: {profile.display_name}</p>
                        <p className="text-gray-700">Year in School: {profile.year_in_school}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="w-full bg-red-600 text-white py-2 rounded mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                    <p className="text-gray-700 text-center mt-2">
                        Signing out will end your session.
                    </p>
                </div>
            ) : (
                <p className="text-gray-700 text-center">No profile data available.</p>
            )}
        </div>
    );
}
