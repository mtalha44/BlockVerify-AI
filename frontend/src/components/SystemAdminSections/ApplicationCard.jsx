import React from "react";
import {
  Building2,
  Mail,
  MapPin,
  User,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default function ApplicationCard({ application, onSelect }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "verified":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-3.5 h-3.5" />;
      case "verified":
        return <CheckCircle2 className="w-3.5 h-3.5" />;
      case "rejected":
        return <XCircle className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      onClick={onSelect}
      className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-lg hover:border-[#002677]/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-[#002677]/10 to-[#002677]/5 rounded-lg">
              <Building2 className="w-4 h-4 text-[#002677]" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {application.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 ml-8">
            {application.domain ||
              application.email?.split("@")[1] ||
              "No domain"}
          </p>
        </div>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}
        >
          {getStatusIcon(application.status)}
          <span className="capitalize">{application.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">
            {application.authorizedEmail || application.email}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>
            {application.city}, {application.country}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>{application.primaryContactName}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Submitted: {formatDate(application.createdAt)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          ID: {application.registrationNumber || "N/A"}
        </span>
        <button className="flex items-center gap-1 text-sm font-medium text-[#002677] hover:text-[#001b55] transition-colors group-hover:gap-2">
          <span>Review</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
