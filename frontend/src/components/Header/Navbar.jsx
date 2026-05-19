import { useNavigate } from "react-router-dom";
import { use, useState } from "react";
import {
  Menu,
  X,
  Shield,
  LogIn,
  FileCheck,
  Users,
  BookOpen,
  Mail,
  Home,
  Cpu,
  Lock,
  Play,
} from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", href: "#Home", icon: Home },
    { name: "Features", href: "#Features", icon: FileCheck },
    { name: "Documentation", href: "#docs", icon: BookOpen },
    { name: "Team", href: "#team", icon: Users },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  const [navLink, setNavlinkActive] = useState("Home");

  return (
    <header>
      <nav className="navbar fixed top-0 left-0 right-0 z-50">
        <div className='mx-auto px-4 x-6 lg:px-8 max-w-7xl"'>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-auto">
                <img src="../../images/logo.png" alt="Logo" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-color-primary">
                  BlockVerify-AI
                </span>
                <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase ">
                  Certificates Verification
                </span>
              </div>
            </div>
            <div className="flex gap-1 max-[965px]:hidden">
              {navItems.map((items) => (
                <a
                  key={items.name}
                  href={items.href}
                  className={`nav-link flex items-center gap-2 text-sm ${navLink === items.name ? "text-[#002677] bg-primary-50" : ""}`}
                  onClick={() => setNavlinkActive(items.name)}
                >
                  <items.icon className="size-4" />
                  <span>{items.name}</span>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 max-[965px]:hidden">
              <button className="btn-secondary flex items-center gap-2 text-sm"
                onClick={() => navigate("/login")}
              >
                <LogIn className="size-4" />
                <span>Login</span>
              </button>
              <button className="btn-primary flex items-center gap-2 max-[1145px]:hidden">
                {/* <Shield className='size-4 ' /> */}
                <Play className="size-4" />
                <span>Try Demo</span>
              </button>
            </div>

            <div className="h-full flex justify-center items-center min-[965px]:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ?
                  <X className="size-5" />
                : <Menu className="size-5" />}
              </button>
            </div>
          </div>
          {isMenuOpen && (
            <div className="shadow-[0_8px_12px_-6px_rgba(0,0,0,0.15)] pb-6 w-full border-t min-[965px]:hidden transition-all duration-200 border-gray-200">
              <div className="px-2 py-3  space-y-1 ">
                {navItems.map((items) => (
                  <a
                    key={items.name}
                    href={items.href}
                    className={`nav-link flex flex-row items-center px-4 py-3 gap-2 text-md ${navLink === items.name ? "text-[#002677] bg-primary-50" : ""}`}
                    onClick={() => {
                      setIsMenuOpen(false);
                      setNavlinkActive(items.name);
                    }}
                  >
                    <items.icon className="size-5" />
                    <span>{items.name}</span>
                  </a>
                ))}
              </div>
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <button
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                  onClick={() => navigate("/login")}
                >
                  <LogIn className="size-4" />
                  <span>Login</span>
                </button>
                <button className="w-full btn-primary flex items-center justify-center gap-2">
                  <Lock className="size-4" />
                  <span>Start Verification</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
