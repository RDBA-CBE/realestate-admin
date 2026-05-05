import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import IconUser from "@/components/Icon/IconUser";
import IconMapPin from "@/components/Icon/IconMapPin";
import { DataTable } from "mantine-datatable";
import { ArrowLeft, Eye } from "lucide-react";
import {
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  formatPriceRange,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import PrivateRouter from "@/hook/privateRouter";

const InfoRow = ({ label, value }: { label: string; value: any }) => (
  <div className="flex flex-col p-2">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-[15px] font-medium text-gray-800 dark:text-white">
      {value || "-"}
    </div>
  </div>
);

const SectionHeader = ({ color, iconColor, title }: any) => (
  <div className="flex items-center gap-3 mb-4">
    <div
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full`}
      style={{ background: color }}
    >
      <IconUser style={{ color: iconColor }} />
    </div>
    <div className="text-[18px] font-semibold dark:text-white">{title}</div>
  </div>
);

const UserView = () => {
  const router = useRouter();
  const id = router?.query?.id;

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
  const profile = user?.profile;

  const wishlistColumns = [
    {
      accessor: "property_title",
      title: "Property",
      render: (row: any) => (
        <span
          className="cursor-pointer font-medium text-dred"
          onClick={() => router.push(`/real-estate/property/detail/${row?.property?.id || row?.id}`)}
        >
          {truncateText(row?.property?.title || row?.title, 20)}
        </span>
      ),
    },
    {
      accessor: "property_type",
      title: "Type",
      render: (row: any) => (
        <span>{capitalizeFLetter(row?.property?.listing_type || row?.listing_type || "-")}</span>
      ),
    },
    {
      accessor: "location",
      title: "Location",
      render: (row: any) => (
        <span>{capitalizeFLetter(row?.property?.city || row?.city || "-")}</span>
      ),
    },
    {
      accessor: "added_on",
      title: "Saved On",
      render: (row: any) => <span>{commonDateFormat(row?.created_at)}</span>,
    },
    {
      accessor: "action",
      title: "Action",
      render: (row: any) => (
        <button
          className="text-dred"
          onClick={() => router.push(`/real-estate/property/detail/${row?.property?.id || row?.id}`)}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const enquiryColumns = [
    {
      accessor: "property",
      title: "Property",
      render: (row: any) => (
        <span
          className="cursor-pointer font-medium text-dred"
          onClick={() => router.push(`/real-estate/property/detail/${row?.property_details?.id}`)}
        >
          {truncateText(row?.property_details?.title || "-", 20)}
        </span>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (row: any) => (
        <span className="badge badge-outline-primary">
          {capitalizeFLetter(row?.status_info?.name || "-")}
        </span>
      ),
    },
    {
      accessor: "lead_source",
      title: "Source",
      render: (row: any) => <span>{capitalizeFLetter(row?.lead_source_info?.name || "-")}</span>,
    },
    {
      accessor: "created_at",
      title: "Date",
      render: (row: any) => <span>{commonDateFormat(row?.created_at)}</span>,
    },
    {
      accessor: "action",
      title: "Action",
      render: (row: any) => (
        <button
          className="text-dred"
          onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="relative h-auto space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div>
            <h5 className="text-lg font-semibold dark:text-white-light">User Details</h5>
            <p className="text-sm text-gray-500">View user profile and activity</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              user?.account_status === "approved"
                ? "bg-green-100 text-green-700"
                : user?.account_status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {capitalizeFLetter(user?.account_status || "")}
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            {user?.primary_group || user?.user_type || "-"}
          </span>
        </div>
      </div>

      {/* User Info Panel */}
      <div className="panel rounded-xl border shadow-none">
        <div className="flex flex-wrap gap-6">
          {/* Avatar + basic */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#deffd7] text-2xl font-bold text-[#4caf50]">
              {user?.first_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="text-xl font-semibold dark:text-white">
                {`${capitalizeFLetter(user?.first_name)} ${user?.last_name || ""}`}
              </div>
              <div className="text-sm text-gray-500">{user?.email}</div>
              <div className="text-sm text-gray-500">{formatPhoneNumber(user?.phone)}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 md:grid-cols-2">
          {/* Contact Info */}
          <div>
            <SectionHeader color="#ffeeee" iconColor="#fe70f2" title="Contact Information" />
            <InfoRow label="Full Name" value={`${capitalizeFLetter(user?.first_name)} ${user?.last_name || ""}`} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Phone" value={formatPhoneNumber(user?.phone)} />
            <InfoRow label="Address" value={user?.address} />
            <InfoRow label="Location" value={user?.location} />
          </div>

          {/* Account Info */}
          {/* <div>
            <SectionHeader color="#e8f4ff" iconColor="#3b82f6" title="Account Information" />
            <InfoRow label="User Type" value={capitalizeFLetter(user?.user_type)} /> 
           <InfoRow label="Account Status" value={capitalizeFLetter(user?.account_status)} /> 
            <InfoRow
              label="Email Verified"
              value={user?.is_email_verified ? "Yes" : "No"}
            />
            <InfoRow
              label="Can Access Platform"
              value={user?.can_access_platform ? "Yes" : "No"}
            />
            <InfoRow label="Joined On" value={commonDateFormat(user?.created_at)} />
          </div> */}

          {/* Buyer Preferences */}
          <div>
            <SectionHeader color="#fff8e1" iconColor="#f59e0b" title="Buyer Preferences" />
            <InfoRow
              label="Interested In Buying"
              value={profile?.interested_in_buying ? "Yes" : "No"}
            />
            <InfoRow
              label="Interested In Renting"
              value={profile?.interested_in_renting ? "Yes" : "No"}
            />
            <InfoRow
              label="Budget"
              value={
                profile?.budget_min || profile?.budget_max
                  ? formatPriceRange(profile?.budget_min, profile?.budget_max)
                  : null
              }
            />
            <InfoRow
              label="Min Bedrooms"
              value={profile?.min_bedrooms}
            />
            <InfoRow
              label="Preferred Location"
              value={profile?.preferred_location}
            />
            <InfoRow
              label="Profile Completion"
              value={profile?.profile_completion_percentage != null ? `${profile.profile_completion_percentage}%` : null}
            />
          </div>
        </div>

        {/* Notification Preferences */}
        {/* <div className="mt-4 flex flex-wrap gap-3 border-t pt-4">
          <span className="text-sm text-gray-500 font-medium">Notifications:</span>
          {[
            { label: "Email", value: profile?.email_notifications },
            { label: "SMS", value: profile?.sms_notifications },
            { label: "Call", value: profile?.call_notifications },
          ].map((n) => (
            <span
              key={n.label}
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                n.value ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {n.label}: {n.value ? "On" : "Off"}
            </span>
          ))}
        </div> */}
      </div>
      <div className="panel rounded-xl border shadow-none">
        <div className="mb-4 flex items-center gap-3">
          <SectionHeader color="#ffeeee" iconColor="#fe70f2" title="Enquired Properties" />
          <span className="flex h-5 w-6 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white">
            {state.enquiries?.length || 0}
          </span>
        </div>
        <div className="datatables">
          <DataTable
            className="table-responsive"
            records={state.enquiries}
            columns={enquiryColumns}
            highlightOnHover
            minHeight={150}
            noRecordsText="No enquiries found"
          />
        </div>
      </div>

      {/* Saved Properties (Wishlist) */}
      <div className="panel rounded-xl border shadow-none">
        <div className="mb-4 flex items-center gap-3">
          <SectionHeader color="#deffd7" iconColor="#4caf50" title="Saved Properties" />
          <span className="flex h-5 w-6 items-center justify-center rounded-sm bg-primary text-xs font-bold text-white">
            {state.wishlist?.length || 0}
          </span>
        </div>
        <div className="datatables">
          <DataTable
            className="table-responsive"
            records={state.wishlist}
            columns={wishlistColumns}
            highlightOnHover
            minHeight={150}
            noRecordsText="No saved properties"
          />
        </div>
      </div>

      {/* Enquiry Properties */}
     
    </div>
  );
};

export default PrivateRouter(UserView);
