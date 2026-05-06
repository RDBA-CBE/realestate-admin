import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import { DataTable } from "mantine-datatable";
import {
  ArrowLeft, Eye, Mail, Phone, MapPin, Calendar,
  Building2, Heart, MessageSquare, CheckCircle,
  XCircle, Clock, Star, TrendingUp, Home,
} from "lucide-react";
import {
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import PrivateRouter from "@/hook/privateRouter";
import { RotatingLines } from "react-loader-spinner";

const UserView = () => {
  const router = useRouter();
  const id = router?.query?.id;
  const [activeTab, setActiveTab] = useState("enquiries");

  const [state, setState] = useSetState({
    loading: false,
    user: null as any,
    wishlist: [],
    enquiries: [],
  });

  useEffect(() => {
    if (id) {
      getUserDetails();
      getWishlist();
      getEnquiries();
    }
  }, [id]);

  const getUserDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.user.details(id);
      setState({ user: res, loading: false });
    } catch {
      setState({ loading: false });
    }
  };

  const getWishlist = async () => {
    try {
      const res: any = await Models.user.wishlist(id);
      setState({ wishlist: res?.results || res || [] });
    } catch {}
  };

  const getEnquiries = async () => {
    try {
      const res: any = await Models.user.enquiries(id);
      setState({ enquiries: res?.results || res || [] });
    } catch {}
  };

  const { user } = state;

  const wishlistColumns = [
    {
      accessor: "property_title",
      title: "Property",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fdf4f4]">
            <Home className="h-4 w-4 text-[#9b0f09]" />
          </div>
          <span className="cursor-pointer font-medium text-[#9b0f09] hover:underline"
            onClick={() => router.push(`/real-estate/property/detail/${row?.property?.id || row?.id}`)}>
            {truncateText(row?.property?.title || row?.title, 25)}
          </span>
        </div>
      ),
    },
    {
      accessor: "property_type",
      title: "Type",
      render: (row: any) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {capitalizeFLetter(row?.property?.listing_type || row?.listing_type || "-")}
        </span>
      ),
    },
    {
      accessor: "location",
      title: "Location",
      render: (row: any) => (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          {capitalizeFLetter(row?.property?.city || row?.city || "-")}
        </div>
      ),
    },
    {
      accessor: "added_on",
      title: "Saved On",
      render: (row: any) => <span className="text-sm text-gray-500">{commonDateFormat(row?.created_at)}</span>,
    },
    {
      accessor: "action",
      title: "",
      textAlignment: "center" as any,
      render: (row: any) => (
        <button className="rounded-lg border border-[#9b0f09] px-3 py-1 text-xs font-semibold text-[#9b0f09] transition hover:bg-[#9b0f09] hover:text-white"
          onClick={() => router.push(`/real-estate/property/detail/${row?.property?.id || row?.id}`)}>
          View
        </button>
      ),
    },
  ];

  const enquiryColumns = [
    {
      accessor: "property",
      title: "Property",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fdf4f4]">
            <Home className="h-4 w-4 text-[#9b0f09]" />
          </div>
          <span className="cursor-pointer font-medium text-[#9b0f09] hover:underline"
            onClick={() => router.push(`/real-estate/property/detail/${row?.property_details?.id}`)}>
            {truncateText(row?.property_details?.title || "-", 25)}
          </span>
        </div>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (row: any) => (
        <span className="rounded-full bg-[#fdf4f4] px-2.5 py-0.5 text-xs font-semibold text-[#9b0f09]">
          {capitalizeFLetter(row?.status_info?.name || "-")}
        </span>
      ),
    },
    {
      accessor: "lead_source",
      title: "Source",
      render: (row: any) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
          {capitalizeFLetter(row?.lead_source_info?.name || "-")}
        </span>
      ),
    },
    {
      accessor: "created_at",
      title: "Date",
      render: (row: any) => <span className="text-sm text-gray-500">{commonDateFormat(row?.created_at)}</span>,
    },
    {
      accessor: "action",
      title: "",
      textAlignment: "center" as any,
      render: (row: any) => (
        <button className="rounded-lg border border-[#9b0f09] px-3 py-1 text-xs font-semibold text-[#9b0f09] transition hover:bg-[#9b0f09] hover:text-white"
          onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}>
          View
        </button>
      ),
    },
  ];

  if (state.loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <RotatingLines visible strokeColor="#9b0f09" strokeWidth="5" animationDuration="0.75" width="40" ariaLabel="loading" />
      </div>
    );
  }

  const statusColor = user?.account_status === "approved"
    ? { bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle className="h-3.5 w-3.5" /> }
    : user?.account_status === "rejected"
    ? { bg: "bg-red-100", text: "text-red-700", icon: <XCircle className="h-3.5 w-3.5" /> }
    : { bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="h-3.5 w-3.5" /> };

  return (
    <div className="space-y-5">

      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()}
          className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-[#9b0f09] hover:text-[#9b0f09]">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="h-4 w-px bg-gray-200" />
        <span className="text-sm text-gray-400">Users</span>
        <span className="text-sm text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{capitalizeFLetter(user?.first_name)} {user?.last_name}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">

        {/* ── Left Column ── */}
        <div className="space-y-4 lg:col-span-1">

          {/* Profile Card */}
          <div className="panel overflow-hidden rounded-2xl p-0 shadow-sm">
            
            {/* Avatar */}
            <div className="flex flex-col items-center px-5 pb-5">
              <div className="mt-3 mb-3 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-[#7d0c07] text-3xl font-bold text-white shadow-lg">
                {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {capitalizeFLetter(user?.first_name)} {user?.last_name || ""}
              </h2>
              <p className="mt-0.5 text-sm text-gray-400">{user?.email}</p>
              <div className="mt-3 flex items-center gap-2">
                <span className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusColor.bg} ${statusColor.text}`}>
                  {statusColor.icon}
                  {capitalizeFLetter(user?.account_status || "")}
                </span>
                <span className="rounded-full bg-[#fdf4f4] px-3 py-1 text-xs font-semibold text-[#9b0f09]">
                  {capitalizeFLetter(user?.primary_group || user?.user_type || "-")}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 divide-x border-t">
              <div className="flex flex-col items-center py-4">
                <p className="text-2xl font-bold text-[#9b0f09]">{state.enquiries?.length || 0}</p>
                <p className="mt-0.5 text-xs text-gray-400">Enquiries</p>
              </div>
              <div className="flex flex-col items-center py-4">
                <p className="text-2xl font-bold text-[#9b0f09]">{state.wishlist?.length || 0}</p>
                <p className="mt-0.5 text-xs text-gray-400">Saved</p>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="panel rounded-2xl shadow-sm">
            <h6 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Contact Info</h6>
            <div className="space-y-3">
              {[
                { icon: <Mail className="h-4 w-4" />, label: "Email", value: user?.email },
                { icon: <Phone className="h-4 w-4" />, label: "Phone", value: formatPhoneNumber(user?.phone) },
                { icon: <MapPin className="h-4 w-4" />, label: "Location", value: user?.location || user?.address },
                { icon: <Building2 className="h-4 w-4" />, label: "Industry", value: user?.industry },
                { icon: <Calendar className="h-4 w-4" />, label: "Joined", value: commonDateFormat(user?.created_at) },
              ].filter(i => i.value).map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fdf4f4] text-[#9b0f09]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info Card */}
          <div className="panel rounded-2xl shadow-sm">
            <h6 className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-400">Account</h6>
            <div className="space-y-2">
              {[
                { label: "User Type", value: capitalizeFLetter(user?.user_type) },
                { label: "Email Verified", value: user?.is_email_verified ? "Yes" : "No" },
                { label: "Industry Year", value: user?.industry_start_year },
              ].filter(i => i.value).map((item, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-800 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="lg:col-span-3">
          <div className="panel rounded-2xl shadow-sm">
            {/* Tabs */}
            <div className="mb-5 flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab("enquiries")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "enquiries" ? "border-[#9b0f09] text-[#9b0f09]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Enquiries
                {state.enquiries?.length > 0 && (
                  <span className="rounded-full bg-[#9b0f09] px-1.5 py-0.5 text-[10px] font-bold text-white">{state.enquiries.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === "wishlist" ? "border-[#9b0f09] text-[#9b0f09]" : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Heart className="h-4 w-4" />
                Saved Properties
                {state.wishlist?.length > 0 && (
                  <span className="rounded-full bg-[#9b0f09] px-1.5 py-0.5 text-[10px] font-bold text-white">{state.wishlist.length}</span>
                )}
              </button>
            </div>

            {activeTab === "enquiries" && (
              <DataTable
                className="table-hover whitespace-nowrap"
                records={state.enquiries}
                columns={enquiryColumns}
                highlightOnHover
                minHeight={200}
                noRecordsText="No enquiries found"
              />
            )}

            {activeTab === "wishlist" && (
              <DataTable
                className="table-hover whitespace-nowrap"
                records={state.wishlist}
                columns={wishlistColumns}
                highlightOnHover
                minHeight={200}
                noRecordsText="No saved properties"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivateRouter(UserView);
