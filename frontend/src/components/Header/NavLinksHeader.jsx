
import { useNavigate } from "react-router-dom";
import BlockCertLogo from "./BlockCertLogo";

const NavbarForLinks = () => {
    const navigate = useNavigate();
    return(
        <div className="max-w-6xl pb-2 border-b border-slate-200/80 mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
        <BlockCertLogo />   
        
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-500 hover:text-[#002677] transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
        
    )
}

export default NavbarForLinks;