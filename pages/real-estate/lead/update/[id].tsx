import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../../store/themeConfigSlice";
import { DataTable, DataTableSortStatus } from "mantine-datatable";
import IconUser from "@/components/Icon/IconUser";
import {
  Dropdown,
  Failure,
  Success,
  capitalizeFLetter,
  commonDateFormat,
  formatPriceRange,
  formatToINR,
  objIsEmpty,
  truncateText,
  useSetState,
} from "../../../..//utils/function.utils";
import TextInput from "@/components/FormFields/TextInput.component";

import NumberInput from "@/components/FormFields/NumberInputs.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";

import Models from "@/imports/models.import";
import IconLoader from "@/components/Icon/IconLoader";
import TextArea from "@/components/FormFields/TextArea.component";

import * as Yup from "yup";

import IconSearch from "@/components/Icon/IconSearch";
import { SimpleGrid } from "@mantine/core";
import moment from "moment";
import IconMail from "@/components/Icon/IconMail";
import {
  FRONTEND_URL,
  LISTING_TYPE_LIST,
  ROLES,
} from "@/utils/constant.utils";
import { Building, Computer, LucideHome, User2, User2Icon, Eye, ArrowLeft } from "lucide-react";
import CustomeDatePicker from "@/components/datePicker";
import CustomPhoneInput from "@/components/phoneInput";
import Link from "next/link";
import IconMapPin from "@/components/Icon/IconMapPin";
import { useRouter, useSearchParams } from "next/navigation";
import Utils from "@/imports/utils.import";
import PrivateRouter from "@/hook/privateRouter";

const CreateOpportunities = () => {
  const dispatch = useDispatch();

  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  useEffect(() => {
    dispatch(setPageTitle("Update Lead"));
  });

  const [state, setState] = useSetState({
    userId: null,
    loading: false,
    first_name: "",
    propertyPage: 1,
    propertyList: [],
    hasMoreProperty: false,
    error: {},
  });

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    setState({ userId });
  }, []);

  useEffect(() => {
    if (id) {
      leadDetails();
      propertyList(1);
      leadSourceList(1);
      leadStatusList(1);
    }
  }, [id]);

  const leadDetails = async () => {
    try {
      setState({ loading: true });

      const res: any = await Models.lead.details(id);
      setState({
        first_name: res?.first_name,
        last_name: res?.last_name,
        company_name: res?.company_name,
        email: res?.email,
        phone: res?.phone,
        next_follow_up: res?.next_follow_up,
        requirements: res?.requirements,
      });
      if (res?.assigned_to) {
        setState({
          assignRole: {
            value: res?.assigned_to_details?.user_type,
            label: capitalizeFLetter(res?.assigned_to_details?.user_type),
          },
          assigned_to: {
            value: res?.assigned_to_details?.id,
            label: `${capitalizeFLetter(
              res?.assigned_to_details?.first_name,
            )} ${capitalizeFLetter(res?.assigned_to_details?.last_name)} `,
          },
        });
        getInitialRoleList(res?.assigned_to_details?.user_type);
      }

      if (!objIsEmpty(res?.property_details)) {
        handleGetProperty({
          value: res?.property_details?.id,
          label: capitalizeFLetter(res?.property_details?.title),
        });
      }
      if (res?.status_info) {
        setState({
          status: {
            value: res?.status_info?.id,
            label: capitalizeFLetter(res?.status_info?.name),
          },
        });
      }

      if (res?.lead_source) {
        setState({
          lead_source: {
            value: res?.lead_source_info?.id,
            label: capitalizeFLetter(res?.lead_source_info?.name),
          },
        });
      }

      console.log("leadDetails --->", res);
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const getInitialRoleList = async (e) => {
    try {
      if (e) {
        const body = {
          user_type: e == ROLES.DEVELOPER ? ROLES.DEVELOPER : ROLES.AGENT,
        };
        const res: any = await Models.user.list(1, body);
        const dropdown = res?.results?.map((item) => ({
          value: item?.id,
          label: `${capitalizeFLetter(item?.first_name)} ${item?.last_name}`,
        }));
        setState({
          assignList: dropdown,
        });
      } else {
        setState({ assignList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const leadSourceList = async (id: any) => {
    try {
      const res: any = await Models.leadSource.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadSourceList: dropdownList,
      });
    }
    catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const leadStatusList = async (id: any) => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadStatusList: dropdownList,
      });
    }
    catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const propertyList = async (id: any) => {
    try {
      setState({ loading: true });
      const userId = localStorage.getItem("userId")
      
      const body = {
        developer: userId,
        pagination:"No",
        is_approved: true
      };

      const res: any = await Models.property.list(1, body);
      const dropdownList = Dropdown(res.results, "title");
      setState({
        propertyList: dropdownList,
        loading: false,
        hasMoreProperty: res.next,
      });
    } catch (error) {
      setState({ loading: false });

      console.log("error: ", error);
    }
  };

  const propertyLoadMore = async () => {
    try {
      if (state.hasMoreProperty) {
        const res: any = await Models.property.list(state.propertyPage + 1, {});
        const newOptions = Dropdown(res?.results, "title");
        setState({
          propertyList: [...state.propertyList, ...newOptions],
          hasMoreProperty: res.next,
          propertyPage: state.propertyPage + 1,
        });
      } else {
        setState({
          propertyList: state.propertyList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const handleGetProperty = async (e) => {
    try {
      setState({
        property_name: e,
        error: { ...state.error, interested_property: null },
      });
      if (e) {
        const res: any = await Models.property.details(e?.value);
        const data = [
          {
            title: capitalizeFLetter(res?.title),
            status: capitalizeFLetter(res?.status),
            id: res?.id,
            total_area: res?.total_area,
             property_type:
                      res?.property_type?.map((pt) => capitalizeFLetter(pt?.name)) || [],
            listing_type: {
              type: capitalizeFLetter(res?.listing_type),
              color:
                res?.listing_type == LISTING_TYPE_LIST.RENT
                  ? "warning"
                  : res?.listing_type == LISTING_TYPE_LIST.SALE
                  ? "secondary"
                  : res?.listing_type == LISTING_TYPE_LIST.LEASE
                  ? "info"
                  : "success",
            },

            date: commonDateFormat(res?.created_at),
            location: capitalizeFLetter(res?.city),
            developer: `${capitalizeFLetter(
              res?.developer?.first_name,
            )} ${capitalizeFLetter(res?.developer?.last_name)}`,
            project: capitalizeFLetter(res?.project?.name),

            price: formatPriceRange(
                     res?.price_range?.minimum_price,
                     res?.price_range?.maximum_price,
                   ),
            publish: res?.publish === true ? "Published" : "Draft",
            is_approved: res?.is_approved,
            image:
              res?.primary_image?.image ??
              "/assets/images/real-estate/property-info-img1.png",
          },
        ];
        setState({ tableList: data });
      } else {
        setState({ tableList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        company_name: capitalizeFLetter(state.company_name),
        first_name: capitalizeFLetter(state.first_name),
        last_name: capitalizeFLetter(state.last_name),
        phone: state.phone,
        email: state.email,
        interested_property: state.property_name?.value,
        lead_source: state.lead_source?.value,
        assigned_to: state.assigned_to
          ? state.assigned_to?.value
          : state.userId,
        // lead_source_details: state.lead_source_details,
        next_follow_up: state.next_follow_up
          ? moment(state.next_follow_up).format("YYYY-MM-DD")
          : null,
        status: state.status?.value,
        requirements: capitalizeFLetter(state.requirements),
      };
      console.log("✌️body --->", body);

      await Utils.Validation.lead.validate(body, { abortEarly: false });

      const res = await Models.lead.update(body, id);
      setState({ btnLoading: false });
      Success("Lead Updated Successfully");
      router.back();
      console.log("✌️res --->", res);
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, btnLoading: false });
        Failure("Please fill all the required fields");
      } else {
        console.log("error", error);
        Failure(error);
        setState({ btnLoading: false });
      }
    }
  };

  const getAssignList = async (e) => {
    try {
      if (e) {
        setState({ assignRole: e, assigned_to: "" });

        const body = {
          user_type:
            e?.value == ROLES.DEVELOPER ? ROLES.DEVELOPER : ROLES.AGENT,
        };
        const res: any = await Models.user.list(1, body);
        const dropdown = res?.results?.map((item) => ({
          value: item?.id,
          label: `${capitalizeFLetter(item?.first_name)} ${item?.last_name}`,
        }));
        setState({
          assignList: dropdown,
        });
      } else {
        setState({ assignRole: null, assigned_to: "", assignList: [] });
      }
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };
  const handleView = async (row) => {
    router.push(`/real-estate/property/detail/${row?.id}`);
  };



  const allColumns = [
    {
      accessor: "title",
      title: "Property Info",
      sortable: true,
      render: (row) => (
        <div
        onClick={() => handleView(row)}
        className="cursor-pointer text-sm font-semibold">
          {truncateText(row.title)}
        </div>
      ),
    },
    {
      accessor: "project",
      title: "Project",
      render: (row) => (
        <span title={row.project}>{truncateText(row.project)}</span>
      ),
    },
    {
      accessor: "property_type",
      title: "Property Type",
      render: (row: any) => {
        const property_type = row.property_type;
        if (!property_type || property_type?.length === 0) return <span>-</span>;
        const firstType = property_type[0];
        const others = property_type.slice(1);
        const maxShow = 3;
        const remaining = others.length - maxShow;
        const visibleTypes = others.slice(0, maxShow);
        const hiddenTypes = others.slice(maxShow);
        return (
          <div className="flex items-center gap-2">
            <span title={firstType} className="text-sm text-gray-700 dark:text-gray-300">
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
      accessor: "role",
      title: "Offer Type",
      render: (row: any) => (
        <span className={`badge badge-outline-${row?.listing_type?.color}`}>
          {row?.listing_type?.type}
        </span>
      ),
    },
    {
      accessor: "publish",
      title: "Publish Status",
      render: (row: any) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
          row?.publish === "Published" ? "bg-lred text-dred border-dred" : "bg-gray-200 text-gray-700"
        }`}>
          {row?.publish}
        </span>
      ),
    },
    {
      accessor: "is_approved",
      title: "Approved Status",
      render: (row: any) => (
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
          row?.is_approved === true ? "bg-green-100 text-green-700" : "bg-yellow-100 text-gray-700"
        }`}>
          {row?.is_approved === true ? "Approved" : "Pending"}
        </span>
      ),
    },
    {
      accessor: "action",
      title: "Actions",
      textAlignment: "center" as const,
      render: (row: any) => (
        <div className="mx-auto flex w-max items-center gap-4">
          <button
            className="text-dred flex"
            onClick={() => handleView(row)}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="relative h-auto  bg-cover ">
      <div className="  flex  items-center justify-between gap-5 ">
        <div className="flex items-center gap-2">
          <div
            className="flex h-[50px] w-[50px] overflow-hidden bg-white"
            style={{ borderRadius: 50 }}
          >
            <img
              src="/assets/images/profile-1.jpeg"
              height={"100%"}
              width={"100%"}
            />
          </div>
          <div>
            <h5 className="font-semibold " style={{ fontSize: "18px" }}>
              Update Lead
            </h5>
            <div className="  " style={{ fontSize: "14px", color: "grey" }}>
              Your data journey starts here...
            </div>
          </div>
        </div>
        {/* <div className="flex  flex-wrap items-center gap-3">
          <p>Assign To:</p>
          <CustomSelect
            value={state.assignRole}
            onChange={(e) => getAssignList(e)}
            placeholder={"Choose Role"}
            options={[
              { value: "developer", label: "Developer" },
              { value: "agent", label: "Agent" },
            ]}
            // required
            className="lg:w-[200px]"
          />
          <CustomSelect
            value={state.assigned_to}
            onChange={(e) => setState({ assigned_to: e })}
            placeholder={"Assign To"}
            options={state.assignList}
            error={state.errors?.assigned_to}
            // required
            className="lg:w-[200px]"
          />
        </div> */}

        <div className="flex  flex-wrap items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </div>
      </div>

      <div className={`flex-wrap" mt-4 flex w-full gap-4`}>
        <div className={`mt-1 w-full md:w-1/2`}>
          <div className=" panel   border shadow-none flex  flex-col gap-5 rounded-2xl p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                <IconUser className="text-[#82de69]" />
              </div>
              <div className=" " style={{ fontSize: "20px" }}>
                Lead Information
              </div>
            </div>

            <TextInput
              title="Company Name"
              value={state.company_name}
              onChange={(e) => setState({ company_name: e.target.value })}
              placeholder="Company Name"
              error={state.errors?.company_name}
              icon={<Computer height={15} width={15} />}
            />

            <CustomSelect
              title="Lead Source"
              value={state.lead_source}
              onChange={(e) =>
                setState({
                  lead_source: e,
                  error: { ...state.error, lead_source: null },
                })
              }
              placeholder={"Lead Source"}
              options={state.leadSourceList}
              error={state.error?.lead_source}
              required
              className="w-full"
              leftIcon={<Building className="h-4 w-4 text-gray-400" />}
            />

            {/* <TextArea
              title="Lead Source Details"
              placeholder="Lead Source Details"
              value={state.lead_source_details}
              onChange={(e) =>
                setState({ lead_source_details: e.target.value })
              }
            /> */}

            <CustomSelect
              value={state.status}
              onChange={(e) =>
                setState({ status: e, error: { ...state.error, status: null } })
              }
              placeholder={"Status"}
              title={"Status"}
              options={state.leadStatusList} 
              error={state.error?.status}
              required
              className="w-full"
              leftIcon={<User2Icon className="h-4 w-4 text-gray-400" />}
            />

            <CustomeDatePicker
              value={state.next_follow_up}
              placeholder="Next Follow Up Date"
              title="Next Follow Up Date"
              onChange={(e) =>
                setState({
                  next_follow_up: e,
                  error: { ...state.error, next_follow_up: null },
                })
              }
              showTimeSelect={true}
              error={state.error?.next_follow_up}
            />
            <TextArea
              title="Requirements"
              placeholder="Requirements"
              value={state.requirements}
              onChange={(e) =>
                setState({
                  requirements: e.target.value,
                  error: { ...state.error, requirements: "" },
                })
              }
              required
              error={state.error?.requirements}
            />
          </div>
        </div>

        <div className={`mt-1 w-full md:w-1/2`}>
          <div>
            <div className=" panel border shadow-none flex  flex-col gap-5 rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#ffefe4]">
                  <IconUser className="text-[#ffbb55]" />
                </div>
                <div className=" " style={{ fontSize: "20px" }}>
                  Contact Information
                </div>
              </div>

              <TextInput
                title="First Name"
                value={state.first_name}
                onChange={(e) =>
                  setState({
                    first_name: e.target.value,
                    error: { ...state.error, first_name: "" },
                  })
                }
                placeholder={"First Name"}
                error={state.error?.first_name}
                icon={<User2 height={15} width={15} />}
                required
              />

              <TextInput
                title="Last Name"
                value={state.last_name}
                onChange={(e) =>
                  setState({
                    last_name: e.target.value,
                    error: { ...state.error, last_name: "" },
                  })
                }
                placeholder={"Last Name"}
                error={state.error?.last_name}
                icon={<User2 height={15} width={15} />}
                required
              />
              <TextInput
                title="Email"
                value={state.email}
                onChange={(e) =>
                  setState({
                    email: e.target.value,
                    error: { ...state.error, email: "" },
                  })
                }
                placeholder={"Email"}
                error={state.error?.email}
                icon={<IconMail fill={false} />}
                required
              />

              <CustomPhoneInput
                value={state.phone}
                onChange={(value) =>
                  setState({
                    phone: value,
                    error: { ...state.error, phone: "" },
                  })
                }
                title="Phone Number"
                name="phone"
                required
                error={state.error?.phone}
              />
            </div>
            <div className=" panel border shadow-none mt-4  flex flex-col gap-5 rounded-2xl p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl   bg-[#deffd7]">
                  <IconUser className="text-[#82de69]" />
                </div>
                <div className=" " style={{ fontSize: "20px" }}>
                  Property Information
                </div>
              </div>

              <CustomSelect
                title="Property"
                value={state.property_name}
                onChange={(e) => handleGetProperty(e)}
                placeholder={"Select Property"}
                options={state.propertyList}
                error={state.errors?.interested_property}
                required
                className="w-full"
                loadMore={() => propertyLoadMore()}
              />
            </div>
          </div>
        </div>
      </div>
      {state.tableList?.length > 0 && (
        <div className={`mt-3 w-full`}>
          <div className="  flex  flex-col gap-5 rounded-xl ">
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                <IconUser className="text-[#82de69]" />
              </div>
              <div className=" " style={{ fontSize: "20px" }}>
                Property Details
              </div>
            </div>

            <div className="datatables">
              <DataTable
                className="table-responsive"
                records={state.tableList || []}
                columns={allColumns}
                highlightOnHover
                minHeight={180}
              />
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 pt-5 md:flex-row md:justify-end">
        <button
          type="button"
          className="btn btn-outline-danger w-full border md:w-auto"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-dred w-full md:w-auto"
          onClick={() => handleSubmit()}
          disabled={state.btnLoading}
        >
          {state.btnLoading ? (
            <IconLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Submit"
          )}
        </button>
      </div>
      <div className=" mt-2 grid grid-cols-12  gap-2">
        <div className=" col-span-12 flex flex-col   md:col-span-5"></div>
      </div>
    </div>
  );
};

export default PrivateRouter(CreateOpportunities);
