import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Subslink</h1>
        <p className="text-lg mb-6">
          Simplify your subscription management with customizable Solana-based Blinks.
        </p>
          <div className="flex justify-center items-center">
          <Image
            src="/logo.png"
            alt="Sublink Logo"
            width={180}
            height={37}
            priority
          />
          </div>
      </header>

      <button className="bg-black text-white p-3 mb-2 border-slate-700">
        <a href="https://dial.to/?action=solana-action%3Ahttps%3A%2F%2Fsubslink.vercel.app%2Fapi%2Factions%2Fcreate&cluster=devnet">Create Blink for your Project</a>
      </button>

      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Subslink?</h2>
        <p className="text-lg mb-6">
          Subslink offers a seamless way for organizations to manage their subscriptions. Create your custom Blink to:
        </p>
        <ul className="list-disc list-inside mb-6">
          <li>Effortlessly handle subscription payments.</li>
          <li>Track transactions in real-time.</li>
          <li>Customize payment options to fit your needs.</li>
        </ul>
      </section>

      <footer className="text-center mt-12">
        <p className="text-sm">
          &copy; 2024 Subslink. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
