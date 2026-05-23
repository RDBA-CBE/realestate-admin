"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import {
  Dropdown,
  Success,
  Failure,
  capitalizeFLetter,
  commonDateFormat,
  formatPriceRange,
  useSetState,
  truncateText,
} from "@/utils/function.utils";
import {
  ArrowLeft,
  MapPin,
  Home,
  Tag,
  Layers,
  Star,
  DollarSign,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Building,
  Computer,
  User2,
  User2Icon,
  ChevronUp,
  ChevronDown,
  Eye,
} from "lucide-react";
import PrivateRouter from "@/hook/privateRouter";
import moment from "moment";
import TextInput from "@/components/FormFields/TextInput.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import CustomeDatePicker from "@/components/datePicker";
import CustomPhoneInput from "@/components/phoneInput";
import IconUser from "@/components/Icon/IconUser";
import IconMail from "@/components/Icon/IconMail";
import IconLoader from "@/components/Icon/IconLoader";
import * as Yup from "yup";
import Utils from "@/imports/utils.import";
import { GENDER_LIST, LISTING_TYPE_LIST } from "@/utils/constant.utils";
import { DataTable } from "mantine-datatable";

const View_CallInquiry = () => {
  const router = useRouter();
  const id = router?.query?.id;

  const [state, setState] = useSetState({
    loading: false,
    detail: {} as any,
    moveToLead: false,
    // lead form state
    btnLoading: false,
    company_name: "",
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    gender: null,
    location: null,
    area: null,
    income_type: null,
    bank_loan_required: false,
    bank_name: "",
    branch_name: "",
    account_number: "",
    showAlternateContact: false,
    alt_first_name: "",
    alt_last_name: "",
    alt_email: "",
    alt_phone: "",
    alt_gender: null,
    lead_source: null,
    status: null,
    next_follow_up: null,
    requirements: "",
    property_name: null,
    leadSourceList: [],
    leadStatusList: [],
    IncomeTypeList: [],
    cityList: [],
    areaList: [],
    propertyList: [],
    cityPage: 1,
    cityNext: null,
    areaPage: 1,
    areaNext: null,
    propertyPage: 1,
    hasMoreProperty: false,
    error: {} as any,
    userId: null,
    openContactRow: true,
    openProperty: true,
    openMoveLead: true,
  });

  useEffect(() => {
    if (id) getDetails();
    const userId = localStorage.getItem("userId");
    setState({ userId });
  }, [id]);

  useEffect(() => {
    if (state.moveToLead) {
      leadSourceList();
      leadStatusList();
      IncomeTypeList();
      cityList(1);
      propertyList();
      // pre-fill from inquiry
      const d = state.detail;
      setState({
        email: d?.email || "",
        phone: d?.phone_number || "",
      });
    }
  }, [state.moveToLead]);

  useEffect(() => {
    if (state.location) areaList(1);
  }, [state.location]);

  const getDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.inquiry.booking_view(id);
      const user_info = res?.user_details;

      if (user_info) {
        setState({
          first_name: user_info?.first_name,
          last_name: user_info?.last_name,
          email: user_info?.email,
          phone: `+91 ${user_info?.phone}`,
        });
      } else {
        setState({
          email: res?.email,
          phone: res?.phone,
        });
      }
      setState({ detail: res, loading: false, requirements: res?.message });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const leadSourceList = async () => {
    try {
      const res: any = await Models.leadSource.list(1, { pagination: "No" });
      setState({ leadSourceList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const leadStatusList = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      setState({ leadStatusList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const IncomeTypeList = async () => {
    try {
      const res: any = await Models.employmentType.list(1, {
        pagination: "No",
      });
      setState({ IncomeTypeList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const cityList = async (page: number) => {
    try {
      const res: any = await Models.city.list(page, {});
      setState({
        cityList: Dropdown(res?.results, "name"),
        cityNext: res.next,
        cityPage: page,
      });
    } catch (error) {}
  };

  const cityLoadMore = async () => {
    if (!state.cityNext) return;
    const res: any = await Models.city.list(state.cityPage + 1, {});
    setState({
      cityList: [...state.cityList, ...Dropdown(res?.results, "name")],
      cityNext: res.next,
      cityPage: state.cityPage + 1,
    });
  };

  const areaList = async (page: number) => {
    try {
      const res: any = await Models.area.list(page, {
        location: state.location?.value,
      });
      setState({
        areaList: Dropdown(res?.results, "name"),
        areaNext: res.next,
        areaPage: page,
      });
    } catch (error) {}
  };

  const areaLoadMore = async () => {
    if (!state.areaNext) return;
    const res: any = await Models.area.list(state.areaPage + 1, {});
    setState({
      areaList: [...state.areaList, ...Dropdown(res?.results, "name")],
      areaNext: res.next,
      areaPage: state.areaPage + 1,
    });
  };

  const propertyList = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res: any = await Models.property.list(1, {
        developer: userId,
        pagination: "No",
        is_approved: true,
      });
      setState({
        propertyList: Dropdown(res.results, "title"),
        hasMoreProperty: res.next,
      });
    } catch (error) {}
  };

  const propertyLoadMore = async () => {
    if (!state.hasMoreProperty) return;
    const res: any = await Models.property.list(state.propertyPage + 1, {});
    setState({
      propertyList: [...state.propertyList, ...Dropdown(res?.results, "title")],
      hasMoreProperty: res.next,
      propertyPage: state.propertyPage + 1,
    });
  };

  const handleGetProperty = async (e) => {
    console.log("✌️e --->", e);
    try {
      setState({
        property_name: e,
        error: { ...state.error, interested_property: null },
      });

      if (!e || (Array.isArray(e) && e.length === 0)) {
        setState({ tableList: [] });
        return;
      }

      // const propertyDetails = await Promise.all(
      const res: any = await Models.property.details(e?.value);
      const propertyDetails = {
        title: capitalizeFLetter(res?.title),
        status: capitalizeFLetter(res?.status),
        id: res?.id,
        total_area: res?.total_area,
        property_type:
          res?.property_type?.map((pt) => capitalizeFLetter(pt?.name)) || [],
        listing_type: {
          type: capitalizeFLetter(res?.listing_type),
          color:
            res?.listing_type == LISTING_TYPE_LIST.RENT
              ? "warning"
              : res?.listing_type == LISTING_TYPE_LIST.SALE
              ? "secondary"
              : res?.listing_type == LISTING_TYPE_LIST.LEASE
              ? "info"
              : "success",
        },
        date: commonDateFormat(res?.created_at),
        location: capitalizeFLetter(res?.city),
        developer: `${capitalizeFLetter(
          res?.developer?.first_name,
        )} ${capitalizeFLetter(res?.developer?.last_name)}`,
        project: capitalizeFLetter(res?.project?.name),
        price: formatPriceRange(
          res?.price_range?.minimum_price,
          res?.price_range?.maximum_price,
        ),
        built_up_area: res?.built_up_area,
        publish: res?.publish === true ? "Published" : "Draft",
        is_approved: res?.is_approved,
        image:
          res?.primary_image?.image ??
          "/assets/images/real-estate/property-info-img1.png",
      };

      setState({ tableList: [propertyDetails] });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };
  console.log(
    "first",
    state.property_name?.value,
    state.detail?.property_details?.id,
  );

  const handleLeadSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        company_name: capitalizeFLetter(state.company_name),
        first_name: capitalizeFLetter(state.first_name),
        last_name: capitalizeFLetter(state.last_name),
        phone: state.phone,
        email: state.email,
        gender: state.gender?.value,
        location: state.location?.value,
        area: state.area?.value,
        interested_property: state.property_name?.value
          ? [state.property_name?.value]
          : state.detail?.property_details?.id
          ? [state.detail?.property_details?.id]
          : null,
        lead_source: state.lead_source?.value,
        assigned_to: state.userId,
        next_follow_up: state.next_follow_up
          ? moment(state.next_follow_up).format("YYYY-MM-DD")
          : null,
        opportunity_status: state.status?.value,
        inquiry_details: capitalizeFLetter(state.requirements),
        ...(state.showAlternateContact && {
          alternate_first_name: capitalizeFLetter(state.alt_first_name),
          alternate_last_name: capitalizeFLetter(state.alt_last_name),
          alternate_email: state.alt_email,
          alternate_phone_number: state.alt_phone,
          alternate_gender: state.alt_gender?.value,
        }),
        employment_type: state.income_type?.value,
        bank_loan: state.bank_loan_required,
        bank_name: capitalizeFLetter(state.bank_name),
        bank_branch: capitalizeFLetter(state.branch_name),
        bank_account_no: state.account_number,
      };

      await Utils.Validation.lead.validate(body, { abortEarly: false });
      const res = await Models.lead.create(body);
      if (res) {
        await delete_call_inquiry();
      }
      setState({ btnLoading: false });
      Success("Lead Created Successfully");
      router.push("/real-estate/lead/list");
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);
        setState({ error: validationErrors, btnLoading: false });
        Failure("Please fill all the required fields");
      } else {
        if (error?.email?.length > 0) Failure(error?.email[0]);
        else if (error?.phone?.length > 0) Failure(error?.phone[0]);
        else Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const handleView = async (row) => {
    router.push(`/real-estate/property/detail/${row?.id}`);
  };

  const allColumns = [
    {
      accessor: "title",
      title: "Property Info",
      sortable: true,
      render: (row) => (
        <div
          onClick={() => handleView(row)}
          className="cursor-pointer text-sm font-semibold"
        >
          {row.title}
        </div>
      ),
    },
    {
      accessor: "project",
      title: "Project",
      render: (row) => <span title={row.project}>{row.project}</span>,
    },
    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "built_up_area",
      title: "Built-Up Area (sq.ft)",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "property_type",
      title: "Property Type",
      render: (row: any) => {
        const property_type = row.property_type;
        if (!property_type || property_type?.length === 0) {
          return <span>-</span>;
        }
        const firstType = property_type[0];
        const others = property_type.slice(1);
        const maxShow = 3;
        const remaining = others.length - maxShow;
        const visibleTypes = others.slice(0, maxShow);
        const hiddenTypes = others.slice(maxShow);
        return (
          <div className="flex items-center gap-2">
            <span
              title={firstType}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {truncateText(firstType)}
            </span>
            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                    {type}
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div className="group relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-bold text-white dark:border-gray-900">
                    +{remaining}
                  </div>
                  <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                    {hiddenTypes.join(", ")}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessor: "role",
      title: "Offer Type",
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color}`}>
          {row?.listing_type?.type}
        </span>
      ),
    },

    {
      accessor: "action",
      title: "Actions",
      textAlignment: "center" as const,
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button className="text-dred flex" onClick={() => handleView(row)}>
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const delete_call_inquiry = async () => {
    try {
      const res: any = await Models.inquiry.booking_delete(id);
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };
  const d = state.detail;
  const search = d?.search || {};
  const property = d?.property_details;

  const InfoRow = ({
    icon,
    label,
    value,
  }: {
    icon?: React.ReactNode;
    label: string;
    value: any;
  }) => (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-[#9b0f09]">{icon}</div>}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || "-"}</p>
      </div>
    </div>
  );

  const Badge = ({ label }: { label: string }) => (
    <span className="inline-block rounded-full bg-[#9b0f09]/10 px-3 py-1 text-xs font-semibold text-[#9b0f09]">
      {label}
    </span>
  );

  if (state.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#9b0f09] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-400">
            Inquiry Proposal
          </p>
          <h5 className="text-xl font-bold text-gray-800">Booking Inquiry</h5>
          <p className="text-xs text-gray-400">
            {d?.created_at
              ? moment(d.created_at).format("DD MMM YYYY, hh:mm A")
              : "-"}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Contact Info + Preferences/Property Row — linked accordion */}
      <div
        className={`grid grid-cols-1 gap-5 ${
          Object.keys(search).length > 0 || property ? "md:grid-cols-2" : ""
        }`}
      >
        {/* Contact Info */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            className="flex w-full items-center gap-2 px-4 py-3"
            onClick={() => setState({ openContactRow: !state.openContactRow })}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <span className="font-bold text-gray-700">Contact Information</span>
            <span className="ml-auto text-gray-400">
              {state.openContactRow ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>
          {state.openContactRow && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              <div className="grid grid-cols-1 gap-4">
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={d?.email}
                />
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={d?.phone_number}
                />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Submitted On"
                  value={
                    d?.created_at
                      ? moment(d.created_at).format("DD MMM YYYY")
                      : "-"
                  }
                />
              </div>
              {d?.message && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-[#9b0f09]" />
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Message
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{d.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2nd column: Customer Preferences OR Interested Property (linked accordion) */}
        {Object.keys(search).length > 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              className="flex w-full items-center gap-2 px-4 py-3"
              onClick={() =>
                setState({ openContactRow: !state.openContactRow })
              }
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
              <span className="font-bold text-gray-700">
                Customer Preferences
              </span>
              <span className="ml-auto rounded-full bg-[#9b0f09] px-2 py-0.5 text-xs font-bold text-white">
                Proposal Criteria
              </span>
              <span className="ml-2 text-gray-400">
                {state.openContactRow ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>
            {state.openContactRow && (
              <div className="border-t border-gray-100 px-5 pb-5 pt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {search.property_type && (
                    <InfoRow
                      icon={<Home className="h-4 w-4" />}
                      label="Property Type"
                      value={search.property_type}
                    />
                  )}
                  {search.location_pref && (
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Preferred Location"
                      value={search.location_pref}
                    />
                  )}
                  {search.price_range && (
                    <InfoRow
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Budget / Price Range"
                      value={search.price_range}
                    />
                  )}
                  {search.apartment_config && (
                    <InfoRow
                      icon={<Layers className="h-4 w-4" />}
                      label="Configuration"
                      value={search.apartment_config}
                    />
                  )}
                  {search.apartment_floor && (
                    <InfoRow
                      icon={<Tag className="h-4 w-4" />}
                      label="Floor Preference"
                      value={search.apartment_floor}
                    />
                  )}
                </div>
                {search.amenities?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Required Amenities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {search.amenities.map((a: string, i: number) => (
                        <Badge key={i} label={a} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : property ? (
          /* No search + Property → 2nd column card, linked accordion */
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <button
              className="flex w-full items-center gap-2 px-4 py-3"
              onClick={() =>
                setState({ openContactRow: !state.openContactRow })
              }
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <Home className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-bold text-gray-700">
                Interested Property
              </span>
              <span className="ml-auto text-gray-400">
                {state.openContactRow ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </span>
            </button>
            {state.openContactRow && (
              <div
                className="cursor-pointer border-t border-gray-100 px-5 pb-5 pt-4"
                onClick={() =>
                  router.push(`/real-estate/property/detail/${property.id}`)
                }
              >
                <div className="flex items-start gap-5">
                  {property.primary_image?.image_url ? (
                    <img
                      src={property.primary_image.image_url}
                      alt={property.title}
                      className="h-32 w-44 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-32 w-44 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                      <Home className="h-5 w-5" />
                    </div>
                  )}
                  <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-4">
                    <InfoRow
                      icon={<Home className="h-4 w-4" />}
                      label="Property Name"
                      value={property.title}
                    />
                    <InfoRow
                      icon={<Building className="h-4 w-4" />}
                      label="Project"
                      value={property.project?.name}
                    />
                    <InfoRow
                      icon={<DollarSign className="h-4 w-4" />}
                      label="Price Range"
                      value={
                        property.price_range
                          ? `₹${(
                              property.price_range.minimum_price / 100000
                            ).toFixed(1)}L – ₹${(
                              property.price_range.maximum_price / 100000
                            ).toFixed(1)}L`
                          : "-"
                      }
                    />
                    <InfoRow
                      icon={<Layers className="h-4 w-4" />}
                      label="Built-up Area"
                      value={
                        property.built_up_area
                          ? `${Number(
                              property.built_up_area,
                            ).toLocaleString()} sqft`
                          : "-"
                      }
                    />
                    <InfoRow
                      icon={<Tag className="h-4 w-4" />}
                      label="Property Type"
                      value={property.property_type
                        ?.map((t: any) => t.name)
                        .join(", ")}
                    />
                    <InfoRow
                      icon={<MapPin className="h-4 w-4" />}
                      label="Area"
                      value={property.area?.name}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Interested Property - Table Format (only when search exists) */}
      {Object.keys(search).length > 0 && property && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <button
            className="flex w-full items-center gap-2 px-4 py-3"
            onClick={() => setState({ openProperty: !state.openProperty })}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Home className="h-4 w-4 text-green-600" />
            </div>
            <span className="font-bold text-gray-700">Interested Property</span>
            <span className="ml-auto text-gray-400">
              {state.openProperty ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </button>
          {state.openProperty && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-2 text-left">Image</th>
                      <th className="px-4 py-2 text-left">Property Name</th>
                      <th className="px-4 py-2 text-left">Project</th>
                      <th className="px-4 py-2 text-left">Property Type</th>
                      <th className="px-4 py-2 text-left">Area</th>
                      <th className="px-4 py-2 text-left">Built-up Area</th>
                      <th className="px-4 py-2 text-left">Price Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      className="cursor-pointer border-b border-gray-50 hover:bg-[#9b0f09]/5"
                      onClick={() =>
                        router.push(
                          `/real-estate/property/detail/${property.id}`,
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        {property.primary_image?.image_url ? (
                          <img
                            src={property.primary_image.image_url}
                            alt={property.title}
                            className="h-14 w-20 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                            <Home className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {property.title || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {property.project?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {property.property_type
                          ?.map((t: any) => t.name)
                          .join(", ") || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {property.area?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {property.built_up_area
                          ? `${Number(
                              property.built_up_area,
                            ).toLocaleString()} sqft`
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {property.price_range
                          ? `₹${(
                              property.price_range.minimum_price / 100000
                            ).toFixed(1)}L – ₹${(
                              property.price_range.maximum_price / 100000
                            ).toFixed(1)}L`
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Move to Lead */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <button
          className="flex w-full items-center gap-2 px-4 py-3"
          onClick={() => setState({ openMoveLead: !state.openMoveLead })}
        >
          <span className="font-bold text-gray-700">Move to Lead</span>
          <span className="ml-auto text-gray-400">
            {state.openMoveLead ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </span>
        </button>
        {state.openMoveLead && (
          <div className="border-t border-gray-100 px-5 pb-5 pt-4">
            <CheckboxInput
              label="Move to Lead"
              checked={state.moveToLead}
              onChange={() => setState({ moveToLead: !state.moveToLead })}
            />
          </div>
        )}
      </div>

      {/* Lead Form */}
      {state.moveToLead && (
        <>
          <div className="flex flex-wrap gap-4">
            {/* Contact Information */}
            <div className="mt-1 w-full md:w-[calc(50%-8px)]">
              <div className="panel flex flex-col gap-5 rounded-xl border p-3 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffefe4]">
                    <IconUser className="text-[#ffbb55]" />
                  </div>
                  <div style={{ fontSize: "20px" }}>Contact Information</div>
                </div>

                <TextInput
                  title="First Name"
                  value={state.first_name}
                  onChange={(e) =>
                    setState({
                      first_name: e.target.value,
                      error: { ...state.error, first_name: "" },
                    })
                  }
                  placeholder="First Name"
                  error={state.error?.first_name}
                  icon={<User2 height={15} width={15} />}
                  required
                />
                <TextInput
                  title="Last Name"
                  value={state.last_name}
                  onChange={(e) =>
                    setState({
                      last_name: e.target.value,
                      error: { ...state.error, last_name: "" },
                    })
                  }
                  placeholder="Last Name"
                  error={state.error?.last_name}
                  icon={<User2 height={15} width={15} />}
                  required
                />
                <TextInput
                  title="Email"
                  value={state.email}
                  onChange={(e) =>
                    setState({
                      email: e.target.value,
                      error: { ...state.error, email: "" },
                    })
                  }
                  placeholder="Email"
                  error={state.error?.email}
                  icon={<IconMail fill={false} />}
                  required
                />
                <CustomPhoneInput
                  value={state.phone}
                  onChange={(value) =>
                    setState({
                      phone: value,
                      error: { ...state.error, phone: "" },
                    })
                  }
                  title="Phone Number"
                  name="phone"
                  required
                  error={state.error?.phone}
                />
                <CustomSelect
                  value={state.gender}
                  onChange={(e) =>
                    setState({
                      gender: e,
                      error: { ...state.error, gender: null },
                    })
                  }
                  placeholder="Gender"
                  title="Gender"
                  options={GENDER_LIST}
                  error={state.error?.gender}
                  required
                  className="w-full"
                />
                <CustomSelect
                  title="City name"
                  placeholder="Select city"
                  options={state.cityList}
                  value={state.location}
                  onChange={(e) => setState({ location: e, area: "" })}
                  isClearable
                  loadMore={cityLoadMore}
                  required
                  error={state.error?.location}
                />
                <CustomSelect
                  title="Area name"
                  placeholder="Select Area"
                  options={state.areaList}
                  value={state.area}
                  onChange={(e) => setState({ area: e })}
                  isClearable
                  loadMore={areaLoadMore}
                  required
                  error={state.error?.area}
                  disabled={!state.location}
                />
                <CustomSelect
                  title="Income Type"
                  value={state.income_type}
                  onChange={(e) => setState({ income_type: e })}
                  placeholder="Select Income Type"
                  options={state.IncomeTypeList}
                  className="w-full"
                />
                <CheckboxInput
                  label="Bank Loan Required"
                  checked={state.bank_loan_required}
                  onChange={() =>
                    setState({ bank_loan_required: !state.bank_loan_required })
                  }
                />
                {state.bank_loan_required && (
                  <>
                    <TextInput
                      title="Bank Name"
                      value={state.bank_name}
                      onChange={(e) => setState({ bank_name: e.target.value })}
                      placeholder="Bank Name"
                    />
                    <TextInput
                      title="Branch Name"
                      value={state.branch_name}
                      onChange={(e) =>
                        setState({ branch_name: e.target.value })
                      }
                      placeholder="Branch Name"
                    />
                    <TextInput
                      title="Account Number"
                      value={state.account_number}
                      onChange={(e) =>
                        setState({ account_number: e.target.value })
                      }
                      placeholder="Account Number"
                    />
                  </>
                )}
                <CheckboxInput
                  label="Add Alternate Contact Details"
                  checked={state.showAlternateContact}
                  onChange={() =>
                    setState({
                      showAlternateContact: !state.showAlternateContact,
                    })
                  }
                />
                {state.showAlternateContact && (
                  <>
                    <TextInput
                      title="Alternate First Name"
                      value={state.alt_first_name}
                      onChange={(e) =>
                        setState({ alt_first_name: e.target.value })
                      }
                      placeholder="Alternate First Name"
                      icon={<User2 height={15} width={15} />}
                    />
                    <TextInput
                      title="Alternate Last Name"
                      value={state.alt_last_name}
                      onChange={(e) =>
                        setState({ alt_last_name: e.target.value })
                      }
                      placeholder="Alternate Last Name"
                      icon={<User2 height={15} width={15} />}
                    />
                    <TextInput
                      title="Alternate Email"
                      value={state.alt_email}
                      onChange={(e) => setState({ alt_email: e.target.value })}
                      placeholder="Alternate Email"
                      icon={<IconMail fill={false} />}
                    />
                    <CustomPhoneInput
                      value={state.alt_phone}
                      onChange={(value) => setState({ alt_phone: value })}
                      title="Alternate Phone Number"
                      name="alt_phone"
                    />
                    <CustomSelect
                      value={state.alt_gender}
                      onChange={(e) => setState({ alt_gender: e })}
                      placeholder="Gender"
                      title="Gender"
                      options={GENDER_LIST}
                      className="w-full"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Lead Information */}
            <div className="mt-1 w-full md:w-[calc(50%-8px)]">
              <div className="panel flex flex-col gap-5 rounded-xl border p-3 shadow-none">
                <div className="flex items-center gap-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#deffd7]">
                    <IconUser className="text-[#82de69]" />
                  </div>
                  <div style={{ fontSize: "20px" }}>Lead Information</div>
                </div>
                <TextInput
                  title="Company Name"
                  value={state.company_name}
                  onChange={(e) => setState({ company_name: e.target.value })}
                  placeholder="Company Name"
                  icon={<Computer height={15} width={15} />}
                />
                <CustomSelect
                  title="Lead Source"
                  value={state.lead_source}
                  onChange={(e) =>
                    setState({
                      lead_source: e,
                      error: { ...state.error, lead_source: null },
                    })
                  }
                  placeholder="Lead Source"
                  options={state.leadSourceList}
                  error={state.error?.lead_source}
                  required
                  className="w-full"
                  leftIcon={<Building className="h-4 w-4 text-gray-400" />}
                />
                <CustomSelect
                  value={state.status}
                  onChange={(e) =>
                    setState({
                      status: e,
                      error: { ...state.error, opportunity_status: null },
                    })
                  }
                  placeholder="Status"
                  title="Status"
                  options={state.leadStatusList}
                  error={state.error?.opportunity_status}
                  required
                  className="w-full"
                  leftIcon={<User2Icon className="h-4 w-4 text-gray-400" />}
                />
                <CustomeDatePicker
                  value={state.next_follow_up}
                  placeholder="Next Follow Up Date"
                  title="Next Follow Up Date"
                  onChange={(e) =>
                    setState({
                      next_follow_up: e,
                      error: { ...state.error, next_follow_up: null },
                    })
                  }
                  showTimeSelect={true}
                  required
                  error={state.error?.next_follow_up}
                  minDate={new Date()}
                />
                <TextArea
                  title="Inquiry Details"
                  placeholder="Inquiry Details"
                  value={state.requirements}
                  onChange={(e) =>
                    setState({
                      requirements: e.target.value,
                      error: { ...state.error, inquiry_details: "" },
                    })
                  }
                  required
                  error={state.error?.inquiry_details}
                />
              </div>
              {!state.detail?.property && (
                <div className="panel mt-4 flex flex-col gap-5 rounded-2xl border p-3 shadow-none">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#deffd7]">
                      <IconUser className="text-[#82de69]" />
                    </div>
                    <div style={{ fontSize: "20px" }}>Property Information</div>
                    <span className="ml-auto rounded-full bg-[#9b0f09] px-2 py-1 text-xs font-bold text-white">
                      Create
                    </span>
                  </div>
                  <CustomSelect
                    title="Property"
                    value={state.property_name}
                    onChange={(e) => handleGetProperty(e)}
                    placeholder={"Select Property"}
                    options={state.propertyList}
                    error={state.error?.interested_property}
                    required
                    className="w-full"
                    loadMore={() => propertyLoadMore()}
                  />
                </div>
              )}
            </div>
          </div>

          {state.tableList?.length > 0 && (
            <div className={`mt-3 w-full`}>
              <div className="   flex  flex-col gap-5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                    <IconUser className="text-[#82de69]" />
                  </div>
                  <div className=" " style={{ fontSize: "20px" }}>
                    Property Details
                  </div>
                </div>

                <div className="datatables">
                  <DataTable
                    className="table-responsive"
                    records={state.tableList || []}
                    columns={allColumns}
                    highlightOnHover
                    minHeight={180}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-3 pt-2 md:flex-row md:justify-end">
            <button
              type="button"
              className="btn btn-outline-danger w-full border md:w-auto"
              onClick={() => setState({ moveToLead: false })}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-dred w-full border-none md:w-auto"
              onClick={handleLeadSubmit}
              disabled={state.btnLoading}
            >
              {state.btnLoading ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Lead"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PrivateRouter(View_CallInquiry);
