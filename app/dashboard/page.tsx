"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOutUser, getCurrentSession } from '@/lib/authentication';
import { getUserProfile } from '@/lib/db';

export default function Dashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // To handle component unmounting during async operations

        const fetchProfile = async () => {
            try {
                setLoading(true);

                // Fetch the current session
                const session = await getCurrentSession();
                console.log("Session Data:", session);
                if (!session) {
                    console.log("No session found. Redirecting to /auth/signin");
                    router.push('/auth/signin'); // Redirect to Sign-In if no session
                    return;
                }

                // Fetch user profile using the session's user ID
                const userProfile = await getUserProfile(session.user.id);
                console.log("User Profile:", userProfile);
                if (isMounted) setProfile(userProfile);
            } catch (err: any) {
                if (isMounted) {
                    console.error('Error fetching profile:', err);
                    setError(err.message || 'Failed to fetch profile.');
                    router.push('/auth/signin'); // Redirect to Sign-In on error
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProfile();

        return () => {
            isMounted = false; // Cleanup function to avoid state updates after unmount
        };
    }, [router]);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOutUser();
            router.push('/auth/signin'); // Redirect to Sign-In after signing out
        } catch (err: any) {
            setError(err.message || 'Failed to sign out.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-800">
                <p className="text-white text-xl">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-800">
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-800 p-4">
            {profile ? (
                <div className="bg-gray-900 p-8 rounded-2xl shadow-md w-full max-w-2xl text-white">
                    <h2 className="text-3xl font-bold mb-6 text-center">Your Profile</h2>
                    
                    {/* Profile Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div>
                            <h3 className="text-xl font-semibold">First Name</h3>
                            <p className="text-gray-300">{profile.first_name}</p>
                        </div>

                        {/* Year in School */}
                        <div>
                            <h3 className="text-xl font-semibold">Year in School</h3>
                            <p className="text-gray-300">{profile.year_in_school}</p>
                        </div>

                        {/* Age */}
                        <div>
                            <h3 className="text-xl font-semibold">Age</h3>
                            <p className="text-gray-300">{profile.age}</p>
                        </div>

                        {/* Experience Level */}
                        <div>
                            <h3 className="text-xl font-semibold">Experience Level</h3>
                            <p className="text-gray-300">{profile.experience_level}</p>
                        </div>

                        {/* Main Programming Language */}
                        <div>
                            <h3 className="text-xl font-semibold">Main Programming Language</h3>
                            <p className="text-gray-300">{profile.main_language}</p>
                        </div>

                        {/* Preferred Role */}
                        <div>
                            <h3 className="text-xl font-semibold">Preferred Role</h3>
                            <p className="text-gray-300">{profile.preferred_role}</p>
                        </div>

                        {/* Availability Hours */}
                        <div>
                            <h3 className="text-xl font-semibold">Availability (Hours/Week)</h3>
                            <p className="text-gray-300">{profile.availability_hours}</p>
                        </div>

                        {/* Contact Platform */}
                        <div>
                            <h3 className="text-xl font-semibold">Preferred Contact Platform</h3>
                            <p className="text-gray-300">{profile.contact_platform}</p>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="mt-6">
                        {/* Frameworks */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Frameworks / Libraries</h3>
                            <ul className="list-disc list-inside text-gray-300">
                                {profile.frameworks && profile.frameworks.length > 0 ? (
                                    profile.frameworks.map((fw: string, index: number) => (
                                        <li key={index}>{fw}</li>
                                    ))
                                ) : (
                                    <li>No frameworks listed.</li>
                                )}
                            </ul>
                        </div>

                        {/* Technical Skills */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Technical Skills</h3>
                            <ul className="list-disc list-inside text-gray-300">
                                {profile.technical_skills && profile.technical_skills.length > 0 ? (
                                    profile.technical_skills.map((skill: string, index: number) => (
                                        <li key={index}>{skill}</li>
                                    ))
                                ) : (
                                    <li>No technical skills listed.</li>
                                )}
                            </ul>
                        </div>

                        {/* Project Preferences */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Project Preferences</h3>
                            <ul className="list-disc list-inside text-gray-300">
                                {profile.project_preference && profile.project_preference.length > 0 ? (
                                    profile.project_preference.map((pref: string, index: number) => (
                                        <li key={index}>{pref}</li>
                                    ))
                                ) : (
                                    <li>No project preferences listed.</li>
                                )}
                            </ul>
                        </div>

                        {/* Top Project Idea */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Top Project Idea</h3>
                            <p className="text-gray-300">{profile.top_project_idea || 'No project idea provided.'}</p>
                        </div>

                        {/* GitHub URL */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">GitHub URL</h3>
                            {profile.github_url ? (
                                <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                    {profile.github_url}
                                </a>
                            ) : (
                                <p className="text-gray-300">No GitHub URL provided.</p>
                            )}
                        </div>

                        {/* Hobbies */}
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold">Hobbies / Interests</h3>
                            <p className="text-gray-300">{profile.hobbies || 'No hobbies listed.'}</p>
                        </div>
                    </div>

                    {/* Sign-Out Button */}
                    <button
                        onClick={handleSignOut}
                        className="w-full py-2 px-4 mt-6 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors duration-200"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <div className="bg-gray-900 p-8 rounded-2xl shadow-md w-full max-w-2xl text-white">
                    <h2 className="text-3xl font-bold mb-6 text-center">No Profile Found</h2>
                    <p className="text-gray-300 text-center">Please complete your profile.</p>
                    <button
                        onClick={() => router.push('/profileCreation')}
                        className="w-full py-2 px-4 mt-6 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors duration-200"
                    >
                        Go to Profile Creation
                    </button>
                </div>
            )}
        </div>
    );
    }
