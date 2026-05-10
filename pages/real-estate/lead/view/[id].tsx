"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import {
  Dropdown,
  Failure,
  Success,
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  formatPriceRange,
  useSetState,
} from "@/utils/function.utils";
import { DataTable } from "mantine-datatable";
import {
  Eye,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Activity,
} from "lucide-react";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import LogCard from "@/components/logCard";
import { truncateText } from "@/utils/function.utils";
import { sourceConfig, statusConfig, GENDER_LIST } from "@/utils/constant.utils";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import IconLoader from "@/components/Icon/IconLoader";
import moment from "moment";
import CustomPhoneInput from "@/components/phoneInput";

const View_Lead = () => {
  const router = useRouter();
  const id = router?.query?.id;

  const [state, setState] = useSetState({
    loading: false,
    detail: {},
    logList: [],
    logCount: 0,
    isOpenLog: false,
    openLeadInfo: true,
    openProperties: true,
    openContact: true,
    editMode: false,
    btnLoading: false,
    leadStatusList: [],
    leadSourceList: [],
    cityList: [],
    areaList: [],
    // edit fields
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    requirements: "",
    next_follow_up: null,
    status: null,
    lead_source: null,
    location: null,
    area: null,
    gender: null,
  });

  useEffect(() => {
    if (id) {
      getDetails();
      getLogList();
      leadStatusList();
      leadSourceList();
      cityList(1);
    }
  }, [id]);

  useEffect(() => {
    getLogList();
  }, [state.date_from, state.action, state.date_to]);

  useEffect(() => {
    if (state.location) areaList(1);
  }, [state.location]);

  const getDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.lead.details(id);
      setState({
        detail: res,
        loading: false,
        first_name: res?.first_name || "",
        last_name: res?.last_name || "",
        email: res?.email || "",
        phone: res?.phone || "",
        company_name: res?.company_name || "",
        requirements: res?.requirements || "",
        next_follow_up: res?.next_follow_up || null,
        gender: res?.gender ? { value: res.gender, label: capitalizeFLetter(res.gender) } : null,
        status: res?.status_info ? { value: res.status_info.id, label: res.status_info.name } : null,
        lead_source: res?.lead_source_info ? { value: res.lead_source_info.id, label: res.lead_source_info.name } : null,
        location: res?.location_details ? { value: res.location_details.id, label: res.location_details.name } : null,
        area: res?.area_details ? { value: res.area_details.id, label: res.area_details.name } : null,
      });
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

  const leadStatusList = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      setState({ leadStatusList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const leadSourceList = async () => {
    try {
      const res: any = await Models.leadSource.list(1, { pagination: "No" });
      setState({ leadSourceList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const cityList = async (page) => {
    try {
      const res: any = await Models.city.list(page, {});
      setState({ cityList: Dropdown(res?.results, "name"), cityNext: res.next, cityPage: page });
    } catch (error) {}
  };

  const cityLoadMore = async () => {
    if (!state.cityNext) return;
    const res: any = await Models.city.list(state.cityPage + 1, {});
    setState({ cityList: [...state.cityList, ...Dropdown(res?.results, "name")], cityNext: res.next, cityPage: state.cityPage + 1 });
  };

  const areaList = async (page) => {
    try {
      const res: any = await Models.area.list(page, { location: state.location?.value });
      setState({ areaList: Dropdown(res?.results, "name"), areaNext: res.next, areaPage: page });
    } catch (error) {}
  };

  const areaLoadMore = async () => {
    if (!state.areaNext) return;
    const res: any = await Models.area.list(state.areaPage + 1, { location: state.location?.value });
    setState({ areaList: [...state.areaList, ...Dropdown(res?.results, "name")], areaNext: res.next, areaPage: state.areaPage + 1 });
  };

  const handleUpdate = async () => {
    try {
      setState({ btnLoading: true });
      const body: any = {
        first_name: state.first_name,
        last_name: state.last_name,
        email: state.email,
        phone: state.phone,
        company_name: state.company_name,
        requirements: state.requirements,
        gender: state.gender?.value,
        status: state.status?.value,
        lead_source: state.lead_source?.value,
        location: state.location?.value,
        area: state.area?.value,
        next_follow_up: state.next_follow_up ? moment(state.next_follow_up).format("YYYY-MM-DD") : null,
      };
      await Models.lead.update(body, id);
      setState({ btnLoading: false, editMode: false });
      Success("Lead updated successfully");
      getDetails();
    } catch (error) {
      setState({ btnLoading: false });
      Failure("Update failed");
    }
  };

  const d = state.detail as any;

  const propertyColumns = [
    {
      accessor: "title",
      title: "Property Name",
      sortable: true,
      render: (row: any) => (
        <span
          className="cursor-pointer font-medium text-[#9b0f09] hover:underline"
          onClick={() => router.push(`/real-estate/property/detail/${row.id}`)}
        >
          {row.title || "-"}
        </span>
      ),
    },
    {
      accessor: "project",
      title: "Project",
      sortable: true,
      render: (row: any) => <span>{row.project?.name || "-"}</span>,
    },
    {
      accessor: "price_range",
      title: "Price Range",
      render: (row: any) => (
        <span className="font-semibold text-[#9b0f09]">
          {formatPriceRange(row.price_range?.minimum_price, row.price_range?.maximum_price)}
        </span>
      ),
    },
    {
      accessor: "built_up_area",
      title: "Sq.ft",
      render: (row: any) => <span>{row.built_up_area || "-"}</span>,
    },
    {
      accessor: "property_type",
      title: "Property Type",
      render: (row: any) => {
        const types = row.property_type;
        if (!types?.length) return <span className="text-gray-400">-</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {types.map((t: any, i: number) => (
              <span key={i} className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                {capitalizeFLetter(t?.name || t)}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessor: "city",
      title: "City",
      sortable: true,
      render: (row: any) => <span>{row.city || "-"}</span>,
    },
    {
      accessor: "area",
      title: "Area",
      sortable: true,
      render: (row: any) => <span>{row.area?.name || "-"}</span>,
    },
    {
      accessor: "action",
      title: "Actions",
      render: (row: any) => (
        <div className="flex items-center gap-3">
          <button className="text-[#9b0f09]" onClick={() => router.push(`/real-estate/property/detail/${row.id}`)}>
            <Eye className="h-4 w-4" />
          </button>
          <button className="text-blue-600" onClick={() => router.push(`/real-estate/lead/property-edit?lead=${id}&property=${row.id}`)}>
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-white">{value || "-"}</span>
    </div>
  );

  const AccordionHeader = ({
    title,
    count,
    open,
    onToggle,
    action,
  }: {
    title: string;
    count?: number;
    open: boolean;
    onToggle: () => void;
    action?: React.ReactNode;
  }) => (
    <div
      className="flex cursor-pointer items-center justify-between rounded-t-xl border border-gray-200 bg-white px-5 py-4"
      onClick={onToggle}
    >
      <div className="flex items-center gap-3">
        {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
        <span className="text-base font-semibold text-gray-800">{title}</span>
        {count !== undefined && (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-[#9b0f09] px-1 text-xs font-bold text-white">
            {count}
          </span>
        )}
      </div>
      {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
    </div>
  );

  const StatusOptions = [
    { value: "created", label: "Lead Created" },
    { value: "updated", label: "Lead Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "assigned", label: "Lead Assigned" },
    { value: "contacted", label: "Lead Contacted" },
    { value: "note_added", label: "Note Added" },
  ];

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#9b0f09]/10 text-sm font-bold text-[#9b0f09]">
            {d?.first_name?.[0]}{d?.last_name?.[0]}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">LEAD</p>
            <h5 className="text-lg font-bold text-gray-800 dark:text-white">
              {d?.full_name || `${d?.first_name} ${d?.last_name}`}
            </h5>
          </div>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Accordion 1: Lead Information */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <AccordionHeader
          title="Lead Information"
          open={state.openLeadInfo}
          onToggle={() => setState({ openLeadInfo: !state.openLeadInfo })}
          action={
            !state.editMode ? (
              <button
                className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
                onClick={() => setState({ editMode: true, openLeadInfo: true })}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null
          }
        />
        {state.openLeadInfo && (
          <div className="border-t border-gray-200 bg-white p-5">
            {!state.editMode ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Company Info */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                      <span className="text-xs text-orange-500">🏢</span>
                    </div>
                    <span className="font-semibold text-gray-700">Company Information</span>
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Company Name" value={d?.company_name} />
                    <InfoRow label="Address" value={d?.address} />
                    <InfoRow label="City" value={d?.city || d?.location_details?.name} />
                    <InfoRow label="State" value={d?.state} />
                    <InfoRow label="Country" value={d?.country} />
                  </div>
                </div>
                {/* Contact Info */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                      <span className="text-xs text-blue-500">👤</span>
                    </div>
                    <span className="font-semibold text-gray-700">Contact Information</span>
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Name" value={d?.full_name} />
                    <InfoRow label="Email" value={d?.email} />
                    <InfoRow label="Phone Number" value={formatPhoneNumber(d?.phone)} />
                    <InfoRow label="Gender" value={capitalizeFLetter(d?.gender)} />
                    <InfoRow label="Lead Source" value={d?.lead_source_info?.name} />
                    <InfoRow label="Status" value={d?.status_info?.name} />
                  </div>
                </div>
                {/* More Info */}
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-100">
                      <span className="text-xs text-purple-500">ℹ️</span>
                    </div>
                    <span className="font-semibold text-gray-700">More Information</span>
                  </div>
                  <div className="space-y-3">
                    <InfoRow label="Requirements" value={d?.requirements} />
                    <InfoRow label="Next Follow Up" value={commonDateFormat(d?.next_follow_up)} />
                    <InfoRow label="Location" value={d?.location_details?.name} />
                    <InfoRow label="Area" value={d?.area_details?.name} />
                    <InfoRow label="Priority" value={capitalizeFLetter(d?.priority)} />
                    <InfoRow label="Assigned To" value={d?.assigned_to_details ? `${d.assigned_to_details.first_name} ${d.assigned_to_details.last_name}` : "-"} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextInput title="First Name" value={state.first_name} onChange={(e) => setState({ first_name: e.target.value })} placeholder="First Name" />
                  <TextInput title="Last Name" value={state.last_name} onChange={(e) => setState({ last_name: e.target.value })} placeholder="Last Name" />
                  <TextInput title="Email" value={state.email} onChange={(e) => setState({ email: e.target.value })} placeholder="Email" />
                  <CustomPhoneInput value={state.phone} onChange={(v) => setState({ phone: v })} title="Phone" name="phone" />
                  <TextInput title="Company Name" value={state.company_name} onChange={(e) => setState({ company_name: e.target.value })} placeholder="Company Name" />
                  <CustomSelect title="Gender" value={state.gender} onChange={(e) => setState({ gender: e })} placeholder="Select Gender" options={GENDER_LIST} />
                  <CustomSelect title="Lead Source" value={state.lead_source} onChange={(e) => setState({ lead_source: e })} placeholder="Lead Source" options={state.leadSourceList} />
                  <CustomSelect title="Status" value={state.status} onChange={(e) => setState({ status: e })} placeholder="Status" options={state.leadStatusList} />
                  <CustomeDatePicker value={state.next_follow_up} placeholder="Next Follow Up" title="Next Follow Up" onChange={(e) => setState({ next_follow_up: e })} showTimeSelect={false} />
                  <CustomSelect title="City" value={state.location} onChange={(e) => setState({ location: e, area: null })} placeholder="Select City" options={state.cityList} isClearable loadMore={cityLoadMore} />
                  <CustomSelect title="Area" value={state.area} onChange={(e) => setState({ area: e })} placeholder="Select Area" options={state.areaList} isClearable loadMore={areaLoadMore} disabled={!state.location} />
                  <div className="md:col-span-3">
                    <TextArea title="Requirements" value={state.requirements} onChange={(e) => setState({ requirements: e.target.value })} placeholder="Requirements" />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button className="btn border-dred hover:btn-mred" onClick={() => setState({ editMode: false })}>Cancel</button>
                  <button className="btn btn-dred border-none" onClick={handleUpdate} disabled={state.btnLoading}>
                    {state.btnLoading ? <IconLoader className="h-4 w-4 animate-spin" /> : "Submit"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion 2: Interested Properties */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <AccordionHeader
          title="Interested Properties"
          count={d?.properties_details?.length || 0}
          open={state.openProperties}
          onToggle={() => setState({ openProperties: !state.openProperties })}
        />
        {state.openProperties && (
          <div className="border-t border-gray-200 bg-white p-5">
            <div className="datatables">
              <DataTable
                className="table-responsive"
                records={d?.properties_details || []}
                columns={propertyColumns}
                highlightOnHover
                minHeight={150}
              />
            </div>
          </div>
        )}
      </div>

      {/* Accordion 3: Contact Information */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <AccordionHeader
          title="Contact Information"
          count={1}
          open={state.openContact}
          onToggle={() => setState({ openContact: !state.openContact })}
        />
        {state.openContact && (
          <div className="border-t border-gray-200 bg-white p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-semibold uppercase text-gray-400">
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Phone Number</th>
                  <th className="pb-2 pr-4">Gender</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2">Area</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 pr-4 font-medium text-gray-800">{d?.full_name || "-"}</td>
                  <td className="py-3 pr-4 text-gray-600">{d?.email || "-"}</td>
                  <td className="py-3 pr-4 text-gray-600">{formatPhoneNumber(d?.phone) || "-"}</td>
                  <td className="py-3 pr-4 text-gray-600">{capitalizeFLetter(d?.gender) || "-"}</td>
                  <td className="py-3 pr-4 text-gray-600">{d?.location_details?.name || "-"}</td>
                  <td className="py-3 text-gray-600">{d?.area_details?.name || "-"}</td>
                </tr>
                {(d?.alternate_first_name || d?.alternate_phone_number) && (
                  <tr>
                    <td className="py-3 pr-4 font-medium text-gray-800">
                      {`${d?.alternate_first_name || ""} ${d?.alternate_last_name || ""}`.trim() || "-"}
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{d?.alternate_email || "-"}</td>
                    <td className="py-3 pr-4 text-gray-600">{formatPhoneNumber(d?.alternate_phone_number) || "-"}</td>
                    <td className="py-3 pr-4 text-gray-600">{capitalizeFLetter(d?.alternate_gender) || "-"}</td>
                    <td className="py-3 pr-4 text-gray-600">-</td>
                    <td className="py-3 text-gray-600">-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log History */}
      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div
          className="flex cursor-pointer items-center justify-between border-gray-200 bg-white px-5 py-4"
          onClick={() => setState({ isOpenLog: !state.isOpenLog })}
        >
          <div className="flex items-center gap-3">
            {state.isOpenLog ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
            <span className="text-base font-semibold text-gray-800">Log History</span>
            {state.logCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded bg-[#9b0f09] px-1 text-xs font-bold text-white">
                {state.logCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <div className="w-36">
              <CustomeDatePicker value={state.date_from} placeholder="From Date" onChange={(e) => setState({ date_from: e })} showTimeSelect={false} />
            </div>
            <div className="w-36">
              <CustomeDatePicker value={state.date_to} placeholder="To Date" onChange={(e) => setState({ date_to: e })} showTimeSelect={false} />
            </div>
            <div className="w-44">
              <CustomSelect value={state.action} onChange={(e) => setState({ action: e })} placeholder="Lead Action" options={StatusOptions} isClearable />
            </div>
          </div>
        </div>
        {state.isOpenLog && (
          <div className="border-t border-gray-200 bg-white p-5">
            <div className="max-h-[500px] overflow-y-auto">
              <LogCard data={state.logList} onPress={() => {}} editIcon={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrivateRouter(View_Lead);
