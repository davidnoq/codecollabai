"use client";

import { useState, useEffect } from "react";
import { getUserProfile, upsertUserProfile } from "@/lib/db";
import { getCurrentSession } from "@/lib/authentication";

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const session = await getCurrentSession();
        if (!session) {
          throw new Error("User not authenticated.");
        }

        const userProfile = await getUserProfile(session.user.id);
        setProfile(userProfile);
        setFormData(userProfile); // Pre-fill form with existing profile data
      } catch (err: any) {
        setError(err.message || "Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await upsertUserProfile(formData);
      setProfile(formData);
      setIsEditing(false); // Exit editing mode
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-white text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className=" min-h-dvh flex items-center justify-center ">
      <div className="bg-gray-900 p-8 rounded-xl shadow-lg w-full max-w-3xl text-white">
        <h1 className="text-3xl font-bold mb-6">Manage Profile</h1>

        {isEditing ? (
          <>
            <form className="space-y-4">
              {/* First Name */}
              <div>
                <label className="block font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-200"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              {/* Year in School */}
              <div>
                <label className="block font-medium mb-2">Year in School</label>
                <select
                  name="year_in_school"
                  value={formData.year_in_school || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-200"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgrad">Postgraduate</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Main Language */}
              <div>
                <label className="block font-medium mb-2">Main Programming Language</label>
                <input
                  type="text"
                  name="main_language"
                  value={formData.main_language || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 text-gray-200"
                  placeholder="e.g., JavaScript"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500"
              >
                Save Changes
              </button>
            </form>

            {/* Cancel Editing */}
            <button
              onClick={() => setIsEditing(false)}
              className="w-full mt-4 py-2 rounded-lg bg-gray-800 text-white font-semibold hover:bg-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {/* View Profile */}
            <div className="space-y-4">
              <p>
                <span className="font-bold">First Name:</span> {profile?.first_name || "N/A"}
              </p>
              <p>
                <span className="font-bold">Year in School:</span> {profile?.year_in_school || "N/A"}
              </p>
              <p>
                <span className="font-bold">Main Programming Language:</span> {profile?.main_language || "N/A"}
              </p>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-6 w-full py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-500"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
