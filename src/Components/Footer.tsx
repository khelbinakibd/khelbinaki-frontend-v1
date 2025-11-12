import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
    return (
        <div className="w-full bg-gradient-to-br from-green-800 via-green-900 to-emerald-950 text-white">
            <footer className="max-w-7xl mx-auto px-6 sm:px-10 py-16">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-2xl font-bold text-green-800">KN</span>
                            </div>
                            <span className="text-xl font-bold">khelbi Naki</span>
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your trusted partner for turf booking across Bangladesh. Play anywhere, anytime.
                        </p>
                        {/* Social Media Icons */}
                        <div className="flex space-x-3 pt-2">
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h6 className="text-lg font-semibold mb-6 text-white">Quick Links</h6>
                        <ul className="space-y-3">
                            <li>
                                <a href="turfs" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Book Turf
                                </a>
                            </li>
                            <li>
                                <a href="contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Report Issue
                                </a>
                            </li>
                            <li>
                                <a href="/dashboard/profile" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h6 className="text-lg font-semibold mb-6 text-white">Support</h6>
                        <ul className="space-y-3">
                            <li>
                                <a href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Help Center
                                </a>
                            </li>
                            <li>
                                <Link to={"/terms-privacy"} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link to={"/terms-privacy"} className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Terms & Conditions
                                </Link>
                            </li>
                            <li>
                                 <Link to={"/terms-privacy"}  className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center group">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 group-hover:w-3 transition-all duration-200"></span>
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h6 className="text-lg font-semibold mb-6 text-white">Get in Touch</h6>
                        <ul className="space-y-4">
                            <li>
                                <a href="tel:+880188595895" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-start group">
                                    <Phone size={18} className="mr-3 mt-0.5 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                                    <span>+880 188 595 895</span>
                                </a>
                            </li>
                            <li>
                                <a href="mailto:khelbinaki@gmail.com" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-start group">
                                    <Mail size={18} className="mr-3 mt-0.5 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                                    <span className="break-all">khelbinaki@gmail.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-start group">
                                    <MapPin size={18} className="mr-3 mt-0.5 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                                    <span>Mirpur-10, Dhaka<br />Bangladesh</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} khelbi Naki. All rights reserved.
                        </p>
                        <div className="flex space-x-6 text-sm">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Terms
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Privacy
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                Cookies
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;