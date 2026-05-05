"use client"

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
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    leadList(1);
    categoryList(1);
    groupList();
    setState({ visibleColumns: columns });
    statCount();
    leadSourceList();
    leadStatusList();
  }, []);

  useEffect(() => {
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
  ]);

  const categoryList = async (page) => {
    try {
      const res: any = await Models.category.list(page, {});
      const droprdown = Dropdown(res?.results, "name");
      setState({
        categoryList: droprdown,
        categoryPage: page,
        categoryNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const groupList = async () => {
    try {
      const res: any = await Models.user.groups();
      const droprdown = Dropdown(res?.results, "name");
      const filter = droprdown?.filter(
        (item) => item?.label != "Admin" && item?.label != "Buyer",
      );

      setState({
        groupList: filter,
      });
    } catch (error) {
      console.log("✌️error --->", error);
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
      console.log("✌️error --->", error);
    }
  };

  const catListLoadMore = async () => {
    try {
      if (state.categoryNext) {
        const res: any = await Models.category.list(state.categoryPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          categoryList: [...state.categoryList, ...newOptions],
          categoryNext: res.next,
          categoryPage: state.categoryPage + 1,
        });
      } else {
        setState({
          categoryList: state.categoryList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const statCount = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const body = {
        developer: state.user ? state.user?.value : userId,
      };

      const res: any = await Models.lead.count(body);
      console.log("count res", res);

      setState({
        statCount: res,
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

  const leadList = async (
    page,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
    try {
      const body = bodyData();
      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }
      const res: any = await Models.lead.list(page, body);
      const data = res?.results?.map((item) => ({
        company_name: item?.company_name,
        full_name: item?.full_name,
        lead_source: item?.lead_source_info,
        status: item?.status_info,
        id: item?.id,
        date: commonDateFormat(item?.created_at),
        email: item?.email,
        property: item?.property_details?.title,
        property_type:
          item?.property_type?.map((pt) => capitalizeFLetter(pt?.name)) || [],
        requirements: item?.requirements,
        assigned_to: item?.assigned_to_details
          ? `${item?.assigned_to_details?.first_name} ${item?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.assigned_by_details
          ? `${item?.assigned_by_details?.first_name} ${item?.assigned_by_details?.last_name}`
          : "",
      }));
      const group = localStorage.getItem("group");

      setState({
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
        group,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createProject = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.create(body);
      clearData();
      setState({ btnLoading: false });
      leadList(1);
      Success("Preject created succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateProject = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.update(body, state.editId);
      console.log("createProject --->", res);
      clearData();
      setState({ btnLoading: false });
      leadList(state.page);

      Success("Preject updated succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const deleteDecord = async (row) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.lead.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      leadList(state.page);

      Success("Preject deleted succssfully");
    } catch (error) {}
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => {
        deleteDecord(row);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete lead?",
    );
  };

  const developerList = async (page) => {
    try {
      const body = {
        user_type: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
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
      console.log("✌️error --->", error);
    }
  };

  const agentList = async (page) => {
    try {
      const body = {
        user_type: ROLES.AGENT,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const sellerList = async (page) => {
    try {
      const body = {
        user_type: ROLES.SELLER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        userList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const getuserList = (e) => {
    setState({ role: e, user: null });
    if (e?.label == "Developer") {
      developerList(1);
    } else if (e?.label == "Agent") {
      agentList(1);
    } else if (e?.label == "Seller") {
      sellerList(1);
    }
  };

  console.log("state.status", state.status);

  const bodyData = () => {
    const userId = localStorage.getItem("userId");
    const group = localStorage.getItem("group");
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }

    if (state.lead_source) {
      body.lead_source = state.lead_source.value;
    }

    if (state.property_type) {
      body.property_type = state.property_type;
    }

    if (state.status) {
      body.status = state.status.value;
    }

    if (state.date) {
      body.date = backendDateFormat(state.date);
    }
    body.developer = userId;

    if (state.leadType?.value === "own") {
      body.created_by = userId;
    } else if (state.leadType?.value === "assigned") {
      body.assigned_to = userId;
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

  // const adminBody = () => {
  //   let body: any = {};
  //   if (state.user) {
  //     body.created_by = state.user?.value;
  //   } else {
  //     if (state.role) {
  //       body.group = state.role?.value;
  //     }
  //   }
  //   return body;
  // };

  const handleEdit = (row) => {
    router.push(`/real-estate/lead/update/${row?.id}`);
    console.log("✌️row --->", row);
  };

  const clearData = () => {
    setState({
      editId: null,
      name: "",
      location: "",
      description: "",
      isOpen: false,
      error: {},
    });
  };

  const handleStatus = async (row) => {
    setState({ statusRow: row, showStatusModal: true, newStatus: null });
  };

  const confirmStatus = async () => {
    if (!state.newStatus) return;
    try {
      setState({ btnLoading: true });
      await Models.lead.update(
        { status: state.newStatus?.value },
        state.statusRow?.id,
      );
      setState({ showStatusModal: false, btnLoading: false });
      leadList(state.page);
      Success("Lead status updated successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
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
    });
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

  const filteredColumns = state.visibleColumns
    ?.filter((col) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }) => col);

  const columns = [

    // {
    //   accessor: "company_name",
    //   title: "Company Name",
    //   visible: true,
    //   toggleable: true,
    //   sortable: true,
    //   render: (row) => (
    //     <div
    //       className="w-fit cursor-pointer"
    //       onClick={(e) => {
    //         router.push(`/real-estate/lead/view/${row?.id}`);
    //       }}
    //     >
    //       <div>{row?.company_name}</div>
    //     </div>
    //   ),
    // },
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
          <div>{row?.date}</div>
        </div>
      ),
    },
    {
      accessor: "title",
      title: "Property",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <div
          className="w-fit cursor-pointer"
          onClick={(e) => {
            router.push(`/real-estate/lead/view/${row?.id}`);
          }}
          title={row?.property}
        >
          <div>{truncateText(row?.property)}</div>
        </div>
      ),
    },
    // {
    //   accessor: "property_type",
    //   title: "Property Type",
    //   visible: true,
    //   toggleable: true,
    //   render: (row: any) => {
    //     const property_type = row.property_type;
    //     if (!property_type || property_type?.length === 0) {
    //       return <span className="text-gray-400">-</span>;
    //     }

    //     const firstType = property_type[0];
    //     const others = property_type.slice(1);
    //     const maxShow = 3;
    //     const remaining = others.length - maxShow;
    //     const visibleTypes = others.slice(0, maxShow);
    //     const hiddenTypes = others.slice(maxShow);

    //     return (
    //       <div className="flex items-center gap-2">
    //         {/* First type text */}
    //         <span
    //           title={firstType}
    //           className="text-sm text-gray-700 dark:text-gray-300"
    //         >
    //           {truncateText(firstType)}
    //         </span>

    //         {/* Avatars */}
    //         <div className="flex items-center -space-x-2">
    //           {visibleTypes?.map((type: string, index: number) => (
    //             <div key={index} className="group relative z-10">
    //               <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
    //                 {type?.slice(0, 2)?.toUpperCase()}
    //               </div>
    //               {/* Tooltip */}
    //               <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
    //                 {type}
    //               </div>
    //             </div>
    //           ))}
    //           {remaining > 0 && (
    //             <div className="group relative z-10">
    //               <div className="flex h-7 w-7  items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-bold text-white dark:border-gray-900">
    //                 +{remaining}
    //               </div>
    //               {/* Remaining tooltip */}
    //               <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
    //                 {hiddenTypes.join(", ")}
    //               </div>
    //             </div>
    //           )}
    //         </div>
    //       </div>
    //     );
    //   },
    // },

    {
      accessor: "full_name",
      title: "Customer Name",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <span title={row?.full_name}>{truncateText(row?.full_name)}</span>
      ),
    },

    // {
    //   accessor: "email",
    //   title: "Email",

    //   visible: true,
    //   toggleable: true,
    //   sortable: true,
    //   render: (row) => <span title={row?.email}>{row?.email}</span>,
    // },

    // {
    //   accessor: "assigned_to",
    //   title: "Assigned To",
    //   visible: true,
    //   toggleable: true,
    //   render: (row) => (
    //     <span title={row?.assigned_to}>{truncateText(row?.assigned_to)}</span>
    //   ),
    // },

    {
      accessor: "lead_source",
      title: "Lead Source",
      visible: true,
      toggleable: true,
      render: (row) => {
     
        const label = row?.lead_source?.name || row?.lead_source;
        const cls = sourceConfig[label] ?? "bg-gray-100 text-gray-600";
        return (
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>
            {label || "-"}
          </span>
        );
      },
    },
    {
      accessor: "status",
      title: "Status",
      visible: true,
      toggleable: true,
      render: (row) => {
        const cls =
          statusConfig[row?.status?.name] ?? "bg-gray-100 text-gray-600";
        return (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
          >
            {capitalizeFLetter(row?.status?.name)}
          </span>
        );
      },
    },

    {
      accessor: "requirements",
      sortable: false,
      render: (row) => (
        <Tippy
          content={row?.requirements}
          placement="top"
          className="rounded-lg bg-black p-1 text-sm text-white"
        >
          <div>
            {row?.requirements?.length > 20
              ? `${row.requirements.slice(0, 20)}...`
              : row?.requirements}
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
      textAlignment: "center",
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            className="text-dred flex"
            onClick={(e) => {
              router.push(`/real-estate/lead/view/${row?.id}`);
            }}
            title="View Lead Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          <button
            className="flex text-success"
            onClick={(e) => handleStatus(row)}
            title="Change Lead Status"
          >
            <CheckCircle className="h-4 w-4" />
          </button>

          <button
            className="flex text-primary"
            onClick={(e) => {
              handleEdit(row);
            }}
            title="Edit Lead"
          >
            <IconEdit className="h-4 w-4" />
          </button>

          {/* <button
            type="button"
            className="flex text-danger"
            onClick={(e) => handleDelete(row)}
            title="Delete Lead"
          >
            <IconTrashLines className="h-4 w-4" />
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Lead List
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Manage Lead listings and opportunities
          </p>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-dred w-full border-none md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/lead/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
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
      </div>

      <div className="mb-5 rounded-2xl ">
        <div className="flex items-center justify-between gap-5">
          <TextInput
            type="text"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />

          {/* <div className="flex-1">
          <CustomSelect
            placeholder="Select Property Type"
            value={state.}
            onChange={(e) => setState({ property_type: e })}
            options={state?.categoryList}
            isClearable={true}
            loadMore={() => catListLoadMore()}
          />
        </div> */}

          <CustomSelect
            value={state.lead_source}
            onChange={(e) => setState({ lead_source: e })}
            placeholder={"Lead Source"}
            options={state.leadSourceList}
            error={state.errors?.lead_source}
            isClearable={true}
          />

          <CustomSelect
            value={state.status}
            onChange={(e) => setState({ status: e })}
            placeholder={"Status"}
            options={state.leadStatusList}
            error={state.errors?.status}
            required
            className="w-full"
          />

          <CustomSelect
            value={state.leadType}
            onChange={(e) => setState({ leadType: e })}
            placeholder={"All Leads"}
            options={[
              { value: "own", label: "Own Leads" },
              { value: "assigned", label: "Assigned Leads" },
            ]}
            isClearable={true}
          />

          {/* {state.group == "Admin" && (
            <>
              <CustomSelect
                placeholder="Role"
                value={state.role}
                onChange={(e) => {
                  getuserList(e);
                  setState({ userList: [] });
                }}
                options={state.groupList}
              />

              <CustomSelect
                placeholder="user"
                value={state.user}
                onChange={(e) => setState({ user: e })}
                options={state.userList}
                disabled={!state.role}
              />
            </>
          )} */}

          <CustomeDatePicker
            value={state.date}
            placeholder="Choose Date"
            onChange={(e) => setState({ date: e })}
            showTimeSelect={false}
          />

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
            <div className="ml-auto text-sm text-black">
              {state.total} Leads found
            </div>
          </div>
          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={filteredColumns}
            highlightOnHover
            totalRecords={state.taskList?.length}
            recordsPerPage={state.pageSize}
            minHeight={200}
            page={null}
            onPageChange={(p) => {}}
            withBorder={true}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
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

      <Modal
        addHeader={state.editId ? "Update Project" : "Create Project"}
        open={state.isOpen}
        close={() => {
          clearData();
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="name"
                  title="Project Name"
                  placeholder="Enter project name"
                  value={state.name}
                  onChange={(e) => setState({ name: e.target.value })}
                  error={state.error?.name}
                  required
                />

                <TextInput
                  name="name"
                  title="Location"
                  placeholder="Enter location"
                  value={state.location}
                  onChange={(e) => setState({ location: e.target.value })}
                  error={state.error?.location}
                  required
                />

                <TextArea
                  name="description"
                  title="Description"
                  placeholder="Enter Description"
                  value={state.description}
                  onChange={(e) => setState({ description: e.target.value })}
                />
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  type="button"
                  className="btn border-dred hover:btn-mred gap-2"
                  onClick={() => {
                    clearData();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    state.editId ? updateProject() : createProject()
                  }
                  className="btn btn-dred border-none ltr:ml-4 rtl:mr-4"
                >
                  {state.btnLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />

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
              {state.group == "Admin" && (
                <>
                  <CustomSelect
                    placeholder="Role"
                    value={state.role}
                    onChange={(e) => {
                      getuserList(e);
                      setState({ userList: [] });
                    }}
                    options={state.groupList}
                  />

                  <CustomSelect
                    placeholder="user"
                    value={state.user}
                    onChange={(e) => setState({ user: e })}
                    options={state.userList}
                    disabled={!state.role}
                  />
                </>
              )}
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

      <Modal
        open={state.showStatusModal}
        close={() => setState({ showStatusModal: false })}
        maxWidth="!w-[500px]"
        renderComponent={() => (
          <div className=" pb-0">
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
                onChange={(e) => setState({ newStatus: e })}
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
                onClick={confirmStatus}
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
