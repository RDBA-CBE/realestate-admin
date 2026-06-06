"use client";

import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
import IconEdit from "@/components/Icon/IconEdit";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  Failure,
  showDeleteAlert,
  Success,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import IconLoader from "@/components/Icon/IconLoader";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import IconTrash from "@/components/Icon/IconTrash";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { useRouter } from "next/navigation";
import PrivateRouter from "@/hook/privateRouter";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import Link from "next/link";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Columns,
  Eye,
  EyeOff,
  Hourglass,
  SlidersHorizontal,
  Table,
  X,
  Download,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import {
  FILTER_ROLES,
  ROLES,
  sourceConfig,
  statusConfig,
} from "@/utils/constant.utils";
import CustomeDatePicker from "@/components/datePicker";
import { clear, group } from "console";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import { render } from "@fullcalendar/core/preact";
import user from "@/models/user.model";

const List = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    categoryList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    visibleColumns: [],
    userList: [],
    role: null,
    groupList: [],
    group: null,
    showFilterModal: false,
    showStatusModal: false,
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

  const isFirstRender = React.useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      leadList(1);
      return;
    }
    leadList(1);
  }, [
    debouncedSearch,
    state.user,
    state.developer,
    state.agent,
    state.role,
    state.lead_source,
    state.status,
    state.date,
    state.leadType,
    state.from_date,
    state.to_date,
    // state.leadStatus
  ]);

  const leadList = async (
    page,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
    try {
      setState({ tableList: [] });
      const body = bodyData();
      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }
      const res: any = await Models.lead.list(page, body);

      const response: any = await Models.inquiry.callback(page, body);
      console.log("response", response);

      const tableData = response?.results?.map((item) => {
        console.log("item", item);
        return {
          id: item?.id,
          email: item?.email,
          phone: item?.phone_number,
          message: item?.message,
          property: item?.property_details ?? null,
          created_at: commonDateFormat(item?.created_at),
          interested_area: item?.search,
        };
      });
      console.log("tableData", tableData);

      const group = localStorage.getItem("group");

      setState({
        tableList: tableData,
        total: response?.count,
        page: page,
        next: response.next,
        previous: response.previous,
        totalRecords: response?.count,
        group,
        selectedRecords: [],
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const bodyData = () => {
    const userId = localStorage.getItem("userId");
    const group = localStorage.getItem("group");
    let body: any = {};

    // body.interested_property = true;

    body.status = 6; // Won status

    if (state.search) {
      body.search = state.search;
    }

    if (state.lead_source) {
      body.lead_source = state.lead_source.value;
    }

    if (state.property_type) {
      body.property_type = state.property_type;
    }

    // if (state.status) {
    //   body.status = state.status.value;
    // }

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
    body.developer = userId;

    if (state.leadType?.value === "own") {
      body.created_by = userId;
    }
    if (state.leadType?.value === "admin") {
      body.team = true;
    }

    if (state.leadType?.value === "website") {
      body.website = true;
    }

    // if (state.user) {
    //   body.created_by = state.user?.value;
    // } else {
    //   if (state.role) {
    //     body.created_by_group = state.role?.value;
    //   } else {
    //     body.created_by = userId;
    //   }
    // }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    // if (group == capitalizeFLetter(ROLES.ADMIN)) {
    //   body = { ...body, ...adminBody() };
    // }

    console.log("✌️body --->", body);
    return body;
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      async () => {
        try {
          setState({ btnLoading: true });
          await Promise.all(
            state.selectedRecords.map((row: any) =>
              Models.lead.delete(row?.id),
            ),
          );
          setState({ selectedRecords: [], btnLoading: false });
          leadList(state.page);
          Success(
            `${state.selectedRecords.length} lead${
              state.selectedRecords.length > 1 ? "s" : ""
            } deleted successfully`,
          );
        } catch (error) {
          setState({ btnLoading: false });
        }
      },
      () => Swal.fire("Cancelled", "Your Records are safe :)", "info"),
      `Are you sure want to delete ${
        state.selectedRecords.length
      } selected lead${state.selectedRecords.length > 1 ? "s" : ""}?`,
    );
  };

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.page + 1;
      leadList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      leadList(newPage);
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
      lead_source: null,
      status: null,
      date: null,
      role: null,
      user: null,
      recordType: null,
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
      "Property",
      "Lead Source",
      "Status",
      "Assigned To",
      "Assigned By",
      "Requirements",
    ];
    const rows = state.tableList.map((row: any) => [
      row.date || "",
      row.full_name || "",
      row.email || "",
      row.property || "",
      row.lead_source.name || "",
      row.status.name || "",
      row.assigned_to || "",
      row.assigned_by || "",
      row.requirements || "",
    ]);
    const csvContent = [headers, ...rows]
      .map((r) =>
        r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilter = () => {
    console.log("clearFilter");

    setState({
      search: "",
      lead_source: null,
      property_type: null,
      status: null,
      date: null,
      role: null,
      user: null,
    });
  };

  const columns = [
    {
      accessor: "email",
      title: "Type",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <div
        onClick={(e) => {
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
      render: (row) => (
        <div
          className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
          onClick={() => {
            router.push(`/real-estate/property/detail/${row?.property?.id}`);
          }}
        >
          {row?.property ? row?.property?.title : "-"}
        </div>
      ),
    },
    {
      accessor: "phone",
      title: "Phone",
      visible: true,
      toggleable: true,
      sortable: true,
    },

    {
      accessor: "email",
      title: "Email",
      visible: true,
      toggleable: true,
      sortable: true,
    },

    {
      accessor: "created_at",
      title: "Date",
      visible: true,
      toggleable: true,
      sortable: true,
      width: 150,
      render: (row) => (
        <div
          className="w-fit cursor-pointer"
          onClick={(e) => {
            router.push(`/real-estate/lead/view/${row?.id}`);
          }}
        >
          <div>{row?.created_at}</div>
        </div>
      ),
    },
    {
      accessor: "message",
      title: "Message",
      visible: true,
      toggleable: true,
      sortable: true,
      width: 150,
      render: (row) => (
        <Tippy
          content={row?.message || "-"}
          placement="top"
          className="rounded-lg bg-black p-1 text-sm text-white"
        >
          <div className="cursor-default">
            {row?.message?.length > 20
              ? `${row.message.slice(0, 15)}...`
              : row?.message || "-"}
          </div>
        </Tippy>
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
            className="text-dred flex"
            onClick={(e) => {
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

  const filteredColumns = columns
    ?.filter((col) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }) => col);

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Call Inquiry List
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Call Inquiry listings
          </p>
        </div>
        <div className="flex gap-3">
          {/* <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-green-600 px-3 py-2 text-sm font-semibold text-green-600 transition hover:bg-green-600 hover:text-white"
            onClick={exportToExcel}
          >
            <Download className="h-4 w-4" />
            Export
          </button> */}
          {/* <button
            type="button"
            className="btn btn-dred w-full border-none md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/lead/create")}
          >
            + Create
          </button> */}
        </div>
      </div>

      {/* <div className="mb-6 flex gap-4">
        <div
          onClick={() => {
            setState({ status: null });
          }}
          className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Briefcase className="text-dblue h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.total || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setState({ status: { value: 6, label: "Won" } })}
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.won_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Won Leads
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setState({ status: { value: 2, label: "Contacted" } })}
          className="cursor-pointer  rounded-lg border border-gray-200 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Hourglass className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.contacted_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Contacted Leads
              </p>
            </div>
          </div>
        </div>
        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-red-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() => setState({ status: { value: 7, label: "Lost" } })}
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-red-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.lost_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lost Leads
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Date Filter Bar */}
      <div className="mb-4 flex w-full items-center gap-2 overflow-hidden rounded-lg border border-gray-200 bg-white p-2">
        <TextInput
          type="text"
          placeholder="Search..."
          value={state.search}
          onChange={(e) => setState({ search: e.target.value })}
          className="border-0 border-r border-gray-200"
        />
        {["Year", "LastMonth", "ThisMonth", "Last7Days", "Custom"].map(
          (preset) => (
            <button
              key={preset}
              onClick={() =>
                preset !== "Custom"
                  ? handleDatePreset(preset)
                  : setState({ datePreset: "Custom" })
              }
              className={`whitespace-nowrap border-r border-gray-200 px-4 py-2 text-sm font-medium transition ${
                state.datePreset === preset
                  ? "bg-dred text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {preset}
            </button>
          ),
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
          className="border-r border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none"
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
          className="border-r border-gray-200 px-3 py-2 text-sm text-gray-600 outline-none"
        />
        <button
          onClick={() => leadList(1)}
          className="bg-dred hover:bg-lred hover:text-dred whitespace-nowrap px-4 py-2 text-sm font-semibold text-white"
        >
          Go
        </button>
      </div>

      <div className="mb-5 rounded-2xl ">
        <div className="flex items-center justify-between gap-5">
          {state.group == "Admin" && (
            <button
              onClick={() => setState({ showFilterModal: true })}
              className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
          )}
          {/*        
        <div className="align-end">
          <button type="button" className="mt-2 text-dred flex gap-1">
            <X size={13} className="mt-[2px]" />Clear Filter 
          </button>
        </div> */}
        </div>
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
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
                          state.from_date,
                        )}`,
                        onRemove: () => setState({ from_date: null }),
                      },
                    ]
                  : []),
                ...(state.to_date
                  ? [
                      {
                        label: `To Date: ${commonDateFormat(state.to_date)}`,
                        onRemove: () => setState({ to_date: null }),
                      },
                    ]
                  : []),
                ...(state.custom_from
                  ? [
                      {
                        label: `From Date: ${commonDateFormat(
                          state.custom_from,
                        )}`,
                        onRemove: () => setState({ custom_from: null }),
                      },
                    ]
                  : []),
                ...(state.custom_to
                  ? [
                      {
                        label: `To Date: ${commonDateFormat(state.custom_to)}`,
                        onRemove: () => setState({ custom_to: null }),
                      },
                    ]
                  : []),
              ]}
              onClearAll={clearAllFilters}
            />
            <div className="ml-auto flex items-center gap-3">
              {state.selectedRecords?.length > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                  onClick={handleBulkDelete}
                >
                  <IconTrashLines className="h-4 w-4" />
                  Delete ({state.selectedRecords.length})
                </button>
              )}
              <div className="text-sm text-black">
                {state.total} Inquiries found
              </div>
            </div>
          </div>

          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={filteredColumns}
            highlightOnHover
            totalRecords={state.total || state.tableList?.length}
            recordsPerPage={state.pageSize}
            minHeight={200}
            page={null}
            onPageChange={(p) => {}}
            withBorder={true}
            // selectedRecords={state.selectedRecords}
            // onSelectedRecordsChange={(records) => setState({ selectedRecords: records })}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
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
        <div className="mt-5 flex justify-end gap-3">
          <button
            disabled={!state.previous}
            onClick={handlePreviousPage}
            className={`btn border-none p-2 ${
              !state.previous ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state.next}
            onClick={handleNextPage}
            className={`btn border-none p-2 ${
              !state.next ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>
    </>
  );
};

export default PrivateRouter(List);
