import Link from 'next/link';
import React from 'react';
import Image from 'next/image';  // Import Image from next/image

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center text-white bg-gray-900">
      {/* Hero Section */}
      <section className="h-screen flex flex-col mt-[-30px] justify-center items-center text-center px-4 sm:px-6 bg-gray-900">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-blue-100">
          Empower Direct Subscriptions with
        </h1>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r h-20 from-violet-600 via-cyan-500 to-blue-500">
          SubsLink
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-400">
          Seamless. Shareable. Built on Solana.
        </p>

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="https://x.com/subs_link">
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full text-base sm:text-lg">
              Follow on Twitter
            </button>
          </Link>
          <Link href={`https://dial.to/?action=solana-action:${process.env.BASE_URL}/api/actions/create`}>
            <button className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full text-base sm:text-lg">
              Create Subscription
            </button>
          </Link>
        </div>
      </section>

      <section className="py-16 bg-gray-900 w-[80%] flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 sm:px-6">
        <div className="md:w-1/3">
          <Image src="/updates.png" alt="Analytics Dashboard" width={400} height={300} className="mx-auto" /> {/* Use Image */}
        </div>
        <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 order-first md:order-last md:pl-10">
          <h2 className="text-4xl sm:text-2xl md:text-5xl font-bold text-blue-100 mb-4">
            Update Your Subscription
          </h2>
          <p className="text-m sm:text-lg md:text-xl mb-4 text-gray-400">
            Want to change you pre-existing subscription? No worries just enter your new details and in one click your subscription will be updated.
          </p>
          <Link href="/update">
            <button className="px-1 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 rounded-full text-lg sm:text-xl">
              Update Subscription
            </button>
          </Link>
        </div>
      </section>

      {/* Email Feature Section */}
      <section className="py-16 bg-gray-900 w-[80%] flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 sm:px-6">
        <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0">
          <h2 className="text-4xl sm:text-2xl md:text-5xl font-bold text-blue-100 mb-4">
            Send Emails in One Click
          </h2>
          <p className="text-m sm:text-lg md:text-xl mb-4 text-gray-400">
            With SubsLink, you can send emails to all your subscribers with a single click, making communication simple and effective.
          </p>
          <Link href="/send-email">
            <button className="px-1 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 rounded-full text-lg sm:text-xl">
              Send Email Now
            </button>
          </Link>
        </div>
        <div className="md:w-1/3">
          <Image src="/email.png" alt="Email Feature" width={400} height={300} className="mx-auto" /> {/* Use Image */}
        </div>
      </section>

      {/* Analytics Section */}
      <section className="py-16 bg-gray-900 w-[80%] flex flex-col md:flex-row items-center justify-center text-center md:text-left px-4 sm:px-6">
        <div className="md:w-1/3">
          <Image src="/analytics.png" alt="Analytics Dashboard" width={400} height={300} className="mx-auto" /> {/* Use Image */}
        </div>
        <div className="md:w-1/2 md:pr-8 mb-8 md:mb-0 order-first md:order-last md:pl-10">
          <h2 className="text-4xl sm:text-2xl md:text-5xl font-bold text-blue-100 mb-4">
            Monitor Your Performance
          </h2>
          <p className="text-m sm:text-lg md:text-xl mb-4 text-gray-400">
            Gain insights into your subscription activity with our comprehensive analytics dashboard. Check how your users are reacting to your emails.
          </p>
          <Link href="/view-analytics">
            <button className="px-1 py-2 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-600 rounded-full text-lg sm:text-xl">
              View Analytics
            </button>
          </Link>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 w-full text-center md:mt-10 px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8">
          Ready to Get Started?
        </h2>
        <p className="text-lg sm:text-xl mb-8 text-gray-200">
          Join the future of subscriptions on Solana.
        </p>
        <Link href={`https://dial.to/?action=solana-action:${process.env.BASE_URL}/api/actions/create`}>
          <button className="px-2 py-1 sm:px-8 sm:py-4 bg-white text-blue-600 font-semibold rounded-full text-lg sm:text-xl shadow-lg">
            Create Your Subscription Now
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-800 w-full text-center">
        <p className="text-gray-500">&copy; 2024 SubsLink. All Rights Reserved.</p>
      </footer>
    </main>
  );
}
