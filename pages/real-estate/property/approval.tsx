import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
import IconEdit from "@/components/Icon/IconEdit";
import {
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  Failure,
  formatPriceRange,
  formatToINR,
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
import IconMapPin from "@/components/Icon/IconMapPin";
import Link from "next/link";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import {
  FRONTEND_URL,
  LISTING_TYPE,
  LISTING_TYPE_LIST,
  ListType,
  PROPERTY_STATUS,
  Property_status,
  PROPERTY_TYPE,
  propertyType,
} from "@/utils/constant.utils";
import { RotatingLines } from "react-loader-spinner";
import {
  LucideHome,
  Columns,
  Eye,
  EyeOff,
  Table,
  Calendar,
  X,
  Hourglass,
  CheckCircle,
  Briefcase,
  Clock,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import moment from "moment";
import { render } from "@fullcalendar/core/preact";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import PrivateRouter from "@/hook/privateRouter";

const List = () => {
  const router = useRouter();

  const tableColumns = [
    {
      accessor: "title",
      title: "Property Info",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <Link className="flex gap-3 font-semibold" href={`${FRONTEND_URL}/property-detail/${row?.id}`}
                target="_blank">
          <div className="flex flex-col justify-between ">
            <div>
              <div
                className="cursor-pointer text-sm"           
                title={row.title}
              >
                {truncateText(row.title)}
              </div>
            </div>
          </div>
        </Link>
      ),
    },

    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row)=>(
      <span title={row.project}>
        {truncateText(row.project)}
      </span>
      )
    },

    {
      accessor: "created_by",
      title: "Created By",
      visible: true,
      toggleable: true,
       render: (row)=>(
      <span title={row.created_by}>
        {truncateText(row.created_by)}
      </span>
      )
    },

    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
      render: (row)=>(
      <span title={row.developer}>
        {truncateText(row.developer)}
      </span>
      )
    },
    {
      accessor: "agent",
      title: "Agent",
      visible: true,
      toggleable: true,
      render: (row)=>(
      <span title={row.agent}>
        {truncateText(row.agent)}
      </span>
      )
    },
    {
      accessor: "property_type",
      title: "Property Type",
      visible: true,
      toggleable: true,
      render: (row: any) => {
        const property_type = row.property_type;
        if (!property_type || property_type?.length === 0) {
          return <span className="">-</span>;
        }

        const firstType = property_type[0];
        const others = property_type.slice(1);
        const maxShow = 3;
        const remaining = others.length - maxShow;
        const visibleTypes = others.slice(0, maxShow);
        const hiddenTypes = others.slice(maxShow);

        return (
          <div className="flex items-center gap-2">
            {/* First type text */}
            <span title={firstType} className="text-sm text-gray-700 dark:text-gray-300">
              {truncateText(firstType)}
            </span>

            {/* Avatars */}
            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-dred text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-[100]">
                    {type}
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div className="group relative z-10">
                  <div className="flex h-7 w-7  items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-bold text-white dark:border-gray-900">
                    +{remaining}
                  </div>
                  {/* Remaining tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-[100]">
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
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color} `}>
          {row?.listing_type?.type}
        </span>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false, // Actions column cannot be hidden
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
  ];

  const allColumns = [
    {
      accessor: "title",
      title: "Property Info",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <Link className="flex gap-3 font-semibold" href={`${FRONTEND_URL}/property-detail/${row?.id}`} target="__blank">
          <div className="h-20 w-20 rounded-md bg-white-dark/30  ltr:mr-2 rtl:ml-2">
            <img
              className="h-full w-full cursor-pointer rounded-md object-cover"
              src={row.image}
              alt=""
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex gap-1 ">
                {" "}
                <IconMapPin className="h-3 w-3" />
                <span className="mt-[-2px] text-xs">{row.location}</span>
              </div>
              <div
                className="cursor-pointer text-md font-bold"   
                title={row.title}             
              >
                {truncateText(row.title)}
              </div>
            </div>
            <div
              className={`inline-block w-fit rounded-full px-2 text-xs font-semibold ${
                row?.publish == "Published"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {row?.publish}
            </div>
            <div>
              <Link
                className="flex gap-1 text-primary pt-2"
                href={`${FRONTEND_URL}/property-detail/${row?.id}`}
                target="_blank"
              >
                <LucideHome className="h-3 w-3 text-black " /> 
                <span className="text-xs mt-[-2px]">View Details</span>
              </Link>
            </div>
          </div>
        </Link>
      ),
    },

    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => ( 
        <span title={row.project}>
          {truncateText(row.project)}
        </span>

      )
    },
    {
      accessor: "created_by",
      title: "Created By",
      visible: true,
      toggleable: true,   
      render: (row) => ( 
        <span title={row.created_by}>
          {truncateText(row.created_by)}
        </span>
      )
    },
    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
      render: (row) => ( 
        <span title={row.developer}>
          {truncateText(row.developer)}
        </span>
      )
    },
    {
      accessor: "agent",
      title: "Agent",
      visible: true,
      toggleable: true,
       render: (row) => ( 
        <span title={row.agent}>
          {truncateText(row.agent)}
        </span>
      )
    },
    {
      accessor: "property_type",
      title: "Property Type",
      visible: true,
      toggleable: true,
      render: (row: any) => {
        const property_type = row.property_type;
        if (!property_type || property_type?.length === 0) {
          return <span className="">-</span>;
        }

        const firstType = property_type[0];
        const others = property_type.slice(1);
        const maxShow = 3;
        const remaining = others.length - maxShow;
        const visibleTypes = others.slice(0, maxShow);
        const hiddenTypes = others.slice(maxShow);

        return (
          <div className="flex items-center gap-2">
            {/* First type text */}
            <span title={firstType} className="text-sm text-gray-700 dark:text-gray-300">
              {truncateText(firstType)}
            </span>

            {/* Avatars */}
            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-dred text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-[100]">
                    {type}
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div className="group relative z-10">
                  <div className="flex h-7 w-7  items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-bold text-white dark:border-gray-900">
                    +{remaining}
                  </div>
                  {/* Remaining tooltip */}
                  <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 z-[100]">
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
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color} `}>
          {row?.listing_type?.type}
        </span>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      visible: true,
      toggleable: true,
    },
    {
      accessor: "date",
      title: "Date",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false, // Actions column cannot be hidden
      sortable: false,
      textAlignment: "center",
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            type="button"
            className="btn btn-outline-primary w-full md:mb-0 md:w-auto px-3 py-1"
            onClick={() => handleApprove(row)}
          >
            Approve
          </button>
        </div>
      ),
    },
  ];

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    categoryList: [],
    tableList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    loading: false,
    visibleColumns: allColumns,
    viewMode: "table",
    sortBy: "",
    sortOrder: "asc",
  });

  const visibleCount = state.visibleColumns.filter((col) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col) => col.toggleable !== false
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    propertyList(1);
    categoryList(1);
    statCount()
  }, []);

  useEffect(() => {
    propertyList(1);
  }, [
    debouncedSearch,
    state.property_type,
    state.offer_type,
    state.status,
    state.publish,
  ]);

  useEffect(() => {
    if (state.viewMode == "table") {
      setState({
        visibleColumns: tableColumns,
      });
    } else {
      setState({
        visibleColumns: allColumns,
      });
    }
  }, [state.viewMode]);

   const statCount = async()=> {
      try {
        const body = {
          publish : "Yes"
        }
         const res: any = await Models.property.count(body);
         console.log("count res", res);
  
         setState({
          statCount:res
         })
         
        
      } catch (error) {
        console.log("✌️error --->", error);
        setState({ loading: false });
      }
    }

  const propertyList = async (page, sortBy = state.sortBy, sortOrder = state.sortOrder) => {
    console.log("✌️page --->", page);
    try {
      setState({ loading: true });
      const body = bodyData();

      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      console.log("✌️body --->", body);
      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item) => ({
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        total_area: item?.total_area,
        property_type: item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) || [],
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color:
            item?.listing_type == LISTING_TYPE_LIST.RENT
              ? "warning"
              : item?.listing_type == LISTING_TYPE_LIST.SALE
              ? "secondary"
              : item?.listing_type == LISTING_TYPE_LIST.LEASE
              ? "info"
              : "success",
        },

        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
        project: capitalizeFLetter(item?.project?.name),
        publish: item?.publish ? "Published" : "Draft",
        agent: false,

        price: formatPriceRange(item?.minimum_price, item?.maximum_price),
        created_by: `${capitalizeFLetter(item?.created_by?.first_name)} ${
          item?.created_by?.last_name
        }`,
        image:
          item?.primary_image ??
          "/assets/images/real-estate/property-info-img1.png",
      }));
      console.log("✌️data --->", data);

      setState({
        tableList: data,
        total: res?.count,
        page: page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
        loading: false,
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

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
  console.log("✌️state.page --->", state.page);

  const handleApprove = async (row: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to approve this property?",
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
        is_approved: true,
      };
      await Models.property.update(body, row?.id);
      propertyList(state.page);
      Success("Property Approved successfully");
    } catch (error) {
      console.error("Approval error:", error);
      Failure("Something went wrong while approving the property.");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const bodyData = () => {
    let body: any = {};

    // body.is_approved = "No";

    if (state.search) {
      body.search = debouncedSearch;
    }

    if (state.property_type?.length > 0) {
      body.property_type = state.property_type?.map((item) => item?.value);
    }

    if (state.offer_type) {
      body.listing_type = state.offer_type.value;
    }

    if (state.status) {
      body.status = state.status.value;
    }

    if (state.status) {
      body.status = state.status.value;
    }
    if (state.publish?.value) {
      body.publish = state.publish.value == "Publish" ? "Yes" : "No";
    } else {
      body.publish = "Yes";
    }

     if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const handleEdit = async (row) => {
    router.push(`/real-estate/property/update/${row?.id}`);
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

  const handleNextPage = () => {
    if (state.next) {
      const newPage = state.page + 1;
      propertyList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      propertyList(newPage);
    }
  };

  const propertStatus = [
    { value: 1, label: "Available" },
    { value: 2, label: "Unavailable" },
  ];

  const toggleColumn = (accessor: string) => {
    const updatedColumns = state.visibleColumns?.map((col) =>
      col.accessor === accessor ? { ...col, visible: !col.visible } : col
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

  const handleClear = () => {
    setState({
      property_type: null,
      offer_type: null,
      status: null,
      publish: null,
      search: "",
    });
  };

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Approval Property List
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
              Manage property listings and status
            </p>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-dred border-none w-full md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/property/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div
        onClick={() => {
          setState({ offer_type:null})

        }}
        className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Briefcase className="text-dblue h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.total || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Properties
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() =>
            setState({ offer_type: { value: "sale", label: "Sale" } })
          }
          className="cursor-pointer rounded-lg border border-gray-200 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.sale_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                 Sale Properties
              </p>
            </div>
          </div>
        </div>
        <div
          onClick={() =>
             setState({ offer_type: { value: "lease", label: "Lease" } })
          }
          className="cursor-pointer  rounded-lg border border-gray-200 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Hourglass className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.statCount?.lease_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lease Properties
              </p>
            </div>
          </div>
        </div>
        {/* <div className="rounded-lg border border-gray-200 bg-red-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700">
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-red-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl  leading-none text-gray-900 dark:text-white">
                {state.jobList?.filter((job) => job.priority == "0 - 30 Days")
                  ?.length || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Urgent Job
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* <div className=" mb-2 mt-5 gap-2 md:mt-0 md:flex flex-wrap xl:gap-4"> */}
      <div className="mb-5 rounded-2xl ">
        <div className="flex items-center justify-between gap-5">
       
          <TextInput
            type="text"
           
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
        

        
          <CustomSelect
            placeholder="Property Type"
            value={state.property_type}
            onChange={(e) => setState({ property_type: e })}
            options={state?.categoryList}
            isClearable={true}
            isMulti={true}
            loadMore={() => catListLoadMore()}
          />
       

      
          <CustomSelect
            placeholder="Offer Type"
            value={state.offer_type}
            onChange={(e) => setState({ offer_type: e })}
            options={ListType}
          />
       

     
          <CustomSelect
            placeholder="Property Status"
            value={state.status}
            onChange={(e) => setState({ status: e })}
            options={Property_status}
          />
       

      
          <CustomSelect
            placeholder="Publish or Draft"
            value={state.publish}
            onChange={(e) => setState({ publish: e })}
            options={PROPERTY_STATUS}
          />
        

         {/* <div className="align-end min-w-[200px]">
          <button type="button" className="mt-2 text-dred flex gap-1" onClick={handleClear}>
            <X size={13} className="mt-[2px]" />Clear Filter 
          </button>
        </div> */}
        </div>
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          {state?.loading ? (
            <div className="flex h-[400px] items-center justify-center">
              <RotatingLines
                visible={true}
                strokeColor="gray"
                strokeWidth="5"
                animationDuration="0.75"
                width="40"
                ariaLabel="rotating-lines-loading"
              />
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-4">
                <FilterChips
                  chips={[
                    ...(state.search ? [{ label: `Search: ${state.search}`, onRemove: () => setState({ search: "" }) }] : []),
                    ...(state.property_type?.length > 0 ? state.property_type.map((pt: any) => ({ label: `Type: ${pt.label}`, onRemove: () => setState({ property_type: state.property_type.filter((t: any) => t.value !== pt.value) }) })) : []),
                    ...(state.offer_type ? [{ label: `Offer: ${state.offer_type.label}`, onRemove: () => setState({ offer_type: null }) }] : []),
                    ...(state.status ? [{ label: `Status: ${state.status.label}`, onRemove: () => setState({ status: null }) }] : []),
                    ...(state.publish ? [{ label: `Publish: ${state.publish.label}`, onRemove: () => setState({ publish: null }) }] : []),
                  ]}
                  onClearAll={() => setState({ search: "", property_type: null, offer_type: null, status: null, publish: null })}
                />
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  <div className="flex items-center gap-1 rounded-md">
                    <button onClick={() => setState({ viewMode: "table" })} className="rounded-md p-2 transition-all duration-200">
                      <Table size={18} color={state.viewMode == "table" ? "#9b0f09" : "grey"} />
                    </button>
                    <div className="h-6 w-px bg-gray-300" />
                    <button onClick={() => setState({ viewMode: "image" })} className="rounded-md p-2 transition-all duration-200">
                      <Calendar size={18} color={state.viewMode == "image" ? "#9b0f09" : "grey"} />
                    </button>
                  </div>
                  <div className="text-sm text-black">{state.total} Properties found</div>
                </div>
              </div>

              <DataTable
                className="table-responsive"
                records={state.tableList || []}                
                columns={filteredColumns}
                highlightOnHover
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
                  propertyList(1, columnAccessor, direction);
                }}
                
              />
            </>
          ) }
        </div>

        <div className="mt-5 flex justify-end gap-3">
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
            className={`btn border-none p-2 ${!state?.next ? "btn-disabled" : "btn-dred"}`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>
    </>
  );
}

export default PrivateRouter(List)
