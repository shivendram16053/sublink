'use client';
import Link from 'next/link';
import React, { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link href="/">
            <p className="text-2xl font-bold">SubsLink</p>
          </Link>
        </div>
        <div className="hamburger" onClick={toggleMenu}>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className={`navbar-menu ${isMenuOpen ? 'active' : 'hidden'}`}>
          <Link href="/update">
            <p className="navbar-link">Update Subscription</p>
          </Link>
          <Link href="/send-email">
            <p className="navbar-link">Send Email</p>
          </Link>
          <Link href="/view-analytics">
            <p className="navbar-link">View Analytics</p>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
