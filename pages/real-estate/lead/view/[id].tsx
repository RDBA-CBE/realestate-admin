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
  Plus,
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
import Modal from "@/components/modal/modal.component";
import { X } from "lucide-react";

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
    showAddPropertyModal: false,
    addPropertyLoading: false,
    newProperty: null,
    newInquiryDetails: "",
    newOpportunityStatus: null,
    propertyList: [],
    propertyPage: 1,
    hasMoreProperty: false,
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
    alt_first_name: "",
    alt_last_name: "",
    alt_email: "",
    alt_phone: "",
    alt_gender: null,
    bank_loan_required: false,
    bank_name: "",
    bank_branch: "",
    account_number: "",
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
        alt_first_name: res?.alternate_first_name || "",
        alt_last_name: res?.alternate_last_name || "",
        alt_email: res?.alternate_email || "",
        alt_phone: res?.alternate_phone_number || "",
        alt_gender: res?.alternate_gender ? { value: res.alternate_gender, label: capitalizeFLetter(res.alternate_gender) } : null,
        bank_loan_required: res?.bank_loan || false,
        bank_name: res?.bank_name || "",
        bank_branch: res?.bank_branch || "",
        account_number: res?.bank_account_no || "",
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

  const fetchPropertyList = async (page = 1) => {
    try {
      const userId = localStorage.getItem("userId");
      const res: any = await Models.property.list(page, { developer: userId, pagination: "No", is_approved: true });
      const options = Dropdown(res.results, "title");
      setState({ propertyList: options, propertyPage: page, hasMoreProperty: res.next });
    } catch (error) {
      console.log("error:", error);
    }
  };

  const propertyLoadMore = async () => {
    if (!state.hasMoreProperty) return;
    const userId = localStorage.getItem("userId");
    const res: any = await Models.property.list(state.propertyPage + 1, { developer: userId, pagination: "No", is_approved: true });
    setState({ propertyList: [...state.propertyList, ...Dropdown(res.results, "title")], propertyPage: state.propertyPage + 1, hasMoreProperty: res.next });
  };

  const closeAddPropertyModal = () => {
    setState({ showAddPropertyModal: false, newProperty: null, newInquiryDetails: "", newOpportunityStatus: null });
  };

  const handleAddProperty = async () => {
    if (!state.newProperty) return;
    try {
      setState({ addPropertyLoading: true });
      const userId = localStorage.getItem("userId");
      const existingIds = (d?.properties_details || []).map((p: any) => p.id);
      const interested_property = [state.newProperty.value, ...existingIds];
      const body={
        interested_property: interested_property,
        ...(state.newInquiryDetails && { inquiry_details: state.newInquiryDetails }),
        ...(state.newOpportunityStatus && { oppurtunity_status: state.newOpportunityStatus.value }),
        developer_user: Number(userId),
      }
      await Models.lead.update(body, id);
      // await Models.lead.lead_properties_create({
      //   lead: Number(id),
      //   property: [state.newProperty.value],
      //   developer_user: Number(userId),
      //   ...(state.newInquiryDetails && { inquiry_details: state.newInquiryDetails }),
      //   ...(state.newOpportunityStatus && { oppurtunity_status: state.newOpportunityStatus.value }),
      // });
      setState({ addPropertyLoading: false });
      closeAddPropertyModal();
      Success("Property added successfully");
      getDetails();
    } catch (error) {
      setState({ addPropertyLoading: false });
      Failure("Failed to add property");
    }
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
        alternate_first_name: state.alt_first_name,
        alternate_last_name: state.alt_last_name,
        alternate_email: state.alt_email,
        alternate_phone_number: state.alt_phone,
        alternate_gender: state.alt_gender?.value,
        bank_loan: state.bank_loan_required,
        bank_name: state.bank_name,
        bank_branch: state.bank_branch,
        bank_account_no: state.account_number,
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
                {/* <div>
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
                </div> */}
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
                    {/* <InfoRow label="Status" value={d?.status_info?.name} /> */}
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
                    {/* <InfoRow label="Requirements" value={d?.requirements} /> */}
                    <InfoRow label="Next Follow Up" value={commonDateFormat(d?.next_follow_up)} />
                    <InfoRow label="Location" value={d?.location_details?.name} />
                    <InfoRow label="Area" value={d?.area_details?.name} />
                    {d?.bank_loan == true &&
                    (
                    <>
                    <InfoRow label="Bank Loan Required" value="Yes" />
                    <InfoRow label="Bank Name" value={d?.bank_name} />
                    <InfoRow label="Bank Branch" value={d?.bank_branch} />
                    <InfoRow label="Bank Account Number" value={d?.bank_account_no} />
                    </>
                    )}
                    {/* <InfoRow label="Priority" value={capitalizeFLetter(d?.priority)} /> */}
                    {/* <InfoRow label="Assigned To" value={d?.assigned_to_details ? `${d.assigned_to_details.first_name} ${d.assigned_to_details.last_name}` : "-"} /> */}
                  </div>
                </div>

                {(d?.alternate_first_name || d?.alternate_phone_number) && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100">
                        <span className="text-xs text-orange-500">👥</span>
                      </div>
                      <span className="font-semibold text-gray-700">Alternate Contact</span>
                    </div>
                    <div className="space-y-3">
                      <InfoRow label="Name" value={`${d?.alternate_first_name || ""} ${d?.alternate_last_name || ""}`.trim()} />
                      <InfoRow label="Gender" value={capitalizeFLetter(d?.alternate_gender)} />
                      <InfoRow label="Email" value={d?.alternate_email} />
                      <InfoRow label="Phone" value={formatPhoneNumber(d?.alternate_phone_number)} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextInput title="First Name" value={state.first_name} onChange={(e) => setState({ first_name: e.target.value })} placeholder="First Name" />
                  <TextInput title="Last Name" value={state.last_name} onChange={(e) => setState({ last_name: e.target.value })} placeholder="Last Name" />
                  <TextInput title="Email" value={state.email} onChange={(e) => setState({ email: e.target.value })} placeholder="Email" />
                  <CustomPhoneInput value={state.phone} onChange={(v) => setState({ phone: v })} title="Phone" name="phone" />
                  {/* <TextInput title="Company Name" value={state.company_name} onChange={(e) => setState({ company_name: e.target.value })} placeholder="Company Name" /> */}
                  <CustomSelect title="Gender" value={state.gender} onChange={(e) => setState({ gender: e })} placeholder="Select Gender" options={GENDER_LIST} />
                  <CustomSelect title="Lead Source" value={state.lead_source} onChange={(e) => setState({ lead_source: e })} placeholder="Lead Source" options={state.leadSourceList} />
                  {/* <CustomSelect title="Status" value={state.status} onChange={(e) => setState({ status: e })} placeholder="Status" options={state.leadStatusList} /> */}
                  <CustomeDatePicker value={state.next_follow_up} placeholder="Next Follow Up" title="Next Follow Up" onChange={(e) => setState({ next_follow_up: e })} showTimeSelect={false}  minDate={new Date()}/>
                  <CustomSelect title="City" value={state.location} onChange={(e) => setState({ location: e, area: null })} placeholder="Select City" options={state.cityList} isClearable loadMore={cityLoadMore} />
                  <CustomSelect title="Area" value={state.area} onChange={(e) => setState({ area: e })} placeholder="Select Area" options={state.areaList} isClearable loadMore={areaLoadMore} disabled={!state.location} />
                  {/* <div className="md:col-span-3">
                    <TextArea title="Requirements" value={state.requirements} onChange={(e) => setState({ requirements: e.target.value })} placeholder="Requirements" />
                  </div> */}
                  <div className="md:col-span-3 flex items-center gap-2">
                    <input type="checkbox" id="bank_loan" checked={state.bank_loan_required} onChange={() => setState({ bank_loan_required: !state.bank_loan_required })} className="h-4 w-4" />
                    <label htmlFor="bank_loan" className="text-sm text-gray-700">Bank Loan Required</label>
                  </div>
                  {state.bank_loan_required && (
                    <>
                      <TextInput title="Bank Name" value={state.bank_name} onChange={(e) => setState({ bank_name: e.target.value })} placeholder="Bank Name" />
                      <TextInput title="Bank Branch" value={state.bank_branch} onChange={(e) => setState({ bank_branch: e.target.value })} placeholder="Bank Branch" />
                      <TextInput title="Account Number" value={state.account_number} onChange={(e) => setState({ account_number: e.target.value })} placeholder="Account Number" />
                    </>
                  )}
                </div>
                <div className="mt-2 border-t border-gray-200 pt-4">
                  <p className="mb-3 text-sm font-semibold text-gray-600">Alternate Contact</p>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <TextInput title="Alternate First Name" value={state.alt_first_name} onChange={(e) => setState({ alt_first_name: e.target.value })} placeholder="Alternate First Name" />
                    <TextInput title="Alternate Last Name" value={state.alt_last_name} onChange={(e) => setState({ alt_last_name: e.target.value })} placeholder="Alternate Last Name" />
                    <TextInput title="Alternate Email" value={state.alt_email} onChange={(e) => setState({ alt_email: e.target.value })} placeholder="Alternate Email" />
                    <CustomPhoneInput value={state.alt_phone} onChange={(v) => setState({ alt_phone: v })} title="Alternate Phone" name="alt_phone" />
                    <CustomSelect title="Alternate Gender" value={state.alt_gender} onChange={(e) => setState({ alt_gender: e })} placeholder="Select Gender" options={GENDER_LIST} />
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
          action={
            <button
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
              onClick={() => { setState({ showAddPropertyModal: true }); fetchPropertyList(1); }}
            >
              <Plus className="h-4 w-4" />
            </button>
          }
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

      <Modal
        open={state.showAddPropertyModal}
        close={closeAddPropertyModal}
        maxWidth="!w-[500px]"
        renderComponent={() => (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Property</h2>
              <button onClick={closeAddPropertyModal} className="rounded-full p-2 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <CustomSelect
                title="Property"
                value={state.newProperty}
                onChange={(e) => setState({ newProperty: e })}
                placeholder="Select Property"
                options={state.propertyList}
                loadMore={propertyLoadMore}
                required
              />
              <TextArea
                title="Inquiry Details"
                value={state.newInquiryDetails}
                onChange={(e) => setState({ newInquiryDetails: e.target.value })}
                placeholder="Inquiry Details"
              />
              <CustomSelect
                title="Opportunity Status"
                value={state.newOpportunityStatus}
                onChange={(e) => setState({ newOpportunityStatus: e })}
                placeholder="Select Opportunity Status"
                options={state.leadStatusList}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-6">
              <button className="btn border-dred hover:btn-mred" onClick={closeAddPropertyModal}>Cancel</button>
              <button
                className="btn btn-dred border-none"
                onClick={handleAddProperty}
                disabled={state.addPropertyLoading || !state.newProperty}
              >
                {state.addPropertyLoading ? <IconLoader className="h-4 w-4 animate-spin" /> : "Add"}
              </button>
            </div>
          </div>
        )}
      />
      </div>

      {/* Accordion 3: Contact Information */}
      {/* <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <AccordionHeader
          title="Contact Information"
          count={(d?.alternate_first_name || d?.alternate_phone_number) ? 2 : 1}
          open={state.openContact}
          onToggle={() => setState({ openContact: !state.openContact })}
        />
        {state.openContact && (
          <div className="border-t border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-xs text-blue-500">👤</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Primary Contact</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <InfoRow label="Name" value={d?.full_name} />
                  <InfoRow label="Gender" value={capitalizeFLetter(d?.gender)} />
                  <InfoRow label="Email" value={d?.email} />
                  <InfoRow label="Phone" value={formatPhoneNumber(d?.phone)} />
                  <InfoRow label="Location" value={d?.location_details?.name} />
                  <InfoRow label="Area" value={d?.area_details?.name} />
                </div>
              </div>
              
              {(d?.alternate_first_name || d?.alternate_phone_number) && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100">
                      <span className="text-xs text-orange-500">👥</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Alternate Contact</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Name" value={`${d?.alternate_first_name || ""} ${d?.alternate_last_name || ""}`.trim()} />
                    <InfoRow label="Gender" value={capitalizeFLetter(d?.alternate_gender)} />
                    <InfoRow label="Email" value={d?.alternate_email} />
                    <InfoRow label="Phone" value={formatPhoneNumber(d?.alternate_phone_number)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div> */}

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
