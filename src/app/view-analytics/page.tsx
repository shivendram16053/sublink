"use client";

import { useState, FormEvent } from "react";

const FetchUserPage = () => {
  const [userId, setUserId] = useState<string>("");
  const [usersData, setUsersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleIdSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUsersData([]);

    try {
      const res = await fetch("/api/actions/fetch-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const result = await res.json();

      if (res.ok) {
        setUsersData(result.users); // Assuming the response contains an array of user details
      } else {
        setError(result.message || "User not found");
      }
    } catch (err) {
      setError("Failed to fetch user details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center flex-col items-center p-6 text-white w-[80%]">
      <div className="w-[98%] bg-gray-900 p-8 rounded-lg shadow-[0_0_13px_rgba(255,255,255,0.4)] border border-gray-500">
        <h1 className="text-3xl text-center font-bold mb-6">Fetch Users</h1>

        <form onSubmit={handleIdSubmit} className="space-y-6">
          <label htmlFor="userId" className="block text-lg font-medium mb-2">
          Enter Project&#39;s Unique ID (You received this through email)
          </label>
          <input
            id="userId"
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
            placeholder="User ID"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch User"}
          </button>
        </form>

        {error && <p className="text-red-400 mt-2">{error}</p>}

        
      </div>

      {usersData.length > 0 && (
          <table className="mt-6 w-full text-white border-collapse border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="border border-gray-600 px-4 py-2">Name</th>
                <th className="border border-gray-600 px-4 py-2">Email</th>
                <th className="border border-gray-600 px-4 py-2">Org ID</th>
                <th className="border border-gray-600 px-4 py-2">Amount</th>
                <th className="border border-gray-600 px-4 py-2">Duration</th>
                <th className="border border-gray-600 px-4 py-2">UserPubKey</th>
                <th className="border border-gray-600 px-4 py-2">Created At</th>
              </tr>
            </thead>
            <tbody>
              {usersData.map((user) => (
                <tr key={user._id}>
                  <td className="border border-gray-600 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-600 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-600 px-4 py-2">{user.orgId}</td>
                  <td className="border border-gray-600 px-4 py-2">{user.amount}</td>
                  <td className="border border-gray-600 px-4 py-2">{user.duration}</td>
                  <td className="border border-gray-600 px-4 py-2">{user.UserPubKey}</td>
                  <td className="border border-gray-600 px-4 py-2">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
};

export default FetchUserPage;
