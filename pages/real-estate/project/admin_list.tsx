import React, { useEffect } from "react";
import { DataTable } from "mantine-datatable";
import IconEdit from "@/components/Icon/IconEdit";
import {
  capitalizeFLetter,
  Dropdown,
  Failure,
  showDeleteAlert,
  Success,
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
import { ROLES } from "@/utils/constant.utils";
import PrivateRouter from "@/hook/privateRouter";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import { Eye, HomeIcon, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import Paginations from "@/pages/elements/paginations";

const RECORD_TYPE_OPTIONS = [
  { value: "all", label: "All Projects" },
  { value: "own", label: "Own Records" },
];

const PropertypeCount = [
  {
    name: "Apartment",
    count: 0,
    key: "apartment",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    name: "Villa",
    count: 0,
    key: "villa",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  {
    name: "Commercial",
    count: 0,
    key: "commercial",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  {
    name: "Industry",
    count: 0,
    key: "industry",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
];

const AdminProjectList = () => {
  const router = useRouter();

  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    total: 0,
    totalRecords: 0,
    editId: null,
    name: "",
    location: null,
    area: null,
    developerModal: null,
    description: "",
    search: "",
    error: {},
    userId: null,
    group: null,
    sortBy: "",
    sortOrder: "asc",
    selectedRecords: [],
    expandedRow: null,
    quickInfo: {},
    developer: null,
    developerList: [],
    developerPage: 1,
    developerNext: null,
    recordType: { value: "all", label: "All Projects" },
    filterLocation: null,
    filterArea: null,
    cityList: [],
    cityPage: 1,
    cityNext: null,
    areaList: [],
    areaPage: 1,
    areaNext: null,
    categoryList: [],
    categoryPage: 1,
    categoryNext: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    const group = localStorage.getItem("group");
    const userId = localStorage.getItem("userId");
    setState({
      userId: userId,
      group: group,
    });
  }, []);

  useEffect(() => {
    categoryList(1);
    cityList(1);
    developerList(1);
  }, []);

  useEffect(() => {
    if (state.location || state.filterLocation) {
      areaList(1);
    }
  }, [state.location, state.filterLocation]);

  useEffect(() => {
    projectList(1);
  }, [
    debouncedSearch,
    state.developer,
    state.recordType,
    state.filterLocation,
    state.filterArea,
  ]);

  const developerList = async (page = 1) => {
    try {
      const body = {
        user_type: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item: any) => ({
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
      console.log("error fetching developer list --->", error);
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

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }

    if (state.developer?.value) {
      body.developer = state.developer.value;
    }

    if (state.recordType?.value === "own" && state.userId) {
      body.created_by = state.userId;
    }

    if (state.filterLocation?.value) {
      body.city = state.filterLocation.value;
    }

    if (state.filterArea?.value) {
      body.area = state.filterArea.value;
    }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    console.log("Admin Project List body --->", body);
    return body;
  };

  const projectList = async (
    page: number = 1,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
    try {
      const body = bodyData();

      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      const res: any = await Models.project.list(page, body);
      const data =
        res?.results?.map((item: any) => {
          const devIndustry = item?.developer?.industry;
          const devName = item?.developer?.first_name
            ? `${item.developer.first_name} ${item.developer.last_name || ""}`.trim()
            : "";
          const developerDisplay =
            devIndustry ||
            devName ||
            (typeof item?.developer === "string" ? item.developer : "-");

          const cityName =
            item?.location?.name ||
            (typeof item?.location === "string" ? item.location : "-");
          const areaName =
            item?.area?.name ||
            (typeof item?.area === "string" ? item.area : "-");

          return {
            id: item?.id,
            name: item?.name,
            location: item?.location,
            status: item?.status || "Active",
            properties: item?.property_count || 0,
            project: item?.project?.name,
            description: item?.description || "-",
            developer: developerDisplay,
            developer_id: item?.developer?.id || (typeof item?.developer === "number" ? item.developer : null),
            developer_email: item?.developer?.email || "-",
            developer_phone: item?.developer?.phone || "-",
            property_type_counts: item?.property_type_counts || [],
            city: item?.location || "-",
            cityName: cityName,
            cityId: item?.location?.id,
            area: item?.area || "-",
            areaName: areaName,
            areaId: item?.area?.id,
            created_at: item?.created_at,
            created_by: item?.created_by,
          };
        }) || [];

      setState({
        tableList: data,
        total: res?.count || 0,
        page: page,
        next: res?.next,
        previous: res?.previous,
        totalRecords: res?.count || 0,
        selectedRecords: [],
      });
    } catch (error) {
      console.log("error fetching project list --->", error);
    }
  };

  const createProject = async () => {
    try {
      setState({ btnLoading: true });
      const body: any = {
        name: capitalizeFLetter(state.name),
        location: state.location?.value,
        area: state.area?.value,
        description: capitalizeFLetter(state.description),
        developer: state.developerModal?.value || state.userId,
      };

      await Utils.Validation.project.validate(body, { abortEarly: false });

      await Models.project.create(body);
      clearData();
      setState({ btnLoading: false });
      projectList(1);
      Success("Project created successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err?.message;
        });
        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure((error as any)?.error || "Failed to create project");
        setState({ btnLoading: false });
      }
    }
  };

  const updateProject = async () => {
    try {
      setState({ btnLoading: true });
      const body: any = {
        name: capitalizeFLetter(state.name),
        location: state.location?.value,
        area: state.area?.value,
        description: capitalizeFLetter(state.description),
        developer: state.developerModal?.value || state.userId,
      };

      await Utils.Validation.project.validate(body, { abortEarly: false });

      await Models.project.update(body, state.editId);
      clearData();
      setState({ btnLoading: false });
      projectList(state.page);
      Success("Project updated successfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path] = err?.message;
        });
        setState({ error: validationErrors, btnLoading: false });
      } else {
        Failure((error as any)?.error || "Failed to update project");
        setState({ btnLoading: false });
      }
    }
  };

  const deleteRecord = async (row: any) => {
    try {
      setState({ btnLoading: true });
      await Models.project.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      projectList(state.page);
      Success("Project deleted successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleDelete = (row: any) => {
    showDeleteAlert(
      () => {
        deleteRecord(row);
      },
      () => {
        Swal.fire("Cancelled", "Your Record is safe :)", "info");
      },
      "Are you sure want to delete project?",
    );
  };

  const categoryList = async (page: number) => {
    try {
      const res: any = await Models.category.list(page, {});
      const dropdown = Dropdown(res?.results, "name");
      setState({
        categoryList: dropdown,
        categoryPage: page,
        categoryNext: res.next,
      });
    } catch (error) {
      console.log("error fetching categories --->", error);
    }
  };

  const cityList = async (page: number) => {
    try {
      const body: any = {};
      const res: any = await Models.city.list(page, body);
      const dropdown = Dropdown(res?.results, "name");

      setState({
        cityList: dropdown,
        cityNext: res.next,
        cityPrevious: res.previous,
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
      const locationId =
        state.location?.value || state.filterLocation?.value;
      if (!locationId) return;

      const body: any = {
        location: locationId,
      };
      const res: any = await Models.area.list(page, body);
      const dropdown = Dropdown(res?.results, "name");

      setState({
        areaList: dropdown,
        areaNext: res.next,
        areaPrevious: res.previous,
      });
    } catch (error) {
      console.log("error fetching areas -->", error);
    }
  };

  const areaLoadMore = async () => {
    try {
      if (state.areaNext) {
        const locationId =
          state.location?.value || state.filterLocation?.value;
        const res: any = await Models.area.list(state.areaPage + 1, {
          location: locationId,
        });
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

  const handleBulkDelete = () => {
    showDeleteAlert(
      async () => {
        try {
          setState({ btnLoading: true });
          await Promise.all(
            state.selectedRecords.map((row: any) =>
              Models.project.delete(row?.id),
            ),
          );
          setState({ selectedRecords: [], btnLoading: false });
          projectList(state.page);
          Success(
            `${state.selectedRecords.length} project${
              state.selectedRecords.length > 1 ? "s" : ""
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
      } selected project${state.selectedRecords.length > 1 ? "s" : ""}?`,
    );
  };

  const handleEdit = (row: any) => {
    setState({
      name: row.name,
      description: row.description !== "-" ? row.description : "",
      isOpen: true,
      editId: row?.id,
      location: row.cityId
        ? { value: row.cityId, label: row.cityName }
        : row.city?.id
        ? { value: row.city.id, label: row.city.name }
        : null,
      area: row.areaId
        ? { value: row.areaId, label: row.areaName }
        : row.area?.id
        ? { value: row.area.id, label: row.area.name }
        : null,
      developerModal: row.developer_id
        ? { value: row.developer_id, label: row.developer }
        : null,
    });
  };

  const handleView = async (row: any) => {
    router.push(`/real-estate/project/view/${row?.id}`);
  };

  const handleCreate = async (row: any) => {
    router.push(`/real-estate/property/create?project_id=${row?.id}`);
  };

  const toggleQuickInfo = async (row: any) => {
    if (state.expandedRow === row.id) {
      setState({ expandedRow: null });
      return;
    }
    setState({ expandedRow: row.id });
    if (state.quickInfo[row.id]) return;
    try {
      const types = ["apartment", "villa", "commercial", "industry"];
      const counts: any = {};
      await Promise.all(
        types.map(async (type) => {
          const res: any = await Models.property.list(1, {
            project: row.id,
            property_type_name: type,
          });
          counts[type] = res?.count || 0;
        }),
      );
      setState({ quickInfo: { ...state.quickInfo, [row.id]: counts } });
    } catch (error) {
      console.log("error getting quick info breakdown --->", error);
    }
  };

  const clearData = () => {
    setState({
      editId: null,
      name: "",
      location: null,
      area: null,
      developerModal: null,
      description: "",
      isOpen: false,
      error: {},
    });
  };

  const exportToExcel = () => {
    const headers = [
      "Project Name",
      "Developer",
      "Developer Email",
      "Properties",
      "Location / City",
      "Area",
      "Status",
    ];
    const rows = state.tableList.map((row: any) => [
      row.name || "",
      row.developer || "",
      row.developer_email !== "-" ? row.developer_email : "",
      row.properties || 0,
      row.cityName || "",
      row.areaName || "",
      row.status || "",
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
    link.download = `Projects_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePageChange = (page: number) => {
    projectList(page);
  };

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div>
            <h5 className="text-lg font-semibold dark:text-white-light">
              All Projects
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Super Admin project management & overview
            </p>
          </div>
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
            className="btn btn-dred w-full border-none text-white md:mb-0 md:w-auto"
            onClick={() => setState({ isOpen: true })}
          >
            + Create Project
          </button>
        </div>
      </div>

      {/* Admin Filters Section */}
      <div className="mb-5 mt-5 flex flex-wrap items-center gap-3 md:mt-0">
        {/* Search Input */}
        <div className="w-full sm:w-64">
          <TextInput
            type="text"
            className="form-input"
            placeholder="Search projects..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
        </div>

        {/* Record Type Dropdown */}
        <div className="w-full sm:w-44">
          <CustomSelect
            placeholder="Project Scope"
            value={state.recordType}
            onChange={(selectedOption) =>
              setState({ recordType: selectedOption })
            }
            options={RECORD_TYPE_OPTIONS}
            isClearable={false}
          />
        </div>

        {/* Developer Filter */}
        <div className="w-full sm:w-60">
          <CustomSelect
            placeholder="Filter by Developer"
            options={state.developerList}
            value={state.developer}
            onChange={(selectedOption) =>
              setState({ developer: selectedOption })
            }
            isClearable
            loadMore={() => developerLoadMore()}
          />
        </div>

        {/* City Filter */}
        <div className="w-full sm:w-48">
          <CustomSelect
            placeholder="Select City"
            options={state.cityList}
            value={state.filterLocation}
            onChange={(selectedOption) =>
              setState({ filterLocation: selectedOption, filterArea: null })
            }
            isClearable
            loadMore={() => cityLoadMore()}
          />
        </div>

        {/* Area Filter */}
        <div className="w-full sm:w-48">
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
        </div>
      </div>

      <div className="border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              gap: "10px",
              flexWrap: "wrap",
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

                ...(state.recordType && state.recordType.value !== "all"
                  ? [
                      {
                        label: `Scope: ${state.recordType.label}`,
                        onRemove: () =>
                          setState({
                            recordType: {
                              value: "all",
                              label: "All Projects",
                            },
                          }),
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

                ...(state.filterLocation
                  ? [
                      {
                        label: `City: ${state.filterLocation.label}`,
                        onRemove: () =>
                          setState({
                            filterLocation: null,
                            filterArea: null,
                          }),
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
              ]}
              onClearAll={() =>
                setState({
                  search: "",
                  developer: null,
                  recordType: { value: "all", label: "All Projects" },
                  filterLocation: null,
                  filterArea: null,
                })
              }
            />

            <div className="ml-auto flex items-center gap-3">
              {state.selectedRecords?.length > 0 && (
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg border border-red-600 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={handleBulkDelete}
                >
                  <IconTrashLines className="h-4 w-4" />
                  Delete ({state.selectedRecords.length})
                </button>
              )}
              <div className="text-sm font-medium text-black dark:text-white-light">
                {state.total} Projects found
              </div>
            </div>
          </div>
        </div>

        <DataTable
          className="table-responsive"
          rowClassName={(_, index) =>
            index % 2 === 0
              ? "bg-white dark:bg-gray-900"
              : "bg-gray-50 dark:bg-gray-800"
          }
          records={state.tableList || []}
          columns={[
            {
              accessor: "name",
              title: "Project Name",
              sortable: true,
              render: (row: any) => (
                <div className="flex flex-col gap-0.5">
                  <span
                    className="cursor-pointer font-semibold hover:underline dark:text-white-light"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(row);
                    }}
                  >
                    {row.name}
                  </span>
                  <span
                    className="text-dred w-fit cursor-pointer text-xs underline hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuickInfo(row);
                    }}
                  >
                    Quick View
                  </span>
                </div>
              ),
            },
            {
              accessor: "developer",
              title: "Developer",
              sortable: true,
              render: (row: any) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {row.developer}
                  </span>
                  {row.developer_email && row.developer_email !== "-" && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {row.developer_email}
                    </span>
                  )}
                </div>
              ),
            },
            {
              accessor: "properties",
              title: "Properties",
              sortable: true,
              textAlignment: "center",
              render: (row: any) => (
                <span
                  className="cursor-pointer "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(row);
                  }}
                  title="View project details"
                >
                  {row.properties || 0}
                </span>
              ),
            },
            {
              accessor: "city",
              title: "City",
              sortable: true,
              render: (row: any) => <span>{row.cityName || "-"}</span>,
            },
            {
              accessor: "area",
              title: "Area",
              sortable: true,
              render: (row: any) => <span>{row.areaName || "-"}</span>,
            },
            // {
            //   accessor: "status",
            //   title: "Status",
            //   sortable: true,
            //   textAlignment: "center",
            //   render: (row: any) => {
            //     const status = row.status || "Active";
            //     const statusLower = String(status).toLowerCase();
            //     const isSuccess =
            //       statusLower === "active" ||
            //       statusLower === "completed" ||
            //       statusLower === "approved";
            //     return (
            //       <span
            //         className={`badge ${
            //           isSuccess
            //             ? "badge-outline-success"
            //             : "badge-outline-warning"
            //         }`}
            //       >
            //         {status}
            //       </span>
            //     );
            //   },
            // },
            {
              accessor: "actions",
              title: "Actions",
              textAlignment: "center",
              render: (row: any) => (
                <div className="mx-auto flex w-max items-center gap-4">
                  <button
                    className="text-dred flex hover:opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleView(row);
                    }}
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(row);
                    }}
                    title="Edit Project"
                  >
                    <IconEdit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="text-dred flex hover:opacity-80"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate(row);
                    }}
                    title="Create Property"
                  >
                    <HomeIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex text-danger hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(row);
                    }}
                    title="Delete Project"
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              ),
            },
          ]}
          highlightOnHover
          totalRecords={state.tableList?.length}
          recordsPerPage={10}
          minHeight={200}
          page={null}
          onPageChange={() => {}}
          withBorder={true}
          paginationText={({ from, to, totalRecords }) =>
            `Showing ${from} to ${to} of ${totalRecords} entries`
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
            projectList(1, columnAccessor, direction);
          }}
          selectedRecords={state.selectedRecords}
          onSelectedRecordsChange={(records) =>
            setState({ selectedRecords: records })
          }
          rowExpansion={{
            allowMultiple: false,
            expanded: {
              recordIds: state.expandedRow ? [state.expandedRow] : [],
              onRecordIdsChange: () => {},
            },
            content: ({ record }: any) => (
              <div className="bg-gray-50 px-6 py-3 dark:bg-gray-800">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Property Type Breakdown
                </p>
                {(() => {
                  const counts =
                    record.property_type_counts?.length > 0
                      ? record.property_type_counts
                      : PropertypeCount;
                  const colors = [
                    "bg-blue-100 text-blue-700",
                    "bg-green-100 text-green-700",
                    "bg-yellow-100 text-yellow-700",
                    "bg-purple-100 text-purple-700",
                    "bg-pink-100 text-pink-700",
                    "bg-orange-100 text-orange-700",
                  ];
                  return (
                    <div className="flex flex-wrap gap-2">
                      {counts.map((item: any, i: number) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            colors[i % colors.length]
                          }`}
                        >
                          {item.name}
                          <span className="rounded-full bg-white/70 px-1.5 py-0.5 text-xs font-bold">
                            {item.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ),
          }}
        />

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
        subTitle={state.editId ? "Update Project" : "Create Project"}
        open={state.isOpen}
        closeIcon={true}
        close={() => {
          clearData();
        }}
        renderComponent={() => (
          <div className="pb-7">
            <form className="flex flex-col gap-3">
              <div className="w-full space-y-5">
                <TextInput
                  name="name"
                  title="Project Name"
                  placeholder="Enter project name"
                  value={state.name}
                  onChange={(e) => setState({ name: e.target.value })}
                  error={state.error?.name}
                  required
                />

                <CustomSelect
                  title="Developer"
                  placeholder="Select developer"
                  options={state.developerList}
                  value={state.developerModal}
                  onChange={(selectedOption) =>
                    setState({ developerModal: selectedOption })
                  }
                  isClearable
                  loadMore={() => developerLoadMore()}
                  error={state.error?.developer}
                />

                <CustomSelect
                  title="City name"
                  placeholder="Select city"
                  options={state.cityList}
                  value={state.location}
                  onChange={(selectedOption) =>
                    setState({ location: selectedOption, area: null })
                  }
                  isClearable
                  loadMore={() => cityLoadMore()}
                  required
                  error={state.error?.location}
                />

                <CustomSelect
                  title="Area name"
                  placeholder="Select Area"
                  options={state.areaList}
                  value={state.area}
                  onChange={(selectedOption) =>
                    setState({ area: selectedOption })
                  }
                  isClearable
                  loadMore={() => areaLoadMore()}
                  required
                  error={state.error?.area}
                  disabled={!state.location}
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
    </>
  );
};

export default PrivateRouter(AdminProjectList);
