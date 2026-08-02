import { Hash, Database, Users } from "lucide-react";

const StatsCards = ({ stats, loading }) => {
  console.log("Stats Object:", stats);

  console.log("totalTxs:", stats.totalTxs);
  console.log("typeof totalTxs:", typeof stats.totalTxs);

  console.log("recordsStored:", stats.recordsStored);
  console.log("typeof recordsStored:", typeof stats.recordsStored);

  console.log("verifiedStudents:", stats.verifiedStudents);
  console.log("typeof verifiedStudents:", typeof stats.verifiedStudents);
  const cards = [
    {
      label: "Total Write Transactions",
      value: Number(stats.totalTxs),
      icon: Hash,
      color: "blue",
      subtext: "+ Live",
    },
    {
      label: "Degrees Fixed on Blockchain",
      value: Number(stats.recordsStored),
      suffix: "",
      icon: Database,
      color: "blue",
      subtext: "Immutable",
    },
    {
      label: "Active Verified Students",
      value: Number(stats.verifiedStudents),
      suffix: "",
      icon: Users,
      color: "blue",
      subtext: "Clean Registry",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/85 hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.label}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <h2 className="text-3xl font-bold text-[#002677]">
                  {loading ?
                    <span className="animate-pulse">...</span>
                  : card.value}
                </h2>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">
                  {card.subtext}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-[#002677] rounded-xl flex items-center justify-center group-hover:scale-105 transition-all">
              <card.icon className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
