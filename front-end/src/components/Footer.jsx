import React from "react";
import github from "../assets/github.svg";
import { Link } from "react-router-dom";


function Footer() {
  return (
    <footer className="p-8 mt-8 w-full bg-gradient-to-r from-[#001f3d] to-[#004d67] dark:from-[#004d67] dark:to-[#001f3d] text-white">
      <div className="container mx-auto flex flex-wrap justify-between space-y-8 md:space-y-0 md:flex-row">

        {/* About Section */}
        <div className="w-full md:w-1/3 mb-6 text-center md:text-left">
          <a href="/" className="text-2xl font-bold">React Blog</a>
          <p className="text-lg mt-2 opacity-80">
            Share your story, inspire the world. A platform for bloggers and readers.
          </p>
        </div>

        {/* Quick Links Section */}
        <div className="w-full md:w-1/3 mb-6 text-center md:text-left">
          <h3 className="text-2xl font-bold">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <a href="/" className="text-lg hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-200">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="text-lg hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-200">
                About
              </a>
            </li>
            <li>
              <a href="/article-list" className="text-lg hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-200">
                Articles
              </a>
            </li>
            <li>
              <a href="/faq" className="text-lg hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-200">
                FAQ's
              </a>
            </li>
            <li>
              <Link to="/contributors"
                className="text-lg hover:text-yellow-400 dark:hover:text-yellow-300 transition duration-200"
              >
                Contributors
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Media and Contact Section */}
        <div className="w-full md:w-1/3 mb-6 text-center md:text-left">
          <h3 className="text-2xl font-bold mt-11">Follow Us on GitHub</h3>
          <div className="flex justify-center md:justify-start mt-4">
            <a
              href="https://github.com/OkenHaha/react-blog"
              aria-label="Follow us on GitHub"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition-transform duration-300 mx-6 "
            >
              <img src={github} alt="GitHub" className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center mt-6 text-sm border-t border-yellow-500 pt-4 opacity-70 dark:border-yellow-600">
        © 2025 React Blog. All Rights Reserved.
      </div>
    </footer >
  );
}

export default Footer;
