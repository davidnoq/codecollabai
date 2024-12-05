"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutUser, getCurrentSession } from "@/lib/authentication";
import { getUserProfile } from "@/lib/db";

interface MatchResult {
    userId: string;
    similarity: number;
    display_name: string;
    top_project_idea: string;
    preferred_role: string;
    project_preference: string;
}

const Dashboard: React.FC = () => {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [matchLoading, setMatchLoading] = useState<boolean>(false);
    const [topMatch, setTopMatch] = useState<MatchResult | null>(null);
    const [explanation, setExplanation] = useState<string>("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);

                // Fetch the current session
                const session = await getCurrentSession();
                if (!session) {
                    router.push("/auth/signin");
                    return;
                }

                // Fetch the user profile
                const userProfile = await getUserProfile(session.user.id);
                setProfile(userProfile);
            } catch (err: any) {
                setError(err.message || "Failed to load profile.");
                router.push("/auth/signin");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleSignOut = async () => {
        setLoading(true);
        try {
            await signOutUser();
            router.push("/auth/signin");
        } catch (err: any) {
            setError(err.message || "Failed to sign out.");
        } finally {
            setLoading(false);
        }
    };

    const handleFindMatch = async () => {
        setMatchLoading(true);
        setError(null);
        setTopMatch(null);
        setExplanation("");

        try {
            const response = await fetch("/api/matchUsers", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: profile.id, // Use the fetched profile's ID
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to find a match.");
            }

            const data = await response.json();
            setTopMatch(data.topMatch);
            setExplanation(data.explanation);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setMatchLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-gray-700 text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-red-500 text-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 flex flex-col items-center p-4">
            {/* User Information and Sign-Out */}
            <div className="bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-md mb-8">
                <h1 className="text-4xl font-bold text-indigo-700 mb-4 text-center">
                    Welcome, {profile.first_name}!
                </h1>
                <div className="space-y-2">
                    <p className="text-gray-800">
                        <span className="font-semibold">Top Project Idea:</span> {profile.top_project_idea}
                    </p>
                    <p className="text-gray-800">
                        <span className="font-semibold">Preferred Role:</span> {profile.preferred_role}
                    </p>
                    <p className="text-gray-800">
                        <span className="font-semibold">Project Preference:</span> {profile.project_preference}
                    </p>
                </div>
                <button
                    onClick={handleSignOut}
                    className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
                    disabled={loading}
                >
                    {loading ? "Signing Out..." : "Sign Out"}
                </button>
            </div>

            {/* Match Finder */}
            <div className="bg-white bg-opacity-90 backdrop-blur-md p-6 rounded-2xl shadow-lg w-full max-w-md">
                <button
                    onClick={handleFindMatch}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
                    disabled={matchLoading}
                >
                    {matchLoading ? "Finding Match..." : "Find Best Match"}
                </button>

                {matchLoading && (
                    <p className="text-gray-700 mt-4 text-center animate-pulse">
                        Processing your request...
                    </p>
                )}

                {topMatch && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-lg shadow-inner">
                        <h2 className="text-2xl font-bold text-indigo-700 mb-3">Top Match</h2>
                        <div className="space-y-1">
                            <p className="text-gray-800">
                                <span className="font-semibold">Display Name:</span> {topMatch.first_name}
                            </p>
                            <p className="text-gray-800">
                                <span className="font-semibold">Top Project Idea:</span> {topMatch.top_project_idea}
                            </p>
                            <p className="text-gray-800">
                                <span className="font-semibold">Preferred Role:</span> {topMatch.preferred_role}
                            </p>
                            <p className="text-gray-800">
                                <span className="font-semibold">Project Preference:</span> {topMatch.project_preference}
                            </p>
                            <p className="text-gray-800">
                                <span className="font-semibold">Similarity Score:</span> {(topMatch.similarity * 100).toFixed(2)}%
                            </p>
                        </div>

                        {/* Explanation Message */}
                        {explanation && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                                <h3 className="text-xl font-semibold text-indigo-600 mb-2">Why You're a Great Match</h3>
                                <p className="text-gray-700">{explanation}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
