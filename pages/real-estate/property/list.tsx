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
import FilterChips from "@/components/FilterChips/FilterChips.component";
import {
  FILTER_ADMINROLES,
  FILTER_ROLES,
  FRONTEND_URL,
  LISTING_TYPE,
  LISTING_TYPE_LIST,
  ListType,
  PROPERTY_STATUS,
  Property_status,
  PROPERTY_TYPE,
  propertyType,
  RECORDS_TYPE,
  ROLES,
} from "@/utils/constant.utils";
import { RotatingLines } from "react-loader-spinner";
import {
  LucideHome,
  Columns,
  Eye,
  EyeOff,
  Table,
  Calendar,
  CircleCheck,
  Briefcase,
  CheckCircle,
  Hourglass,
  X,
  SlidersHorizontal,
  Globe,
  Tag,
  Key,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import moment from "moment";
import { clear } from "console";
import PrivateRouter from "@/hook/privateRouter";

const List = () => {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    row: any;
    x: number;
    y: number;
  } | null>(null);

  // const [group, setGroup] = useState(null);

  // console.log("group", group);

  // useEffect(() => {
  //   const usergroup = localStorage.getItem("group") || "";
  //   setGroup(usergroup);
  // }, []);

  const tableColumns = [
    {
      accessor: "title",
      title: "Property Info",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row) => (
        <div
          className="relative"
          onMouseEnter={(e) => {
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            setTooltip({ row, x: rect.left, y: rect.top });
          }}
          onMouseLeave={() => setTooltip(null)}
        >
          <div
            className="flex gap-3 font-semibold"
            onClick={() => handleView(row)}
          
          >
            <div className="flex flex-col justify-between ">
              <div>
                <div className="cursor-pointer text-sm">
                  {truncateText(row.title)}
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // {
    //   accessor: "price",
    //   title: "Price Range",
    //   visible: true,
    //   toggleable: true,
    // },
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
    // {
    //   accessor: "created_by",
    //   title: "Created By",
    //   visible: true,
    //   toggleable: true,
    //   render: (row) => (
    //     <span title={row.created_by}>{truncateText(row.created_by)}</span>
    //   ),
    // },
    // {
    //   accessor: "developer",
    //   title: "Developer",
    //   visible: true,
    //   toggleable: true,
    //   render: (row) => (
    //     <span title={row.developer}>{truncateText(row.developer)}</span>
    //   ),
    // },
    // {
    //   accessor: "agent",
    //   title: "Agent",
    //   visible: true,
    //   toggleable: true,
    //   render: (row) => <span title={row.agent}>{truncateText(row.agent)}</span>,
    // },
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
    // {
    //   accessor: "status",
    //   title: "Status",
    //   visible: true,
    //   toggleable: true,
    // },
    // {
    //   accessor: "date",
    //   title: "Date",
    //   visible: true,
    //   toggleable: true,
    // },
    {
      accessor: "publish",
      title: "Publish Status",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            row?.publish === "Published"
              ? "bg-lred text-dred border-dred"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {row?.publish}
        </span>
      ),
    },

    {
      accessor: "is_approved",
      title: "Approved Status",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
            row?.is_approved == true
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-gray-700"
          }`}
        >
          {row?.is_approved == true ? "Approved" : "Pending"}
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
          {/* <button
            className="flex text-success hover:text-success"
            onClick={() => handleStatus(row)}
          >
            <CircleCheck className="h-3.5 w-3.5 " />
          </button> */}
          <button
            type="button"
            className={`flex ${
              row?.publish === "Published" ? "text-warning" : "text-info"
            }`}
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
            <IconTrashLines className="h-4 w-4 " />
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
            className="flex gap-3 font-semibold"
            href={`${FRONTEND_URL}/property-detail/${row?.id}`}
            target="_blank"
          >
            <div className="h-20 w-20 rounded-md bg-white-dark/30 ltr:mr-2 rtl:ml-2">
              <img
                className="h-full w-full cursor-pointer rounded-md object-cover"
                src={row.image}
                alt=""
              />
            </div>
            <div className="flex flex-col justify-between">
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
              {group == "Seller" ? (
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
                  <LucideHome className="h-3 w-3 text-black" />
                  <span className="mt-[-2px] text-xs">View Details</span>
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
      accessor: "created_by",
      title: "Created By",
      visible: true,
      toggleable: true,
      render: (row) => (
        <span title={row.created_by}>{truncateText(row.created_by)}</span>
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

    // ...(group == "Admin" || group == "Seller"
    //   ? [
    {
      accessor: "action",
      title: "Actions",
      visible: true,
      toggleable: false,
      sortable: false,
      textAlignment: "center",
      render: (row) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            className="text-dred flex"
            onClick={(e) => {
              handleView(row);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button className="flex text-primary" onClick={() => handleEdit(row)}>
            <IconEdit className="h-3.5 w-3.5 " />
          </button>
          <button
            className="flex text-success hover:text-success"
            onClick={() => handleStatus(row)}
          >
            <CircleCheck className="h-3.5 w-3.5 " />
          </button>
          <button
            type="button"
            className={`flex ${
              row?.publish === "Published" ? "text-warning" : "text-info"
            }`}
            onClick={() => handlePublish(row)}
            title={row?.publish === "Published" ? "Unpublish" : "Publish"}
          >
            <Globe className="h-3.5 w-3.5" />
          </button>
          <button
            className="flex text-danger hover:text-danger"
            onClick={() => handleDelete(row)}
          >
            <IconTrashLines className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    //       ]
    //     : []),
  ];

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    group: null,
    page: 1,
    categoryList: [],
    tableList: [],
    agentList: [],
    developerList: [],
    userList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    loading: false,
    visibleColumns: allColumns,
    viewMode: "table",
    role: null,
    showFilterModal: false,
    sortBy: "",
    sortOrder: "asc",
    selectedRecords: [],
  });

  const visibleCount = state.visibleColumns.filter((col) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col) => col.toggleable !== false,
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    const group = localStorage.getItem("group") || "";
    const userId = localStorage.getItem("userId");

    setState({
      group: group,
      // role: group == "Admin" && {
      //   value: "developer",
      //   label: "Developer",
      // },
      userId: userId,
    });
  }, [state.group]);

  useEffect(() => {
    categoryList(1);
    developerList(1);
    statCount();
    projectList(1);
  }, []);

  console.log("state.userId", state.userId);

  useEffect(() => {
    if (state.userId) {
      propertyList(1);
    }
  }, [
    state.userId,
    debouncedSearch,
    state.property_type,
    state.offer_type,
    state.status,
    state.developer,
    state.agent,
    state.role,
    state.user,
    state.publish,
    state.recordType,
    state.team,
    state.project,
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
      const body = bodyData();

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

  const propertyList = async (
    page,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
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
        // property_type: item?.property_type?.name,
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
        created_by:
          item.created_by?.first_name || item.created_by?.last_name
            ? `${item.created_by?.first_name || ""} ${
                item.created_by?.last_name || ""
              }`.trim()
            : item.created_by || "-",
        agent:
          item.agent?.first_name || item.agent?.last_name
            ? `${capitalizeFLetter(
                item.agent?.first_name || "",
              )} ${capitalizeFLetter(item.agent?.last_name || "")}`.trim()
            : item.agent || "-",
        project: capitalizeFLetter(item?.project?.name),

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
        selectedRecords: [],
      });
    } catch (error) {
      console.log("✌️error --->", error);
      setState({ loading: false });
    }
  };

  console.log("tableList", state?.tableList);

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

  const projectList = async (page) => {
    try {
      const userId = localStorage.getItem("userId");
      const body = {
        developer: userId,
      };
      const res: any = await Models.project.list(page, body);
      const droprdown = Dropdown(res?.results, "name");
      setState({
        projectList: droprdown,
        projectPage: page,
        projectNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const projectListLoadMore = async () => {
    try {
      if (state.projectNext) {
        const res: any = await Models.project.list(state.projectPage + 1, {
          developer: localStorage.getItem("userId"),
        });
        const newOptions = Dropdown(res?.results, "name");
        setState({
          projectList: [...state.projectList, ...newOptions],
          projectNext: res.next,
          projectPage: state.projectPage + 1,
        });
      } else {
        setState({
          projectList: state.projectList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
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

  const getRecordTypeList = (e) => {
    setState({ recordType: e, user: null, userList: [] });

    if (e?.value == "created") {
      setState({ createdRecords: true, assignedRecords: false });
    }
    if (e?.value == "assigned") {
      setState({ assignedRecords: true, createdRecords: false });
    }
  };

  // const getuserList = (e) => {
  //   setState({ role: e, user: null, userList: [] });

  //   if (e?.value == "developer") {
  //     developerList(1);
  //   } else if (e?.value == "agent") {
  //     agentList(1);
  //   } else if (e?.value == "seller") {
  //     sellerList(1);
  //   }
  // };

  const getuserList = (e) => {
    setState({ recordType: e });
    if (e?.value === "own") {
      setState({ team: false });
    } else if (e?.value === "admin") {
      setState({ team: true });
    } else {
      setState({ team: null });
    }
  };
  console.log("team", state.team);

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
      "Are you sure want to delete property?",
    );
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      async () => {
        try {
          setState({ btnLoading: true });
          await Promise.all(
            state.selectedRecords.map((row: any) =>
              Models.property.delete(row?.id),
            ),
          );
          setState({ selectedRecords: [], btnLoading: false });
          propertyList(state.page);
          Success(
            `${state.selectedRecords.length} propert${state.selectedRecords.length > 1 ? "ies" : "y"} deleted successfully`,
          );
        } catch (error) {
          setState({ btnLoading: false });
        }
      },
      () => {
        Swal.fire("Cancelled", "Your Records are safe :)", "info");
      },
      `Are you sure want to delete ${state.selectedRecords.length} selected propert${state.selectedRecords.length > 1 ? "ies" : "y"}?`,
    );
  };

  const bodyData = () => {
    const group = localStorage.getItem("group");
    const userId = localStorage.getItem("userId");
    let body: any = {};

    // Common

    // body.is_approved = "Yes";

    body.developer = userId;

    if (state.search) {
      body.search = debouncedSearch;
    }
    if (state.project) {
      body.project = state.project.value;
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

    if (state?.team == true) {
      body.team = state?.team;
    }
    if (state?.team == false) {
      body.team = state?.team;
    }

    // if (group == capitalizeFLetter(ROLES.ADMIN)) {
    //   body = { ...body, ...adminBody() };
    // } else if (group == capitalizeFLetter(ROLES.DEVELOPER)) {
    //   body = { ...body, ...developerBody() };
    // } else if (group == capitalizeFLetter(ROLES.AGENT)) {
    //   body = { ...body, ...agentBody() };
    // } else if (group == capitalizeFLetter(ROLES.SELLER)) {
    //   body = { ...body, ...sellerBody() };
    // }

    // if(state.createdRecords){
    //   const userId = localStorage.getItem("userId");
    //   if (state.role?.value == "own") {
    //     body.created_by = userId
    //   }
    //   if (state.role?.value == "developer") {
    //     body.created_by = state.user?.value
    //   }
    //   if (state.role?.value == "agent") {
    //     body.created_by = state.user?.value
    //   }
    //   if (state.role?.value == "seller") {
    //     body.created_by = state.user?.value
    //   }
    // }
    // if(state.assignedRecords){
    //   const userId = localStorage.getItem("userId");

    //   if (state.role?.value == "own") {
    //     body.assigned_to = userId
    //   }
    //   if (state.role?.value == "developer") {
    //     body.assigned_to_developer = state.user?.value
    //   }
    //   if (state.role?.value == "agent") {
    //     body.assigned_to_agent = state.user?.value
    //   }

    // }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const adminBody = () => {
    let body: any = {};

    if (state.user) {
      if (state.role?.value == "developer") {
        body.assigned_to_developer = state.user?.value;
        // body.created_by = state.user?.value;
      } else if (state.role?.value == "agent") {
        body.assigned_to_agent = state.user?.value;
        // body.created_by = state.user?.value;
      } else if (state.role?.value == "seller") {
        body.created_by = state.user?.value;
      }
    } else {
      if (state.role) {
        body.group = state.role?.value;
      }
    }
    return body;
  };

  const developerBody = () => {
    const userId = localStorage.getItem("userId");
    const body: any = {};
    body.is_approved = "Yes";
    body.developer = userId;
    return body;
  };
  const agentBody = () => {
    const userId = localStorage.getItem("userId");
    const body: any = {};
    body.is_approved = "Yes";
    body.agent = userId;
    return body;
  };

  const sellerBody = () => {
    const userId = localStorage.getItem("userId");
    const body: any = {};
    body.created_by = userId;
    return body;
  };

  const handleEdit = async (row) => {
    router.push(`/real-estate/property/update/${row?.id}`);
  };

  const handleView = async (row) => {
    router.push(`/real-estate/property/detail/${row?.id}`);
  };

  const handleStatus = async (row) => {
    const isPublished = row?.publish === "Published";

    if (!isPublished) {
      Failure("Cannot change status because the property is in draft.");
      return;
    }

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

      const body = { is_approved: !row.is_approved };
      await Models.property.update(body, row?.id);
      propertyList(state.page);
      Success("Property Approved successfully");
    } catch (error) {

    }
  };

  const handlePublish = async (row) => {
    const isPublished = row?.publish === "Published";
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${
        isPublished ? "unpublish" : "publish"
      } this property?`,
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
      // if (isPublished) {
      //   formData.append("is_approved", "false");
      // }
      await Models.property.update(formData, row?.id);
      propertyList(state.page);
      Success(
        `Property ${isPublished ? "unpublished" : "published"} successfully`,
      );
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
      role: null,
      user: "",
      showFilterModal:false

      // developer: "",
      // agent: "",
    });
  };

  const propertStatus = [
    { value: 1, label: "Available" },
    { value: 2, label: "Unavailable" },
  ];

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

  const activeFilterCount = [
    state.group == "Admin" && state.role,
    state.group == "Admin" && state.user,
    state.publish,
  ].filter(Boolean).length;

  const FILTER_ADMINROLES = [
    {
      value: "own",
      label: "Own Records",
    },
    {
      value: "admin",
      label: "Admin Records",
    },
  ];

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            {"Properties List"}
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
          className="cursor-pointer rounded-lg border border-purple-200 bg-purple-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Tag className="h-10 w-10 text-purple-600" />
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
          className="cursor-pointer  rounded-lg border border-sky-200 bg-sky-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex  items-center justify-center rounded-lg dark:border-gray-700">
              <Key className="h-10 w-10 text-sky-600" />
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

      {/* Filter section */}
      <div className="mb-5 rounded-2xl">
        <div className="flex  items-center justify-between gap-5">
          <TextInput
            type="text"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />

          <CustomSelect
            placeholder="Project Type"
            value={state.project}
            onChange={(e) => setState({ project: e })}
            options={state?.projectList}
            isClearable={true}
            // isMulti
            loadMore={() => projectListLoadMore()}
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
            placeholder="All Properties"
            value={state.recordType}
            onChange={getuserList}
            options={FILTER_ADMINROLES}
            // isClearable={false}
          />

          {/* <CustomSelect
                   
                    value={state.recordType}
                    onChange={(e) => getRecordTypeList(e)}
                    options={RECORDS_TYPE}
                    isClearable={false}
                  /> */}

          {/* {state.group == "Admin" && (
                <>
                  <CustomSelect
                    placeholder="Select User's Role"
                    value={state.role}
                    onChange={(e) => getuserList(e)}
                    options={FILTER_ADMINROLES}
                    // isClearable={false}
                  />
                  <CustomSelect
                    placeholder="Select User"
                    value={state.user}
                    onChange={(e) => setState({ user: e })}
                    options={state.userList}
                    disabled={!state.role}
                  />
                </>
              )} */}
          <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding [&_.mantine-datatable-table-container]:overflow-visible [&_table]:overflow-visible">
          {
            state?.loading ? (
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    gap: "10px",
                  }}
                >
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
                      ...(state.property_type?.length > 0
                        ? state.property_type.map((pt: any) => ({
                            label: `Type: ${pt.label}`,
                            onRemove: () =>
                              setState({
                                property_type: state.property_type.filter(
                                  (t: any) => t.value !== pt.value,
                                ),
                              }),
                          }))
                        : []),
                      ...(state.offer_type
                        ? [
                            {
                              label: `Offer: ${state.offer_type.label}`,
                              onRemove: () => setState({ offer_type: null }),
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
                      ...(state.publish
                        ? [
                            {
                              label: `Publish: ${state.publish.label}`,
                              onRemove: () => setState({ publish: null }),
                            },
                          ]
                        : []),
                      ...(state.role && state.group === "Admin"
                        ? [
                            {
                              label: `Role: ${state.role.label}`,
                              onRemove: () =>
                                setState({
                                  role: {
                                    value: "developer",
                                    label: "Developer",
                                  },
                                  user: null,
                                }),
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
                    onClearAll={() =>
                      setState({
                        search: "",
                        property_type: null,
                        offer_type: null,
                        status: null,
                        publish: null,
                        role: null,
                        user: null,
                      })
                    }
                  />

                  <div className="ml-auto flex items-center gap-3">
                    {state.selectedRecords?.length > 0 && (
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-red-600  px-3 py-1.5 text-sm font-medium text-red-600 "
                        onClick={handleBulkDelete}
                      >
                        <IconTrashLines className="h-4 w-4" />
                        Delete ({state.selectedRecords.length})
                      </button>
                    )}
                    <div className="text-sm text-black">
                      {state.total} Properties found
                    </div>

                    {/* <Popover
                  position="bottom-end"
                  withArrow
                  shadow="md"
                  width={220}
                >
                  <Popover.Target>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#475569",
                        transition: "all 0.2s ease",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                      }}
                      className="hover:border-gray-400 hover:shadow-sm"
                    >
                      <Columns size={16} color="#64748b" />
                      <span>Show Columns</span>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          backgroundColor: "#3b82f6",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "white",
                        }}
                      >
                        {visibleCount}
                      </div>
                    </div>
                  </Popover.Target>

                  <Popover.Dropdown
                    style={{
                      padding: "16px",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ marginBottom: "16px" }}>
                      <Text
                        size="sm"
                        fw={600}
                        style={{ color: "#1e293b", marginBottom: "12px" }}
                      >
                        Show Columns
                      </Text>

                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          marginBottom: "16px",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "#475569",
                            transition: "all 0.2s ease",
                          }}
                          className="hover:border-gray-300 hover:bg-gray-50"
                          onClick={() => toggleAllColumns(true)}
                        >
                          <Eye size={14} color="#475569" />
                          <span>All</span>
                        </div>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "13px",
                            color: "#475569",
                            transition: "all 0.2s ease",
                          }}
                          className="hover:border-gray-300 hover:bg-gray-50"
                          onClick={() => toggleAllColumns(false)}
                        >
                          <EyeOff size={14} color="#475569" />
                          <span>None</span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        marginBottom: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                        }}
                      >
                        {state.visibleColumns?.map((column) => (
                          <div
                            key={column.accessor}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <Checkbox
                              checked={column.visible ?? true}
                              onChange={() => toggleColumn(column.accessor)}
                              disabled={column.toggleable === false}
                              size="sm"
                              style={{ flexShrink: 0 }}
                            />
                            <Text
                              size="sm"
                              style={{
                                color:
                                  column.toggleable === false
                                    ? "#94a3b8"
                                    : "#475569",
                                cursor:
                                  column.toggleable === false
                                    ? "not-allowed"
                                    : "pointer",
                              }}
                              onClick={() =>
                                column.toggleable !== false &&
                                toggleColumn(column.accessor)
                              }
                            >
                              {column.title}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: "12px",
                        fontSize: "12px",
                        color: "#64748b",
                        textAlign: "center",
                      }}
                    >
                      {visibleCount} of {totalToggleable} columns visible
                    </div>
                  </Popover.Dropdown>
                </Popover> */}
                  </div>
                </div>

                <DataTable
                  className="table-responsive"
                  records={state.tableList || []}
                  columns={filteredColumns}
                  highlightOnHover
                  minHeight={200}
                  selectedRecords={state.selectedRecords}
                  onSelectedRecordsChange={(records) =>
                    setState({ selectedRecords: records })
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
                    propertyList(1, columnAccessor, direction);
                  }}
                />
              </>
            )
            // : (
            //   <div className="mt-5 flex h-[400px] items-center justify-center">
            //     <p>No Records Found</p>
            //   </div>
            // )
          }
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
                placeholder="Offer Type"
                value={state.offer_type}
                onChange={(e) => setState({ offer_type: e })}
                options={ListType}
              />
              {/* <CustomSelect
                placeholder="Property Status"
                value={state.status}
                onChange={(e) => setState({ status: e })}
                options={Property_status}
              /> */}
              <CustomSelect
                placeholder="Publish or Draft"
                value={state.publish}
                onChange={(e) => setState({ publish: e })}
                options={PROPERTY_STATUS}
              />
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

      {/* Fixed tooltip rendered outside table */}
      {tooltip && (
        <div
          className="border-dred bg-lred pointer-events-none fixed z-[99999] w-56 rounded-lg border p-3 shadow-lg dark:bg-gray-800"
          style={{
            top: tooltip.y - 8,
            left: tooltip.x,
            transform: "translateY(40%)",
          }}
        >
          <div className="mb-1 font-semibold text-[#000]">
            {tooltip.row.title}
          </div>
          {tooltip.row?.created_by && (
            <div className="mb-1 flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Created By:
              </span>
              <span className="text-gray-800 dark:text-white">
                {tooltip.row.created_by}
              </span>
            </div>
          )}
          {tooltip.row?.developer && (
            <div className="mb-1 flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Developer:
              </span>
              <span className="text-gray-800 dark:text-white">
                {tooltip.row.developer}
              </span>
            </div>
          )}
          {tooltip.row?.agent && (
            <div className="flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Agent:
              </span>
              <span className="text-gray-800 dark:text-white">
                {tooltip.row.agent ?? "-"}
              </span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PrivateRouter(List);
