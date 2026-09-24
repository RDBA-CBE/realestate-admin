"use client";

import React, { useEffect, useRef } from "react";
import { DataTable } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  pageCounts,
  useSetState,
} from "@/utils/function.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import Models from "@/imports/models.import";
import TextInput from "@/components/FormFields/TextInput.component";
import useDebounce from "@/hook/useDebounce";
import { useRouter } from "next/navigation";
import PrivateRouter from "@/hook/privateRouter";
import {
  Download,
  Eye,
} from "lucide-react";
import { ROLES } from "@/utils/constant.utils";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import moment from "moment";
import Paginations from "@/pages/elements/paginations";

const List = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    loading: false,
    page: 1,
    tableList: [],
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
    inquiryType: null,
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
  });

  const debouncedSearch = useDebounce(state.search, 500);
  const isFirstRender = useRef(true);

  useEffect(() => {
    developerList(1);
    projectList(1);
    propertyDropdownList(1);
  }, []);

  // Cascading when developer filter changes
  useEffect(() => {
    if (isFirstRender.current) return;
    projectList(1);
    propertyDropdownList(1);
  }, [state.developer]);

  // Cascading when project filter changes
  useEffect(() => {
    if (isFirstRender.current) return;
    propertyDropdownList(1);
  }, [state.project]);

  // Fetch list when filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      leadList(1);
      return;
    }
    setState({ page: 1 });
    leadList(1);
  }, [
    debouncedSearch,
    state.developer,
    state.project,
    state.property,
    state.inquiryType,
    state.from_date,
    state.to_date,
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

  const bodyData = () => {
    let body: any = {};

    // For Super Admin: only filter by developer if selected
    if (state.developer?.value) {
      body.developer_user = state.developer.value;
      body.developer = state.developer.value;
    }

    if (state.project?.value) {
      body.project = state.project.value;
    }

    if (state.property?.value) {
      body.property = state.property.value;
    }

    if (state.search) {
      body.search = state.search;
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

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const leadList = async (
    page: number,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder
  ) => {
    try {
      setState({ loading: true, tableList: [] });

      const body = bodyData();
      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      const response: any = await Models.inquiry.callback(page, body);

      let results = response?.results || [];

      // Filter by inquiry type if selected (Property vs General)
      if (state.inquiryType?.value === "property") {
        results = results.filter((item: any) => item?.property_details || item?.property);
      } else if (state.inquiryType?.value === "general") {
        results = results.filter((item: any) => !item?.property_details && !item?.property);
      }

      const tableData = results.map((item: any) => {
        const devObj =
          (typeof item?.developer_user_details === "object" && item?.developer_user_details !== null
            ? item.developer_user_details
            : null) ||
          (typeof item?.developer_details === "object" && item?.developer_details !== null
            ? item.developer_details
            : null) ||
          (typeof item?.property_details?.developer_details === "object" && item?.property_details?.developer_details !== null
            ? item.property_details.developer_details
            : null) ||
          (typeof item?.developer === "object" && item?.developer !== null
            ? item.developer
            : null);

        const devCompany =
          (devObj && typeof devObj.industry === "string" && devObj.industry) ||
          (item && typeof item.industry_name === "string" && item.industry_name) ||
          "";

        const devPerson =
          devObj && (devObj.first_name || devObj.last_name)
            ? `${devObj.first_name || ""} ${devObj.last_name || ""}`.trim()
            : "";

        const devEmail =
          (devObj && typeof devObj.email === "string" && devObj.email) || "";

        const developerDisplay =
          devCompany ||
          devPerson ||
          (typeof item?.developer === "string" ? item.property_details?.developer?.industry : "-");

        return {
          id: item?.id,
          email: typeof item?.email === "string" ? item.email : "-",
          phone:
            typeof item?.phone_number === "string"
              ? item.phone_number
              : typeof item?.phone === "string"
              ? item.phone
              : "-",
          message: typeof item?.message === "string" ? item.message : "-",
          property: item?.property_details ?? null,
          property_id:
            item?.property_details?.id ||
            (typeof item?.property === "number" || typeof item?.property === "string"
              ? item.property
              : null),
          property_title:
            (item?.property_details &&
              typeof item.property_details.title === "string" &&
              item.property_details.title) ||
            "-",
          developer_name: item?.property_details?.developer?.industry || '-',
          developer_email: devEmail,
          developer_user_details: devObj,
          created_at: commonDateFormat(item?.created_at),
          created_date: item?.created_at
            ? moment(item.created_at).format("DD-MM-YYYY")
            : null,
          interested_area:
            typeof item?.search === "string" ? item.search : "-",
          ...item,
        };
      });

      const group = localStorage.getItem("group");

      setState({
        tableList: tableData,
        total: response?.count || tableData.length,
        page: page,
        next: response.next,
        previous: response.previous,
        totalRecords: response?.count || tableData.length,
        group,
        selectedRecords: [],
        loading: false,
      });
    } catch (error) {
      setState({ loading: false });
      console.log("error in leadList --->", error);
    }
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    let from = "",
      to = fmt(today);
    if (preset === "Year") {
      from = `${today.getFullYear()}-01-01`;
    } else if (preset === "LastMonth") {
      from = fmt(new Date(today.getFullYear(), today.getMonth() - 1, 1));
      to = fmt(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (preset === "ThisMonth") {
      from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (preset === "Last7Days") {
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
      inquiryType: null,
      date: null,
      from_date: "",
      to_date: "",
      datePreset: "",
      custom_from: "",
      custom_to: "",
    });
  };

  const exportToExcel = () => {
    const headers = [
      "Created Date",
      "Type",
      "Email",
      "Phone",
      "Developer",
      "Property",
      "Message",
    ];
    const rows = state.tableList.map((row: any) => [
      row.created_at || row.created_date || "",
      row.property ? "Property" : "General",
      row.email || "",
      row.phone || "",
      row.developer_name || "",
      row.property_title || row?.property?.title || "",
      row.message || "",
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
    link.download = `call_inquiries_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns = [
    {
      accessor: "type",
      title: "Type",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <div
          onClick={() => {
            router.push(`/real-estate/inquiry/view_call_inquiry/${row?.id}`);
          }}
          className="cursor-pointer"
        >
          <div>{row?.property ? "Property" : "General"}</div>
        </div>
      ),
    },
    {
      accessor: "property",
      title: "Property",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => {
        const propTitle =
          (typeof row?.property_title === "string" && row.property_title) ||
          (typeof row?.property?.title === "string" && row.property.title) ||
          "-";
        const propId =
          row?.property_id ||
          (typeof row?.property?.id === "number" || typeof row?.property?.id === "string"
            ? row.property.id
            : null);

        return (
          <div
            className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
            onClick={() => {
              if (propId) {
                router.push(`/real-estate/property/detail/${propId}`);
              }
            }}
            title={propTitle}
          >
            {propTitle}
          </div>
        );
      },
    },
    {
      accessor: "phone",
      title: "Phone",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {typeof row?.phone === "string" || typeof row?.phone === "number"
            ? String(row.phone)
            : "-"}
        </span>
      ),
    },
    {
      accessor: "email",
      title: "Email",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {typeof row?.email === "string" ? row.email : "-"}
        </span>
      ),
    },
    {
      accessor: "developer_name",
      title: "Developer",
      visible: true,
      toggleable: true,
      sortable: false,
      render: (row: any) => {
       
        return (
          <div className="flex flex-col">
            <span
              className="text-sm font-medium text-gray-800 dark:text-gray-200"
              title={row.developer_name}
            >
              {row.developer_name}
            </span>

          </div>
        );
      },
    },
    {
      accessor: "created_at",
      title: "Created Date",
      visible: true,
      toggleable: true,
      sortable: true,
      width: 150,
      render: (row: any) => {
        const dateDisplay =
          (typeof row?.created_at === "string" && row.created_at) ||
          (typeof row?.created_date === "string" && row.created_date) ||
          "-";
        return (
          <div
            className="w-fit cursor-pointer"
            onClick={() => {
              router.push(`/real-estate/inquiry/view_call_inquiry/${row?.id}`);
            }}
          >
            <div>{moment(dateDisplay).format('DD/MM/YYYY')}</div>
          </div>
        );
      },
    },
    {
      accessor: "message",
      title: "Message",
      visible: true,
      toggleable: true,
      sortable: true,
      width: 150,
      render: (row: any) => {
        const msg = typeof row?.message === "string" ? row.message : "-";
        return (
          <Tippy
            content={msg}
            placement="top"
            className="rounded-lg bg-black p-1 text-sm text-white"
          >
            <div className="cursor-default">
              {msg.length > 20
                ? `${capitalizeFLetter(msg.slice(0, 15))}...`
                : capitalizeFLetter(msg) || "-"}
            </div>
          </Tippy>
        );
      },
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
            className="flex text-dred hover:opacity-80"
            onClick={() => {
              router.push(`/real-estate/inquiry/view_call_inquiry/${row?.id}`);
            }}
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const handlePageChange = (page: number) => {
    setState({ page });
    leadList(page);
  };

  const filteredColumns = columns
    ?.filter((col) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }) => col);

  return (
    <>
      <div className="mb-3 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h5 className="text-lg font-semibold dark:text-white-light">
            Call Inquiry Management
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Access, filter, and manage all call inquiries across all developers, projects, and properties
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
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="mb-4 flex w-fit flex-wrap items-center gap-0 overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {["Year", "LastMonth", "ThisMonth", "Last7Days", "Custom"].map(
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
          onClick={() => leadList(1)}
          className="border-r border-gray-200 bg-dred px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 dark:border-gray-700"
        >
          Go
        </button>
      </div>

      {/* Admin Filters Grid */}
      <div className="mb-4 rounded-2xl">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-center">
          <TextInput
            type="text"
            placeholder="Search inquiry, phone, email..."
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

          {/* <CustomSelect
            value={state.inquiryType}
            onChange={(e: any) => setState({ inquiryType: e, page: 1 })}
            placeholder="All Inquiry Types"
            options={[
              { value: "property", label: "Property Inquiry" },
              { value: "general", label: "General Inquiry" },
            ]}
            isClearable={true}
          /> */}
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
                ...(state.inquiryType
                  ? [
                      {
                        label: `Type: ${state.inquiryType.label}`,
                        onRemove: () => setState({ inquiryType: null }),
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
              ]}
              onClearAll={clearAllFilters}
            />
            <div className="ml-auto text-sm text-black dark:text-white">
              {state.total} Inquiries found
            </div>
          </div>

          <div className="flex items-center justify-end pb-2 pr-3">
            <div className="p-1 font-semibold">
              {pageCounts(state.page, state.total)}
            </div>
          </div>

          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={filteredColumns}
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
              leadList(1, columnAccessor, direction);
            }}
            style={{ zIndex: 0 }}
          />
        </div>

        {state.tableList?.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: "10px",
              paddingBottom: "20px",
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
    </>
  );
};

export default PrivateRouter(List);
