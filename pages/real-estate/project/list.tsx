import Link from "next/link";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import { useState, useEffect } from "react";
import sortBy from "lodash/sortBy";
import { useDispatch, useSelector } from "react-redux";
import { IRootState } from "../../../store";
import { setPageTitle } from "../../../store/themeConfigSlice";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import IconPlus from "@/components/Icon/IconPlus";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { useSetState } from "@mantine/hooks";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import PrivateRouter from "@/components/Layouts/private-router";
import { ROLES } from "@/utils/constant.utils";

const List = () => {
  const dispatch = useDispatch();

  const [state, setState] = useSetState({
    previousPage: false,
    nextPage: false,
    currentPage: 1,
    role: null,
  });

  useEffect(() => {
    dispatch(setPageTitle("User List"));
  });
  const [items, setItems] = useState([
    {
      id: 1,
      invoice: "081451",
      name: "Laurie Fox",
      email: "lauriefox@company.com",
      date: "15 Dec 2020",
      amount: "2275.45",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
    {
      id: 2,
      invoice: "081452",
      name: "Alexander Gray",
      email: "alexGray3188@gmail.com",
      date: "20 Dec 2020",
      amount: "1044.00",
      status: { tooltip: "Developer", color: "secondary" },
      profile: "profile-1.jpeg",
    },
    {
      id: 3,
      invoice: "081681",
      name: "James Taylor",
      email: "jamestaylor468@gmail.com",
      date: "27 Dec 2020",
      amount: "20.00",
      status: { tooltip: "Agent", color: "info" },
      profile: "profile-1.jpeg",
    },
    {
      id: 4,
      invoice: "082693",
      name: "Grace Roberts",
      email: "graceRoberts@company.com",
      date: "31 Dec 2020",
      amount: "344.00",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
    {
      id: 5,
      invoice: "084743",
      name: "Donna Rogers",
      email: "donnaRogers@hotmail.com",
      date: "03 Jan 2021",
      amount: "405.15",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
    {
      id: 6,
      invoice: "086643",
      name: "Amy Diaz",
      email: "amy968@gmail.com",
      date: "14 Jan 2020",
      amount: "100.00",
      status: { tooltip: "Seller", color: "warning" },
      profile: "profile-1.jpeg",
    },
    {
      id: 7,
      invoice: "086773",
      name: "Nia Hillyer",
      email: "niahillyer666@comapny.com",
      date: "20 Jan 2021",
      amount: "59.21",
      status: { tooltip: "Agent", color: "info" },
      profile: "profile-1.jpeg",
    },
    {
      id: 8,
      invoice: "087916",
      name: "Mary McDonald",
      email: "maryDonald007@gamil.com",
      date: "25 Jan 2021",
      amount: "79.00",
      status: { tooltip: "Agent", color: "info" },
      profile: "profile-1.jpeg",
    },
    {
      id: 9,
      invoice: "089472",
      name: "Andy King",
      email: "kingandy07@company.com",
      date: "28 Jan 2021",
      amount: "149.00",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
    {
      id: 10,
      invoice: "091768",
      name: "Vincent Carpenter",
      email: "vincentcarpenter@gmail.com",
      date: "30 Jan 2021",
      amount: "400",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
    {
      id: 11,
      invoice: "095841",
      name: "Kelly Young",
      email: "youngkelly@hotmail.com",
      date: "06 Feb 2021",
      amount: "49.00",
      status: { tooltip: "Agent", color: "info" },
      profile: "profile-1.jpeg",
    },
    {
      id: 12,
      invoice: "098424",
      name: "Alma Clarke",
      email: "alma.clarke@gmail.com",
      date: "10 Feb 2021",
      amount: "234.40",
      status: { tooltip: "Customer", color: "success" },
      profile: "profile-1.jpeg",
    },
  ]);

  const [page, setPage] = useState(1);
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [initialRecords, setInitialRecords] = useState(
    sortBy(items, "invoice")
  );
  const [records, setRecords] = useState(initialRecords);
  const [selectedRecords, setSelectedRecords] = useState<any>([]);

  const [search, setSearch] = useState("");
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "firstName",
    direction: "asc",
  });

  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  useEffect(() => {
    const from = (page - 1) * pageSize;
    const to = from + pageSize;
    setRecords([...initialRecords.slice(from, to)]);
  }, [page, pageSize, initialRecords]);

  useEffect(() => {
    setInitialRecords(() => {
      return items.filter((item) => {
        return (
          item.invoice.toLowerCase().includes(search.toLowerCase()) ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase()) ||
          item.date.toLowerCase().includes(search.toLowerCase()) ||
          item.amount.toLowerCase().includes(search.toLowerCase()) ||
          item.status.tooltip.toLowerCase().includes(search.toLowerCase())
        );
      });
    });
  }, [search]);

  useEffect(() => {
    const data2 = sortBy(initialRecords, sortStatus.columnAccessor);
    setRecords(sortStatus.direction === "desc" ? data2.reverse() : data2);
    setPage(1);
  }, [sortStatus]);

  const deleteRow = (id: any = null) => {
    if (window.confirm("Are you sure want to delete selected row ?")) {
      if (id) {
        setRecords(items.filter((user) => user.id !== id));
        setInitialRecords(items.filter((user) => user.id !== id));
        setItems(items.filter((user) => user.id !== id));
        setSelectedRecords([]);
        setSearch("");
      } else {
        let selectedRows = selectedRecords || [];
        const ids = selectedRows.map((d: any) => {
          return d.id;
        });
        const result = items.filter((d) => !ids.includes(d.id as never));
        setRecords(result);
        setInitialRecords(result);
        setItems(result);
        setSelectedRecords([]);
        setSearch("");
        setPage(1);
      }
    }
  };

  const handleNextPage = () => {
    if (state?.nextPage) {
      const newPage = state.currentPage + 1;
      // filterData(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state?.previousPage) {
      const newPage = state.currentPage - 1;
      // filterData(newPage);
    }
  };

  const roleList: any = [
    { value: 1, label: "Agent" },
    { value: 2, label: "Developer" },
    { value: 3, label: "Seller" },
    { value: 4, label: "Buyer" },
  ];

  return (
    <>
      <div className="panel mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            User List
          </h5>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-primary  w-full md:mb-0 md:w-auto"
            onClick={() => window.open("/apps/product/add", "_blank")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="panel mb-5 mt-5 gap-2 px-2 md:mt-0 md:flex md:justify-between xl:gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <input
            type="text"
            className="w-100 form-input"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Dropdown */}
        <div className="flex-1">
          <CustomSelect
            placeholder="Select Role"
            value={state.role}
            onChange={(e) => setState({ role: e })}
            options={roleList}
            // error={state.errors?.tags}
          />
        </div>

        <div className="flex-1">
          <CustomSelect
            placeholder="Select Role"
            value={state.role}
            onChange={(e) => setState({ role: e })}
            options={roleList}
            // error={state.errors?.tags}
          />
        </div>
        {/* Status Dropdown */}

        {/* Bulk Actions Dropdown */}

        <div>
          <button type="button" className="btn btn-primary">
            Clear Filter
          </button>
        </div>
      </div>

      <div className="panel border-white-light px-0 dark:border-[#1b2e4b]">
        {/* <div className="invoice-table"> */}

        <div className="datatables pagination-padding">
          <DataTable
            className="table-hover whitespace-nowrap"
            records={records}
            columns={[
              {
                accessor: "name",

                render: ({ name, id }) => (
                  <div className="flex items-center font-semibold">
                    <div className="w-max rounded-full bg-white-dark/30 p-0.5 ltr:mr-2 rtl:ml-2">
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={`/assets/images/profile-${id}.jpeg`}
                        alt=""
                      />
                    </div>
                    <div>{name}</div>
                  </div>
                ),
              },
              { accessor: "email" },
              { accessor: "date" },

              {
                accessor: "Role",
                render: ({ status }) => (
                  <span className={`badge badge-outline-${status.color} `}>
                    {status.tooltip}
                  </span>
                ),
              },
              {
                accessor: "action",
                title: "Actions",
                sortable: false,
                textAlignment: "center",
                render: ({ id }) => (
                  <div className="mx-auto flex w-max items-center gap-4">
                    <Link
                      href="/apps/invoice/edit"
                      className="flex hover:text-info"
                    >
                      <IconEdit className="h-4.5 w-4.5" />
                    </Link>
                    <Link
                      href="/apps/invoice/preview"
                      className="flex hover:text-primary"
                    >
                      <IconEye />
                    </Link>
                    <button
                      type="button"
                      className="flex hover:text-danger"
                      onClick={(e) => deleteRow(id)}
                    >
                      <IconTrashLines />
                    </button>
                  </div>
                ),
              },
            ]}
            highlightOnHover
            totalRecords={initialRecords.length}
            recordsPerPage={pageSize}
            page={null}
            onPageChange={(p) => {}}
            // recordsPerPageOptions={PAGE_SIZES}
            // onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
          />
        </div>

        <div className="me-2 mt-5 flex justify-end gap-3">
          <button
            disabled={!state?.previousPage}
            onClick={handlePreviousPage}
            className={`btn ${
              !state?.previousPage ? "btn-disabled" : "btn-primary"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state?.nextPage}
            onClick={handleNextPage}
            className={`btn ${
              !state?.nextPage ? "btn-disabled" : "btn-primary"
            }`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>
      {/* </div> */}
    </>
  );
};

export default PrivateRouter(List);
