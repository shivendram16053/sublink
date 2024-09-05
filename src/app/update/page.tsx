"use client";

import { useState, FormEvent } from "react";

const UpdatePage = () => {
  const [uniqueId, setUniqueId] = useState<string>("");
  const [isIdValid, setIsIdValid] = useState<boolean | null>(null);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [website, setWebsite] = useState<string | null>(null);
  const [twitter, setTwitter] = useState<string | null>(null);
  const [discord, setDiscord] = useState<string | null>(null);
  const [month, setMonth] = useState<number>(0);
  const [year, setYear] = useState<number>(0);
  const [feesType, setFeesType] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);

  const handleIdSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/actions/check-id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uniqueId }),
      });

      const result = await res.json();

      if (result.exists) {
        setIsIdValid(true);
        setName(result.org.name);
        setEmail(result.org.email);
        setWebsite(result.org.website || "");
        setTwitter(result.org.twitter || "");
        setDiscord(result.org.discord || "");
        setMonth(result.org.month || 0);
        setYear(result.org.year || 0);
        setFeesType(result.org.feesType || "");
      } else {
        setIsIdValid(false);
        setName("");
        setEmail("");
        setWebsite(null);
        setTwitter(null);
        setDiscord(null);
        setMonth(0);
        setYear(0);
        setFeesType("");
      }
    } catch (err) {
      setError("Failed to check ID or fetch project details");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }

    setUpdating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/actions/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uniqueId,
          name,
          email,
          website,
          twitter,
          discord,
          month,
          year,
          feesType,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess("Project updated successfully!");
      } else {
        setError(result.message || "Failed to update project");
      }
    } catch (err) {
      setError("Failed to update project");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-6 text-white w-[80%]">
      <div className="w-[80%] bg-gray-900 p-8 rounded-lg shadow-[0_0_13px_rgba(255,255,255,0.4)] border border-gray-500">
        <h1 className="text-3xl text-center font-bold mb-6">Update Project</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600"
              role="status"
            ></div>
          </div>
        ) : isIdValid === null ? (
          <form onSubmit={handleIdSubmit} className="space-y-6">
            <label
              htmlFor="uniqueId"
              className="block text-lg font-medium mb-2"
            >
              Enter Project's Unique ID
            </label>
            <input
              id="uniqueId"
              type="text"
              value={uniqueId}
              onChange={(e) => setUniqueId(e.target.value)}
              className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
              placeholder="Unique ID"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Check ID
            </button>
            {error && <p className="text-red-400 mt-2">{error}</p>}
          </form>
        ) : isIdValid ? (
          <>
            <form onSubmit={handleUpdate} className="space-y-6">
              <label htmlFor="name" className="block text-lg font-medium mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Name"
              />
              <label htmlFor="email" className="block text-lg font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Email"
              />
              <label
                htmlFor="website"
                className="block text-lg font-medium mb-2"
              >
                Website
              </label>
              <input
                id="website"
                type="text"
                value={website || ""}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Website (optional)"
              />
              <label
                htmlFor="twitter"
                className="block text-lg font-medium mb-2"
              >
                Twitter
              </label>
              <input
                id="twitter"
                type="text"
                value={twitter || ""}
                onChange={(e) => setTwitter(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Twitter (optional)"
              />
              <label
                htmlFor="discord"
                className="block text-lg font-medium mb-2"
              >
                Discord
              </label>
              <input
                id="discord"
                type="text"
                value={discord || ""}
                onChange={(e) => setDiscord(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Discord (optional)"
              />
              <label htmlFor="month" className="block text-lg font-medium mb-2">
                Monthly fees
              </label>
              <input
                id="month"
                type="number"
                value={month}
                onChange={(e) => setMonth(parseFloat(e.target.value))}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Month"
              />
              <label htmlFor="year" className="block text-lg font-medium mb-2">
                Yearly fees
              </label>
              <input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(parseFloat(e.target.value))}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Year"
              />
              <label
                htmlFor="feesType"
                className="block text-lg font-medium mb-2"
              >
                Fees Type
              </label>
              <select
                id="feesType"
                value={feesType}
                onChange={(e) => setFeesType(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
              >
                <option value="" disabled>
                  Select Fees Type
                </option>
                <option value="sol">SOL</option>
                <option value="usdc">USDC</option>
              </select>

              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Project"}
              </button>
              {error && <p className="text-red-400 mt-2">{error}</p>}
              {success && <p className="text-green-400 mt-2">{success}</p>}
            </form>
          </>
        ) : (
          <p className="text-red-400">Invalid ID. Please try again.</p>
        )}
      </div>
    </div>
  );
};

export default UpdatePage;
