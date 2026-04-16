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
  SlidersHorizontal,
  Table,
  X,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import {
  LEAD_SOURCE_OPTIONS,
  ROLES,
  STATUS_OPTIONS,
} from "@/utils/constant.utils";
import CustomeDatePicker from "@/components/datePicker";
import { render } from "@fullcalendar/core/preact";

const List = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    visibleColumns: [],
    assignmentTitle: "Assigned By",
    group: null,
    showFilterModal: false,
    showStatusModal: false,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    leadList(1);
    categoryList(1);
    groupList();
    setState({ visibleColumns: columns });
  }, []);

  useEffect(() => {
    leadList(1);
  }, [
    debouncedSearch,
    state.lead_source,
    state.status,
    state.date,
    state.user,
    state.developer,
    state.agent,
    state.role,
  ]);

  useEffect(() => {
    const group = localStorage.getItem("group");
    console.log("✌️group --->", group);
  }, []);

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

  const leadList = async (page) => {
    try {
      const body = bodyData();
      const res: any = await Models.lead.list(page, body);
      const data = res?.results?.map((item) => ({
        full_name: item?.full_name,
        lead_source: capitalizeFLetter(item?.lead_source),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        date: commonDateFormat(item?.created_at),
        email: item?.email,
        property: item?.property_details?.title,
        property_type: item?.property_details?.property_type?.name,
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
      "Are you sure want to delete project?",
    );
  };

  const bodyData = () => {
    const userId = localStorage.getItem("userId");
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

    if (state.user) {
      body.assigned_to = state.user?.value;
    } else {
      if (state.role) {
        body.assigned_to_group = state.role?.value;
      } else {
        body.assigned_to = userId;
      }
    }

    // body.assigned_to = userId;

    console.log("✌️body --->", body);
    return body;
  };

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

  const toggleColumn = (accessor: string) => {
    const updatedColumns = state.visibleColumns?.map((col) =>
      col.accessor === accessor ? { ...col, visible: !col.visible } : col,
    );
    setState({ visibleColumns: updatedColumns });
  };

  const toggleAllColumns = (visible: boolean) => {
    const updatedColumns = state.visibleColumns?.map((col) => ({
      ...col,
      visible: col.toggleable === false ? col.visible : visible,
    }));
    setState({ visibleColumns: updatedColumns });
  };

  const filteredColumns = state.visibleColumns
    ?.filter((col) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }) => col);

  const group = localStorage.getItem("group");

  const columns = [
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
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
      accessor: "property",
      title: "Property",
      visible: true,
      toggleable: true,
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

    // },

    {
      accessor: "full_name",
      title: "Customer Name",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row?.full_name}>{truncateText(row?.full_name)}</span>
      ),
    },

    {
      accessor: "email",
      title: "Email",

      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row?.email}>{truncateText(row?.email)}</span>
      ),
    },

    {
      accessor: "assigned_by",
      title: "Assigned By",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row?.assigned_to}>{truncateText(row?.assigned_to)}</span>
      ),
    },

    {
      accessor: "lead_source",
      title: "Lead Source",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row?.lead_source}>{truncateText(row?.lead_source)}</span>
      ),
    },
    {
      accessor: "status",
      title: "Status",

      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row?.status}>{truncateText(row?.status)}</span>
      ),
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

          <button
            type="button"
            className="flex text-danger"
            onClick={(e) => handleDelete(row)}
            title="Delete Lead"
          >
            <IconTrashLines className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const visibleCount = state.visibleColumns?.filter(
    (col) => col.visible,
  ).length;
  const totalToggleable = state.visibleColumns?.filter(
    (col) => col?.toggleable !== false,
  ).length;

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Assign Lead List
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
            setState({ statusFilter: null });
          }}
          className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Briefcase className="text-dblue h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.total || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() =>
            setState({ statusFilter: { value: "approved", label: "Approved" } })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.total || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Won Leads
              </p>
            </div>
          </div>
        </div>
        {/* <div
          onClick={() =>
            setState({ statusFilter: { value: "pending", label: "Pending" } })
          }
          className="cursor-pointer  rounded-lg border border-gray-200 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Hourglass className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.total || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lost Leads
              </p>
            </div>
          </div>
        </div> */}
        <div className="rounded-lg border border-gray-200 bg-red-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-red-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.total || 0}
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
            options={LEAD_SOURCE_OPTIONS}
            error={state.errors?.lead_source}
            isClearable={true}
          />

          <CustomSelect
            value={state.status}
            onChange={(e) => setState({ status: e })}
            placeholder={"Status"}
            options={STATUS_OPTIONS}
            error={state.errors?.status}
            required
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
              />
           
          </>
        )} */}

          <CustomeDatePicker
            value={state.date}
            placeholder="Choose Date"
            onChange={(e) => setState({ date: e })}
            showTimeSelect={false}
          />

          <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
          {/* <div>
          <button type="button" className="btn btn-dred">
            Clear Filter
          </button>
        </div> */}
        </div>
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          <div
            style={{
              display: "flex",
              justifyContent: "end",
              alignItems: "center",
              marginBottom: "16px",
              gap: "10px",
            }}
          >
            <div className="text-sm text-black">
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
                  className="btn btn-outline-primary gap-2"
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
                  className="btn btn-dred ltr:ml-4 rtl:mr-4"
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
                onClick={clearFilter}
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
                options={STATUS_OPTIONS}
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
