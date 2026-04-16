import Link from "next/link";
import { DataTable } from "mantine-datatable";
import { useEffect } from "react";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { useSetState } from "@mantine/hooks";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import PrivateRouter from "@/hook/privateRouter";
import Models from "@/imports/models.import";
import { capitalizeFLetter, formatDate, Success, truncateText } from "@/utils/function.utils";

import useDebounce from "@/hook/useDebounce";

import { roleList } from "@/utils/constant.utils";
import Swal from "sweetalert2";
import TextInput from "@/components/FormFields/TextInput.component";
import { Briefcase, CheckCircle, Clock, Hourglass } from "lucide-react";

const List = () => {
  const [state, setState] = useSetState<any>({
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
    isOpen: false,
    error: {},
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    usersList(1);
    statCount()
  }, []);

  useEffect(() => {
    usersList(1);
  }, [debouncedSearch, state.role]);

   const statCount = async()=> {
        try {
          const body = {
           account_status : "pending_review"
          }
           const res: any = await Models.user.count(body);
           console.log("count res", res);
    
           setState({
            statCount:res
           })
           
          
        } catch (error) {
          console.log("✌️error --->", error);
          setState({ loading: false });
        }
      }

  const usersList = async (page: any) => {
    try {
      const body = bodyData();
      console.log("body", body);

      const res: any = await Models.user.list(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        first_name: item?.first_name,
        last_name: item?.last_name,
        email: item.email,
        date: formatDate(item.created_at, "DD/MM/YYYY"),
        role: {
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

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }
    if (state.role) {
      body.user_type = state.role.value;
    }
    body.account_status = "pending_review";

    return body;
  };

  const clearFilter = () => {
    setState({
      search: "",
      role: "",
    });
  };

  const handleApprove = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, approve it!",
      cancelButtonText: "Cancel",
      padding: "2em",
    });

    if (!result.isConfirmed) return;

    try {
      setState({ btnLoading: true });
      const body = {
        account_status: "approved",
        is_active: true,
      };
      await Models.user.update(body, row?.id);
      setState({ btnLoading: false });
      usersList(state.page);
      Success("User Approval successfully");
    } catch (error) {}
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
            Waiting For User Approval List
          </h5>
        </div>
        {/* <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-dred border-none w-full md:mb-0 md:w-auto"
            onClick={() => setState({ isOpen: true })}
          >
            + Create
          </button>
        </div> */}
      </div>

      <div className="mb-6 flex gap-4">
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
                onClick={() =>
                  setState({ role: { value: "agent", label: "Agent" } })
                }
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
              <div className="cursor-pointer rounded-lg border border-gray-200 bg-red-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
              onClick={() =>
                  setState({ role: { value: "buyer", label: "Buyer" } })
                }
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
            </div>

      <div className="mb-5 rounded-2xl">
        <div className="flex  items-center  gap-5">
          <div className="w-fit">
            <TextInput
              type="text"
              placeholder="Search..."
              value={state.search}
              onChange={(e) => setState({ search: e.target.value })}
            />
          </div>

          <div className="w-fit">
            <CustomSelect
              placeholder="Choose Role"
              value={state.role}
              onChange={(e) => setState({ role: e })}
              options={roleList}
            />
          </div>
        </div>

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

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
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
            {state.total} Properties found
          </div>
        </div>
        <div className="datatables pagination-padding">
          <DataTable
            className="table-hover whitespace-nowrap"
            records={state?.tableList || []}
            columns={[
              {
                accessor: "name",
                title: "Name",

                render: (row) => (
                  <div className="flex w-fit items-center font-semibold">
                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                      <img
                        className="h-8 w-8 cursor-pointer rounded-full object-cover"
                        src={`/assets/images/profile-${row.id}.jpeg`}
                        alt=""
                      />
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
              { accessor: "email", title: "Email" , 
                render: (row) => (
                  <span title={row.email}>
                    {truncateText(row.email)}
                  </span>
                )
              },
              { accessor: "date", title: "Date" },

              {
                accessor: "role",
                title: "Role",
                render: (row: any) => (
                  <span className={`badge badge-outline-${row?.role?.color} `}>
                    {capitalizeFLetter(row?.role?.role)}
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
                    <div className="flex gap-5">
                      <button
                        type="button"
                        className="btn btn-outline-primary w-full md:mb-0 md:w-auto px-3 py-1"
                        onClick={() => handleApprove(row)}
                      >
                        Approve
                      </button>
                    </div>
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
    </>
  );
};

export default PrivateRouter(List);
