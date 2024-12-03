import supabase from '@/config/supabaseClient';

// Sign up a user
export const signUpUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
    return data;
};

// Sign in a user
export const signInUser = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
};

// Sign out the current user
export const signOutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
};

export const getCurrentSession = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return null;
    return data.session;
};

