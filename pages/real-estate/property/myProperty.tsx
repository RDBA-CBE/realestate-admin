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
  LISTING_TYPE_LIST,
  ListType,
  PROPERTY_STATUS,
  propertyType,
} from "@/utils/constant.utils";
import { FaHome } from "react-icons/fa";
import { RotatingLines } from "react-loader-spinner";
import { Checkbox, Popover, Text } from "@mantine/core";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  CircleCheck,
  Columns,
  Eye,
  EyeOff,
  Globe,
  Hourglass,
  LucideHome,
  SlidersHorizontal,
  Table,
  X,
} from "lucide-react";
import PrivateRouter from "@/hook/privateRouter";
import FilterChips from "@/components/FilterChips/FilterChips.component";

const  list = () => {
  const router = useRouter();

  const tableColumns = [
    {
      accessor: "title",
      title: "Property Info",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <Link
          className="flex gap-3 font-semibold"
          href={`${FRONTEND_URL}/property-detail/${row?.id}`}
          target="_blank"
        >
          <div className="flex flex-col justify-between ">
            <div>
              <div className="cursor-pointer text-sm" title={"row.title"}>
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
      render: (row) => (
        <span title={row.project}>{truncateText(row.project)}</span>
      ),
    },
    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row.developer}>{truncateText(row.developer)}</span>
      ),
    },
    {
      accessor: "agent",
      title: "Agent",
      visible: true,
      toggleable: true,
      render: (row) => <span title={row.agent}>{truncateText(row.agent)}</span>,
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
            <span
              title={firstType}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {truncateText(firstType)}
            </span>

            {/* Avatars */}
            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
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
      accessor: "publish",
      title: "Publish",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
          row?.publish === "Published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
        }`}>
          {row?.publish}
        </span>
      ),
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
            className="text-dred flex"
            onClick={(e) => {
              handleView(row);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            className="flex text-primary"
            onClick={(e) => {
              handleEdit(row);
            }}
          >
            <IconEdit className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex text-success"
            onClick={() => handleStatus(row)}
          >
            <CircleCheck className="h-3.5 w-3.5 " />
          </button>

          <button
            type="button"
            className={`flex ${ row?.publish === "Published" ? "text-warning" : "text-info" }`}
            onClick={() => handlePublish(row)}
            title={row?.publish === "Published" ? "Unpublish" : "Publish"}
          >
            <Globe className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            className="flex text-danger"
            onClick={(e) => handleDelete(row)}
          >
            <IconTrashLines className="h-3.5 w-3.5" />
          </button>
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
      render: (row) => {
        const group = localStorage.getItem("group");

        return (
          <Link
            className="flex w-fit gap-3 font-semibold"
            href={`${FRONTEND_URL}/property-detail/${row?.id}`}
            target="__blank"
          >
            <div className="h-20 w-20 rounded-md bg-white-dark/30 ltr:mr-2 rtl:ml-2">
              <img
                className="h-full w-full cursor-pointer rounded-md object-cover"
                src={row.image}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-between ">
              <div>
                <div className="flex gap-1">
                  <IconMapPin className="h-3 w-3" />
                  <span className="mt-[-2px] text-xs">{row.location}</span>
                </div>
                <div
                  className="text-md cursor-pointer font-bold"
                  title={row.title}
                >
                  {truncateText(row.title)}
                </div>
              </div>
              {group !== "Admin" ? (
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={`badge  ${
                      row?.is_approved
                        ? "badge-outline-success w-[70px]"
                        : "badge-outline-warning w-[140px]"
                    }`}
                  >
                    {row?.is_approved ? "Approved" : "Waiting For Approval"}
                  </span>
                  <div
                    className={`inline-block w-fit rounded-full px-2 text-xs font-semibold ${
                      row?.publish == "Published"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {row?.publish}
                  </div>
                </div>
              ) : (
                <div
                  className={`inline-block w-fit rounded-full px-2 text-xs font-semibold ${
                    row?.publish == "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {row?.publish}
                </div>
              )}
              <div>
                <Link
                  className="flex gap-1 text-primary"
                  href={`${FRONTEND_URL}/property-detail/${row?.id}`}
                  target="_blank"
                >
                  <LucideHome className="h-4 w-4 text-black" />
                  <span className="mt-[2px] text-xs">View Details</span>
                </Link>
              </div>
            </div>
          </Link>
        );
      },
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
        <span title={row.project}>{truncateText(row.project)}</span>
      ),
    },
    {
      accessor: "developer",
      title: "Developer",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row.developer}>{truncateText(row.developer)}</span>
      ),
    },
    {
      accessor: "agent",
      title: "Agent",
      visible: true,
      toggleable: true,
      render: (row) => <span title={row.agent}>{truncateText(row.agent)}</span>,
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
            <span
              title={firstType}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {truncateText(firstType)}
            </span>

            {/* Avatars */}
            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
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
    // {
    //   accessor: "publish",
    //   title: "Publish",
    //   visible: true,
    //   toggleable: true,
    //   render: (row: any) => (
    //     <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
    //       row?.publish === "Published" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
    //     }`}>
    //       {row?.publish}
    //     </span>
    //   ),
    // },

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
            className="text-dred flex"
            onClick={(e) => {
              handleView(row);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            className="flex text-primary"
            onClick={(e) => {
              handleEdit(row);
            }}
          >
            <IconEdit className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex text-success"
            onClick={() => handleStatus(row)}
          >
            <CircleCheck className="h-3.5 w-3.5 " />
          </button>

            <button
                      type="button"
                      className={`flex ${ row?.publish === "Published" ? "text-warning" : "text-info" }`}
                      onClick={() => handlePublish(row)}
                      title={row?.publish === "Published" ? "Unpublish" : "Publish"}
                    >
                      <Globe className="h-3.5 w-3.5" />
                    </button>
          <button
            type="button"
            className="flex text-danger"
            onClick={(e) => handleDelete(row)}
          >
            <IconTrashLines className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    group: null,
    page: 1,
    tableList: [],
    categoryList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    loading: false,
    userId: null,
    visibleColumns: allColumns,
    viewMode: "table",
    showFilterModal: false,
     sortBy: "",
    sortOrder: "asc",
  });

  const visibleCount = state.visibleColumns.filter((col) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col) => col.toggleable !== false,
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", debouncedSearch);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setState({
      userId: userId,
    });
  }, []);

  useEffect(() => {
    categoryList(1);
  }, []);

  useEffect(() => {
    if (state.userId !== null) {
      statCount();
    }
  }, [ state.userId,]);

  useEffect(() => {
    if (state.userId !== null) {
      propertyList(1);
    }
  }, [
    debouncedSearch,
    state.userId,
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

  const statCount = async () => {
    try {
      const body = {
        userId: state.userId,
      };
      const res: any = await Models.property.count(body);
      console.log("count res", res);

      setState({
        statCount: res,
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

  const propertyList = async (page, sortBy = state.sortBy, sortOrder = state.sortOrder) => {
    try {
      setState({ loading: true });
      const body = bodyData();

       if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }
      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item) => ({
        publish: item?.publish == true ? "Published" : "Draft",

        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        total_area: item?.total_area,
        property_type:
          item?.property_type?.map((pt) => capitalizeFLetter(pt?.name)) || [],
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
          item?.developer?.first_name,
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
        agent: `${capitalizeFLetter(
          item?.agent?.first_name,
        )} ${capitalizeFLetter(item?.agent?.last_name)}`,
        project: capitalizeFLetter(item?.project?.name),

        // price: formatToINR(item?.price),
        price: formatPriceRange(
          item?.price_range?.minimum_price,
          item?.price_range?.maximum_price,
        ),

        is_approved: item?.is_approved,
        image:
          item?.primary_image ??
          "/assets/images/real-estate/property-info-img1.png",
      }));

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

  const handleClear = () => {
    setState({
      property_type: null,
      offer_type: null,
      status: null,
      publish: null,
      search: "",
      role: { value: "developer", label: "Developer" },
      user: "",
      developer: "",
      agent: "",
    });
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

  const deleteDecord = async (row: any) => {
    try {
      setState({ btnLoading: true });

      const res = await Models.property.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      propertyList(state.page);

      Success("Property deleted succssfully");
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
    let body: any = {};

    if (state.search) {
      body.search = debouncedSearch;
    }
    if (state.userId) {
      body.userId = state.userId;
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
    if (state.publish) {
      body.publish = state.publish?.value == "Publish" ? "Yes" : "No";
    }

     if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const handleEdit = (row) => {
    router.push(`/real-estate/property/update/${row?.id}`);
    console.log("✌️row --->", row);
  };

  const handleView = async (row) => {
    window.open(`${FRONTEND_URL}/property-detail/${row?.id}`, "_blank");
  };

  const handleStatus = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to change the status of this property?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
      padding: "2em",
    });

    if (!result.isConfirmed) return;

    try {
      setState({ btnLoading: true });
      const body = { is_approved: true };
      await Models.property.update(body, row?.id);
      propertyList(state.page);
      Success("Property Approved successfully");
    } catch (error) {}
  };

  const handlePublish = async (row) => {
      const isPublished = row?.publish === "Published";
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to ${isPublished ? "unpublish" : "publish"} this property?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, do it!",
        cancelButtonText: "Cancel",
        padding: "2em",
      });
  
      if (!result.isConfirmed) return;
  
      try {
        setState({ btnLoading: true });
        const formData = new FormData();
        formData.append("publish", isPublished ? "false" : "true");
        await Models.property.update(formData, row?.id);
        propertyList(state.page);
        Success(`Property ${isPublished ? "unpublished" : "published"} successfully`);
      } catch (error) {
        setState({ btnLoading: false });
      }
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

  const clearFilter = async () => {
    setState({
      search: "",
      property_type: "",
      offer_type: "",
      status: "",
      role: { value: "developer", label: "Developer" },
      user: "",
      // developer: "",
      // agent: "",
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

  const propertStatus = [
    { value: 1, label: "Active" },
    { value: 2, label: "In Active" },
  ];

  return (
    <>
      <div className=" mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            My Property List
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Manage property listings and status
          </p>
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            className="btn btn-dred w-full  border-none md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/property/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div
          onClick={() => {
            setState({ offer_type: null });
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
            isMulti
            loadMore={() => catListLoadMore()}
          />

          <CustomSelect
            placeholder="Select Offer Type"
            value={state.offer_type}
            onChange={(e) => setState({ offer_type: e })}
            options={ListType}
          />

          <CustomSelect
            placeholder="Publish or Draft"
            value={state.publish}
            onChange={(e) => setState({ publish: e })}
            options={PROPERTY_STATUS}
          />
          {/* <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button> */}

          {/* Status Dropdown */}

          {/* Bulk Actions Dropdown */}

          {/* <button
          type="button"
          className="btn btn-dred"
          // onClick={() => usersList(1)}
        >
          Apply Filter
        </button>
        <button
          type="button"
          className="btn btn-dred"
          // onClick={() => clearFilter()}
        >
          Clear Filter
        </button> */}
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
          ) :  (
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
                  <div className="flex items-center gap-1">
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

        <div className="me-2 mt-5 flex justify-end gap-3">
          <button
            disabled={!state?.previous}
            onClick={handlePreviousPage}
            className={`btn  border-none p-2 ${
              !state?.previous ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state?.next}
            onClick={handleNextPage}
            className={`btn  border-none p-2  ${
              !state?.next ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

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
                    placeholder="Select User"
                    value={state.user}
                    onChange={(e) => setState({ user: e })}
                    options={state.userList}
                  />
                </>
              )}
              <CustomSelect
                placeholder="Publish or Draft"
                value={state.publish}
                onChange={(e) => setState({ publish: e })}
                options={PROPERTY_STATUS}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <button
                onClick={() =>
                  setState({
                    role: { value: "developer", label: "Developer" },
                    user: null,
                    publish: null,
                  })
                }
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

      {/* <Modal
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
      /> */}
    </>
  );
}

export default PrivateRouter(list)
