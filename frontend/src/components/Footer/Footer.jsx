import {
  ShieldCheck,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Cpu,
  Globe,
  ExternalLink,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-slate-400 pt-20 pb-10 px-8 border-t border-primary-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16 ">
          <div className="space-y-6 small_screen_footer">
            <div className="flex items-center gap-3 cursor-pointer">
              {/* <div className="flex items-center justify-center w-10 h-10 overflow-hidden group-hover:rotate-12 transition-transform duration-300">
                <img
                  src="../../images/logonobg.png"
                  alt="BlockVerify-AI Logo"
                  className="w-full h-full object-contain"
                />
              </div> */}
              <div className="flex flex-col">
                <span className="text-xl font-bold font-display text-white tracking-tight">
                  BlockVerify-AI
                </span>
                <span className="text-[10px] uppercase tracking-widest text-primary-400 font-bold">
                  Certificates Verification
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Empowering global institutions with tamper-proof certificate
              verification powered by Ethereum blockchain and AI-OCR extraction.
            </p>
            <div className="flex items-center gap-4 ">
              <a
                href="#"
                className="p-2 bg-primary-800 rounded-lg hover:text-white hover:bg-primary-700 transition-all duration-200"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-800 rounded-lg hover:text-white hover:bg-primary-700 transition-all duration-200"
              >
                <Github className="size-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-primary-800 rounded-lg hover:text-white hover:bg-primary-700 transition-all duration-200"
              >
                <Linkedin className="size-5" />
              </a>
            </div>
          </div>

          <div className="small_screen_footer">
            <h4 className="text-white font-bold font-display mb-6 uppercase tracking-wider text-sm">
              Platform
            </h4>
            <ul className="space-y-4 text-sm max-[767px]:flex max-[767px]:gap-5 max-[767px]:flex-wrap max-[767px]:justify-center ">
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  Verify Certificate
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="hover:text-white transition-colors duration-200"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#docs"
                  className="hover:text-white transition-colors duration-200 flex items-center gap-2"
                >
                  Documentation <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  Security Audit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-white transition-colors duration-200"
                >
                  API Access
                </a>
              </li>
            </ul>
          </div>

          <div className="small_screen_footer">
            <h4 className="text-white font-bold font-display mb-6 uppercase tracking-wider text-sm ">
              Technology
            </h4>
            <ul className="space-y-4 text-sm max-[767px]:flex max-[767px]:gap-5 max-[767px]:justify-center max-[767px]:flex-wrap">
              <li className="flex items-center gap-3 w-52">
                <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center">
                  <Cpu className="size-4 text-primary-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">EasyOCR Engine</div>
                  <div className="text-xs text-slate-500">
                    99.8% Extraction Accuracy
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 w-52">
                <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center">
                  <Globe className="size-4 text-primary-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">Ethereum L2</div>
                  <div className="text-xs text-slate-500">
                    Immutable Hash Anchoring
                  </div>
                </div>
              </li>
              <li className="flex w-52 items-center gap-3">
                <div className="size-8 rounded-lg bg-primary-800 flex items-center justify-center">
                  <ShieldCheck className="size-4 text-primary-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">
                    SHA-256 Hashing
                  </div>
                  <div className="text-xs text-slate-500">
                    Military-Grade Integrity
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div className="small_screen_footer">
            <h4 className="text-white font-bold font-display mb-6 uppercase tracking-wider text-sm">
              Get in Touch
            </h4>
            <div className="bg-primary-800 p-6 rounded-2xl border border-primary-700">
              <div className="flex items-center gap-2 text-white font-semibold mb-2">
                <Mail className="size-4" />
                <span>Support available 24/7</span>
              </div>
              <p className="text-xs mb-4">
                Have questions about institution onboarding?
              </p>
              <button className="w-full bg-white text-primary-900 font-bold py-2 rounded-lg hover:bg-primary-100 transition-colors duration-200">
                Contact Team
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-primary-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-medium">
            © {currentYear} BlockVerify-AI. Developed at Govt. Graduate College
            of Science, Punjab University.
          </p>
          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest flex-wrap justify-center">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Accessibility
            </a>
            <a href="#" className="hover:text-white transition-colors">
              SLA Agreement
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
