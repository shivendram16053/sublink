import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Sublink</h1>
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

      <section className="text-center mb-12">
        <h2 className="text-2xl font-semibold mb-4">Why Choose Sublink?</h2>
        <p className="text-lg mb-6">
          Sublink offers a seamless way for organizations to manage their subscriptions. Create your custom Blink to:
        </p>
        <ul className="list-disc list-inside mb-6">
          <li>Effortlessly handle subscription payments.</li>
          <li>Track transactions in real-time.</li>
          <li>Customize payment options to fit your needs.</li>
        </ul>
      </section>

      <footer className="text-center mt-12">
        <p className="text-sm">
          &copy; 2024 Sublink. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
