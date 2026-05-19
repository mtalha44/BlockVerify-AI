import React from 'react';
import { Shield } from 'lucide-react';

const AuthFooter = () => {
  return (
    <footer className="w-full bg-white px-6 border-t border-gray-200 pt-1">
      <div className="flex flex-row justify-between items-center max-[665px]:flex-col-reverse">
        <div className="text-center text-gray-700 text-sm font-medium flex flex-row max-[865px]:flex-col-reverse max-[865px]:col-reverse max-[865px]:gap-2">
          <span className="inline-block mr-4 max-[865px]:text-left max-[865px]:ml-2 max-[665px]:text-center">© 2026 All rights reserved.</span>
          <div>
            <a
              href="/privacy-policy"
              className="inline-block mx-2 text-color-primary hover:underline"
            >
              Privacy Policy®
            </a>

            <span className="text-gray-400 mx-2">|</span>

            <a
              href="/terms-of-use"
              className="inline-block mx-2 text-color-primary hover:underline"
            >
              Terms of Use®
            </a>

            <span className="text-gray-400 mx-2">|</span>

            <a
              href="/accessibility"
              className="inline-block mx-2 text-color-primary hover:underline"
            >
              Accessibility®
            </a>
          </div>
        </div>
        <div className="h-13 py-1">
          <img
            src="../../images/oneBlockchainId.png"
            alt="BlockVerify-AI Logo"
            className="h-full w-45"
          />
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;