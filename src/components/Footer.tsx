import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="w-full px-4 md:px-[12vw]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12 w-full">
          {/* About */}
          <div className="col-span-1">
            <img src="/nav-logo.png" alt="Candid" className="w-32 h-auto mb-4" />
            <p className="text-gray-600 text-sm mb-4">
              Connect with local creative professionals for your content needs. Quality work, delivered locally.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/photography" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Photography
                </Link>
              </li>
              <li>
                <Link to="/category/videography" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Videography
                </Link>
              </li>
              <li>
                <Link to="/category/editing" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Video Editing
                </Link>
              </li>
              <li>
                <Link to="/category/content" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Content Creation
                </Link>
              </li>
            </ul>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/how-it-works" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link to="/find-talent" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Find Talent
                </Link>
              </li>
            </ul>
          </div>

          {/* For Creatives */}
          <div>
            <h3 className="text-[#404145] font-semibold mb-4">For Creatives</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/become-creative" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Become a Creative
                </Link>
              </li>
              <li>
                <Link to="/find-work" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Find Work
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-gray-500 hover:text-primary transition-colors text-sm">
                  Community
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-500 text-sm">
              {new Date().getFullYear()} Candid. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link to="/privacy" className="text-gray-500 hover:text-primary transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-primary transition-colors text-sm">
                Terms of Service
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-primary transition-colors text-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}