"use client";

import React, { useEffect, useRef } from "react";
import { DataTable } from "mantine-datatable";
import IconEdit from "@/components/Icon/IconEdit";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  pageCounts,
  showDeleteAlert,
  Success,
  useSetState,
} from "@/utils/function.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconLoader from "@/components/Icon/IconLoader";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import TextInput from "@/components/FormFields/TextInput.component";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import { useRouter } from "next/navigation";
import PrivateRouter from "@/hook/privateRouter";
import {
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  Hourglass,
  SlidersHorizontal,
  X,
  Download,
  XCircle,
} from "lucide-react";
import {
  ROLES,
  statusChipConfig,
} from "@/utils/constant.utils";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import Paginations from "@/pages/elements/paginations";

const List = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    loading: false,
    page: 1,
    tableList: [],
    categoryList: [],
    editId: null,
    search: "",
    developerList: [],
    developer: null,
    developerPage: 1,
    developerNext: null,
    projectList: [],
    project: null,
    projectPage: 1,
    projectNext: null,
    propertyDropdownList: [],
    property: null,
    propertyPage: 1,
    propertyNext: null,
    userList: [],
    user: null,
    role: null,
    groupList: [],
    group: null,
    leadSourceList: [],
    lead_source: null,
    leadStatusList: [],
    status: null,
    leadType: null,
    showFilterModal: false,
    showStatusModal: false,
    statusRow: null,
    newStatus: null,
    sortBy: "",
    sortOrder: "asc",
    total: 0,
    pageSize: 10,
    selectedRecords: [],
    from_date: "",
    to_date: "",
    datePreset: "",
    custom_from: "",
    custom_to: "",
    statCount: {},
    opp_status: {},
  });

  const debouncedSearch = useDebounce(state.search, 500);
  const isFirstRender = useRef(true);
  const callIdRef = useRef(0);

  useEffect(() => {
    developerList(1);
    projectList(1);
    propertyDropdownList(1);
    groupList();
    statCount();
    leadSourceList();
    leadStatusList();
  }, []);

  // Cascading when developer filter changes
  useEffect(() => {
    if (isFirstRender.current) return;
    statCount();
    projectList(1);
    propertyDropdownList(1);
  }, [state.developer]);

  // Cascading when project filter changes
  useEffect(() => {
    if (isFirstRender.current) return;
    propertyDropdownList(1);
  }, [state.project]);

  // Fetch lead listings when any active filter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      leadPropertyList(1);
      return;
    }
    setState({ page: 1 });
    leadPropertyList(1);
  }, [
    debouncedSearch,
    state.developer,
    state.project,
    state.property,
    state.lead_source,
    state.status,
    state.leadType,
    state.from_date,
    state.to_date,
    state.role,
    state.user,
    state.date,
  ]);

  const developerList = async (page: number = 1) => {
    try {
      const body = {
        user_type: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown =
        res?.results?.map((item: any) => ({
          value: item?.id,
          label: item?.industry
            ? `${item.industry} (${item.first_name} ${item.last_name})`
            : `${item?.first_name} ${item?.last_name}`,
        })) || [];
      setState({
        developerList:
          page === 1 ? dropdown : [...state.developerList, ...dropdown],
        developerPage: page,
        developerNext: res?.next,
      });
    } catch (error) {
      console.log("error fetching developers --->", error);
    }
  };

  const developerLoadMore = async () => {
    try {
      if (state.developerNext) {
        await developerList(state.developerPage + 1);
      }
    } catch (error) {
      console.log("error loading more developers: ", error);
    }
  };

  const projectList = async (page: number = 1) => {
    try {
      const body: any = {};
      if (state.developer?.value) {
        body.developer = state.developer.value;
      }
      const res: any = await Models.project.list(page, body);
      const dropdown = Dropdown(res?.results, "name") || [];
      setState({
        projectList:
          page === 1 ? dropdown : [...state.projectList, ...dropdown],
        projectPage: page,
        projectNext: res?.next,
      });
    } catch (error) {
      console.log("error fetching projects --->", error);
    }
  };

  const projectListLoadMore = async () => {
    try {
      if (state.projectNext) {
        const body: any = {};
        if (state.developer?.value) {
          body.developer = state.developer.value;
        }
        const res: any = await Models.project.list(state.projectPage + 1, body);
        const newOptions = Dropdown(res?.results, "name") || [];
        setState({
          projectList: [...state.projectList, ...newOptions],
          projectPage: state.projectPage + 1,
          projectNext: res?.next,
        });
      }
    } catch (error) {
      console.log("error loading more projects: ", error);
    }
  };

  const propertyDropdownList = async (page: number = 1) => {
    try {
      const body: any = {};
      if (state.developer?.value) {
        body.developer = state.developer.value;
      }
      if (state.project?.value) {
        body.project = state.project.value;
      }
      const res: any = await Models.property.list(page, body);
      const dropdown = Dropdown(res?.results, "title") || [];
      setState({
        propertyDropdownList:
          page === 1 ? dropdown : [...state.propertyDropdownList, ...dropdown],
        propertyPage: page,
        propertyNext: res?.next,
      });
    } catch (error) {
      console.log("error fetching properties --->", error);
    }
  };

  const propertyDropdownLoadMore = async () => {
    try {
      if (state.propertyNext) {
        const body: any = {};
        if (state.developer?.value) {
          body.developer = state.developer.value;
        }
        if (state.project?.value) {
          body.project = state.project.value;
        }
        const res: any = await Models.property.list(
          state.propertyPage + 1,
          body
        );
        const newOptions = Dropdown(res?.results, "title") || [];
        setState({
          propertyDropdownList: [
            ...state.propertyDropdownList,
            ...newOptions,
          ],
          propertyPage: state.propertyPage + 1,
          propertyNext: res?.next,
        });
      }
    } catch (error) {
      console.log("error loading more properties: ", error);
    }
  };

  const groupList = async () => {
    try {
      const res: any = await Models.user.groups();
      const dropdown = Dropdown(res?.results, "name");
      const filter = dropdown?.filter(
        (item: any) => item?.label !== "Admin" && item?.label !== "Buyer"
      );
      setState({
        groupList: filter,
      });
    } catch (error) {
      console.log("error fetching groups --->", error);
    }
  };

  const leadStatusList = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadStatusList: dropdownList,
      });
    } catch (error) {
      console.log("error fetching lead statuses --->", error);
    }
  };

  const leadSourceList = async () => {
    try {
      const res: any = await Models.leadSource.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadSourceList: dropdownList,
      });
    } catch (error) {
      console.log("error fetching lead sources --->", error);
    }
  };

  const userByRoleList = async (page: number, roleName: string) => {
    try {
      let user_type = "";
      if (roleName === "Developer") user_type = ROLES.DEVELOPER;
      else if (roleName === "Agent") user_type = ROLES.AGENT;
      else if (roleName === "Seller") user_type = ROLES.SELLER;

      const res: any = await Models.user.list(page, { user_type });
      const dropdown = res?.results?.map((item: any) => ({
        value: item?.id,
        label: item?.industry
          ? `${item.industry} (${item.first_name} ${item.last_name})`
          : `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("error fetching users by role --->", error);
    }
  };

  const getuserList = (e: any) => {
    setState({ role: e, user: null });
    if (e?.label) {
      userByRoleList(1, e.label);
    }
  };

  const statCount = async () => {
    try {
      const body: any = {};
      if (state.developer?.value) {
        body.developer = state.developer.value;
      }

      const res: any = await Models.lead.count(body);
      const opp_status = res?.opportunity_status_counts || [];

      const getCount = (name: string) => {
        return opp_status.find((item: any) => item.name === name)?.count || 0;
      };

      const getId = (name: string) => {
        return opp_status.find((item: any) => item.name === name)?.id || 0;
      };

      const bodys = {
        won: {
          count: getCount("Won"),
          id: getId("Won"),
        },
        contacted: {
          count: getCount("Contacted"),
          id: getId("Contacted"),
        },
        follow_up: {
          count: getCount("Follow Up"),
          id: getId("Follow Up"),
        },
        lose: {
          count: getCount("Lose") || getCount("Lost"),
          id: getId("Lose") || getId("Lost") || 7,
        },
        total: res?.total || res?.total_opportunity_status_count || 0,
      };

      setState({
        statCount: res,
        opp_status: bodys,
      });
    } catch (error) {
      console.log("error fetching statCount --->", error);
    }
  };

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }

    if (state.developer?.value) {
      body.developer = state.developer.value;
    }

    if (state.project?.value) {
      body.project = state.project.value;
    }

    if (state.property?.value) {
      body.property = state.property.value;
    }

    if (state.lead_source?.value) {
      body.lead_source = state.lead_source.value;
    }

    if (state.property_type?.value) {
      body.property_type = state.property_type.value;
    }

    if (state.status?.value) {
      body.status = state.status.value;
    }

    if (state.date) {
      body.date = backendDateFormat(state.date);
    }
    if (state.from_date) {
      body.from_date = state.from_date;
    }
    if (state.to_date) {
      body.to_date = state.to_date;
    }
    if (state.datePreset === "Custom") {
      if (state.custom_from) body.from_date = state.custom_from;
      if (state.custom_to) body.to_date = state.custom_to;
    }

    if (state.leadType?.value === "website") {
      body.website = true;
    } else if (state.leadType?.value === "admin") {
      body.team = true;
    } else if (state.leadType?.value === "own") {
      const userId = localStorage.getItem("userId");
      if (userId) body.created_by = userId;
    }

    if (state.user?.value) {
      body.created_by = state.user.value;
    } else if (state.role?.value) {
      body.created_by_group = state.role.value;
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const leadPropertyList = async (
    page: number,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder
  ) => {
    try {
      const callId = ++callIdRef.current;
      setState({ loading: true, tableList: [] });
      const body = bodyData();
      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }
      const res: any = await Models.lead.lead_properties(page, body);
      if (callId !== callIdRef.current) return; // stale response ignore
      const data = res?.results?.map((item: any) => {
        const devObj =
          typeof item?.developer === "object" && item?.developer !== null
            ? item.developer
            : item?.developer_details || null;
        const devCompany = devObj?.industry || item?.industry_name || "";
        const devPerson =
          devObj?.first_name || devObj?.last_name
            ? `${devObj?.first_name || ""} ${devObj?.last_name || ""}`.trim()
            : "";
        const devEmail = devObj?.email || item?.developer_email || "";
        const devPhone =
          devObj?.phone || devObj?.mobile || item?.developer_phone || "";
        const developerDisplay =
          devCompany ||
          devPerson ||
          (typeof item?.developer === "string" ? item.developer : "-");

        return {
         
          id: item?.lead_details?.id || item?.id,
          customer_name:
            item?.lead_details?.full_name || item?.customer_name || "-",
          property_lead_id: item?.id,
          inquiry: item?.inquiry_details || item?.inquiry || "-",
          property_id: item?.property,
          property_title: item?.title || item?.property_title || "-",
          property_image: item?.primary_image,
          property_city:
            item?.city?.name ||
            (typeof item?.city === "string"
              ? item?.city
              : item?.lead_details?.area_details?.name || "-"),
          property_area:
            item?.lead_details?.area_details?.name ||
            item?.area?.name ||
            "-",
          property_listing_type: item?.listing_type,
          property_status: item?.status,
          property_type:
            item?.lead_details?.properties_details
              ?.find((p: any) => p?.id === item?.property)
              ?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) || [],
          project: item?.project_name || item?.project?.name || "-",
          price_range: {
            minimum_price: item?.minimum_price,
            maximum_price: item?.maximum_price,
          },
          built_up_area: item?.built_up_area,
          full_name: item?.lead_details?.full_name || "-",
          email: item?.lead_details?.email || "",
          phone:
            item?.lead_details?.phone ||
            item?.lead_details?.mobile ||
            item?.lead_details?.phone_number ||
            "",
          developer_name: developerDisplay,
          developer_email: devEmail,
          developer_phone: devPhone,
          developer_user_details: devObj,
          lead_source: item?.lead_details?.lead_source_info,
          opportunity_status_id: item?.opportunity_status,
          opportunity_status:
            item?.opportunity_status_details?.name ||
            (typeof item?.opportunity_status === "string" && isNaN(Number(item?.opportunity_status))
              ? item?.opportunity_status
              : state.leadStatusList?.find(
                  (s: any) => String(s.value) === String(item?.opportunity_status)
                )?.label ||
                item?.opportunity_status_details?.name ||
                item?.opportunity_status),
          status: item?.lead_details?.status_info,
          date: commonDateFormat(item?.created_at),
          requirements: item?.lead_details?.requirements,
          assigned_to: item?.lead_details?.assigned_to_details
            ? `${item?.lead_details?.assigned_to_details?.first_name || ""} ${item?.lead_details?.assigned_to_details?.last_name || ""}`.trim()
            : "",
          assigned_by: item?.lead_details?.assigned_by_details
            ? `${item?.lead_details?.assigned_by_details?.first_name || ""} ${item?.lead_details?.assigned_by_details?.last_name || ""}`.trim()
            : "",
          company_name: item?.lead_details?.company_name,
          ...item,
        };
      });
      const group = localStorage.getItem("group");
      setState({
        tableList: data,
        total: res.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
        group,
        selectedRecords: [],
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      console.log("error in leadPropertyList --->", error);
    }
  };

  const handleEdit = (row: any) => {
    router.push(
      `/real-estate/lead/property-edit?lead=${row?.id}&property=${row?.property_id}`
    );
  };

  const handleStatus = async (row: any) => {
    setState({ statusRow: row, showStatusModal: true, newStatus: null });
  };

  const confirmStatus = async (statusRow: any, newStatus: any) => {
    if (!newStatus) return;
    try {
      setState({ btnLoading: true });
      await Models.lead.lead_properties_update(
        { opportunity_status: newStatus?.value },
        statusRow?.property_lead_id
      );
      setState({ showStatusModal: false, btnLoading: false });
      leadPropertyList(state.page);
      Success("Lead status updated successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    let from = "",
      to = fmt(today);
    if (preset === "Year") {
      from = `${today.getFullYear()}-01-01`;
    } else if (preset === "Last Month") {
      from = fmt(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      to = fmt(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (preset === "This Month") {
      from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (preset === "Last 7 Days") {
      const d = new Date(today);
      d.setDate(d.getDate() - 6);
      from = fmt(d);
    }
    setState({ datePreset: preset, from_date: from, to_date: to });
  };

  const clearAllFilters = () => {
    setState({
      search: "",
      developer: null,
      project: null,
      property: null,
      lead_source: null,
      status: null,
      date: null,
      role: null,
      user: null,
      leadType: null,
      from_date: "",
      to_date: "",
      datePreset: "",
      custom_from: "",
      custom_to: "",
    });
  };

  const exportToExcel = () => {
    const headers = [
      "Date",
      "Customer Name",
      "Email",
      "Phone",
      "Developer",
      "Property",
      "Project",
      "City",
      "Area",
      "Lead Source",
      "Status",
      "Opportunity Status",
      "Inquiry",
    ];
    const rows = state.tableList.map((row: any) => [
      `\t${row.date || ""}`,
      row.customer_name || row.full_name || "",
      row.email || "",
      row.phone || "",
      row.developer_name || "",
      row.property_title || "",
      row.project || "",
      row.property_city || "",
      row.property_area || "",
      row.lead_source?.name || "",
      row.status?.name || "",
      row.opportunity_status || "",
      row.inquiry || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((r) =>
        r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_admin_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      accessor: "full_name",
      title: "Lead Details",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <div className="flex flex-col gap-0.5">
          <div
            onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}
            className="cursor-pointer text-sm  hover:underline"
          >
            {row?.customer_name || row?.full_name || "-"}
          </div>
          {(row?.phone || row?.email) && (
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
              {row?.phone && <span>{row.phone}</span>}
              {row?.phone && row?.email && <span>•</span>}
              {row?.email && (
                <span className="max-w-[180px] truncate" title={row.email}>
                  {row.email}
                </span>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "developer_name",
      title: "Developer",
      visible: true,
      toggleable: true,
      sortable: false,
      render: (row: any) => (
        <div className="flex flex-col">
          <span
            className="text-sm font-medium text-gray-800 dark:text-gray-200"
            title={row?.developer_user_details?.industry}
          >
            {row?.developer_user_details?.industry || "-"}
          </span>
          {row?.developer_email && (
            <span
              className="max-w-[180px] truncate text-[11px] text-gray-400"
              title={row.developer_email}
            >
              {row.developer_email}
            </span>
          )}
        </div>
      ),
    },
    {
      accessor: "property_title",
      title: "Property Name",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <div
          className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
          onClick={() =>
            row?.property_id &&
            router.push(`/real-estate/property/detail/${row?.property_id}`)
          }
          title={row?.property_title}
        >
          {row?.property_title || "-"}
        </div>
      ),
    },
    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row?.project || "-"}
        </span>
      ),
    },
    // {
    //   accessor: "property_city",
    //   title: "City",
    //   visible: true,
    //   toggleable: true,
    //   sortable: true,
    //   render: (row: any) => (
    //     <span className="text-sm text-gray-700 dark:text-gray-300">
    //       {row?.property_city || "-"}
    //     </span>
    //   ),
    // },
    {
      accessor: "lead_source",
      title: "Lead Source",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => {
        const source = row?.lead_source?.name;
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              source === "Website"
                ? "bg-green-100 text-green-700"
                : source === "Social Media"
                ? "bg-blue-100 text-blue-700"
                : source === "Referral"
                ? "bg-purple-100 text-purple-700"
                : source === "Walk In"
                ? "bg-yellow-100 text-yellow-700"
                : source === "Cold Call"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {source || "-"}
          </span>
        );
      },
    },
    {
      accessor: "opportunity_status",
      title: "Lead Status",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => {
        const status =
          row?.opportunity_status_details?.name ||
          (typeof row?.opportunity_status === "string" &&
          isNaN(Number(row?.opportunity_status))
            ? row?.opportunity_status
            : state.leadStatusList?.find(
                (s: any) =>
                  String(s.value) === String(row?.opportunity_status) ||
                  String(s.value) === String(row?.opportunity_status_id)
              )?.label ||
              row?.opportunity_status_details?.name ||
              row?.opportunity_status ||
              "-");
        const config = statusChipConfig[status];
        return (
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              config?.bg || "bg-gray-100"
            } ${config?.text || "text-gray-600"}`}
          >
            {status || "-"}
          </span>
        );
      },
    },
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <div className="text-sm font-medium">{row?.date || "-"}</div>
      ),
    },
    {
      accessor: "inquiry",
      title: "Inquiry",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2" title={row?.inquiry}>
          {row?.inquiry || "-"}
        </span>
      ),
    },
    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false,
      sortable: false,
      textAlign: "center",
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            className="flex text-dred"
            onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}
            title="View Lead Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            className="flex text-success"
            onClick={() => handleStatus(row)}
            title="Change Lead Status"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            className="flex text-primary"
            onClick={() => handleEdit(row)}
            title="Edit Lead"
          >
            <IconEdit className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    setState({ page: page });
    leadPropertyList(page);
  };

  return (
    <>
      <div className="mb-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h5 className="text-lg font-semibold dark:text-white-light">
            Lead Management 
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Access, filter, and manage all leads across all developers, projects, and properties
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-600 hover:text-white"
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            className="btn btn-dred border-none"
            onClick={() => router.push("/real-estate/lead/create")}
          >
            + Create
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div
          onClick={() => {
            setState({ status: null });
          }}
          className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 p-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg">
              <Briefcase className="text-dblue h-8 w-8" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {state?.statCount?.total_opportunity_status_count ||
                  state?.opp_status?.total ||
                  0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setState({
              status: { value: state.opp_status?.won?.id, label: "Won" },
            })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 p-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {state.opp_status?.won?.count || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Won Leads
              </p>
            </div>
          </div>
        </div>

        <div
          onClick={() =>
            setState({
              status: {
                value: state.opp_status?.contacted?.id,
                label: "Contacted",
              },
            })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-yellow-100 p-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg">
              <Hourglass className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {state.opp_status?.contacted?.count || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Contacted
              </p>
            </div>
          </div>
        </div>

        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-purple-100 p-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() =>
            setState({
              status: {
                value: state.opp_status?.follow_up?.id,
                label: "Follow Up",
              },
            })
          }
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {state.opp_status?.follow_up?.count || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Follow Up
              </p>
            </div>
          </div>
        </div>

        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-red-100 p-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() => setState({ status: { value: 7, label: "Lost" } })}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-lg">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex flex-col">
              <p className="text-2xl font-bold leading-none text-gray-900 dark:text-white">
                {state.opp_status?.lose?.count || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Lost Leads
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="mb-4 flex w-fit flex-wrap items-center gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {["Year", "Last Month", "This Month", "Last 7 Days", "Custom"].map(
          (preset) => (
            <button
              key={preset}
              onClick={() =>
                preset !== "Custom"
                  ? handleDatePreset(preset)
                  : setState({ datePreset: "Custom" })
              }
              className={`border-r border-gray-200 px-4 py-2 text-sm font-medium transition dark:border-gray-700 ${
                state.datePreset === preset
                  ? "bg-dred text-white"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {preset}
            </button>
          )
        )}
        <input
          type="datetime-local"
          value={state.custom_from ? `${state.custom_from}T00:00` : ""}
          onChange={(e) =>
            setState({
              custom_from: e.target.value?.slice(0, 10),
              datePreset: "Custom",
              from_date: "",
              to_date: "",
            })
          }
          className="border-r border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        <input
          type="datetime-local"
          value={state.custom_to ? `${state.custom_to}T00:00` : ""}
          onChange={(e) =>
            setState({
              custom_to: e.target.value?.slice(0, 10),
              datePreset: "Custom",
              from_date: "",
              to_date: "",
            })
          }
          className="border-r border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        />
        <button
          onClick={() => leadPropertyList(1)}
          className="border-r border-gray-200 bg-dred px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:border-gray-700"
        >
          Go
        </button>
      </div>

      {/* Admin Filters Grid */}
      <div className="mb-4 rounded-2xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 items-center">
          <TextInput
            type="text"
            placeholder="Search lead, property..."
            value={state.search}
            onChange={(e: any) => setState({ search: e.target.value })}
          />

          <CustomSelect
            value={state.developer}
            onChange={(e: any) => {
              setState({
                developer: e,
                project: null,
                property: null,
                page: 1,
              });
            }}
            placeholder="All Developers"
            options={state.developerList}
            loadMore={developerLoadMore}
            isClearable={true}
          />

          <CustomSelect
            value={state.project}
            onChange={(e: any) => {
              setState({
                project: e,
                property: null,
                page: 1,
              });
            }}
            placeholder="All Projects"
            options={state.projectList}
            loadMore={projectListLoadMore}
            isClearable={true}
          />

          <CustomSelect
            value={state.property}
            onChange={(e: any) => {
              setState({
                property: e,
                page: 1,
              });
            }}
            placeholder="All Properties"
            options={state.propertyDropdownList}
            loadMore={propertyDropdownLoadMore}
            isClearable={true}
          />

          <CustomSelect
            value={state.lead_source}
            onChange={(e: any) => setState({ lead_source: e })}
            placeholder="Lead Source"
            options={state.leadSourceList}
            error={state.errors?.lead_source}
            isClearable={true}
          />

          <div className="flex items-center gap-2">
            <CustomSelect
              value={state.status}
              onChange={(e: any) => setState({ status: e })}
              placeholder="Status"
              options={state.leadStatusList}
              error={state.errors?.status}
              isClearable={true}
              className="flex-1"
            />

            <button
              onClick={() => setState({ showFilterModal: true })}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 whitespace-nowrap"
              title="More Filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          <div className="mb-4 flex items-start justify-between">
            <FilterChips
              chips={[
                ...(state.search
                  ? [
                      {
                        label: `Search: ${state.search}`,
                        onRemove: () => setState({ search: "" }),
                      },
                    ]
                  : []),
                ...(state.developer
                  ? [
                      {
                        label: `Developer: ${state.developer.label}`,
                        onRemove: () =>
                          setState({
                            developer: null,
                            project: null,
                            property: null,
                          }),
                      },
                    ]
                  : []),
                ...(state.project
                  ? [
                      {
                        label: `Project: ${state.project.label}`,
                        onRemove: () =>
                          setState({
                            project: null,
                            property: null,
                          }),
                      },
                    ]
                  : []),
                ...(state.property
                  ? [
                      {
                        label: `Property: ${state.property.label}`,
                        onRemove: () => setState({ property: null }),
                      },
                    ]
                  : []),
                ...(state.lead_source
                  ? [
                      {
                        label: `Source: ${state.lead_source.label}`,
                        onRemove: () => setState({ lead_source: null }),
                      },
                    ]
                  : []),
                ...(state.status
                  ? [
                      {
                        label: `Status: ${state.status.label}`,
                        onRemove: () => setState({ status: null }),
                      },
                    ]
                  : []),
                ...(state.leadType
                  ? [
                      {
                        label: `Records: ${state.leadType.label}`,
                        onRemove: () => setState({ leadType: null }),
                      },
                    ]
                  : []),
                ...(state.date
                  ? [
                      {
                        label: `Date: ${commonDateFormat(state.date)}`,
                        onRemove: () => setState({ date: null }),
                      },
                    ]
                  : []),
                ...(state.from_date
                  ? [
                      {
                        label: `From Date: ${commonDateFormat(
                          state.from_date
                        )}`,
                        onRemove: () =>
                          setState({ from_date: null, datePreset: "" }),
                      },
                    ]
                  : []),
                ...(state.to_date
                  ? [
                      {
                        label: `To Date: ${commonDateFormat(state.to_date)}`,
                        onRemove: () =>
                          setState({ to_date: null, datePreset: "" }),
                      },
                    ]
                  : []),
                ...(state.custom_from
                  ? [
                      {
                        label: `From Date: ${commonDateFormat(
                          state.custom_from
                        )}`,
                        onRemove: () =>
                          setState({ custom_from: null, datePreset: "" }),
                      },
                    ]
                  : []),
                ...(state.custom_to
                  ? [
                      {
                        label: `To Date: ${commonDateFormat(state.custom_to)}`,
                        onRemove: () =>
                          setState({ custom_to: null, datePreset: "" }),
                      },
                    ]
                  : []),
                ...(state.role
                  ? [
                      {
                        label: `Role: ${state.role.label}`,
                        onRemove: () => setState({ role: null, user: null }),
                      },
                    ]
                  : []),
                ...(state.user
                  ? [
                      {
                        label: `User: ${state.user.label}`,
                        onRemove: () => setState({ user: null }),
                      },
                    ]
                  : []),
              ]}
              onClearAll={clearAllFilters}
            />
          </div>

          <div className="flex items-center justify-end pb-2 pr-3">
            <div className="p-1 font-semibold">
              {pageCounts(state.page, state.total)}
            </div>
          </div>

          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={columns}
            highlightOnHover
            fetching={state.loading}
            minHeight={200}
            withBorder={true}
            noRecordsText={state.tableList?.length ? "" : "No records"}
            emptyState={state.tableList?.length ? <></> : undefined}
            sortStatus={{
              columnAccessor: state.sortBy,
              direction: state.sortOrder as "asc" | "desc",
            }}
            onSortStatusChange={({ columnAccessor, direction }) => {
              setState({
                sortBy: columnAccessor,
                sortOrder: direction,
                page: 1,
              });
              leadPropertyList(1, columnAccessor, direction);
            }}
            style={{ zIndex: 0 }}
          />

          {state.tableList?.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingTop: "10px",
              }}
            >
              <Paginations
                totalPage={state.total}
                itemsPerPage={10}
                currentPages={state.page}
                activeNumber={handlePageChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* More Filters Modal */}
      <Modal
        open={state.showFilterModal}
        close={() => setState({ showFilterModal: false })}
        maxWidth="!w-[800px]"
        renderComponent={() => (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">More Filters</h2>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-2">
              <CustomSelect
                placeholder="Select Scope"
                value={state.leadType}
                onChange={(e: any) => setState({ leadType: e })}
                options={[
                  { value: "own", label: "Own Records" },
                  { value: "admin", label: "Admin Records" },
                  { value: "website", label: "Website Leads" },
                ]}
                isClearable={true}
              />

              <CustomSelect
                placeholder="Select User Role"
                value={state.role}
                onChange={(e: any) => {
                  getuserList(e);
                  setState({ userList: [] });
                }}
                options={state.groupList}
                isClearable={true}
              />

              <CustomSelect
                placeholder="Select User"
                value={state.user}
                onChange={(e: any) => setState({ user: e })}
                options={state.userList}
                disabled={!state.role}
                isClearable={true}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <button
                onClick={clearAllFilters}
                className="rounded px-3 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setState({ showFilterModal: false })}
                className="btn btn-dred border-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      />

      {/* Change Lead Status Modal */}
      <Modal
        open={state.showStatusModal}
        close={() => setState({ showStatusModal: false })}
        maxWidth="!w-[500px]"
        renderComponent={() => (
          <div className="pb-0">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Change Lead Status</h2>
              <button
                onClick={() => setState({ showStatusModal: false })}
                className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4">
              <CustomSelect
                value={state.newStatus}
                onChange={(e: any) => setState({ newStatus: e })}
                className="z-100"
                placeholder="Select Status"
                options={state.leadStatusList}
              />
            </div>
            <div className="flex items-center justify-end gap-3 pb-0 pt-16">
              <button
                onClick={() => setState({ showStatusModal: false })}
                className="btn border-dred hover:btn-mred"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmStatus(state.statusRow, state.newStatus)}
                className="btn btn-dred border-none"
              >
                {state.btnLoading ? <IconLoader /> : "Confirm"}
              </button>
            </div>
          </div>
        )}
      />
    </>
  );
};

export default PrivateRouter(List);
