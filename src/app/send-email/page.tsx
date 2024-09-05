"use client";

import { useState, FormEvent } from "react";

interface ProjectDetails {
  name: string;
  email: string;
  website: string | null;
  twitter: string | null;
  discord: string | null;
}

const SendEmailPage = () => {
  const [uniqueId, setUniqueId] = useState<string>("");
  const [isIdValid, setIsIdValid] = useState<boolean | null>(null);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false); // Loading state for checking ID
  const [emailSending, setEmailSending] = useState<boolean>(false); // Loading state for email sending

  const handleIdSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when fetching starts

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
        setProjectDetails(result.org); // Store the returned organization details
      } else {
        setIsIdValid(false);
        setProjectDetails(null); // Clear project details if ID is invalid
      }
    } catch (err) {
      setError("Failed to check ID or fetch project details");
    } finally {
      setLoading(false); // Stop loading when the request is complete
    }
  };

  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();

    if (!projectDetails) {
      setError("Project details are missing.");
      return;
    }

    setEmailSending(true); // Start email sending process
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    try {
      const res = await fetch("/api/actions/email-send", {
        // Adjust the API endpoint as needed
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          projectDetails,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setSuccess("Email sent successfully!");
      } else {
        setError(result.message || "Failed to send email");
      }
    } catch (err) {
      setError("Failed to send email");
    } finally {
      setEmailSending(false); // Stop email sending process
    }
  };

  return (
    <div className="flex justify-center items-center p-6 text-white w-[80%]">
      <div className="w-[80%] bg-gray-900 p-8 rounded-lg shadow-[0_0_13px_rgba(255,255,255,0.4)] border border-gray-500">
        <h1 className="text-3xl text-center font-bold mb-6">Send Email</h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            {/* Replace this with your spinner or loading indicator */}
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
              Enter Project&#39;s Unique ID (You received this through email)
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
            {/* Show Project Details */}
            {projectDetails && (
              <div className="space-y-4 mb-6">
                <h2 className="text-2xl font-semibold">Project Details</h2>
                {projectDetails.name && (
                  <p className="text-gray-400">
                    <strong>Name:</strong> {projectDetails.name}
                  </p>
                )}
                {projectDetails.email && (
                  <p className="text-gray-400">
                    <strong>Email:</strong> {projectDetails.email}
                  </p>
                )}
                {projectDetails.website && (
                  <p className="text-gray-400">
                    <strong>Website:</strong> {projectDetails.website}
                  </p>
                )}
                {projectDetails.twitter && (
                  <p className="text-gray-400">
                    <strong>Twitter:</strong> {projectDetails.twitter}
                  </p>
                )}
                {projectDetails.discord && (
                  <p className="text-gray-400">
                    <strong>Discord:</strong> {projectDetails.discord}
                  </p>
                )}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSendEmail} className="space-y-6">
              <label htmlFor="title" className="block text-lg font-medium mb-2">
                Email Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="Enter email title"
              />
              <label
                htmlFor="content"
                className="block text-lg font-medium mb-2"
              >
                Email Content ( We will add your provided socials by default)
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border border-gray-700 rounded bg-gray-800 text-white"
                rows={15}
                placeholder="Enter email content"
              />

              {/* Email Send Button */}
              <button
                type="submit"
                className={`px-6 py-3 ${
                  emailSending ? "bg-gray-500" : "bg-green-600"
                } text-white rounded hover:bg-green-700 transition`}
                disabled={emailSending} // Disable button during sending
              >
                {emailSending ? "Sending..." : "Send Email"}
              </button>

              {/* Success or Error Message */}
              {success && <p className="text-green-400 mt-2">{success}</p>}
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </form>
          </>
        ) : (
          <p className="text-red-400">Invalid Unique ID</p>
        )}
      </div>
    </div>
  );
};

export default SendEmailPage;
