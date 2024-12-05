import supabase from '@/config/supabaseClient';

// Fetch a user profile by ID
// Fetch all user profiles except the specified user
export const getAllProfiles = async (excludeUserId?: string) => {
    const query = supabase
        .from('profiles')
        .select('*');

    if (excludeUserId) {
        query.neq('id', excludeUserId); // Exclude the current user
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching all user profiles:", error.message);
        throw new Error(error.message);
    }

    return data;
};


export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error.message);
        throw new Error(error.message);
    }

    return data;
};
// Upsert a user profile
export const upsertUserProfile = async (profile: {
    id: string;
    first_name: string;
    year_in_school: string;
    age: number;
    experience_level: string;
    main_language: string;
    frameworks: string[];
    preferred_role: string;
    technical_skills: string[];
    project_preference: string[];
    top_project_idea: string;
    availability_hours: number;
    contact_platform: string;
    github_url: string;
    hobbies: string;
}) => {
    const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' }); // Ensures update on conflict

    if (error) {
        console.error("Error upserting profile:", error.message);
        throw new Error(error.message);
    }

    console.log("Profile upserted successfully:", profile);
    return;
};
// Check if a profile exists for a user
export const checkProfileExists = async (userId: string) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

    console.log("Checking profile for User ID:", userId);
    console.log("Data:", data, "Error:", error);

    if (error) {
        if (error.code === 'PGRST116') return false; // No profile exists
        throw new Error(error.message);
    }

    return !!data;
};

