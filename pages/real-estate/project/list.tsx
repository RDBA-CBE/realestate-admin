import React, { useEffect, useState } from "react";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import Tippy from "@tippyjs/react";
import IconEye from "@/components/Icon/IconEye";
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
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import { FILTER_ADMINROLES, FILTER_ROLES, ROLES } from "@/utils/constant.utils";
import PrivateRouter from "@/hook/privateRouter";
import FilterChips from "@/components/FilterChips/FilterChips.component";
import { Eye, HomeIcon, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import area from "../masters/area";
import { s } from "@fullcalendar/core/internal-common";
import { filter } from "lodash";
import Paginations from "@/pages/elements/paginations";

const list = () => {
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
    userList: [],
    role: null,
    userId: null,
    sortBy: "",
    sortOrder: "asc",
    selectedRecords: [],
    expandedRow: null,
    quickInfo: {},
    cityList: [],
    areaList: [],
    city: null,
    area: null,
  });

  const debouncedSearch = useDebounce(state.search, 500);
  console.log("✌️state.search --->", state.search);

  useEffect(() => {
    const group = localStorage.getItem("group");
    const userId = localStorage.getItem("userId");
    setState({
      userId: userId,
    });
  }, []);

  useEffect(() => {
    categoryList(1);
    cityList(1);
  }, []);

  useEffect(() => {
    if (state.location || state.filterLocation) {
      areaList(1);
    }
  }, [state.location, state.filterLocation]);

  useEffect(() => {
    if (state.userId !== null) {
      projectList(1);
    }
  }, [
    debouncedSearch,
    state.user,
    state.role,
    state.userId,
    state.recordType,
    state.team,
    state.filterLocation,
    state.filterArea,
  ]);

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

  const projectList = async (
    page,
    sortBy = state.sortBy,
    sortOrder = state.sortOrder,
  ) => {
    try {
      const body = bodyData();

      if (sortBy) {
        body.ordering = sortOrder === "desc" ? `-${sortBy}` : sortBy;
      }

      console.log("body", body);

      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
        properties: item?.property_count,
        project: item?.project?.name,
        description: item?.description,
        developer: item?.developer?.industry || "-",
        // ...item
        property_type_counts: item?.property_type_counts || [],
        city: item?.location || "-",
        area: item?.area || "-",
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
        selectedRecords: [],
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createProject = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        name: capitalizeFLetter(state.name),
        location: state.location?.value,
        area: state.area?.value,
        description: capitalizeFLetter(state.description),
        developer: state.userId,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.create(body);
      clearData();
      setState({ btnLoading: false });
      projectList(1);
      Success("Project created succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });

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
        name: capitalizeFLetter(state.name),
        location: state.location?.value,
        area: state.area?.value,
        description: capitalizeFLetter(state.description),
        developer: state.userId,
      };
      await Utils.Validation.project.validate(body, { abortEarly: false });

      const res = await Models.project.update(body, state.editId);
      clearData();
      setState({ btnLoading: false });
      projectList(state.page);

      Success("Project updated succssfully");
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

      const res = await Models.project.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      projectList(state.page);

      Success("Project deleted succssfully");
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

  console.log("state.categoryList", state.categoryList);

  const cityList = async (page) => {
    try {
      const body: any = {};
      if (state.search) body.search = state.search;
      const res: any = await Models.city.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        cityList: droprdown,
        // total: res?.count,
        // page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error) {
      console.log("error -->", error);
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
      } else {
        setState({
          cityList: state.cityList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const areaList = async (page) => {
    try {
      const body: any = {
        location: state.location?.value || state.filterLocation?.value,
      };
      if (state.search) body.search = state.search;
      const res: any = await Models.area.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        areaList: droprdown,
        // total: res?.count,
        // page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error) {
      console.log("error -->", error);
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
      } else {
        setState({
          areaList: state.areaList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
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

  const bodyData = () => {
    let body: any = {};

    if (state.search) {
      body.search = state.search;
    }
    // if (state.role) {
    //   body.group = state.role.value;
    // }

    // if (state.developer){
    //   body.developer = state.developer.value;
    // }

    body.developer = state.userId;

    if (state.filterLocation) {
      body.city = state.filterLocation.value;
    }
    if (state.filterArea) {
      body.area = state.filterArea.value;
    }
    if (state?.team == true) {
      body.team = state?.team;
    }
    if (state?.team == false) {
      body.team = state?.team;
    }

    // if (state.user?.value || (state.role == null && state.userId)) {
    //   body.created_by = state.user?.value ? state.user?.value : state.userId;
    // }

    if (state.sortBy) {
      body.ordering =
        state.sortOrder === "desc" ? `-${state.sortBy}` : state.sortBy;
    }

    // else {
    //   body.created_by = userId;
    // }
    console.log("✌️body --->", body);
    return body;
  };

  const handleEdit = (row) => {
    setState({
      name: row.name,
      description: row.description,
      isOpen: true,
      editId: row?.id,
      location: row.city ? { value: row.city.id, label: row.city.name } : null,
      area: row.area ? { value: row.area.id, label: row.area.name } : null,
    });
    console.log("✌️row --->", row);
  };

  const handleView = async (row) => {
    router.push(`/real-estate/project/view/${row?.id}`);
  };

  const handleCreate = async (row) => {
    router.push(`/real-estate/property/create?project_id=${row?.id}`);
  };

  const toggleQuickInfo = async (row) => {
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
      console.log("✌️error --->", error);
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
      projectList(newPage);
    }
  };

  const handlePreviousPage = () => {
    if (state.previous) {
      const newPage = state.page - 1;
      projectList(newPage);
    }
  };

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


  // const getuserList = (e) => {
  //   setState({ role: e, user: null });
  //   if (e?.value == "developer") {
  //     developerList(1);
  //   } else if (e?.value == "agent") {
  //     agentList(1);
  //   } else if (e?.value == "seller") {
  //     sellerList(1);
  //   }
  // };

  const clearFilter = () => {
    setState({
      search: "",
      role: "",
      user: null,
      userId: state.userId,
    });
  };
  console.log("first",state.tableList)

  const exportToExcel = () => {
    const headers = [
      "Project Name",
      "Properties",
      "Location",
      "Area",
      "Developer",
      // "Commercial Properties",
      // "Villa Properties",
      // "Individual House",
      // "Apartment Properties",
      "Status",
    ];
    const rows = state.tableList.map((row: any) => [
      row.name || "",
      row.properties || 0,
      row.location?.name || "",
      row.area?.name || "",
      row.developer || "",
      // row.commercial_properties || 0,
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

  const handlePageChange = (page) => {
    // setState({ page });
    projectList(page);
  }

  return (
    <>
      <div className=" mb-5 flex items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <h5 className="text-lg font-semibold dark:text-white-light">
            Project List
          </h5>
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
            Create Project
          </button>
        </div>
      </div>

      <div className=" mb-5 mt-5 gap-2 md:mt-0 md:flex xl:gap-4">
        {/* Search Input */}
        <div className="">
          <TextInput
            type="text"
            className=" form-input"
            placeholder="Search..."
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
        </div>

        <div>
          <CustomSelect
            placeholder="All Projects"
            value={state.recordType}
            onChange={getuserList}
            options={FILTER_ADMINROLES}
            // isClearable={false}
          />
        </div>

        <div>
          <CustomSelect
            placeholder="Select city"
            options={state.cityList}
            value={state.filterLocation}
            onChange={(selectedOption) =>
              setState({ filterLocation: selectedOption, filterArea: "" })
            }
            isClearable
            loadMore={() => cityLoadMore()}
            required
          />
        </div>

        <div>
          <CustomSelect
            placeholder="Select Area"
            options={state.areaList}
            value={state.filterArea}
            onChange={(selectedOption) =>
              setState({ filterArea: selectedOption })
            }
            isClearable
            loadMore={() => areaLoadMore()}
            required
            disabled={!state.filterLocation}
          />
        </div>

        {/* {state.group == "Admin" && (
          <>
            <div className="">
              <CustomSelect
                placeholder="Select Role"
                value={state.role}
                onChange={(e) => {
                  getuserList(e);
                  // setState({isDeveloper: e.value == ROLES.DEVELOPER ? true : false,
                  //   isAgent: e.value == ROLES.AGENT ? true : false
                  // })
                  setState({ userList: [] });
                }}
                options={FILTER_ROLES}
              />
            </div>

            <div className="">
              <CustomSelect
                placeholder="Select user"
                value={state.user}
                onChange={(e) => setState({ user: e })}
                options={state.userList}
                disabled={!state.role}
              />
            </div>
          </>
        )} */}

        {/* <div>
          <button type="button" className="btn btn-dred" onClick={clearFilter}>
            Clear Filter
          </button>
        </div> */}
      </div>

      <div className=" border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
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

                ...(state.recordType
                  ? [
                      {
                        label: `Records: ${state.recordType.label}`,
                        onRemove: () =>
                          setState({ team: null, recordType: "" }),
                      },
                    ]
                  : []),

                ...(state.filterLocation
                  ? [
                      {
                        label: `City: ${state.filterLocation.label}`,
                        onRemove: () => setState({ filterLocation: "" }),
                      },
                    ]
                  : []),

                ...(state.filterArea
                  ? [
                      {
                        label: `Area: ${state.filterArea.label}`,
                        onRemove: () => setState({ filterArea: "" }),
                      },
                    ]
                  : []),

                // ...(state.role && state.group === "Admin"
                //   ? [
                //       {
                //         label: `Role: ${state.role.label}`,
                //         onRemove: () =>
                //           setState({ role: null, user: null, userList: [] }),
                //       },
                //     ]
                //   : []),
                // ...(state.user
                //   ? [
                //       {
                //         label: `User: ${state.user.label}`,
                //         onRemove: () => setState({ user: null }),
                //       },
                //     ]
                //   : []),
              ]}
              onClearAll={() =>
                setState({
                  search: "",
                  role: null,
                  user: null,
                  userList: [],
                  recordType: null,
                  filterLocation: null,
                  filterArea: null,
                  team: null,
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
                    className="cursor-pointer font-medium"
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
              accessor: "properties",
              render: (row: any) => (
                <span
                  className="cursor-pointer   "
                  onClick={(e) => {
                    e.stopPropagation();
                    handleView(row);
                  }}
                >
                  {row.properties}
                </span>
              ),
            },

            {
              accessor: "city",
              sortable: true,
              render: (row: any) => <span>{row.city.name || "-"}</span>,
            },
            {
              accessor: "area",
              sortable: true,
              render: (row: any) => <span>{row.area.name || "-"}</span>,
            },
            // { accessor: "status" },

            {
              accessor: "actions",
              title: "Actions",
              textAlignment: "center",
              render: (row: any) => (
                <div className="mx-auto flex w-max items-center gap-4">
                  <button
                    className="text-dred flex"
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
                    className="text-dred flex"
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
          recordsPerPage={state.pageSize}
          minHeight={200}
          page={null}
          onPageChange={(p) => {}}
          withBorder={true}
          paginationText={({ from, to, totalRecords }) =>
            `Showing  ${from} to ${to} of ${totalRecords} entries`
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
          // onRowClick={(record: any) => toggleQuickInfo(record)}
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
        {/* <div className="mt-5 flex justify-end gap-3">
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
            className={`btn border-none p-2  ${
              !state.next ? "btn-disabled" : "btn-dred"
            }`}
          >
            <IconArrowForward />
          </button>
        </div> */}
      </div>

      <Modal
        subTitle={state.editId ? "Update Project" : "Create Project"}
        open={state.isOpen}
        closeIcon={true}
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

                <CustomSelect
                  title="City name"
                  placeholder="Select city"
                  options={state.cityList}
                  value={state.location}
                  onChange={(selectedOption) =>
                    setState({ location: selectedOption, area: "" })
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

export default PrivateRouter(list);
