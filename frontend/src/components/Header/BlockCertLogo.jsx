
const BlockCertLogo = () => {
  return (
    <div className=".logo max-[485px]:pl-4 ">
      <div className="flex items-center gap-3">
        <div className="relative w-16 h-auto">
          <img src="../../images/logo.png" alt="" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-color-primary">
            BlockVerify-AI
          </span>
          <span className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">
            Certificate Verification
          </span>
        </div>
      </div>
    </div>
  );
}

export default BlockCertLogo;