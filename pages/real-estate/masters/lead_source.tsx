import React, { useEffect } from "react";
import { DataTable } from "mantine-datatable";
import IconEdit from "@/components/Icon/IconEdit";
import IconTrash from "@/components/Icon/IconTrash";
import {
  capitalizeFLetter,
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

const LeadSource = () => {
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
    leadSourceList(1);
  }, [debouncedSearch]);

  const leadSourceList = async (page) => {
    try {
      const body: any = {};
      if (state.search) body.search = state.search;
      const res: any = await Models.leadSource.list(page, body);
      const data = res?.results?.map((item) => ({
        name: item?.name,
        // description: item?.description,
        id: item?.id,
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

  const createLeadSource = async () => {
    try {
      setState({ btnLoading: true });
      const body = { name:  capitalizeFLetter(state.name) };
      if (!body.name) {
        setState({ error: { name: "Name is required" }, btnLoading: false });
        return;
      }
      await Models.leadSource.create(body);
      clearData();
      setState({ btnLoading: false });
      leadSourceList(1);
      Success("Lead Source created successfully");
    } catch (error: any) {
      Failure(error?.name?.[0] || "Something went wrong");
      setState({ btnLoading: false });
    }
  };

  const updateLeadSource = async () => {
    try {
      setState({ btnLoading: true });
      const body = { name: capitalizeFLetter(state.name) };
      if (!body.name) {
        setState({ error: { name: "Name is required" }, btnLoading: false });
        return;
      }
      await Models.leadSource.update(body, state.editId);
      clearData();
      setState({ btnLoading: false });
      leadSourceList(state.page);
      Success("Lead Source updated successfully");
    } catch (error: any) {
      Failure(error?.name?.[0] || "Something went wrong");
      setState({ btnLoading: false });
    }
  };

  const deleteRecord = async (row) => {
    try {
      setState({ btnLoading: true });
      await Models.leadSource.delete(row?.id);
      clearData();
      setState({ btnLoading: false });
      leadSourceList(state.page);
      Success("Lead Source deleted successfully");
    } catch (error) {
      setState({ btnLoading: false });
    }
  };

  const handleDelete = (row) => {
    showDeleteAlert(
      () => deleteRecord(row),
      () => Swal.fire("Cancelled", "Your Record is safe :)", "info"),
      "Are you sure want to delete this lead source?",
    );
  };

  const handleEdit = (row) => {
    setState({
      name: row.name,
      description: row.description,
      isOpen: true,
      editId: row?.id,
    });
  };

  const clearData = () => {
    setState({
      editId: null,
      name: "",
      description: "",
      isOpen: false,
      error: {},
    });
  };

  const handleNextPage = () => {
    if (state.next) leadSourceList(state.page + 1);
  };

  const handlePreviousPage = () => {
    if (state.previous) leadSourceList(state.page - 1);
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-5">
        <div>
          <h5 className="text-lg font-semibold dark:text-white-light">
            Lead Source List
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

      <div className="border-white-light px-0 dark:border-[#1b2e4b]">
        <div className="datatables pagination-padding">
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
              // {
              //   accessor: "description",
              //   title: "Description",
              //   render: (row: any) => (
              //     <span>{row.description || "-"}</span>
              //   ),
              // },
              {
                accessor: "actions",
                title: "Actions",
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
        addHeader={state.editId ? "Update Lead Source" : "Create Lead Source"}
        open={state.isOpen}
        close={() => clearData()}
        renderComponent={() => (
          <div className="pb-7">
            <form className="flex flex-col gap-3">
              <div className="w-full space-y-5">
                <TextInput
                  name="name"
                  title="Lead Source Name"
                  placeholder="Enter lead source name"
                  value={state.name}
                  onChange={(e) =>
                    setState({ name: e.target.value, error: { ...state.error, name: "" } })
                  }
                  error={state.error?.name}
                  required
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
                  onClick={() => state.editId ? updateLeadSource() : createLeadSource()}
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

export default PrivateRouter(LeadSource);
