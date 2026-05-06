"use client";

import Link from "next/link";
import { DataTable } from "mantine-datatable";
import { useEffect } from "react";

import IconTrashLines from "@/components/Icon/IconTrashLines";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import PrivateRouter from "@/hook/privateRouter";

import Models from "@/imports/models.import";
import {
  capitalizeFLetter,
  Failure,
  formatDate,
  showDeleteAlert,
  Success,
  Dropdown,
  useSetState,
  truncateText,
} from "@/utils/function.utils";
import moment from "moment";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import TextInput from "@/components/FormFields/TextInput.component";
import Modal from "@/components/modal/modal.component";
import TextArea from "@/components/FormFields/TextArea.component";
import IconLoader from "@/components/Icon/IconLoader";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import { FILTER_ROLES, roleList } from "@/utils/constant.utils";
import { Briefcase, CheckCircle, Clock, EyeIcon, Hourglass } from "lucide-react";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import { useRouter } from "next/navigation";

const List = () => {

  const router = useRouter();

  const [state, setState] = useSetState({
    previousPage: false,
    nextPage: false,
    currentPage: 1,
    role: null,
    page: 1,
    btnLoading: false,
    tableList: [],
    editId: null,
    search: "",
    total: null,
    next: null,
    previous: null,
    totalRecords: null,
    userList: [],
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    date: "",
    address: "",
    industry:"",
    isOpen: false,
    error: {},
    sortBy: "",
    sortOrder: "asc",
  });

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", state.search);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setState(() => {
      userId;
    });
  }, []);

  useEffect(() => {
    usersList(1);
    groupsList(1);
    statCount();
  }, []);

  useEffect(() => {
    usersList(1);
  }, [debouncedSearch, state.role]);

  const groupsList = async (page: any) => {
    try {
      const res: any = await Models.user.group(page);
      console.log("res", res);
      const dropdown = Dropdown(res?.results, "name");
      setState({
        groupList: dropdown.filter((item) => item.label !== "Admin"),
        groupPage: page,
        groupNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  console.log("groupList", state.groupList);

  const statCount = async () => {
    try {
      const body = {
        account_status: "approved",
      };
      const res: any = await Models.user.count(body);
      console.log("count res", res);

      setState({
        statCount: res,
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

  const usersList = async (page: any, sortBy = state.sortBy, sortOrder = state.sortOrder) => {
    try {
      const body = bodyData();
      console.log("body", body);

       if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      const res: any = await Models.user.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        first_name: item?.first_name,
        last_name: item?.last_name,
        email: item.email,
        // date: moment(item.created_at).format("DD/MM/YYYY HH:mm"),
        date: formatDate(item.created_at, "DD/MM/YYYY"),
        userRole: {
          role: item.user_type,
          color:
            item.user_type == "buyer"
              ? "success"
              : item.user_type == "developer"
              ? "secondary"
              : item.user_type == "agent"
              ? "info"
              : item.user_type == "seller"
              ? "warning"
              : "success",
        },
        industry: item.industry,
        ...item,
      }));

      setState({
        userList: res.results,
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error: any) {
      console.log("✌️error --->", error);
    }
  };

  const createUser = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        first_name: state?.first_name,
        last_name: state?.last_name,
        email: state?.email,
        password: state?.password,
        phone: state?.phone,
        groups: [state?.userRole?.value],
        // groups: state?.role?.map((item) => item?.value),
        address: state?.address,
        account_status: "approved",
        approved_by: state.userId,
        industry: state.industry,
      };

      console.log("create body", body);

      await Utils.Validation.user.validate(body, { abortEarly: false });

      const res = await Models.user.create(body);
      clearData();
      setState({ btnLoading: false });
      usersList(1);
      Success("User created succssfully");
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        console.log("error", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateUsers = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        first_name: state?.first_name,
        last_name: state?.last_name,
        email: state?.email,
        phone: state?.phone,
        groups: [state?.userRole?.value],
        address: state?.address,
        industry: state.industry,
      };

      await Utils.Validation.userUpdate.validate(body, { abortEarly: false });

      const res = await Models.user.update(body, state.editId);

      clearData();
      setState({ btnLoading: false });
      usersList(state.page);

      Success("User updated succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
      } else {
        console.log("errors --->", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const bodyData = () => {
    let body: any = {};
    const userId = localStorage.getItem("userId");

    body.developer_property_users = userId

    if (state.search) {
      body.search = state.search;
    }
    body.user_type = "buyer";

   
    body.account_status = "approved";

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const clearData = () => {
    setState({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      userRole: "",
      editId: "",
      industry:"",
      isOpen: false,
      error: {},
    });
  };

  const clearFilter = () => {
    setState({
      search: "",
      role: "",
    });
  };

  const handleEdit = (row) => {
    console.log("row", row);

    setState({
      first_name: row?.first_name,
      last_name: row?.last_name,
      email: row?.email,
      phone: row?.phone,
      userRole: state?.groupList?.find(
        (item) => item.label.toLowerCase() === row?.user_type?.toLowerCase(),
      ),
      address: row?.address,
      editId: row?.id,
      industry: row?.industry,
      isOpen: true,
    });
  };

  const deleteDecord = async (row) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.user.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      usersList(state.page);

      Success("User deleted succssfully");
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
      "Are you sure want to delete user?",
    );
  };

  const handleNextPage = () => {
    if (state?.next) {
      const newPage = state.page + 1;
      usersList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state?.previous) {
      const newPage = state.page - 1;
      usersList(newPage);
    }
  };

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            User List
          </h5>
        </div>
        {/* <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-dred  w-full border-none md:mb-0 md:w-auto"
            onClick={() => setState({ isOpen: true })}
          >
            + Create
          </button>
        </div> */}
      </div>

      {/* <div className="mb-6 flex gap-4">
        <div
          onClick={() => {
            setState({ role: null });
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
                Total Users
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() =>
            setState({ role: { value: "developer", label: "Developer" } })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.developers || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Developers
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() => setState({ role: { value: "agent", label: "Agent" } })}
          className="cursor-pointer  rounded-lg border border-gray-200 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Hourglass className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.agents || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Agents</p>
            </div>
          </div>
        </div>
        <div
          className="cursor-pointer rounded-lg border border-gray-200 bg-red-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() => setState({ role: { value: "buyer", label: "Buyer" } })}
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-red-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.buyers || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Buyers</p>
            </div>
          </div>
        </div>
      </div> */}

      <div className="mb-5 rounded-2xl">
        <div className="flex  items-center  gap-5">
          {/* Search Input */}
          <div className="w-[500px]">
            <TextInput
              type="text"
              placeholder="Search..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
            />
          </div>

          {/* Category Dropdown */}
          {/* <div className="w-fit">
            <CustomSelect
              placeholder="Choose Role"
              value={state.role}
              onChange={(e) => setState({ role: e })}
              options={roleList}
            />
          </div> */}

          {/* <button
          type="button"
          className="btn btn-dred"
          onClick={() => usersList(1)}
        >
          Apply Filter
        </button>
        <button
          type="button"
          className="btn btn-dred"
          onClick={() => clearFilter()}
        >
          Clear Filter
        </button> */}
        </div>
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="flex items-start justify-between mb-4">
          <FilterChips
            chips={[
              ...(state.search ? [{ label: `Search: ${state.search}`, onRemove: () => setState({ search: "" }) }] : []),
              ...(state.role ? [{ label: `Role: ${state.role.label}`, onRemove: () => setState({ role: null }) }] : []),
            ]}
            onClearAll={() => setState({ search: "", role: null })}
          />
          <div className="ml-auto text-sm text-black">{state.total} Users found</div>
        </div>
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding">
          <DataTable
            className="table-responsive"
            records={state?.tableList || []}
            columns={[
             
              {
                accessor: "name",
                title: "Name",
                sortable:true,
                render: (row) => (
                  <div
                    className="flex w-fit items-center font-semibold"
                    onClick={(e) => {
                        router.push(`/real-estate/users/view/${row.id}`);
                        // handleEdit(row);
                      }}
                  >

                    <div className=" flex h-8 w-8 items-center justify-center rounded-full bg-[#9b0f09] text-sm text-white shadow ltr:mr-2 rtl:ml-2">
                      {row?.first_name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div
                      className="cursor-pointer"
                      title={row.first_name + " " + row.last_name}
                    >
                      {truncateText(row.first_name + " " + row.last_name)}
                    </div>
                  </div>
                ),
              },
              {
                accessor: "email",
                title: "Email",
                sortable:true,
                render: (row) => (
                  <span title={row.email}>{truncateText(row.email)}</span>
                ),
              },
              { accessor: "inquiry_count", title: "Inquiry Count",
                sortable:true,
                render: (row) => (
                  <span className="underline cursor-pointer" onClick={() => router.push(`/real-estate/users/view/${row.id}?tab=enquiries`)}>{row.inquiry_count || 0}</span>
                ),
               },
              { accessor: "saved_list_count", title: "Saved List",
                sortable:true,
                render: (row) => (
                  <span className="underline cursor-pointer" onClick={() => router.push(`/real-estate/users/view/${row.id}?tab=wishlist`)}>{row.saved_list_count || 0}</span>
                ),
               },
              { accessor: "date", title: "joined_on" },
              {
                accessor: "userRole",
                title: "Role",
                render: (row: any) => (
                  <span className={`badge badge-outline-${row?.userRole?.color} `}>
                    {capitalizeFLetter(row?.userRole?.role)}
                  </span>
                ),
              },
              {
                accessor: "action",
                title: "Actions",
                sortable: false,
                textAlignment: "center",
                render: (row: any) => (
                  <div className="mx-auto flex w-max items-center gap-4">
                    <button
                    title="View User"
                      className="flex text-primary"
                      onClick={(e) => {
                        router.push(`/real-estate/users/view/${row.id}`);
                        // handleEdit(row);
                      }}
                    >
                      <EyeIcon  className="h-4 w-4" />
                    </button>
                    {/* <Link
                      href="/real-estate/profile"
                      className="flex hover:text-primary"
                    >
                      <IconEye />
                    </Link> */}
                    {/* <button
                      type="button"
                      className="flex text-danger"
                      onClick={(e) => handleDelete(row)}
                    >
                      <IconTrashLines className="h-4 w-4" />
                    </button> */}
                  </div>
                ),
              },
            ]}
            highlightOnHover
            totalRecords={state?.initialRecords?.length}
            recordsPerPage={state?.pageSize}
            page={null}
            onPageChange={(p) => {}}
            paginationText={({ from, to, totalRecords }) =>
              `Showing  ${from} to ${to} of ${totalRecords} entries`
            }
            minHeight={200}
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
                  usersList(1, columnAccessor, direction);
                }}
          />
        </div>

        <div className="me-2 mt-5 flex justify-end gap-3">
          <button
            disabled={!state?.previous}
            onClick={handlePreviousPage}
            className={`btn border-none p-2 ${
              !state?.previous ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state?.next}
            onClick={handleNextPage}
            className={`btn border-none p-2 ${
              !state?.next ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

      <Modal
        addHeader={state.editId ? "Update User" : "Create User"}
        open={state.isOpen}
        close={() => {
          clearData();
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="first_name"
                  type="text"
                  title="First Name"
                  placeholder="Enter First Name"
                  value={state.first_name}
                  onChange={(e) => setState({ first_name: e.target.value })}
                  // error={state.error?.first_name}
                  // required
                />

                <TextInput
                  name="last_name"
                  type="text"
                  title="Last Name"
                  placeholder="Enter First Name"
                  value={state.last_name}
                  onChange={(e) => setState({ last_name: e.target.value })}
                  // error={state.error?.last_name}
                  // required
                />

                <TextInput
                  name="email"
                  type="email"
                  title="Email"
                  placeholder="Enter Email"
                  value={state.email}
                  onChange={(e) => setState({ email: e.target.value })}
                  error={state?.error?.email}
                  required
                />

                {!state.editId && (
                  <TextInput
                    name="password"
                    type="password"
                    title="Password"
                    placeholder="Enter password"
                    value={state.password}
                    onChange={(e) => setState({ password: e.target.value })}
                    error={state?.error?.password}
                    required
                  />
                )}

                <TextInput
                  name="name"
                  type="phone"
                  title="Phone Number"
                  placeholder="Enter Phone Number"
                  value={state.phone}
                  onChange={(e) => setState({ phone: e.target.value })}
                  // error={state.error?.phone}
                  // required
                />

                <CustomSelect
                  title="Role"
                  placeholder="Select Role"
                  value={state.userRole}
                  onChange={(e) => setState({ userRole: e })}
                  options={state.groupList}
                />
                {state.userRole?.label === "Developer" && 
                <TextInput
                  name="industry"
                  type="text"
                  title="Industry"
                  placeholder="Enter industry"
                  value={state.industry}
                  onChange={(e) => setState({ industry: e.target.value })}
                  error={state.error?.industry}
                  required = {state.userRole?.label === "Developer" ? true : false}
                />}
                <TextArea
                  name="address"
                  title="Address"
                  placeholder="Enter Address"
                  value={state.address}
                  onChange={(e) => setState({ address: e.target.value })}
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
                  onClick={() => (state.editId ? updateUsers() : createUser())}
                  className="btn btn-dred border-none ltr:ml-4 rtl:mr-4"
                >
                  {state.btnLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />
      {/* </div> */}
    </>
  );
};

export default PrivateRouter(List);
