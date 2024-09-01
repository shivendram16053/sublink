import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link href="/">
        <>
          <Image src="/logo.png" width={80} height={80} alt="logo" />
        </>
      </Link>

      <div className="nav-item">
        <ul className="flex space-x-4">
          <li>
            <Link href="https://dial.to/devnet?action=solana-action:https://subslink.vercel.app/api/actions/create">
              <div className="text-blue-500 hover:underline">Create a New subscription</div>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
