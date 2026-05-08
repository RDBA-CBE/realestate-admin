import React, { use, useEffect } from "react";
import { DataTable } from "mantine-datatable";
import IconEdit from "@/components/Icon/IconEdit";
import IconTrash from "@/components/Icon/IconTrash";
import {
  capitalizeFLetter,
  Dropdown,
  Failure,
  showDeleteAlert,
  Success,
  useSetState,
} from "@/utils/function.utils";
import IconLoader from "@/components/Icon/IconLoader";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import TextInput from "@/components/FormFields/TextInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import Swal from "sweetalert2";
import useDebounce from "@/hook/useDebounce";
import * as Yup from "yup";
import IconArrowBackward from "@/components/Icon/IconArrowBackward";
import IconArrowForward from "@/components/Icon/IconArrowForward";
import PrivateRouter from "@/hook/privateRouter";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import city from "./city";
import { log } from "console";

const Area = () => {
  const [state, setState] = useSetState({
    isOpen: false,
    btnLoading: false,
    page: 1,
    tableList: [],
    editId: null,
    name: "",
    description: "",
    search: "",
    error: {},
  });

  const debouncedSearch = useDebounce(state.search, 500);

  useEffect(() => {
    areaList(1);
  }, [debouncedSearch]);

  useEffect(() => {
    cityList(1);
  }, []);

  const areaList = async (page) => {
    try {
      const body: any = {};
      if (state.search) body.search = state.search;
      const res: any = await Models.area.list(page, body);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        id: item?.id,
        city: item?.location_details,
      }));
      setState({
        tableList: data,
        total: res?.count,
        page,
        next: res.next,
        previous: res.previous,
        totalRecords: res.count,
      });
    } catch (error) {
      console.log("error -->", error);
    }
  };

  const cityList = async (page) => {
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

  const createArea = async () => {
    try {
      setState({ btnLoading: true });
      const body = { name:  capitalizeFLetter(state.name) , location: state.city.value };
      if (!body.name) {
        setState({ error: { name: "Name is required" }, btnLoading: false });
        return;
      }
      console.log("body", body);
      
      await Models.area.create(body);
      clearData();
      setState({ btnLoading: false });
      areaList(1);
      Success("Area created successfully");
    } catch (error: any) {
      Failure(error?.name?.[0] || "Something went wrong");
      setState({ btnLoading: false });
    }
  };

  const updateArea = async () => {
    try {
      setState({ btnLoading: true });
      const body = { name: capitalizeFLetter(state.name), city: state.city?.id };
      if (!body.name) {
        setState({ error: { name: "Name is required" , city:"City is required"}, btnLoading: false });
        return;
      }
      await Models.area.update(body, state.editId);
      clearData();
      setState({ btnLoading: false });
      areaList(state.page);
      Success("Area updated successfully");
    } catch (error: any) {
      Failure(error?.name?.[0] || "Something went wrong");
      setState({ btnLoading: false });
    }
  };

  const deleteRecord = async (row) => {
    try {
      setState({ btnLoading: true });
      await Models.area.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      areaList(state.page);
      Success("City deleted successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row),
      () => Swal.fire("Cancelled", "Your Record is safe :)", "info"),
      "Are you sure want to delete this city?",
    );
  };

  const handleEdit = (row) => {
    setState({
      name: row.name,
      description: row.description,
      isOpen: true,
      editId: row?.id,
      city: row.city ? { value: row.city.id, label: row.city.name } : null
    });
  };

  const clearData = () => {
    setState({
      editId: null,
      name: "",
      description: "",
      isOpen: false,
      error: {},
      city: {},
    });
  };

  const handleNextPage = () => {
    if (state.next) areaList(state.page + 1);
  };

  const handlePreviousPage = () => {
    if (state.previous) areaList(state.page - 1);
  };

  console.log("cityList",state.cityList);
  

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-5">
        <div>
          <h5 className="text-lg font-semibold dark:text-white-light">
            Area List
          </h5>
        </div>
        <button
          type="button"
          className="btn btn-dred w-full border-none md:mb-0 md:w-auto"
          onClick={() => setState({ isOpen: true })}
        >
          + Create
        </button>
      </div>
      
      {/* <div className="mb-5 rounded-2xl ">
        <div className="flex items-center justify-between gap-5">
          <div>
            <TextInput
            type="text"
            placeholder="Search..."
            className="min-w-[300px]"
            value={state.search}
            onChange={(e) => setState({ search: e.target.value })}
          />
          </div>
          
        </div>
       </div> */}

      <div className="border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
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
            {state.total} Properties types found
          </div>
          </div>
          <DataTable
            className="table-responsive"
            records={state.tableList || []}
            columns={[
              {
                accessor: "name",
                title: "Name",
                render: (row: any) => (
                  <div
                    className="w-fit cursor-pointer"
                    onClick={() => handleEdit(row)}
                  >
                    {row.name}
                  </div>
                ),
              },
              {
                accessor: "city",
                title: "City",
                render: (row: any) => (
                  <span>{row.city.name || "-"}</span>
                ),
              },
              {
                accessor: "actions",
                title: "Actions",
                textAlignment: "center",
                render: (row: any) => (
                  <div className="mx-auto flex w-max items-center gap-4">
                    <button
                      className="flex hover:text-primary"
                      onClick={() => handleEdit(row)}
                    >
                      <IconEdit className="h-4.5 w-4.5" />
                    </button>
                    <button
                      className="flex text-danger hover:text-primary"
                      onClick={() => handleDelete(row)}
                    >
                      <IconTrash />
                    </button>
                  </div>
                ),
              },
            ]}
            highlightOnHover
            minHeight={200}
            withBorder={true}
          />
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button
            disabled={!state.previous}
            onClick={handlePreviousPage}
            className={`btn border-none p-2 ${!state.previous ? "btn-disabled" : "btn-dred"}`}
          >
            <IconArrowBackward />
          </button>
          <button
            disabled={!state.next}
            onClick={handleNextPage}
            className={`btn border-none p-2 ${!state.next ? "btn-disabled" : "btn-dred"}`}
          >
            <IconArrowForward />
          </button>
        </div>
      </div>

      <Modal
        addHeader={state.editId ? "Update Area" : "Create Area"}
        open={state.isOpen}
        close={() => clearData()}
        renderComponent={() => (
          <div className="pb-7">
            <form className="flex flex-col gap-3">
              <div className="w-full space-y-5">
                <TextInput
                  name="name"
                  title="Area Name"
                  placeholder="Enter Area name"
                  value={state.name}
                  onChange={(e) =>
                    setState({ name: e.target.value, error: { ...state.error, name: "" } })
                  }
                  error={state.error?.name}
                  required
                />

                <CustomSelect
                        title="City name"
                        placeholder="Select city"
                        options={state.cityList}
                        value={state.city}
                        onChange={(selectedOption) =>
                          setState({ city: selectedOption })
                        }
                        isClearable
                        loadMore={() => cityLoadMore()}
                        required
                      error={state.error?.city}
                      />

                {/* <TextArea
                  name="description"
                  title="Description"
                  placeholder="Enter description"
                  value={state.description}
                  onChange={(e) => setState({ description: e.target.value })}
                /> */}
              </div>
              <div className="mt-8 flex items-center justify-end">
                <button
                  type="button"
                  className="btn border-dred hover:btn-mred gap-2"
                  onClick={() => clearData()}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => state.editId ? updateArea() : createArea()}
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

export default PrivateRouter(Area);
