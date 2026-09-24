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
  buildFormData,
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
  APPROVED_STATUS,
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
  Download,
  Tag,
  Key,
  Clock,
  Verified,
  Copy,
  XCircle,
  Building2,
  Mail,
  Phone,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import moment from "moment";
import { clear } from "console";
import PrivateRouter from "@/hook/privateRouter";
import Paginations from "@/pages/elements/paginations";

const List = () => {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{
    row: any;
    x: number;
    y: number;
  } | null>(null);

  const tableColumns = [
    {
      accessor: "title",
      title: "Property Name",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => (
        <div className="relative">
          <div
            className="flex gap-3 "
            onClick={() => handleView(row)}
            onMouseEnter={(e) => {
              const rect = (
                e.currentTarget as HTMLElement
              ).getBoundingClientRect();
              setTooltip({ row, x: rect.left, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          >
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex cursor-pointer gap-3 text-sm font-semibold hover:text-primary">
                  {row.title}
                  {row.is_approved ? (
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Clock className="mt-0.5 h-3.5 w-3.5 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(row);
            }}
            title="Duplicate Property"
            className="mt-1 w-fit text-xs text-blue-600 underline hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={state.duplicatingId === row?.id}
          >
            {state.duplicatingId === row?.id ? "Duplicating..." : "Duplicate"}
          </button>
        </div>
      ),
    },

    {
      accessor: "project",
      title: "Project",
      visible: true,
      toggleable: true,
      sortable: true,
      render: (row: any) => <span title={row.project}>{row.project || "-"}</span>,
    },

    // {
    //   accessor: "developer",
    //   title: "Developer Details",
    //   visible: true,
    //   toggleable: true,
    //   sortable: true,
    //   render: (row: any) => (
    //     <div className="flex flex-col gap-0.5 py-0.5">
    //       <div className="flex items-center gap-1.5  dark:text-white">
    //         {/* <Building2 className="h-3.5 w-3.5 shrink-0 text-primary" /> */}
    //         <span
    //           className="max-w-[170px] truncate"
    //           title={row.devCompany || row.developer}
    //         >
    //           {row.devCompany || row.developer || "-"}
    //         </span>
    //       </div>
          
        
    //     </div>
    //   ),
    // },

    {
      accessor: "price",
      title: "Price Range",
      visible: true,
      toggleable: true,
    },

    {
      accessor: "built_up_area",
      title: "Sq.ft",
      visible: true,
      toggleable: true,
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
            <span
              title={firstType}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {truncateText(firstType)}
            </span>

            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
                  <div className="absolute bottom-full left-1/2 z-[100] mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-black px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100">
                    {type}
                  </div>
                </div>
              ))}
              {remaining > 0 && (
                <div className="group relative z-10">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-[10px] font-bold text-white dark:border-gray-900">
                    +{remaining}
                  </div>
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
      accessor: "city",
      sortable: true,
      render: (row: any) => (
        <span>{row.city?.name || (typeof row.city === "string" ? row.city : "-")}</span>
      ),
    },
    {
      accessor: "area",
      sortable: true,
      render: (row: any) => (
        <span>{row.area?.name || (typeof row.area === "string" ? row.area : "-")}</span>
      ),
    },

    // {
    //   accessor: "role",
    //   title: "Offer Type",
    //   visible: true,
    //   toggleable: true,
    //   render: (row: any) => (
    //     <span className={`badge badge-outline-${row?.listing_type?.color} `}>
    //       {row?.listing_type?.type || "-"}
    //     </span>
    //   ),
    // },
    // {
    //   accessor: "publish",
    //   title: "Publish",
    //   visible: true,
    //   toggleable: true,
    //   render: (row: any) => (
    //     <span
    //       className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
    //         row?.publish === "Published"
    //           ? "bg-green-100 text-green-700"
    //           : "bg-gray-200 text-gray-700"
    //       }`}
    //     >
    //       {row?.publish || "Draft"}
    //     </span>
    //   ),
    // },

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
              handleView(row);
            }}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            className="flex text-primary"
            onClick={(e) => {
              handleEdit(row);
            }}
            title="Edit Property"
          >
            <IconEdit className="h-3.5 w-3.5 " />
          </button>

          <button
            className="flex text-success hover:text-success"
            onClick={() => handleStatus(row)}
            title={row?.is_approved ? "Mark Pending" : "Approve"}
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
            type="button"
            className="flex text-danger"
            onClick={(e) => handleDelete(row)}
            title="Delete Property"
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
      render: (row: any) => {
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
                <div className="mt-1 flex items-center gap-2">
                  {row.listing_type?.type && (
                    <span
                      title={`${row.listing_type?.type || ""}${
                        row.total_unit ? " · " + row.total_unit + " units" : ""
                      }${row.publish ? " · " + row.publish : ""}`}
                      className={`cursor-default text-[10px] font-bold uppercase ${
                        row.listing_type.type?.toLowerCase() === "sale"
                          ? "text-blue-500"
                          : "text-purple-500"
                      }`}
                    >
                      {row.listing_type.type?.charAt(0)}
                    </span>
                  )}
                  {row.is_approved ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Clock className="mt-0.5 h-3.5 w-3.5 text-yellow-500" />
                  )}
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
      render: (row: any) => (
        <span title={row.project}>{truncateText(row.project)}</span>
      ),
    },

    {
      accessor: "created_by",
      title: "Created By",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <span title={row.created_by}>{truncateText(row.created_by)}</span>
      ),
    },
    {
      accessor: "developer",
      title: "Developer Details",
      visible: true,
      toggleable: true,
      render: (row: any) => (
        <div className="flex flex-col gap-0.5 py-0.5">
          <div className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
            <Building2 className="h-3 w-3 shrink-0 text-primary" />
            <span
              className="max-w-[150px] truncate"
              title={row.devCompany || row.developer}
            >
              {row.devCompany || row.developer || "-"}
            </span>
          </div>
          {row.devCompany && row.devPerson && row.devPerson !== "-" && (
            <span className="text-[10px] text-gray-500">
              {row.devPerson}
            </span>
          )}
          {row.developer_email && row.developer_email !== "-" && (
            <span className="max-w-[140px] truncate text-[10px] text-gray-400">
              {row.developer_email}
            </span>
          )}
        </div>
      ),
    },
    {
      accessor: "agent",
      title: "Agent",
      visible: true,
      toggleable: true,
      render: (row: any) => <span title={row.agent}>{truncateText(row.agent)}</span>,
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
            <span
              title={firstType}
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              {truncateText(firstType)}
            </span>

            <div className="flex items-center -space-x-2">
              {visibleTypes?.map((type: string, index: number) => (
                <div key={index} className="group relative z-10">
                  <div className="bg-dred flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-gray-900">
                    {type?.slice(0, 2)?.toUpperCase()}
                  </div>
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
              handleView(row);
            }}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <button
            className="flex text-primary"
            onClick={() => handleEdit(row)}
            title="Edit Property"
          >
            <IconEdit className="h-3.5 w-3.5 " />
          </button>
          <button
            className="flex text-success hover:text-success"
            onClick={() => handleStatus(row)}
            title={row?.is_approved ? "Mark Pending" : "Approve"}
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
            title="Delete Property"
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
    categoryList: [],
    tableList: [],
    agentList: [],
    developerList: [],
    developer: null,
    developerPage: 1,
    developerNext: null,
    userList: [],
    editId: null,
    name: "",
    location: "",
    description: "",
    search: "",
    error: {},
    loading: false,
    visibleColumns: tableColumns,
    viewMode: "table",
    role: null,
    showFilterModal: false,
    sortBy: "",
    sortOrder: "asc",
    selectedRecords: [],
    project: null,
    projectList: [],
    projectPage: 1,
    projectNext: null,
    cityList: [],
    cityPage: 1,
    cityNext: null,
    areaList: [],
    areaPage: 1,
    areaNext: null,
    categoryPage: 1,
    categoryNext: null,
    recordType: null,
    duplicatingId: null,
    userId: null,
    total: 0,
    totalRecords: 0,
    next: null,
    previous: null,
  });

  const visibleCount = state.visibleColumns.filter((col: any) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col: any) => col.toggleable !== false,
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);
  const debouncedMinBuiltUpArea = useDebounce(state.min_built_up_area, 500);
  const debouncedMaxBuiltUpArea = useDebounce(state.max_built_up_area, 500);
  const debouncedMinPrice = useDebounce(state.min_price, 500);
  const debouncedMaxPrice = useDebounce(state.max_price, 500);

  useEffect(() => {
    const group = localStorage.getItem("group") || "";
    const userId = localStorage.getItem("userId");

    setState({
      group: group,
      userId: userId,
    });
  }, []);

  useEffect(() => {
    categoryList(1);
    developerList(1);
    projectList(1);
    cityList(1);
  }, []);

  useEffect(() => {
    projectList(1);
  }, [state.developer]);

  useEffect(() => {
    if (state.filterLocation) {
      areaList(1);
    }
  }, [state.filterLocation]);

  useEffect(() => {
    propertyList(1);
    statCount();
  }, [
    debouncedSearch,
    debouncedMinBuiltUpArea,
    debouncedMaxBuiltUpArea,
    debouncedMinPrice,
    debouncedMaxPrice,
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
    state.approvedStatus,
    state.filterLocation,
    state.filterArea,
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
      setState({
        statCount: res,
      });
    } catch (error) {
      console.log("error fetching stat count --->", error);
      setState({ loading: false });
    }
  };

  const propertyList = async (
    page: number = 1,
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
      const data =
        res?.results?.map((item: any) => {
          const devObj =
            typeof item?.developer === "object" && item?.developer !== null
              ? item.developer
              : null;
          const devIndustry = devObj?.industry?.trim() || "";
          const devFirstName = devObj?.first_name || "";
          const devLastName = devObj?.last_name || "";
          const devFullName = `${devFirstName} ${devLastName}`.trim();
          const devEmail = devObj?.email || item?.developer_email || "-";
          const devPhone =
            devObj?.phone || devObj?.mobile || item?.developer_phone || "-";

          const devCompany = devIndustry;
          const devPerson =
            devFullName ||
            (typeof item?.developer === "string" ? item.developer : "-");
          const developerDisplay = devCompany || devPerson || "-";

          return {
            publish: item?.publish == true ? "Published" : "Draft",
            title: capitalizeFLetter(item?.title),
            status: capitalizeFLetter(item?.status),
            id: item?.id,
            total_area: item?.total_area,
            property_type:
              item?.property_type?.map((pt: any) =>
                capitalizeFLetter(pt?.name),
              ) || [],
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
            developer: developerDisplay,
            devCompany: devCompany,
            devPerson: devPerson,
            developer_id:
              devObj?.id ||
              item?.developer?.id ||
              (typeof item?.developer === "number" ? item.developer : null),
            developer_email: devEmail,
            developer_phone: devPhone,
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
            built_up_area: item?.built_up_area,
            is_approved: item?.is_approved,
            image:
              item?.primary_image ??
              "/assets/images/real-estate/property-info-img1.png",
            industry_name: item?.developer?.industry,
            total_unit: item?.total_unit,
            city: item?.location || "-",
            area: item?.area || "-",
          };
        }) || [];

      setState({
        tableList: data,
        total: res?.count || 0,
        page: page,
        next: res?.next,
        previous: res?.previous,
        totalRecords: res?.count || 0,
        loading: false,
        selectedRecords: [],
      });
    } catch (error) {
      console.log("error fetching property list --->", error);
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
      developer: null,
      agent: "",
    });
  };

  const projectList = async (page: number = 1) => {
    try {
      const body: any = {};
      if (state.developer?.value) {
        body.developer = state.developer.value;
      }
      const res: any = await Models.project.list(page, body);
      const droprdown = Dropdown(res?.results, "name");
      setState({
        projectList:
          page === 1 ? droprdown : [...state.projectList, ...droprdown],
        projectPage: page,
        projectNext: res.next,
      });
    } catch (error) {
      console.log("error fetching project list: ", error);
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
        const newOptions = Dropdown(res?.results, "name");
        setState({
          projectList: [...state.projectList, ...newOptions],
          projectNext: res.next,
          projectPage: state.projectPage + 1,
        });
      }
    } catch (error) {
      console.log("error loading more projects: ", error);
    }
  };

  const categoryList = async (page: number) => {
    try {
      const res: any = await Models.category.list(page, {});
      const droprdown = Dropdown(res?.results, "name");
      setState({
        categoryList: droprdown,
        categoryPage: page,
        categoryNext: res.next,
      });
    } catch (error) {
      console.log("error fetching categories --->", error);
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
      }
    } catch (error) {
      console.log("error loading more categories: ", error);
    }
  };

  const cityList = async (page: number) => {
    try {
      const body: any = {};
      if (state.search) body.search = state.search;
      const res: any = await Models.city.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        cityList: droprdown,
        total: res?.count,
        page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error) {
      console.log("error fetching cities -->", error);
    }
  };

  const cityLoadMore = async () => {
    try {
      if (state.cityNext) {
        const res: any = await Models.city.list(state.cityPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          cityList: [...state.cityList, ...newOptions],
          cityNext: res.next,
          cityPage: state.cityPage + 1,
        });
      }
    } catch (error) {
      console.log("error loading more cities: ", error);
    }
  };

  const areaList = async (page: number) => {
    try {
      const body: any = {
        location: state.location?.value || state.filterLocation?.value,
      };
      if (state.search) body.search = state.search;
      const res: any = await Models.area.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        areaList: droprdown,
        total: res?.count,
        page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error) {
      console.log("error fetching areas -->", error);
    }
  };

  const areaLoadMore = async () => {
    try {
      if (state.areaNext) {
        const res: any = await Models.area.list(state.areaPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          areaList: [...state.areaList, ...newOptions],
          areaNext: res.next,
          areaPage: state.areaPage + 1,
        });
      }
    } catch (error) {
      console.log("error loading more areas: ", error);
    }
  };

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

  const getuserList = (e: any) => {
    setState({ recordType: e });
    if (e?.value === "own") {
      setState({ team: false });
    } else if (e?.value === "admin") {
      setState({ team: true });
    } else {
      setState({ team: null });
    }
  };

  const deleteDecord = async (row: any) => {
    try {
      setState({ btnLoading: true });
      await Models.property.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      propertyList(state.page);
      Success("Property deleted successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleDelete = (row: any) => {
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
            `${state.selectedRecords.length} propert${
              state.selectedRecords.length > 1 ? "ies" : "y"
            } deleted successfully`,
          );
        } catch (error) {
          setState({ btnLoading: false });
        }
      },
      () => {
        Swal.fire("Cancelled", "Your Records are safe :)", "info");
      },
      `Are you sure want to delete ${
        state.selectedRecords.length
      } selected propert${state.selectedRecords.length > 1 ? "ies" : "y"}?`,
    );
  };

  const bodyData = () => {
    const userId = localStorage.getItem("userId");
    let body: any = {};
     body.is_approved = "Yes";
    if (state.search) {
      body.search = debouncedSearch;
    }
    if (state.min_built_up_area) {
      body.min_built_up_area = debouncedMinBuiltUpArea;
    }
    if (state.max_built_up_area) {
      body.max_built_up_area = debouncedMaxBuiltUpArea;
    }
    if (state.min_price) {
      body.min_price = debouncedMinPrice;
    }
    if (state.max_price) {
      body.max_price = debouncedMaxPrice;
    }

    if (state.project) {
      body.project = state.project.value;
    }

    if (state.developer?.value) {
      body.developer = state.developer.value;
    }

    if (state.property_type?.length > 0) {
      body.property_type = state.property_type?.map((item: any) => item?.value);
    }

    if (state.filterLocation) {
      body.city = state.filterLocation.value;
    }
    if (state.filterArea) {
      body.area = state.filterArea.value;
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

    if (state.approvedStatus) {
      body.is_approved =
        state.approvedStatus?.value == "Approved" ? true : false;
    }

    if (state?.team == true) {
      body.team = state?.team;
    }
    if (state?.team == false) {
      body.team = state?.team;
    }

    if (state.recordType?.value === "own" && userId) {
      body.created_by = userId;
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    return body;
  };

  const handleDuplicate = async (row: any) => {
    try {
      setState({ duplicatingId: row?.id });

      const res: any = await Models.property.details(row?.id);

      const body: any = {
        title: `${res.title} (Copy)`,
        description: res.description,
        listing_type: res.listing_type,
        status: res.status,
        address: res.address,
        city: res.city,
        state: res.state,
        country: res.country,
        postal_code: res.postal_code,
        latitude: res.latitude,
        longitude: res.longitude,
        total_area: res.total_area,
        built_up_area: res.built_up_area,
        carpet_area: res.carpet_area,
        bedrooms: res.bedrooms,
        bathrooms: res.bathrooms,
        balconies: res.balconies,
        floor_number: res.floor_number,
        total_floors: res.total_floors,
        built_year: res.built_year,
        furnishing: res.furnishing,
        parking: res.parking,
        facing_direction: res.facing_direction,
        minimum_price: res.minimum_price,
        maximum_price: res.maximum_price,
        publish: false,
        is_approved: false,
        project: res.project?.id,
        developer: res.developer?.id,
        agent: res.agent?.id,
        amenities: res.amenities?.map((a: any) => a.id),
        property_type: res.property_type?.map((t: any) => t.id),
      };

      Object.keys(body).forEach((k) => {
        if (body[k] === null || body[k] === undefined) delete body[k];
      });

      const formData = buildFormData(body);
      await Models.property.create(formData);
      propertyList(state.page);
      Success("Property duplicated successfully");
    } catch (error) {
      Failure("Failed to duplicate property");
    } finally {
      setState({ duplicatingId: null });
    }
  };

  const handleEdit = async (row: any) => {
    router.push(`/real-estate/property/update/${row?.id}`);
  };

  const handleView = async (row: any) => {
    router.push(`/real-estate/property/detail/${row?.id}`);
  };

  const handleStatus = async (row: any) => {
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
      setState({ btnLoading: false });
    }
  };

  const handlePublish = async (row: any) => {
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

  const clearAllFilters = () => {
    setState({
      search: "",
      developer: null,
      property_type: null,
      offer_type: null,
      status: null,
      publish: null,
      role: null,
      user: null,
      approvedStatus: null,
      recordType: null,
      project: null,
      team: null,
      filterLocation: null,
      filterArea: null,
      max_price: "",
      min_price: "",
      max_built_up_area: "",
      min_built_up_area: "",
    });
  };

  const clearFilter = async () => {
    setState({
      search: "",
      developer: null,
      property_type: "",
      offer_type: "",
      status: "",
      role: null,
      user: "",
      showFilterModal: false,
    });
  };

  const propertStatus = [
    { value: 1, label: "Available" },
    { value: 2, label: "Unavailable" },
  ];

  const toggleColumn = (accessor: string) => {
    const updatedColumns = state.visibleColumns?.map((col: any) =>
      col.accessor === accessor ? { ...col, visible: !col.visible } : col,
    );
    setState({ visibleColumns: updatedColumns });
  };

  const toggleAllColumns = (visible: boolean) => {
    const updatedColumns = state.visibleColumns?.map((col: any) => ({
      ...col,
      visible: col.toggleable === false ? col.visible : visible,
    }));
    setState({ visibleColumns: updatedColumns });
  };

  const filteredColumns = state.visibleColumns
    ?.filter((col: any) => col.visible !== false)
    ?.map(({ visible, toggleable, ...col }: any) => col);

  const exportToExcel = () => {
    const headers = [
      "Title",
      "Project",
      "Developer",
      "Developer Email",
      "Agent",
      "Price",
      "Status",
      "Offer Type",
      "Property Type",
      "Location",
      "Publish",
      "Total Units",
      "Date",
    ];
    const rows = state.tableList.map((row: any) => [
      row.title || "",
      row.project || "",
      row.developer || "",
      row.developer_email !== "-" ? row.developer_email : "",
      row.agent || "",
      row.price || "",
      row.status || "",
      row.listing_type?.type || "",
      Array.isArray(row.property_type)
        ? row.property_type.join(", ")
        : row.property_type || "",
      row.location || "",
      row.publish || "",
      row.total_unit || "",
      row.date || "",
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
    link.download = `Properties_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number) => {
    propertyList(page);
  };

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-5">
        <div className=" items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            {"Properties List"}
          </h5>

          <p className="text-gray-600 dark:text-gray-400">
            Super Admin property listings & status management
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
          <button
            type="button"
            className="btn btn-dred w-full border-none md:mb-0 md:w-auto"
            onClick={() => router.push("/real-estate/property/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div
          onClick={clearAllFilters}
          className="cursor-pointer rounded-lg border border-gray-200 bg-blue-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center rounded-lg dark:border-gray-700">
              <Briefcase className="text-dblue h-10 w-10" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl leading-none text-gray-900 dark:text-white">
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
            setState({
              offer_type: { value: "sale", label: "Sale" },
              approvedStatus: "",
            })
          }
          className="cursor-pointer rounded-lg border border-purple-200 bg-purple-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5 ">
            <div className="flex items-center justify-center rounded-lg dark:border-gray-700">
              <Tag className="h-10 w-10 text-purple-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl leading-none text-gray-900 dark:text-white">
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
            setState({
              offer_type: { value: "lease", label: "Lease" },
              approvedStatus: "",
            })
          }
          className="cursor-pointer rounded-lg border border-sky-200 bg-sky-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center rounded-lg dark:border-gray-700">
              <Key className="h-10 w-10 text-sky-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl leading-none text-gray-900 dark:text-white">
                {state.statCount?.lease_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Lease Properties
              </p>
            </div>
          </div>
        </div>
        <div
          className="cursor-pointer rounded-lg border border-green-300 bg-green-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() =>
            setState({
              approvedStatus: { value: "Approved", label: "Approved" },
              offer_type: "",
            })
          }
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center rounded-lg dark:border-gray-700">
              <Verified className="h-10 w-10 text-green-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl leading-none text-gray-900 dark:text-white">
                {state.statCount?.approved_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Approved Properties
              </p>
            </div>
          </div>
        </div>

        {/* <div
          className="cursor-pointer rounded-lg border border-yellow-300 bg-yellow-100 px-4 py-3 shadow-sm transition hover:shadow-md dark:border-gray-700"
          onClick={() =>
            setState({
              approvedStatus: { value: "Pending", label: "Pending" },
              offer_type: "",
            })
          }
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center justify-center rounded-lg dark:border-gray-700">
              <Clock className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="flex flex-col">
              <p className="text-2xl leading-none text-gray-900 dark:text-white">
                {state.statCount?.pending_count || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Properties
              </p>
            </div>
          </div>
        </div> */}
      </div>

      {/* Filter section */}
      <div className="mb-5 rounded-2xl">
        <div className="flex  items-center justify-between gap-3 md:gap-5">
          <TextInput
            type="text"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />

          <CustomSelect
            placeholder="Developer"
            value={state.developer}
            onChange={(e) => setState({ developer: e, project: null })}
            options={state?.developerList}
            isClearable={true}
            loadMore={() => developerLoadMore()}
          />

          <CustomSelect
            placeholder="Project"
            value={state.project}
            onChange={(e) => setState({ project: e })}
            options={state?.projectList}
            isClearable={true}
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

          <TextInput
            type="text"
            placeholder="Minimum Sq.ft."
            value={state.min_built_up_area}
            onChange={(e) => setState({ min_built_up_area: e.target.value })}
          />
          <TextInput
            type="text"
            placeholder="Maximum Sq.ft."
            value={state.max_built_up_area}
            onChange={(e) => setState({ max_built_up_area: e.target.value })}
          />

          <CustomSelect
            placeholder="All Records"
            value={state.recordType}
            onChange={getuserList}
            options={FILTER_ADMINROLES}
          />

          <button
            onClick={() => setState({ showFilterModal: true })}
            className="flex items-center gap-4 rounded-lg border bg-white p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 "
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding [&_.mantine-datatable-table-container]:overflow-visible [&_table]:overflow-visible">
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
                    ...(state.developer
                      ? [
                          {
                            label: `Developer: ${state.developer.label}`,
                            onRemove: () => setState({ developer: null }),
                          },
                        ]
                      : []),
                    ...(state.project
                      ? [
                          {
                            label: `Project: ${state.project.label}`,
                            onRemove: () => setState({ project: null }),
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
                    ...(state.min_built_up_area
                      ? [
                          {
                            label: `Min Sq.ft: ${state.min_built_up_area}`,
                            onRemove: () => setState({ min_built_up_area: null }),
                          },
                        ]
                      : []),
                    ...(state.max_built_up_area
                      ? [
                          {
                            label: `Max Sq.ft: ${state.max_built_up_area}`,
                            onRemove: () => setState({ max_built_up_area: null }),
                          },
                        ]
                      : []),
                    ...(state.recordType
                      ? [
                          {
                            label: `Records: ${state.recordType.label}`,
                            onRemove: () => setState({ recordType: null }),
                          },
                        ]
                      : []),
                    ...(state.filterLocation
                      ? [
                          {
                            label: `City: ${state.filterLocation.label}`,
                            onRemove: () =>
                              setState({ filterLocation: null }),
                          },
                        ]
                      : []),
                    ...(state.filterArea
                      ? [
                          {
                            label: `Area: ${state.filterArea.label}`,
                            onRemove: () => setState({ filterArea: null }),
                          },
                        ]
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
                    ...(state.min_price
                      ? [
                          {
                            label: `Min Price: ${state.min_price}`,
                            onRemove: () => setState({ min_price: null }),
                          },
                        ]
                      : []),
                    ...(state.max_price
                      ? [
                          {
                            label: `Max Price: ${state.max_price}`,
                            onRemove: () => setState({ max_price: null }),
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
                    ...(state.approvedStatus
                      ? [
                          {
                            label: `Approved Status: ${state.approvedStatus.label}`,
                            onRemove: () =>
                              setState({ approvedStatus: null }),
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
                      className="flex items-center gap-2 rounded-lg border border-red-600 px-3 py-1.5 text-sm text-red-600 "
                      onClick={handleBulkDelete}
                    >
                      <IconTrashLines className="h-4 w-4" />
                      Delete ({state.selectedRecords.length})
                    </button>
                  )}
                  <div className="text-sm text-black">
                    {state.total} Properties found
                  </div>
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
          )}
        </div>
        {state.tableList?.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: "10px",
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
              <CustomSelect
                placeholder="Property Status"
                value={state.status}
                onChange={(e) => setState({ status: e })}
                options={Property_status}
              />

              <CustomSelect
                placeholder="Select city"
                options={state.cityList}
                value={state.filterLocation}
                onChange={(selectedOption) =>
                  setState({ filterLocation: selectedOption, filterArea: null })
                }
                isClearable
                loadMore={() => cityLoadMore()}
              />

              <CustomSelect
                placeholder="Select Area"
                options={state.areaList}
                value={state.filterArea}
                onChange={(selectedOption) =>
                  setState({ filterArea: selectedOption })
                }
                isClearable
                loadMore={() => areaLoadMore()}
                disabled={!state.filterLocation}
              />

              <TextInput
                type="text"
                placeholder="Minimum Price."
                value={state.min_price}
                onChange={(e) => setState({ min_price: e.target.value })}
              />

              <TextInput
                type="text"
                placeholder="Maximum Price."
                value={state.max_price}
                onChange={(e) => setState({ max_price: e.target.value })}
              />
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

      {/* Fixed tooltip rendered outside table */}
      {tooltip && (
        <div
          className="border-dred bg-lred pointer-events-none fixed z-[99999] w-80 rounded-lg border p-3 shadow-lg dark:bg-gray-800"
          style={{
            top: tooltip.y - 8,
            left: tooltip.x,
            transform: "translateY(40%)",
          }}
        >
          <div className="mb-1 font-semibold text-[#000]">
            {tooltip.row.title}
          </div>
          {/* Unit Count Highlight */}
          <div className="bg-dred mb-3 mt-2 flex w-fit items-center justify-between gap-3 rounded-2xl px-3 py-1">
            <span className="text-sm text-white/80">Total Units</span>
            <span className="text-md text-white">
              {tooltip.row.total_unit ?? "—"}
            </span>
          </div>

          {tooltip.row?.developer && (
            <div className="mb-1.5 flex flex-col text-xs">
              <div className="flex items-center gap-1 text-gray-800 dark:text-white">
                <span className="shrink-0 font-semibold text-gray-500">Developer:</span>
                <span className="font-semibold">{tooltip.row.devCompany || tooltip.row.developer}</span>
              </div>
              {tooltip.row.devPerson && tooltip.row.devPerson !== "-" && (
                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                  Contact: {tooltip.row.devPerson}
                </div>
              )}
              {tooltip.row.developer_email && tooltip.row.developer_email !== "-" && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Email: {tooltip.row.developer_email}
                </div>
              )}
              {tooltip.row.developer_phone && tooltip.row.developer_phone !== "-" && (
                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                  Phone: {tooltip.row.developer_phone}
                </div>
              )}
            </div>
          )}

          {tooltip.row?.listing_type?.type && (
            <div className="mb-1 flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Offer Type:
              </span>
              <span
                className={`font-semibold ${
                  tooltip.row.listing_type.type?.toLowerCase() === "sale"
                    ? "text-blue-500"
                    : "text-purple-500"
                }`}
              >
                {tooltip.row.listing_type.type}
              </span>
            </div>
          )}

          {tooltip.row?.publish && (
            <div className="mb-1 flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Publish:
              </span>
              <span
                className={`font-semibold ${
                  tooltip.row.publish === "Published"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {tooltip.row.publish}
              </span>
            </div>
          )}

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
        </div>
      )}
    </>
  );
};

export default PrivateRouter(List);
