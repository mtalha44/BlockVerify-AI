import { useState } from "react";
import { Search, X, Clock } from "lucide-react";
import { AnimatePresence } from "motion/react";

const TransactionTable = ({ transactions, onRowClick }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTransactions = transactions.filter((tx) => {
    const searchLow = searchTerm.toLowerCase();
    return (
      tx.student.toLowerCase().includes(searchLow) ||
      tx.rollNumber.toLowerCase().includes(searchLow) ||
      tx.hash.toLowerCase().includes(searchLow) ||
      (tx.degree && tx.degree.toLowerCase().includes(searchLow))
    );
  });

  const getStatusStyles = (status) => {
    if (status === "Verified") {
      return "bg-green-100 text-green-700";
    }
    if (status === "Revoked") {
      return "bg-red-100 text-red-700";
    }
    return "bg-yellow-100 text-yellow-700";
  };

  const getStatusDot = (status) => {
    if (status === "Verified") return "bg-green-500";
    if (status === "Revoked") return "bg-red-500 animate-ping";
    return "bg-yellow-500";
  };

  const getTypeStyles = (type) => {
    if (type === "Revocation") {
      return "bg-red-50 text-red-600 border border-red-100";
    }
    if (type === "Bulk Import" || type === "Batch Import") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    }
    return "bg-blue-50 text-blue-700 border border-blue-100";
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#002677]">
            Last Blockchain Transactions
          </h2>
          <p className="text-xs text-slate-500">
            Recent student degrees hashed and committed to ledger block roots.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Student, Roll, Hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 h-10 w-full sm:w-64 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#002677] focus:ring-1 focus:ring-[#002677]/20 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
              <th className="py-4 px-6">Student Information</th>
              <th className="py-4 px-4">Transaction hash</th>
              <th className="py-4 px-4">Type</th>
              <th className="py-4 px-4">Time Added</th>
              <th className="py-4 px-4 text-center">Ledger status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            <AnimatePresence initial={false}>
              {filteredTransactions.length === 0 ?
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-slate-400 text-sm"
                  >
                    {searchTerm ?
                      "No transactions match your search query."
                    : "No transactions yet. Upload a certificate to get started!"
                    }
                  </td>
                </tr>
              : filteredTransactions.slice(0, 10).map((item) => (
                  <tr
                    key={item.id || item.hash}
                    onClick={() => onRowClick(item)}
                    className="hover:bg-blue-50/40 transition-all duration-150 cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-slate-800 text-sm group-hover:text-[#002677] transition-all">
                          {item.student}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>Roll: {item.rollNumber}</span>
                          {item.degree && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{item.degree}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 px-2.5 py-1 rounded text-[#002677]/90 group-hover:bg-blue-100/50 transition-all font-semibold">
                          {item.hash?.substring(0, 14)}...
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium ${getTypeStyles(item.type)}`}
                      >
                        {item.type || "Upload"}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.time}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold ${getStatusStyles(item.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`}
                        />
                        {item.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              }
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {transactions.length > 0 && (
        <p className="text-[10px] text-slate-400 mt-3 text-right">
          * Showing latest {Math.min(filteredTransactions.length, 10)} of{" "}
          {filteredTransactions.length} transactions. Click any row to inspect
          proof.
        </p>
      )}
    </div>
  );
};

export default TransactionTable;
