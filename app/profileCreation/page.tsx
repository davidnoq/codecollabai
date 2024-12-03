"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile, upsertUserProfile, checkProfileExists } from '@/lib/db';
import { getCurrentSession } from '@/lib/authentication';

export default function ProfileCreation() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [yearInSchool, setYearInSchool] = useState<string>('1st Year');
    const [age, setAge] = useState<number | ''>('');
    const [experienceLevel, setExperienceLevel] = useState<string>('Beginner');
    const [mainLanguage, setMainLanguage] = useState('');
    const [frameworks, setFrameworks] = useState<string[]>([]);
    const [preferredRole, setPreferredRole] = useState<string>('Frontend');
    const [technicalSkills, setTechnicalSkills] = useState<string[]>([]);
    const [projectPreference, setProjectPreference] = useState<string[]>([]);
    const [topProjectIdea, setTopProjectIdea] = useState('');
    const [availabilityHours, setAvailabilityHours] = useState<number | ''>('');
    const [contactPlatform, setContactPlatform] = useState<string>('Email');
    const [githubUrl, setGithubUrl] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            try {
                const session = await getCurrentSession();
                if (!session) {
                    router.push('/auth/signin');
                    return;
                }

                const profileExists = await checkProfileExists(session.user.id);
                console.log("Profile Exists:", profileExists);
                if (profileExists) {
                    console.log("Profile exists. Redirecting to /dashboard");
                    router.push('/dashboard'); // Redirect if profile exists
                    return;
                }

                setIsInitializing(false); // Profile does not exist, proceed to profile creation
            } catch (err: any) {
                console.error('Error during initialization:', err);
                setError(err.message || 'An unexpected error occurred.');
                setIsInitializing(false);
            }
        };

        initialize();
    }, [router]);

    const handleNext = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const session = await getCurrentSession();
            if (!session) throw new Error('User not authenticated.');

            // Validate required fields
            if (!firstName.trim()) {
                throw new Error('First name is required.');
            }

            if (typeof age !== 'number' || age < 13) {
                throw new Error('Please enter a valid age (minimum 13).');
            }

            if (typeof availabilityHours !== 'number' || availabilityHours <= 0) {
                throw new Error('Please enter a valid availability (hours per week).');
            }

            // Upsert user profile
            await upsertUserProfile({
                id: session.user.id,
                first_name: firstName.trim(),
                year_in_school: yearInSchool,
                age: age,
                experience_level: experienceLevel,
                main_language: mainLanguage.trim(),
                frameworks: frameworks,
                preferred_role: preferredRole,
                technical_skills: technicalSkills,
                project_preference: projectPreference,
                top_project_idea: topProjectIdea.trim(),
                availability_hours: availabilityHours,
                contact_platform: contactPlatform,
                github_url: githubUrl.trim(),
                hobbies: hobbies.trim(),
            });

            router.push('/dashboard'); // Redirect after successful profile creation
        } catch (err: any) {
            console.error('Error during profile creation:', err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (isInitializing) {
        return <p className="text-gray-700 text-center">Loading...</p>;
    }

    // Progress Indicator
    const totalSteps = 4;
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="min-h-screen flex items-center justify-center bg-indigo-800">
            <form className="p-8 rounded-2xl bg-gray-900 shadow-md w-full max-w-xl text-white">
                <h2 className="text-3xl font-bold mb-6">Create your Profile</h2>
                
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div className="bg-indigo-400 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                </div>

                {/* Step Content */}
                {currentStep === 1 && (
                    <>
                        {/* First Name */}
                        <div className="mb-4">
                            <label className="block font-bold mb-2">First Name</label>
                            <input 
                                type="text" 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                placeholder="Enter your first name"
                            />
                        </div>

                        {/* Year in School */}
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Year in School</label>
                            <select
                                value={yearInSchool}
                                onChange={(e) => setYearInSchool(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                            >
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                                <option value="Postgrad">Postgraduate</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Age */}
                        <div className="mb-4">
                            <label className="block font-bold  mb-2">Age</label>
                            <input 
                                type="number" 
                                value={age}
                                onChange={(e) => setAge(Number(e.target.value) || '')}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                min={13}
                                placeholder="Enter your age"
                            />
                        </div>
                    </>
                )}

                {currentStep === 2 && (
                    <>
                        {/* Experience Level */}
                        <div className="mb-4">
                            <label className="block mb-2">Experience Level</label>
                            <select
                                value={experienceLevel}
                                onChange={(e) => setExperienceLevel(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>

                        {/* Main Language */}
                        <div className="mb-4">
                            <label className="block mb-2">Main Programming Language</label>
                            <input 
                                type="text" 
                                value={mainLanguage}
                                onChange={(e) => setMainLanguage(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                placeholder="e.g., JavaScript"
                            />
                        </div>

                        {/* Frameworks */}
                        <div className="mb-4">
                            <label className="block mb-2">Frameworks / Libraries</label>
                            <select
                                multiple
                                value={frameworks}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                                    setFrameworks(selectedOptions);
                                }}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl h-32"
                            >
                                <option value="React">React</option>
                                <option value="Angular">Angular</option>
                                <option value="Vue">Vue</option>
                                <option value="Next.js">Next.js</option>
                                <option value="Rails">Rails</option>
                                <option value="Django">Django</option>
                                <option value="Flask">Flask</option>
                                <option value="Laravel">Laravel</option>
                                <option value="Spring">Spring</option>
                                <option value="Express">Express</option>
                                <option value="Other">Other</option>
                                <option value="None">None</option>
                                {/* Add more frameworks as needed */}
                            </select>
                            <p className="text-sm text-gray-500 mt-1">Hold down the Ctrl (Windows) or Command (Mac) button to select multiple options.</p>
                        </div>

                        {/* Preferred Role */}
                        <div className="mb-4">
                            <label className="block mb-2">Preferred Role</label>
                            <select
                                value={preferredRole}
                                onChange={(e) => setPreferredRole(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                            >
                                <option value="Frontend">Frontend Developer</option>
                                <option value="Backend">Backend Developer</option>
                                <option value="Fullstack">Fullstack Developer</option>
                                <option value="Designer">Designer</option>
                            </select>
                        </div>
                    </>
                )}

                {currentStep === 3 && (
                    <>
                        {/* Technical Skills */}
                        <div className="mb-4">
                            <label className="block mb-2">Technical Skills</label>
                            <select
                                multiple
                                value={technicalSkills}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                                    setTechnicalSkills(selectedOptions);
                                }}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl h-32"
                            >
                                <option value="Docker">Docker</option>
                                <option value="AWS">AWS</option>
                                <option value="PostgreSQL">PostgreSQL</option>
                                <option value="GraphQL">GraphQL</option>
                                <option value="TypeScript">TypeScript</option>
                                <option value="Python">Python</option>
                                <option value="Java">Java</option>
                                <option value="C#">C#</option>
                                <option value="Ruby">Ruby</option>
                                <option value="Go">Go</option>
                                {/* Add more technical skills as needed */}
                            </select>
                            <p className="text-sm mt-1">Hold down the Ctrl (Windows) or Command (Mac) button to select multiple options.</p>
                        </div>

                        {/* Project Preference */}
                        <div className="mb-4">
                            <label className="block mb-2">Project Preferences</label>
                            <select
                                multiple
                                value={projectPreference}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
                                    setProjectPreference(selectedOptions);
                                }}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl h-32"
                            >
                                <option value="Web Development">Web Development</option>
                                <option value="Mobile Apps">Mobile Apps</option>
                                <option value="Game Development">Game Development</option>
                                <option value="AI/ML">AI/ML</option>
                                <option value="Open Source">Open Source</option>
                                <option value="Data Science">Data Science</option>
                                <option value="Blockchain">Blockchain</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                {/* Add more project types as needed */}
                            </select>
                            <p className="text-sm mt-1">Hold down the Ctrl (Windows) or Command (Mac) button to select multiple options.</p>
                        </div>

                        {/* Top Project Idea */}
                        <div className="mb-4">
                            <label className="block mb-2">Top Project Idea</label>
                            <textarea
                                value={topProjectIdea}
                                onChange={(e) => setTopProjectIdea(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                placeholder="Describe your top project idea"
                                rows={4}
                            ></textarea>
                        </div>
                    </>
                )}

                {currentStep === 4 && (
                    <>
                        {/* Availability Hours */}
                        <div className="mb-4">
                            <label className="block mb-2">Availability (Hours per Week)</label>
                            <input 
                                type="number" 
                                value={availabilityHours}
                                onChange={(e) => setAvailabilityHours(Number(e.target.value) || '')}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                min={1}
                                max={100}
                                placeholder="e.g., 10"
                            />
                        </div>

                        {/* Contact Platform */}
                        <div className="mb-4">
                            <label className="block mb-2">Preferred Contact Platform</label>
                            <select
                                value={contactPlatform}
                                onChange={(e) => setContactPlatform(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                            >
                                <option value="Email">Email</option>
                                <option value="Discord">Discord</option>
                                <option value="Slack">Slack</option>
                            </select>
                        </div>

                        {/* GitHub URL */}
                        <div className="mb-4">
                            <label className="block mb-2">GitHub URL</label>
                            <input 
                                type="url" 
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                placeholder="https://github.com/yourusername"
                            />
                        </div>

                        {/* Hobbies */}
                        
                        <div className="mb-4">
                            <label className="block mb-2">Hobbies / Interests</label>
                            <input
                                type="text"
                                value={hobbies}
                                onChange={(e) => setHobbies(e.target.value)}
                                required
                                className="w-full px-3 py-2 bg-gray-800 text-gray-200 placeholder-gray-500 rounded-xl"
                                placeholder="e.g., Coding"
                            >
                            </input>
                        </div>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-600"
                        >
                            Back
                        </button>
                    )}
                    {currentStep < totalSteps && (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="ml-auto px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-500"
                        >
                            Next
                        </button>
                    )}
                    {currentStep === totalSteps && (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`ml-auto px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
