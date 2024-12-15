import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {

  return (
    <footer className="bg-white  mt-12">
      <div className="w-full px-[12vw]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 w-full">

          {/* Quick Links */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
            </ul>
          </div>

          {/* Clients */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
            </ul>
          </div>

          {/* Creatives */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">For Creatives</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#74767E] hover:text-white text-sm">
                  Link
                </Link>
              </li>
            </ul>
          </div>
          
        </div>

        <div>

        </div>
        {/* Bottom Bar */}
        <div className="border-t border-solid border-[#8d8d8d68] py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <img src="src/static/nav-logo.png" className="w-32 h-auto" />
            </div>
            <div>
            <div className="flex space-x-4">
              <a href="#" className="text-[#74767E] hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#74767E] hover:text-white">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#74767E] hover:text-white">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-[#74767E] hover:text-white">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}