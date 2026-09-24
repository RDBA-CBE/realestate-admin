"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { DataTable } from "mantine-datatable";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Users,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Home,
  Layers,
  PhoneCall,
  CalendarDays,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Models from "@/imports/models.import";
import PrivateRouter from "@/hook/privateRouter";
import {
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  formatPriceRange,
  formatToINR,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import Paginations from "@/pages/elements/paginations";
import useDebounce from "@/hook/useDebounce";
import { RotatingLines } from "react-loader-spinner";
import Swal from "sweetalert2";

const DeveloperDetailView = () => {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState<
    "properties" | "projects" | "leads" | "inquiries"
  >("properties");
  const [inquiryType, setInquiryType] = useState<"booking" | "callback">(
    "booking"
  );
  const [copiedId, setCopiedId] = useState(false);

  // Main state
  const [state, setState] = useSetState({
    loading: true,
    developer: null as any,

    // KPI counts
    totalProperties: 0,
    totalProjects: 0,
    totalLeads: 0,
    totalInquiries: 0,
    leadOpportunityCounts: [] as any[],

    // Properties tab state
    propertiesList: [],
    propertiesLoading: false,
    propertiesPage: 1,
    propertiesTotal: 0,
    propertiesSearch: "",
    propertiesPublishFilter: "all",
    propertiesListingType: "all",

    // Projects tab state
    projectsList: [],
    projectsLoading: false,
    projectsPage: 1,
    projectsTotal: 0,
    projectsSearch: "",

    // Leads tab state
    leadsList: [],
    leadsLoading: false,
    leadsPage: 1,
    leadsTotal: 0,
    leadsSearch: "",
    leadsStatusFilter: "all",

    // Inquiries tab state
    inquiriesList: [],
    inquiriesLoading: false,
    inquiriesPage: 1,
    inquiriesTotal: 0,
    inquiriesSearch: "",
  });

  const debouncedPropSearch = useDebounce(state.propertiesSearch, 400);
  const debouncedProjSearch = useDebounce(state.projectsSearch, 400);
  const debouncedLeadSearch = useDebounce(state.leadsSearch, 400);
  const debouncedInquirySearch = useDebounce(state.inquiriesSearch, 400);

  // Fetch developer details & KPI totals on mount
  useEffect(() => {
    if (id) {
      fetchDeveloperProfile();
      fetchKpiTotals();
      fetchProperties(1);
      fetchProjects(1);
      fetchLeads(1);
      fetchInquiries(1);
    }
  }, [id]);

  // Tab filter effects
  useEffect(() => {
    if (id) {
      fetchProperties(1);
    }
  }, [debouncedPropSearch, state.propertiesPublishFilter, state.propertiesListingType]);

  useEffect(() => {
    if (id) {
      fetchProjects(1);
    }
  }, [debouncedProjSearch]);

  useEffect(() => {
    if (id) {
      fetchLeads(1);
    }
  }, [debouncedLeadSearch, state.leadsStatusFilter]);

  useEffect(() => {
    if (id) {
      fetchInquiries(1);
    }
  }, [debouncedInquirySearch, inquiryType]);

  // ─────────────────────────────────────────────────────────────────────────────
  // API Fetch Functions
  // ─────────────────────────────────────────────────────────────────────────────

  const fetchDeveloperProfile = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.user.details(id);
      setState({ developer: res, loading: false });
    } catch (err) {
      console.error("Error fetching developer profile:", err);
      setState({ loading: false });
    }
  };

  const fetchKpiTotals = async () => {
    try {
      // 1. Property Count
      Models.property
        .count({ developer: id })
        .then((res: any) => {
          setState({ totalProperties: res?.total ?? res?.count ?? 0 });
        })
        .catch(() => {
          Models.property.list(1, { developer: id }).then((r: any) => {
            setState({ totalProperties: r?.count ?? 0 });
          });
        });

      // 2. Project Count
      Models.project
        .list(1, { developer: id })
        .then((res: any) => {
          setState({ totalProjects: res?.count ?? 0 });
        })
        .catch(() => {});

      // 3. Lead Count
      Models.lead
        .count({ developer: id })
        .then((res: any) => {
          setState({
            totalLeads: res?.total ?? 0,
            leadOpportunityCounts: res?.opportunity_status_counts || [],
          });
        })
        .catch(() => {
          Models.lead.list(1, { developer: id }).then((r: any) => {
            setState({ totalLeads: r?.count ?? 0 });
          });
        });

      // 4. Inquiries Count
      Promise.all([
        Models.inquiry.booking_inquiry(1, { developer: id }).catch(() => ({ count: 0 })),
        Models.inquiry.callback(1, { developer: id }).catch(() => ({ count: 0 })),
      ]).then(([bookingRes, callbackRes]: any) => {
        const total = (bookingRes?.count || 0) + (callbackRes?.count || 0);
        setState({ totalInquiries: total });
      });
    } catch (err) {
      console.error("Error fetching KPI totals:", err);
    }
  };

  const fetchProperties = async (page: number) => {
    try {
      setState({ propertiesLoading: true, propertiesPage: page });
      const body: any = { developer: id };

      if (state.propertiesSearch) {
        body.search = state.propertiesSearch;
      }
      if (state.propertiesPublishFilter === "published") {
        body.publish = "Yes";
      } else if (state.propertiesPublishFilter === "draft") {
        body.publish = "No";
      }
      if (state.propertiesListingType !== "all") {
        body.listing_type = state.propertiesListingType;
      }

      const res: any = await Models.property.list(page, body);
      setState({
        propertiesList: res?.results || [],
        propertiesTotal: res?.count || 0,
        propertiesLoading: false,
      });
    } catch (err) {
      console.error("Error fetching developer properties:", err);
      setState({ propertiesLoading: false });
    }
  };

  const fetchProjects = async (page: number) => {
    try {
      setState({ projectsLoading: true, projectsPage: page });
      const body: any = { developer: id };
      if (state.projectsSearch) {
        body.search = state.projectsSearch;
      }

      const res: any = await Models.project.list(page, body);
      setState({
        projectsList: res?.results || [],
        projectsTotal: res?.count || 0,
        projectsLoading: false,
      });
    } catch (err) {
      console.error("Error fetching developer projects:", err);
      setState({ projectsLoading: false });
    }
  };

  const fetchLeads = async (page: number) => {
    try {
      setState({ leadsLoading: true, leadsPage: page });
      const body: any = { developer: id };
      if (state.leadsSearch) {
        body.search = state.leadsSearch;
      }
      if (state.leadsStatusFilter !== "all") {
        body.status = state.leadsStatusFilter;
      }

      const res: any = await Models.lead.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        customer_name:
          item?.full_name ||
          (item?.first_name ? `${item.first_name} ${item.last_name || ""}` : item?.customer_name) ||
          "—",
        email: item?.email || "—",
        phone: item?.phone || item?.mobile || "—",
        property_title:
          item?.property?.title ||
          item?.properties_details?.[0]?.title ||
          item?.property_name ||
          "—",
        property_id: item?.property?.id || item?.properties_details?.[0]?.id,
        project_name: item?.project?.name || item?.properties_details?.[0]?.project?.name || "—",
        lead_source: item?.lead_source_info?.name || item?.lead_source?.name || item?.lead_source || "—",
        status: item?.status_info?.name || item?.status?.name || item?.status || "—",
        requirements: item?.requirements || item?.note || "—",
        created_at: item?.created_at,
      }));

      setState({
        leadsList: data || [],
        leadsTotal: res?.count || 0,
        leadsLoading: false,
      });
    } catch (err) {
      console.error("Error fetching developer leads:", err);
      setState({ leadsLoading: false });
    }
  };

  const fetchInquiries = async (page: number) => {
    try {
      setState({ inquiriesLoading: true, inquiriesPage: page });
      const body: any = { developer: id };
      if (state.inquiriesSearch) {
        body.search = state.inquiriesSearch;
      }

      let res: any;
      if (inquiryType === "booking") {
        res = await Models.inquiry.booking_inquiry(page, body);
      } else {
        res = await Models.inquiry.callback(page, body);
      }

      const data = (res?.results || []).map((item: any) => ({
        id: item?.id,
        customer_name: item?.full_name || item?.name || item?.user?.first_name || "—",
        email: item?.email || item?.user?.email || "—",
        phone: item?.phone || item?.phone_number || "—",
        property_title: item?.property?.title || item?.property_name || "—",
        property_id: item?.property?.id || item?.property,
        project_name: item?.project?.name || "—",
        preferred_date: item?.preferred_date || item?.visit_date || item?.created_at,
        status: item?.status || "Pending",
        message: item?.message || item?.notes || item?.remarks || "—",
        created_at: item?.created_at,
      }));

      setState({
        inquiriesList: data,
        inquiriesTotal: res?.count || 0,
        inquiriesLoading: false,
      });
    } catch (err) {
      console.error("Error fetching developer inquiries:", err);
      setState({ inquiriesLoading: false });
    }
  };

  const handleCopyId = () => {
    if (!id) return;
    navigator.clipboard.writeText(String(id));
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const dev = state.developer;

  if (state.loading) {
    return (
      <div className="flex h-[65vh] flex-col items-center justify-center gap-3">
        <RotatingLines
          visible
          strokeColor="#9b0f09"
          strokeWidth="4"
          animationDuration="0.75"
          width="44"
          ariaLabel="loading"
        />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading developer details...
        </p>
      </div>
    );
  }

  const statusConfig =
    dev?.account_status === "approved"
      ? {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
          icon: <CheckCircle className="h-3.5 w-3.5" />,
          label: "Approved",
        }
      : dev?.account_status === "rejected"
      ? {
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
          icon: <XCircle className="h-3.5 w-3.5" />,
          label: "Rejected",
        }
      : {
          bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
          icon: <Clock className="h-3.5 w-3.5" />,
          label: "Pending Review",
        };

  const developerName = dev
    ? `${capitalizeFLetter(dev.first_name || "")} ${capitalizeFLetter(dev.last_name || "")}`.trim() || "Developer"
    : "Developer";

  return (
    <div className="space-y-6 pb-12">
      {/* ── Top Navigation & Breadcrumbs ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="group flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-[#9b0f09] hover:bg-red-50/40 hover:text-[#9b0f09] dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-red-900"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back</span>
          </button>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/real-estate/admin_dashboard"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Dashboard
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <Link
              href="/real-estate/users/admin_list"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Users
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {dev?.industry || developerName}
            </span>
          </nav>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyId}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            title="Copy Developer ID"
          >
            {copiedId ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-500" />
            )}
            <span>{copiedId ? "Copied ID!" : `ID: #${String(id).slice(-6)}`}</span>
          </button>

          {dev?.email && (
            <a
              href={`mailto:${dev.email}`}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-[#9b0f09] hover:text-[#9b0f09] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <Mail className="h-3.5 w-3.5 text-[#9b0f09]" />
              <span>Email</span>
            </a>
          )}

          {dev?.phone && (
            <a
              href={`tel:${dev.phone}`}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-emerald-600 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>Call</span>
            </a>
          )}
        </div>
      </div>

      {/* ── Hero Profile Header ── */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-7">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-56 w-56 rounded-full bg-gradient-to-br from-[#9b0f09]/10 to-transparent blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar / Logo */}
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9b0f09] via-[#850d08] to-[#5a0905] text-2xl font-black text-white shadow-lg ring-4 ring-red-100 dark:ring-red-950/50">
              {dev?.first_name?.charAt(0)?.toUpperCase() || "D"}
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#9b0f09] shadow-sm dark:bg-gray-800">
                <Building2 className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Developer Title & Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {developerName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${statusConfig.bg}`}
                >
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50/80 px-2.5 py-0.5 text-xs font-semibold text-[#9b0f09] dark:border-red-900 dark:bg-red-950/40">
                  <Sparkles className="h-3 w-3" />
                  Developer Partner
                </span>
              </div>

              {dev?.industry && (
                <div className="flex items-center gap-2 text-base font-semibold text-gray-700 dark:text-gray-300">
                  <Building2 className="h-4 w-4 text-[#9b0f09]" />
                  <span>{dev.industry}</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                {dev?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> {dev.email}
                  </span>
                )}
                {dev?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {formatPhoneNumber(dev.phone)}
                  </span>
                )}
                {dev?.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-500" /> {truncateText(dev.address, 35)}
                  </span>
                )}
                {dev?.created_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Member since {commonDateFormat(dev.created_at)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Properties */}
        <div
          onClick={() => setActiveTab("properties")}
          className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
            activeTab === "properties"
              ? "border-[#9b0f09] bg-gradient-to-br from-red-50/70 to-white ring-2 ring-[#9b0f09]/20 dark:border-red-800 dark:from-red-950/20 dark:to-gray-900"
              : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Properties
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {state.totalProperties.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#9b0f09] transition-transform group-hover:scale-110 dark:bg-red-950/50">
              <Home className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>Portfolio Units</span>
            <span className="font-semibold text-[#9b0f09] group-hover:underline">
              View Properties →
            </span>
          </div>
        </div>

        {/* Total Projects */}
        <div
          onClick={() => setActiveTab("projects")}
          className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
            activeTab === "projects"
              ? "border-[#9b0f09] bg-gradient-to-br from-red-50/70 to-white ring-2 ring-[#9b0f09]/20 dark:border-red-800 dark:from-red-950/20 dark:to-gray-900"
              : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Projects
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {state.totalProjects.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform group-hover:scale-110 dark:bg-blue-950/50">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>Developments</span>
            <span className="font-semibold text-blue-600 group-hover:underline">
              View Projects →
            </span>
          </div>
        </div>

        {/* Total Leads */}
        <div
          onClick={() => setActiveTab("leads")}
          className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
            activeTab === "leads"
              ? "border-[#9b0f09] bg-gradient-to-br from-red-50/70 to-white ring-2 ring-[#9b0f09]/20 dark:border-red-800 dark:from-red-950/20 dark:to-gray-900"
              : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {state.totalLeads.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform group-hover:scale-110 dark:bg-emerald-950/50">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>Prospective Buyers</span>
            <span className="font-semibold text-emerald-600 group-hover:underline">
              View Leads →
            </span>
          </div>
        </div>

        {/* Total Inquiries */}
        <div
          onClick={() => setActiveTab("inquiries")}
          className={`group cursor-pointer rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
            activeTab === "inquiries"
              ? "border-[#9b0f09] bg-gradient-to-br from-red-50/70 to-white ring-2 ring-[#9b0f09]/20 dark:border-red-800 dark:from-red-950/20 dark:to-gray-900"
              : "border-gray-200/80 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Inquiries & Calls
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {state.totalInquiries.toLocaleString()}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 transition-transform group-hover:scale-110 dark:bg-purple-950/50">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
            <span>Bookings & Requests</span>
            <span className="font-semibold text-purple-600 group-hover:underline">
              View Inquiries →
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Left Profile Card + Right Interactive Tabs ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Left Column: Basic Developer Details ── */}
        <div className="space-y-6 lg:col-span-1">
          {/* Basic Details Card */}
          <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <ShieldCheck className="h-4 w-4 text-[#9b0f09]" />
                Developer Details
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Firm / Industry
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {dev?.industry || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Email Address
                  </p>
                  <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                    {dev?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Phone Number
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {formatPhoneNumber(dev?.phone)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Address & Location
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {dev?.address || "No address provided"}
                  </p>
                </div>
              </div>

              {dev?.preferred_locations?.length > 0 && (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Operating Locations
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {dev.preferred_locations.map((loc: any) => loc?.name || loc).join(", ")}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Industry Experience
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {dev?.industry_start_year
                      ? `Active since ${dev.industry_start_year} (${new Date().getFullYear() - Number(dev.industry_start_year)} years)`
                      : "Established Developer"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Metadata Card */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              Account Overview
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60">
                <span className="text-gray-500">Account Type</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {capitalizeFLetter(dev?.user_type || "developer")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60">
                <span className="text-gray-500">Approval Status</span>
                <span className="font-semibold text-emerald-600">
                  {capitalizeFLetter(dev?.account_status || "Approved")}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60">
                <span className="text-gray-500">Email Verified</span>
                <span
                  className={`font-semibold ${
                    dev?.is_email_verified ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {dev?.is_email_verified ? "Verified" : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60">
                <span className="text-gray-500">Registered On</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {commonDateFormat(dev?.created_at)}
                </span>
              </div>

              {dev?.approved_by && (
                <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-xs dark:bg-gray-800/60">
                  <span className="text-gray-500">Approved By</span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    Admin #{dev.approved_by}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column: Interactive Tabs for Properties, Projects, Leads, Inquiries ── */}
        <div className="space-y-5 lg:col-span-3">
          <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-6">
            {/* Tab Navigation Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-3 dark:border-gray-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("properties")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "properties"
                      ? "bg-[#9b0f09] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Properties</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "properties"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {state.propertiesTotal}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("projects")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "projects"
                      ? "bg-[#9b0f09] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Projects</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "projects"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {state.projectsTotal}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("leads")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "leads"
                      ? "bg-[#9b0f09] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Leads</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "leads"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {state.leadsTotal}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("inquiries")}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    activeTab === "inquiries"
                      ? "bg-[#9b0f09] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Inquiries</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeTab === "inquiries"
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {state.inquiriesTotal}
                  </span>
                </button>
              </div>
            </div>

            {/* ── TAB 1: PROPERTIES ── */}
            {activeTab === "properties" && (
              <div className="space-y-4">
                {/* Search & Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search developer properties..."
                      value={state.propertiesSearch}
                      onChange={(e) => setState({ propertiesSearch: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#9b0f09] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Status Filter */}
                    <select
                      value={state.propertiesPublishFilter}
                      onChange={(e) => setState({ propertiesPublishFilter: e.target.value })}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#9b0f09] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>

                    {/* Listing Type Filter */}
                    <select
                      value={state.propertiesListingType}
                      onChange={(e) => setState({ propertiesListingType: e.target.value })}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition focus:border-[#9b0f09] focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <option value="all">All Offers</option>
                      <option value="sale">For Sale</option>
                      <option value="lease">For Lease</option>
                      <option value="rent">For Rent</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="datatables pagination-padding">
                  <DataTable
                    className="table-hover whitespace-nowrap"
                    records={state.propertiesList}
                    columns={[
                      {
                        accessor: "title",
                        title: "Property Name",
                        render: (row: any) => (
                          <div className="flex items-center gap-3">
                            {row?.primary_image ? (
                              <img
                                src={row.primary_image}
                                alt={row?.title || "Property"}
                                className="h-10 w-14 shrink-0 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                              />
                            ) : (
                              <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#9b0f09] dark:bg-red-950/40">
                                <Home className="h-4 w-4" />
                              </div>
                            )}
                            <div>
                              <Link
                                href={`/real-estate/property/detail/${row.id}`}
                                className="font-semibold text-gray-900 transition hover:text-[#9b0f09] dark:text-white"
                                title={row?.title}
                              >
                                {truncateText(row?.title || "Untitled Property", 30)}
                              </Link>
                              {row?.project?.name && (
                                <p className="text-xs text-gray-400">
                                  {row.project.name}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      },
                      {
                        accessor: "property_type",
                        title: "Type",
                        render: (row: any) => (
                          <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {Array.isArray(row?.property_type)
                              ? row.property_type.map((t: any) => t.name).join(", ")
                              : row?.property_type?.name || "—"}
                          </span>
                        ),
                      },
                      {
                        accessor: "listing_type",
                        title: "Offer",
                        render: (row: any) => (
                          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                            {capitalizeFLetter(row?.listing_type || "—")}
                          </span>
                        ),
                      },
                      {
                        accessor: "price",
                        title: "Price",
                        render: (row: any) => (
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {row?.minimum_price || row?.price_range?.minimum_price
                              ? formatPriceRange(
                                  row?.minimum_price || row?.price_range?.minimum_price,
                                  row?.maximum_price || row?.price_range?.maximum_price
                                )
                              : row?.price
                              ? formatToINR(row.price)
                              : "—"}
                          </span>
                        ),
                      },
                      {
                        accessor: "city",
                        title: "Location",
                        render: (row: any) => (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                            <span>
                              {row?.location?.name || row?.city?.name || row?.city || "—"}
                            </span>
                          </div>
                        ),
                      },
                      {
                        accessor: "publish",
                        title: "Status",
                        render: (row: any) => (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row?.publish
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {row?.publish ? "Published" : "Draft"}
                          </span>
                        ),
                      },
                      {
                        accessor: "action",
                        title: "Action",
                        textAlignment: "center",
                        render: (row: any) => (
                          <Link
                            href={`/real-estate/property/detail/${row.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#9b0f09] hover:bg-[#9b0f09] hover:text-white dark:border-gray-700 dark:text-gray-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
                        ),
                      },
                    ]}
                    highlightOnHover
                    minHeight={200}
                    fetching={state.propertiesLoading}
                    noRecordsText="No properties found for this developer"
                  />
                </div>

                {/* Pagination */}
                {state.propertiesTotal > 10 && (
                  <div className="flex justify-end pt-3">
                    <Paginations
                      totalPage={state.propertiesTotal}
                      currentPages={state.propertiesPage}
                      activeNumber={(p: number) => fetchProperties(p)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: PROJECTS ── */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="flex items-center justify-between gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search developer projects..."
                      value={state.projectsSearch}
                      onChange={(e) => setState({ projectsSearch: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#9b0f09] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="datatables pagination-padding">
                  <DataTable
                    className="table-hover whitespace-nowrap"
                    records={state.projectsList}
                    columns={[
                      {
                        accessor: "name",
                        title: "Project Name",
                        render: (row: any) => (
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div>
                              <Link
                                href={`/real-estate/project/view/${row.id}`}
                                className="font-semibold text-gray-900 transition hover:text-[#9b0f09] dark:text-white"
                              >
                                {row.name}
                              </Link>
                              {row.description && (
                                <p className="text-xs text-gray-400">
                                  {truncateText(row.description, 40)}
                                </p>
                              )}
                            </div>
                          </div>
                        ),
                      },
                      {
                        accessor: "location",
                        title: "Location",
                        render: (row: any) => (
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <MapPin className="h-3.5 w-3.5 text-blue-500" />
                            <span>
                              {row?.location?.name || row?.city || "—"}
                              {row?.area?.name ? `, ${row.area.name}` : ""}
                            </span>
                          </div>
                        ),
                      },
                      {
                        accessor: "properties",
                        title: "Properties",
                        render: (row: any) => (
                          <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                            {row?.property_count ?? row?.properties ?? 0} Properties
                          </span>
                        ),
                      },
                      {
                        accessor: "status",
                        title: "Status",
                        render: (row: any) => (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            {capitalizeFLetter(row?.status || "Active")}
                          </span>
                        ),
                      },
                      {
                        accessor: "created_at",
                        title: "Created Date",
                        render: (row: any) => (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {commonDateFormat(row?.created_at)}
                          </span>
                        ),
                      },
                      {
                        accessor: "action",
                        title: "Action",
                        textAlignment: "center",
                        render: (row: any) => (
                          <Link
                            href={`/real-estate/project/view/${row.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#9b0f09] hover:bg-[#9b0f09] hover:text-white dark:border-gray-700 dark:text-gray-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
                        ),
                      },
                    ]}
                    highlightOnHover
                    minHeight={200}
                    fetching={state.projectsLoading}
                    noRecordsText="No projects found for this developer"
                  />
                </div>

                {/* Pagination */}
                {state.projectsTotal > 10 && (
                  <div className="flex justify-end pt-3">
                    <Paginations
                      totalPage={state.projectsTotal}
                      currentPages={state.projectsPage}
                      activeNumber={(p: number) => fetchProjects(p)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: LEADS ── */}
            {activeTab === "leads" && (
              <div className="space-y-4">
                {/* Search & Status Pill Filters */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search leads by customer name..."
                      value={state.leadsSearch}
                      onChange={(e) => setState({ leadsSearch: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#9b0f09] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {["all", "Won", "Contacted", "Follow Up", "Lose"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setState({ leadsStatusFilter: status })}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          state.leadsStatusFilter === status
                            ? "bg-[#9b0f09] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {status === "all" ? "All Leads" : status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table */}
                <div className="datatables pagination-padding">
                  <DataTable
                    className="table-hover whitespace-nowrap"
                    records={state.leadsList}
                    columns={[
                      {
                        accessor: "customer_name",
                        title: "Lead Customer",
                        render: (row: any) => (
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              {row?.customer_name?.charAt(0)?.toUpperCase() || "L"}
                            </div>
                            <div>
                              <Link
                                href={`/real-estate/lead/view/${row.id}`}
                                className="font-semibold text-gray-900 transition hover:text-[#9b0f09] dark:text-white"
                              >
                                {row.customer_name}
                              </Link>
                              <p className="text-xs text-gray-400">{row.email}</p>
                            </div>
                          </div>
                        ),
                      },
                      {
                        accessor: "property",
                        title: "Interested Property",
                        render: (row: any) => (
                          <div>
                            {row?.property_id ? (
                              <Link
                                href={`/real-estate/property/detail/${row.property_id}`}
                                className="font-medium text-[#9b0f09] hover:underline"
                              >
                                {truncateText(row.property_title, 25)}
                              </Link>
                            ) : (
                              <span className="text-gray-600">{row.property_title}</span>
                            )}
                            {row.project_name !== "—" && (
                              <p className="text-xs text-gray-400">{row.project_name}</p>
                            )}
                          </div>
                        ),
                      },
                      {
                        accessor: "lead_source",
                        title: "Lead Source",
                        render: (row: any) => (
                          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {row.lead_source}
                          </span>
                        ),
                      },
                      {
                        accessor: "status",
                        title: "Status",
                        render: (row: any) => (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row?.status?.toLowerCase() === "won"
                                ? "bg-emerald-50 text-emerald-700"
                                : row?.status?.toLowerCase() === "lose"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {capitalizeFLetter(row.status)}
                          </span>
                        ),
                      },
                      {
                        accessor: "created_at",
                        title: "Date",
                        render: (row: any) => (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {commonDateFormat(row?.created_at)}
                          </span>
                        ),
                      },
                      {
                        accessor: "action",
                        title: "Action",
                        textAlignment: "center",
                        render: (row: any) => (
                          <Link
                            href={`/real-estate/lead/view/${row.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:border-[#9b0f09] hover:bg-[#9b0f09] hover:text-white dark:border-gray-700 dark:text-gray-300"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </Link>
                        ),
                      },
                    ]}
                    highlightOnHover
                    minHeight={200}
                    fetching={state.leadsLoading}
                    noRecordsText="No leads found for this developer"
                  />
                </div>

                {/* Pagination */}
                {state.leadsTotal > 10 && (
                  <div className="flex justify-end pt-3">
                    <Paginations
                      totalPage={state.leadsTotal}
                      currentPages={state.leadsPage}
                      activeNumber={(p: number) => fetchLeads(p)}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: INQUIRIES ── */}
            {activeTab === "inquiries" && (
              <div className="space-y-4">
                {/* Inquiry Type Sub-toggle + Search */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                    <button
                      type="button"
                      onClick={() => setInquiryType("booking")}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        inquiryType === "booking"
                          ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      Booking Inquiries
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryType("callback")}
                      className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                        inquiryType === "callback"
                          ? "bg-white text-gray-900 shadow-sm dark:bg-gray-900 dark:text-white"
                          : "text-gray-500 hover:text-gray-800 dark:text-gray-400"
                      }`}
                    >
                      Callback Requests
                    </button>
                  </div>

                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search inquiries..."
                      value={state.inquiriesSearch}
                      onChange={(e) => setState({ inquiriesSearch: e.target.value })}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#9b0f09] focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="datatables pagination-padding">
                  <DataTable
                    className="table-hover whitespace-nowrap"
                    records={state.inquiriesList}
                    columns={[
                      {
                        accessor: "customer_name",
                        title: "Client Name",
                        render: (row: any) => (
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {row.customer_name}
                            </p>
                            <p className="text-xs text-gray-400">{row.email}</p>
                          </div>
                        ),
                      },
                      {
                        accessor: "phone",
                        title: "Phone",
                        render: (row: any) => (
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            {formatPhoneNumber(row.phone)}
                          </span>
                        ),
                      },
                      {
                        accessor: "property_title",
                        title: "Property",
                        render: (row: any) => (
                          <div>
                            <span className="font-medium text-[#9b0f09]">
                              {truncateText(row.property_title, 25)}
                            </span>
                            {row.project_name !== "—" && (
                              <p className="text-xs text-gray-400">{row.project_name}</p>
                            )}
                          </div>
                        ),
                      },
                      {
                        accessor: "date",
                        title: "Requested On",
                        render: (row: any) => (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {commonDateFormat(row.preferred_date || row.created_at)}
                          </span>
                        ),
                      },
                      {
                        accessor: "status",
                        title: "Status",
                        render: (row: any) => (
                          <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                            {capitalizeFLetter(row.status)}
                          </span>
                        ),
                      },
                      {
                        accessor: "message",
                        title: "Message / Note",
                        render: (row: any) => (
                          <span className="text-xs text-gray-500" title={row.message}>
                            {truncateText(row.message, 35)}
                          </span>
                        ),
                      },
                    ]}
                    highlightOnHover
                    minHeight={200}
                    fetching={state.inquiriesLoading}
                    noRecordsText="No inquiries received for this developer's properties"
                  />
                </div>

                {/* Pagination */}
                {state.inquiriesTotal > 10 && (
                  <div className="flex justify-end pt-3">
                    <Paginations
                      totalPage={state.inquiriesTotal}
                      currentPages={state.inquiriesPage}
                      activeNumber={(p: number) => fetchInquiries(p)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateRouter(DeveloperDetailView);
