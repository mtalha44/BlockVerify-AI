import { ShieldCheck, FileSearch, Lock } from "lucide-react";


const VerifyInfo = [
    {
        icon: <ShieldCheck className="w-5 h-5 text-slate-700" />,
        title: "Blockchain Security",
        description: "Every certificate is stored on blockchain, making records tamper-proof and permanently verifiable."
    },
    {
        icon: <FileSearch className="w-5 h-5 text-slate-700" />,
        title: "OCR Verification",
        description: "Extracts certificate details automatically and compares them with blockchain data for instant verification."
    },
    {
        icon: <Lock className="w-5 h-5 text-slate-700" />,
        title: "Secure Privacy",
        description: "Uploaded files are processed securely and are never shared with unauthorized users."
    }
];

const VerifyInfoSection = () => {

return(
    <section className="max-w-4xl mx-auto mt-18 border-slate-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {
            VerifyInfo.map((info, index) => (
                <div key={index} className="space-y-3 border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow ">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        {info.icon}
                    </div>
                    <h5 className="font-bold text-slate-900">{info.title}</h5>
                    <p className="text-sm text-slate-500 leading-relaxed">
                        {info.description}
                    </p>
                </div>
            ))}
        </div>
    </section>
    )
}
export default VerifyInfoSection;