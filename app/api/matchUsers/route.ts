// File: /pages/api/matchUsers.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";
import supabase from "@/config/supabaseClient";
import { getUserProfile, getAllProfiles } from "@/lib/db";
import { cosineSimilarity } from "@/utils/cosineSimilarity";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * POST /api/matchUsers
 * Body: { userId: string }
 * Response: { topMatch: MatchResult, explanation: string }
 */
export async function POST(req: Request) {
    try {
        console.log("Received request for /api/matchUsers...");
        const { userId } = await req.json();
        console.log("User ID received:", userId);

        if (!userId) {
            console.error("Missing userId in request body.");
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Fetch current user profile
        const currentUser = await getUserProfile(userId);
        console.log("Current user profile fetched:", currentUser);

        if (!currentUser) {
            console.error("Failed to fetch user profile.");
            return NextResponse.json(
                { error: "Failed to fetch current user profile." },
                { status: 500 }
            );
        }

        const userInterests = `Top Project Idea: ${currentUser.top_project_idea}. Preferred Role: ${currentUser.preferred_role}. Project Preference: ${currentUser.project_preference}.`;

        // Fetch all other profiles
        const otherUsers = await getAllProfiles(userId);

        if (otherUsers.length === 0) {
            return NextResponse.json({ error: "No other users found for matching." }, { status: 404 });
        }

        // Generate embedding for the current user
        const userEmbeddingResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: userInterests,
        });

        const userEmbedding = userEmbeddingResponse.data[0].embedding;

        // Generate embeddings for other users
        const otherInputs = otherUsers.map(
            (user) =>
                `Top Project Idea: ${user.top_project_idea}. Preferred Role: ${user.preferred_role}. Project Preference: ${user.project_preference}.`
        );

        const otherEmbeddingsResponse = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: otherInputs,
        });

        const otherEmbeddings = otherEmbeddingsResponse.data.map((item) => item.embedding);

        // Calculate cosine similarity
        const matches = otherUsers.map((user, index) => ({
            userId: user.id,
            similarity: cosineSimilarity(userEmbedding, otherEmbeddings[index]),
            first_name: user.first_name,
            top_project_idea: user.top_project_idea,
            preferred_role: user.preferred_role,
            project_preference: user.project_preference,
        }));

        // Sort matches by similarity
        matches.sort((a, b) => b.similarity - a.similarity);

        const topMatch = matches[0];

        if (!topMatch) {
            return NextResponse.json({ error: "No suitable match found." }, { status: 404 });
        }

        // Generate explanation using OpenAI
        const explanationPrompt = `
You are a helpful assistant that explains the similarities between two individuals based on their profiles.

**User Profile:**
- Display Name: ${currentUser.first_name}
- Top Project Idea: ${currentUser.top_project_idea}
- Preferred Role: ${currentUser.preferred_role}
- Project Preference: ${currentUser.project_preference}

**Matched User Profile:**
- Display Name: ${topMatch.first_name}
- Top Project Idea: ${topMatch.top_project_idea}
- Preferred Role: ${topMatch.preferred_role}
- Project Preference: ${topMatch.project_preference}

**Similarity Score:** ${(topMatch.similarity * 100).toFixed(2)}%

**Task:** Provide a concise explanation (only two sentences) highlighting why these two profiles are similar and how their attributes complement each other.
`;

        const explanationResponse = await openai.completions.create({
            model: "gpt-3.5-turbo-instruct",
            prompt: explanationPrompt,
            max_tokens: 100,
            temperature: 1.0,
        });

        const explanation = explanationResponse.choices[0].text?.trim() || "No explanation available.";

        return NextResponse.json({ topMatch, explanation });
    } catch (error: any) {
        console.error("Error in matchUsers API:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
