import React, { useEffect } from "react";

import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import IconUser from "@/components/Icon/IconUser";

import IconPlus from "@/components/Icon/IconPlus";
import moment from "moment";

// import Breadcrumb from '@/common_component/breadcrumb';

import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import LogCard from "@/components/logCard";
import {
  backendDateFormat,
  capitalizeFLetter,
  commonDateFormat,
  formatPhoneNumber,
  formatPriceRange,
  formatToINR,
  objIsEmpty,
  truncateText,
  useSetState,
} from "@/utils/function.utils";
import { DataTable } from "mantine-datatable";
import IconMapPin from "@/components/Icon/IconMapPin";
import Link from "next/link";
import { LucideHome } from "lucide-react";
import { FRONTEND_URL, LISTING_TYPE_LIST } from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";

const View_opportunity = (props: any) => {
  const router = useRouter();

  const id = router?.query?.id;

  const [state, setState] = useSetState({
    loading: false,
    detail: {},
  });

  useEffect(() => {
    getDetails();
    getLogStageList();
    getLogList();
  }, [id]);

  useEffect(() => {
    getDetails();
    getLogStageList();
  }, []);

  // useEffect(() => {
  //   if (state.logtype) {
  //     getLogListFilter();
  //   } else {
  //     getLogList();
  //   }
  // }, [state.logtype]);

  useEffect(() => {
    getLogList();
  }, [ state.date_from, state.action, state.date_to]);

  const getDetails = async () => {
    try {
      setState({ loading: true });
      const res: any = await Models.lead.details(id);
      console.log("getDetails --->", res);
      if (!objIsEmpty(res?.property_details)) {
        handleGetProperty(res?.property_details?.id);
      }

      setState({ detail: res });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const handleGetProperty = async (id) => {
    try {
      if (id) {
        const res: any = await Models.property.details(id);
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
              res?.developer?.first_name
            )} ${capitalizeFLetter(res?.developer?.last_name)}`,
            project: capitalizeFLetter(res?.project?.name),

            price: formatPriceRange(
              res?.price_range?.minimum_price,
              res?.price_range?.maximum_price
            ),
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

  const getLogList = async () => {
    try {

      console.log("hello ");
      
      const body = logListFilter();

      console.log("body", body);
      
      const res: any = await Models.lead.logList(id, body);
      console.log("getLogList --->", res);

      setState({ logList: res?.results, logCount: res.count });
    } catch (error) {
      setState({ loading: false });
    }
  };


  

  const logListFilter = () => {
    let body: any = {};
    if (state.action) {
      body.action = state.action.value;
    }

    if (state.date_from) {
      body.date_from = backendDateFormat(state.date_from);
    }

    if (state.date_to) {
      body.date_to = backendDateFormat(state.date_to);
    }

    return body
  };

  // const getLogListFilter = async () => {
  //   try {
  //     let statusId = null;
  //     if (state.logtype == "Email") {
  //       statusId = "Email";
  //     }
  //     if (state.logtype == "Call") {
  //       statusId = "Call";
  //     }
  //     if (state.logtype == "Meeting") {
  //       statusId = "Meeting";
  //     }
  //     // const res: any = await Models.lead.opplogFilterList(id, statusId);
  //     // setState({ logList: res?.results, loading: false, logCount: res.count });
  //   } catch (error) {
  //     setState({ loading: false });
  //   }
  // };

  const getLogStageList = async () => {
    try {
      // setState({ loading: true });
      // const res: any = await Models.lead.stageList();
      // console.log("res: ", res);
      // const dropdownList = Dropdown(res.results, "stage");
      // setState({ stageList: dropdownList, loading: false });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const handleCheckboxChange = (option) => {
    // setState({ logtype: state.logtype == option ? null : option });
    setState({ logtype: option });
  };

  const StatusOptions = [
    { value: "created", label: "Lead Created" },
    { value: "updated", label: "Lead Updated" },
    { value: "status_changed", label: "Status Changed" },
    { value: "assigned", label: "Lead Assigned" },
    { value: "contacted", label: "Lead Contacted" },
    { value: "note_added", label: "Note Added" },
  ];

  const allColumns = [
    {
      accessor: "name",
      title: "Property Info",
      visible: true,
      toggleable: true,
      
      render: (row) => (
         <Link className="flex gap-3 font-semibold"
        href={`${FRONTEND_URL}/property-detail/${row?.id}`}
                    target="_blank">
          <div className="h-20 w-20 rounded-md bg-white-dark/30  ltr:mr-2 rtl:ml-2">
            <img
              className="h-full w-full cursor-pointer rounded-md object-cover"
              src={row.image}
              alt=""
            />
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex gap-1">
                {" "}
                <IconMapPin className="h-3 w-3" />
                 <span className="mt-[-2px] text-xs">{row.location}</span>
              </div>
              <div
                className=" text-md cursor-pointer font-bold"
               
                title={row.title}
              >
                {truncateText(row.title)}
              </div>
            </div>
            <div>
               <Link className="flex gap-1 text-primary"  href={`${FRONTEND_URL}/property-detail/${row?.id}`} target="_blank">
                <LucideHome className="h-3 w-3 text-black " /> <span className="mt-[-2px] text-xs">View Details</span>
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
  ];

  return (
    <div className="  relative  h-auto   ">
      <div className="  flex flex-wrap justify-between gap-5 ">
        <div className=" items-center gap-5">
          {/* <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            <img
              src="/assets/images/profile-1.jpeg"
              style={{ objectFit: "cover" }}
            />
          </div> */}
          <h5 className="text-lg font-semibold dark:text-white-light">
            Lead Details
          </h5>
          <p className="text-gray-600 dark:text-gray-400">
            Manage property listings and status
          </p>
        </div>

        <div className="flex items-center gap-5">
          {state?.detail?.assigned_to && (
            <div className="flex flex-col p-2 ">
              <div className="text-md text-gray-600">Assigned To</div>
              <div className="text-[18px]">
                {`${capitalizeFLetter(
                  state?.detail?.assigned_to_details?.first_name
                )} ${
                  state?.detail?.assigned_to_details?.last_name
                } (${capitalizeFLetter(
                  state?.detail?.assigned_to_details?.user_type
                )})`}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="panel border shadow-none mt-2 rounded-xl ">
        <div
          className=" cursor-pointer items-center gap-3"
          onClick={() => setState({ isOpenLeadInfo: !state.isOpenLeadInfo })}
        >
          <>
            <div className=" flex w-full flex-wrap">
              <div className={`  w-full md:w-1/2`}>
                <div className="  flex  flex-col gap-5 rounded-2xl ">
                  <div className="flex items-center gap-3">
                    <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  bg-[#deffd7]">
                      <IconUser className="text-[#82de69]" />
                    </div>
                    <div className=" " style={{ fontSize: "20px" }}>
                      Lead Information
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {state.detail?.company_name && (
                      <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">
                          Company Name
                        </div>
                        <div className="text-[18px]">
                          <div className="text-[16px] font-medium">
                            {state.detail?.company_name}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-col p-2 ">
                      <div className="text-md text-gray-600">Lead Source</div>
                      <div className="text-[16px] font-medium">
                        {state.detail?.lead_source}
                      </div>
                    </div>{" "}
                    <div className="flex flex-col p-2 ">
                      <div className="text-md text-gray-600">Status</div>
                      <div className="text-[16px] font-medium">
                        {state.detail?.status}
                      </div>
                    </div>
                    <div className="flex flex-col p-2 ">
                      <div className="text-md text-gray-600">
                        Next Follow Up Date
                      </div>
                      <div className="text-[16px] font-medium">
                        {commonDateFormat(state.detail?.next_follow_up)}
                      </div>
                    </div>
                    <div className="flex flex-col p-2 ">
                      <div className="text-md text-gray-600">Requirements</div>
                      <div className="text-[16px] font-medium">
                        {state.detail?.requirements}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className=" w-full md:w-1/3">
                <div className=" col-span-12 flex flex-col   md:col-span-5">
                  <div className="  flex flex-col gap-5 rounded-2xl  pb-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffeeee]">
                        <IconUser className="text-[#fe70f2]" />
                      </div>
                      <div
                        className="text-lg font-medium"
                        style={{ fontSize: "20px" }}
                      >
                        Contact Information
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">Name</div>

                        <div className="text-[16px] font-medium">
                          {" "}
                          {`${capitalizeFLetter(state.detail?.first_name)} ${
                            state.detail?.last_name
                          }`}{" "}
                        </div>
                      </div>
                      <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">Email</div>
                        <div className="text-[16px] font-medium">
                          {" "}
                          {state.detail?.email}
                        </div>
                      </div>{" "}
                      <div className="flex flex-col p-2 ">
                        <div className="text-md text-gray-600">
                          Phone Number
                        </div>
                        <div className="text-[16px] font-medium">
                          {formatPhoneNumber(state.detail?.phone)}
                        </div>
                      </div>{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        </div>
      </div>

      <div className="   mt-5 w-full rounded-xl">
        <div className=" col-span-12 flex flex-col   md:col-span-5">
          <div className=" flex flex-col gap-5 rounded-2xl  pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl bg-[#ffeeee]">
                <IconUser className="text-[#fe70f2]" />
              </div>
              <div className="text-lg font-medium" style={{ fontSize: "20px" }}>
                Property Information
              </div>
            </div>
            <DataTable
              className="table-hover whitespace-nowrap"
              records={state.tableList || []}
              columns={allColumns}
              highlightOnHover
              style={{ zIndex: 0 }}
            />
          </div>
        </div>
      </div>
      <div className="panel border shadow-none col-span-12  flex flex-col  rounded-xl  md:col-span-12">
        <div className="flex justify-between">
          <div className="log-history flex w-full flex-wrap justify-between">
            <div
              className="flex cursor-pointer items-center gap-3"
              onClick={() => setState({ isOpenLog: !state.isOpenLog })}
            >
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-3xl  ">
                {state.isOpenLog ? (
                  <img src={"/assets/images/arrowDown.svg"} height={10} />
                ) : (
                  <img src={"/assets/images/arrowUp.png"} height={10} />
                )}
              </div>
              <div className="text-lg font-medium ">Log History</div>

              <div
                className=" flex h-5 w-6 items-center justify-center rounded-sm  bg-primary font-bold text-white"
                style={{ fontSize: "18px" }}
              >
                {state.logList?.length}
              </div>
            </div>
            <div
              className="mt-2 flex cursor-pointer flex-wrap items-center gap-3"
              onClick={() => setState({ isOpenLog: true })}
            >
              {/* {checkboxOptions.map((option) => (
                <CheckboxInput
                  key={option.value}
                  checked={state.logtype === option?.value}
                  onChange={() =>
                    setState({
                      logtype:
                        state.logtype === option.value ? null : option?.value,
                    })
                  }
                  label={option?.label}
                />
              ))} */}

              <div className="flex-1">
                <CustomeDatePicker
                  value={state.date_from}
                  placeholder="Choose From Date"
                  onChange={(e) => setState({ date_from: e })}
                  showTimeSelect={false}
                />
              </div>

              <div className="flex-1">
                <CustomeDatePicker
                  value={state.date_to}
                  placeholder="Choose To Date"
                  onChange={(e) => setState({ date_to: e })}
                  showTimeSelect={false}
                />
              </div>

              <div className="flex-1">
                <CustomSelect
                  value={state.action}
                  onChange={(e) => setState({ action: e })}
                  placeholder={"Select Lead Action"}
                  options={StatusOptions}
                  isClearable={true}
                />
              </div>
              {/* <button
                type="button"
                className="btn btn-dred log-btn p-1"
                onClick={() => {
                  setState({ isLogOpen: true });
                }}
              >
                <IconPlus />
              </button> */}
            </div>
          </div>
        </div>
        {state.isOpenLog && (
          <div className="max-h-[600px] overflow-y-scroll">
            <LogCard
              data={state.logList}
              onPress={(item) => router.push(`/opportunity?id=${item.id}`)}
              // onDelete={(item) => deleteOpp(item.id)}
              editIcon={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default PrivateRouter(View_opportunity)
