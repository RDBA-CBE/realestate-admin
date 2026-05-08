"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  formatPriceRange,
  useSetState,
} from "@/utils/function.utils";
import { DataTable } from "mantine-datatable";
import { Eye, ArrowLeft, User, Phone, Mail, MapPin, Building2, Calendar, CreditCard, Briefcase, Users, FileText, Activity } from "lucide-react";
import { LISTING_TYPE_LIST } from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import ReadMore from "@/components/readMore";
import LogCard from "@/components/logCard";
import { truncateText } from "@/utils/function.utils";
import { sourceConfig, statusConfig } from "@/utils/constant.utils";

const View_opportunity = () => {
  const router = useRouter();
  const id = router?.query?.id;

  const [state, setState] = useSetState({
    loading: false,
    detail: {},
    tableList: [],
    logList: [],
    isOpenLog: false,
  });

  useEffect(() => {
    if (id) {
      getDetails();
      getLogList();
    }
  }, [id]);

  useEffect(() => {
    getLogList();
  }, [state.date_from, state.action, state.date_to]);

  const getDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.lead.details(id);

      if (res?.properties_details?.length > 0) {
        const data = res.properties_details.map((item) => ({
          title: capitalizeFLetter(item?.title),
          status: capitalizeFLetter(item?.status),
          id: item?.id,
          total_area: item?.total_area,
          property_type: item?.property_type?.map((pt) => capitalizeFLetter(pt?.name)) || [],
          listing_type: {
            type: capitalizeFLetter(item?.listing_type),
            color:
              item?.listing_type == LISTING_TYPE_LIST.RENT ? "warning"
              : item?.listing_type == LISTING_TYPE_LIST.SALE ? "secondary"
              : item?.listing_type == LISTING_TYPE_LIST.LEASE ? "info"
              : "success",
          },
          date: commonDateFormat(item?.created_at),
          location: capitalizeFLetter(item?.city),
          developer: `${capitalizeFLetter(item?.developer?.first_name)} ${capitalizeFLetter(item?.developer?.last_name)}`,
          project: capitalizeFLetter(item?.project?.name),
          price: formatPriceRange(item?.price_range?.minimum_price, item?.price_range?.maximum_price),
          publish: item?.publish === true ? "Published" : "Draft",
          is_approved: item?.is_approved,
          image: item?.primary_image ?? "/assets/images/real-estate/property-info-img1.png",
        }));
        setState({ tableList: data });
      } else {
        setState({ tableList: [] });
      }

      setState({ detail: res, loading: false });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const getLogList = async () => {
    try {
      const body: any = {};
      if (state.action) body.action = state.action.value;
      if (state.date_from) body.date_from = backendDateFormat(state.date_from);
      if (state.date_to) body.date_to = backendDateFormat(state.date_to);
      const res: any = await Models.lead.logList(id, body);
      setState({ logList: res?.results, logCount: res.count });
    } catch (error) {}
  };

  const handleView = (row) => router.push(`/real-estate/property/detail/${row?.id}`);

  const d = state.detail;

  const StatusOptions = [
    { value: "created", label: "Lead Created" },
    { value: "updated", label: "Lead Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "assigned", label: "Lead Assigned" },
    { value: "contacted", label: "Lead Contacted" },
    { value: "note_added", label: "Note Added" },
  ];

  const propertyColumns = [
    {
      accessor: "title",
      title: "Property",
      render: (row) => (
        <div onClick={() => handleView(row)} className="cursor-pointer font-semibold text-[#9b0f09] hover:underline">
          {truncateText(row.title, 20)}
        </div>
      ),
    },
    {
      accessor: "project",
      title: "Project",
      render: (row) => <span title={row.project}>{truncateText(row.project, 15)}</span>,
    },
    {
      accessor: "property_type",
      title: "Type",
      render: (row: any) => (
        <span className="text-sm text-gray-600">{row.property_type?.join(", ") || "-"}</span>
      ),
    },
    {
      accessor: "role",
      title: "Offer",
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color}`}>{row?.listing_type?.type}</span>
      ),
    },
    {
      accessor: "price",
      title: "Price",
      render: (row) => <span className="font-semibold text-[#9b0f09]">{row.price}</span>,
    },
    {
      accessor: "publish",
      title: "Status",
      render: (row: any) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${row?.publish === "Published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
          {row?.publish}
        </span>
      ),
    },
    {
      accessor: "is_approved",
      title: "Approved",
      render: (row: any) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${row?.is_approved ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
          {row?.is_approved ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      accessor: "action",
      title: "",
      render: (row: any) => (
        <button className="text-[#9b0f09]" onClick={() => handleView(row)}>
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const InfoItem = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-white">{value || "-"}</span>
    </div>
  );

  const SectionHeader = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="mb-4 flex items-center gap-2">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}>{icon}</div>
      <h6 className="text-base font-bold text-gray-800 dark:text-white">{title}</h6>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h5 className="text-xl font-bold dark:text-white-light">Lead Details</h5>
          <p className="text-sm text-gray-500">#{id} · {commonDateFormat(d?.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          {d?.status_info && (
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${statusConfig?.[d?.status_info?.name] ?? "bg-gray-100 text-gray-600"}`}>
              {d?.status_info?.name}
            </span>
          )}
          {d?.priority && (
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              d.priority === "high" ? "bg-red-100 text-red-700"
              : d.priority === "medium" ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
            }`}>
              {capitalizeFLetter(d.priority)} Priority
            </span>
          )}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      {/* Top Row: Lead Info + Contact + Assignment */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

        {/* Lead Information */}
        <div className="panel rounded-xl">
          <SectionHeader icon={<FileText className="h-4 w-4 text-[#9b0f09]" />} title="Lead Information" color="bg-[#9b0f09]/10" />
          <div className="space-y-3">
            <InfoItem label="Lead Source" value={d?.lead_source_info?.name} />
            <InfoItem label="Next Follow Up" value={commonDateFormat(d?.next_follow_up)} />
            <InfoItem label="Preferred Location" value={d?.preferred_location || d?.location_details?.name} />
            <InfoItem label="Area" value={d?.area_details?.name} />
            {d?.budget_min || d?.budget_max ? (
              <InfoItem label="Budget" value={formatPriceRange(d?.budget_min, d?.budget_max)} />
            ) : null}
            {d?.requirements && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Requirements</span>
                <ReadMore className="text-sm font-semibold text-gray-800">{d?.requirements}</ReadMore>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="panel rounded-xl">
          <SectionHeader icon={<User className="h-4 w-4 text-blue-600" />} title="Contact Information" color="bg-blue-100" />
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#9b0f09]/10 text-base font-bold text-[#9b0f09]">
              {d?.first_name?.[0]}{d?.last_name?.[0]}
            </div>
            <div>
              <p className="text-base font-bold text-gray-800 dark:text-white">{capitalizeFLetter(d?.first_name)} {d?.last_name}</p>
              <p className="text-xs text-gray-500">{d?.email}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-[#9b0f09]" />
              {formatPhoneNumber(d?.phone) || "-"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3.5 w-3.5 shrink-0 text-[#9b0f09]" />
              {d?.email || "-"}
            </div>
            <InfoItem label="Gender" value={capitalizeFLetter(d?.gender)} />
            <InfoItem label="Location" value={d?.location_details?.name} />
            <InfoItem label="Area" value={d?.area_details?.name} />
          </div>
        </div>

        {/* Assignment Info */}
        <div className="panel rounded-xl">
          <SectionHeader icon={<Users className="h-4 w-4 text-purple-600" />} title="Assignment" color="bg-purple-100" />
          <div className="space-y-4">
            {d?.assigned_to_details && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Assigned To</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                    {d.assigned_to_details.first_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{d.assigned_to_details.first_name} {d.assigned_to_details.last_name}</p>
                    <p className="text-xs text-gray-500">{d.assigned_to_details.email}</p>
                  </div>
                </div>
              </div>
            )}
            {d?.assigned_by_details && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Assigned By</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                    {d.assigned_by_details.first_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{d.assigned_by_details.first_name} {d.assigned_by_details.last_name}</p>
                    <p className="text-xs text-gray-500">{d.assigned_by_details.email}</p>
                  </div>
                </div>
              </div>
            )}
            <InfoItem label="Assigned At" value={commonDateFormat(d?.assigned_at)} />
            <InfoItem label="Created By" value={d?.created_by} />
          </div>
        </div>
      </div>

      {/* Second Row: More Info + Alternate Contact */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* More Info */}
        <div className="panel rounded-xl">
          <SectionHeader icon={<CreditCard className="h-4 w-4 text-amber-600" />} title="More Info" color="bg-amber-100" />
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Employment Type" value={d?.employment_type ?? "-"} />
            <InfoItem label="Bank Loan" value={d?.bank_loan === true ? "Yes" : d?.bank_loan === false ? "No" : "-"} />
            <InfoItem label="Bank Name" value={d?.bank_name} />
            <InfoItem label="Bank Branch" value={d?.bank_branch} />
            <InfoItem label="Bank Account No" value={d?.bank_account_no} />
          </div>
        </div>

        {/* Alternate Contact */}
        {(d?.alternate_first_name || d?.alternate_phone_number || d?.alternate_email) && (
          <div className="panel rounded-xl">
            <SectionHeader icon={<Phone className="h-4 w-4 text-green-600" />} title="Alternate Contact" color="bg-green-100" />
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                {d?.alternate_first_name?.[0]}{d?.alternate_last_name?.[0]}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">{capitalizeFLetter(d?.alternate_first_name)} {d?.alternate_last_name}</p>
                <p className="text-xs text-gray-500">{d?.alternate_email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Phone" value={formatPhoneNumber(d?.alternate_phone_number)} />
              <InfoItem label="Gender" value={capitalizeFLetter(d?.alternate_gender)} />
            </div>
          </div>
        )}
      </div>

      {/* Properties Table */}
      <div className="panel rounded-xl">
        <SectionHeader icon={<Building2 className="h-4 w-4 text-[#9b0f09]" />} title="Interested Properties" color="bg-[#9b0f09]/10" />
        <div className="datatables">
          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={propertyColumns}
            highlightOnHover
            minHeight={150}
          />
        </div>
      </div>

      {/* Log History */}
      <div className="panel rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => setState({ isOpenLog: !state.isOpenLog })}
          >
            <SectionHeader icon={<Activity className="h-4 w-4 text-indigo-600" />} title="Log History" color="bg-indigo-100" />
            {state.logCount > 0 && (
              <span className="ml-1 flex h-5 w-6 items-center justify-center rounded bg-[#9b0f09] text-xs font-bold text-white">
                {state.logCount}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-40">
              <CustomeDatePicker value={state.date_from} placeholder="From Date" onChange={(e) => setState({ date_from: e })} showTimeSelect={false} />
            </div>
            <div className="w-40">
              <CustomeDatePicker value={state.date_to} placeholder="To Date" onChange={(e) => setState({ date_to: e })} showTimeSelect={false} />
            </div>
            <div className="w-48">
              <CustomSelect value={state.action} onChange={(e) => setState({ action: e })} placeholder="Lead Action" options={StatusOptions} isClearable={true} />
            </div>
          </div>
        </div>
        {state.isOpenLog && (
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            <LogCard data={state.logList} onPress={(item) => {}} editIcon={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateRouter(View_opportunity);
