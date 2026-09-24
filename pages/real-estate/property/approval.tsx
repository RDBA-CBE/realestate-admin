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
  CircleCheck,
  Globe,
  Building2,
} from "lucide-react";
import { Checkbox, Popover, Text } from "@mantine/core";
import moment from "moment";
import { render } from "@fullcalendar/core/preact";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import PrivateRouter from "@/hook/privateRouter";

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
    visibleColumns: tableColumns,
    viewMode: "table",
    sortBy: "",
    sortOrder: "asc",
    selectedRecords: [],
    duplicatingId: null,
  });

  const visibleCount = state.visibleColumns.filter((col) => col.visible).length;
  const totalToggleable = state.visibleColumns.filter(
    (col) => col.toggleable !== false,
  ).length;

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    propertyList(1);
    categoryList(1);
    statCount();
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

  const statCount = async () => {
    try {
      const body = {
        publish: "Yes",
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

  const propertyList = async (
    page,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
    console.log("✌️page --->", page);
    try {
      setState({ loading: true });
      const body = bodyData();

      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      console.log("✌️body --->", body);
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
              item?.price_range?.minimum_price || item?.minimum_price,
              item?.price_range?.maximum_price || item?.maximum_price,
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
      () => { deleteDecord(row); },
      () => { Swal.fire("Cancelled", "Your Record is safe :)", "info"); },
      "Are you sure want to delete property?",
    );
  };

  const handleBulkDelete = () => {
    showDeleteAlert(
      async () => {
        try {
          setState({ btnLoading: true });
          await Promise.all(
            state.selectedRecords.map((row: any) => Models.property.delete(row?.id)),
          );
          setState({ selectedRecords: [], btnLoading: false });
          propertyList(state.page);
          Success(`${state.selectedRecords.length} propert${
            state.selectedRecords.length > 1 ? "ies" : "y"
          } deleted successfully`);
        } catch (error) {
          setState({ btnLoading: false });
        }
      },
      () => { Swal.fire("Cancelled", "Your Records are safe :)", "info"); },
      `Are you sure want to delete ${state.selectedRecords.length} selected propert${
        state.selectedRecords.length > 1 ? "ies" : "y"
      }?`,
    );
  };

  const handleBulkApprove = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Change approval status for ${state.selectedRecords.length} selected propert${
        state.selectedRecords.length > 1 ? "ies" : "y"
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
      padding: "2em",
    });
    if (!result.isConfirmed) return;
    try {
      setState({ btnLoading: true });
      await Promise.all(
        state.selectedRecords.map((row: any) =>
          Models.property.update({ is_approved: !row.is_approved }, row?.id),
        ),
      );
      setState({ selectedRecords: [], btnLoading: false });
      propertyList(state.page);
      Success("Approval status updated successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleView = async (row) => {
    window.open(`${FRONTEND_URL}/property-detail/${row?.id}`, "_blank");
  };

  const handleStatus = async (row: any) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${row?.is_approved ? "mark pending" : "approve"} this property?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, change it!",
      cancelButtonText: "Cancel",
      padding: "2em",
    });

    if (!result.isConfirmed) return;

    try {
      setState({ btnLoading: true });
      const body = {
        is_approved: !row.is_approved,
      };
      await Models.property.update(body, row?.id);
      propertyList(state.page);
      Success("Approval status updated successfully");
    } catch (error) {
      console.error("Approval error:", error);
      Failure("Something went wrong while updating approval status.");
    } finally {
      setState({ btnLoading: false });
    }
  };

  const handleApprove = handleStatus;

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
      console.error("Publish error:", error);
      Failure("Failed to update publish status");
    } finally {
      setState({ btnLoading: false });
    }
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
        minimum_price: res.minimum_price,
        maximum_price: res.maximum_price,
        built_up_area: res.built_up_area,
        total_unit: res.total_unit,
        available_unit: res.available_unit,
        property_type: res.property_type?.map((pt: any) => pt.id) || [],
        amenities: res.amenities?.map((a: any) => a.id) || [],
        features: res.features?.map((f: any) => f.id) || [],
        specifications: res.specifications || [],
        project: res.project?.id || res.project || null,
        developer: res.developer?.id || res.developer || null,
        primary_image: res.primary_image || null,
        publish: false,
        is_approved: false,
      };

      await Models.property.create(body);
      Success("Property duplicated successfully");
      propertyList(state.page);
    } catch (error) {
      console.error("Duplicate error:", error);
      Failure("Failed to duplicate property");
    } finally {
      setState({ duplicatingId: null });
    }
  };

  const bodyData = () => {
    let body: any = {};

    body.is_approved = "No";

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
      // body.publish = "Yes";
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
            className="btn btn-dred w-full border-none md:mb-0 md:w-auto"
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

          {/* <CustomSelect
            placeholder="Publish or Draft"
            value={state.publish}
            onChange={(e) => setState({ publish: e })}
            options={PROPERTY_STATUS}
          /> */}

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
                  ]}
                  onClearAll={() =>
                    setState({
                      search: "",
                      property_type: null,
                      offer_type: null,
                      status: null,
                      publish: null,
                    })
                  }
                />
                <div className="ml-auto flex shrink-0 items-center gap-3">
                  {state.selectedRecords?.length > 0 && (
                    <>
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-green-600 px-3 py-1.5 text-sm text-green-600"
                        onClick={handleBulkApprove}
                      >
                        <CircleCheck className="h-4 w-4" />
                        Change Approval ({state.selectedRecords.length})
                      </button>
                      <button
                        type="button"
                        className="flex items-center gap-2 rounded-lg border border-red-600 px-3 py-1.5 text-sm text-red-600"
                        onClick={handleBulkDelete}
                      >
                        <IconTrashLines className="h-4 w-4" />
                        Delete ({state.selectedRecords.length})
                      </button>
                    </>
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
                onSelectedRecordsChange={(records) => setState({ selectedRecords: records })}
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
            className={`btn border-none p-2 ${
              !state?.next ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

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
                <span className="shrink-0 font-semibold text-gray-500">
                  Developer:
                </span>
                <span className="font-semibold">
                  {tooltip.row.devCompany || tooltip.row.developer}
                </span>
              </div>
              {tooltip.row.devPerson && tooltip.row.devPerson !== "-" && (
                <div className="text-[11px] text-gray-600 dark:text-gray-300">
                  Contact: {tooltip.row.devPerson}
                </div>
              )}
              {tooltip.row.developer_email &&
                tooltip.row.developer_email !== "-" && (
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">
                    Email: {tooltip.row.developer_email}
                  </div>
                )}
              {tooltip.row.developer_phone &&
                tooltip.row.developer_phone !== "-" && (
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
