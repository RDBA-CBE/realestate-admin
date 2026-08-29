import React, { useEffect, useState } from "react";
import { DataTable } from "mantine-datatable";
import {
  BarChart3,
  Eye,
  CheckCircle,
  Clock,
  Globe,
  Search,
  X,
} from "lucide-react";
import Tippy from "@tippyjs/react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { formatToINR, useSetState } from "@/utils/function.utils";
import {
  capitalizeFLetter,
  commonDateFormat,
  Dropdown,
  formatPriceRange,
  truncateText,
} from "@/utils/function.utils";
import { statusChipConfig, LISTING_TYPE_LIST } from "@/utils/constant.utils";
import Models from "@/imports/models.import";
import IconEdit from "@/components/Icon/IconEdit";
import IconTrashLines from "@/components/Icon/IconTrashLines";
import Paginations from "@/pages/elements/paginations";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import TextInput from "@/components/FormFields/TextInput.component";

import HeroBanner from "../../components/dashboard/HeroBanner";
import DateFilterBar from "../../components/dashboard/DateFilterBar";
import MetricCards from "../../components/dashboard/MetricCards";
import DrillDownTable from "../../components/dashboard/DrillDownTable";
import PropertyTypeDonut from "../../components/dashboard/charts/PropertyTypeDonut";
import PropertyStatusBar from "../../components/dashboard/charts/PropertyStatusBar";
import PricePerSqft from "../../components/dashboard/charts/PricePerSqft";
import RegionalRadar from "../../components/dashboard/charts/RegionalRadar";
import LeadSourcesDonut from "../../components/dashboard/charts/LeadSourcesDonut";
import ConversionFunnel from "../../components/dashboard/charts/ConversionFunnel";
import LeadVelocity from "../../components/dashboard/charts/LeadVelocity";
import BookingVsCallbacks from "../../components/dashboard/charts/BookingVsCallbacks";
import BuyerWishlist from "../../components/dashboard/charts/BuyerWishlist";
import PropertyMatrix from "../../components/dashboard/charts/PropertyMatrix";

import { METRIC_CARDS } from "../../components/dashboard/data";
import type { MetricCardId } from "../../components/dashboard/types";

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Converts "DD-MM-YYYY" → "YYYY-MM-DD" for the API
function toIso(ddmmyyyy: string): string {
  if (!ddmmyyyy) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(ddmmyyyy)) return ddmmyyyy;
  const [d, m, y] = ddmmyyyy.split("-");
  return `${y}-${m}-${d}`;
}

function getDateRange(
  activeDateTab: string,
  startDate: string,
  endDate: string,
) {
  if (activeDateTab === "Custom") {
    return { start: toIso(startDate), end: toIso(endDate) };
  }

  const end = moment();
  const start = moment(end);

  switch (activeDateTab) {
    case "Today":
      break;
    case "Last 7 days":
      start.subtract(6, "days");
      break;
    case "This Month":
      start.startOf("month");
      end.endOf("month");
      break;
    case "Last Month":
      start.subtract(1, "month").startOf("month");
      end.subtract(1, "month").endOf("month");
      break;
    case "Last 3 Months":
      start.subtract(3, "months");
      end.endOf("month");
      break;
    case "Last 6 Month":
      start.subtract(6, "months");
      end.endOf("month");
      break;
    case "This Year":
      start.startOf("year");
      end.endOf("year");
      break;
    default:
      return { start: "", end: "" };
  }

  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const DATE_RANGES: any = {
  Today: "today",
  "Last 7 days": "last_7_days",
  "This Month": "this_month",
  "Last Month": "last_month",
  "Last 3 Months": "last_3_months",
  "Last 6 Month": "last_6_months",
  "This Year": "this_year",
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter();

  // Tooltip state for property name hover modal (same as property/list.tsx)
  const [tooltip, setTooltip] = useState<{
    row: any;
    x: number;
    y: number;
  } | null>(null);

  const [state, setState] = useSetState({
    selectedMetricId: "" as MetricCardId,
    activeDateTab: "Last 6 Month",
    startDate: "",
    endDate: "",
    tableRecords: [] as any[],
    tableColumns: [] as any[],
    totalCount: 0,
    page: 1,
    loading: false,
    error: null as string | null,
    // opportunity status IDs — fetched once on mount
    wonStatusId: null as number | null,
    lostStatusId: null as number | null,
    followUpStatusId: null as number | null,
    // banner stats — fetched once without any date filter
    bannerData: null as any,
    // developerId : null
    propertySearch: "",
    propertyProject: null as any,
    propertyType: [] as any[],
    propertyOfferType: null as any,
    propertyStatus: null as any,
    propertyCity: null as any,
    propertyArea: null as any,
    leadSearch: "",
    leadSource: null as any,
    leadStatus: null as any,
    leadType: null as any,
    inquirySearch: "",
    projectOptions: [] as any[],
    categoryOptions: [] as any[],
    cityOptions: [] as any[],
    areaOptions: [] as any[],
    leadSourceOptions: [] as any[],
    leadStatusOptions: [] as any[],
  });

  const selectedMetric =
    METRIC_CARDS.find((m) => m.id === state.selectedMetricId) ??
    METRIC_CARDS[13];

  // Fetch opportunity status IDs once on mount (same pattern as lead/list.tsx leadStatusList)
  useEffect(() => {
    getLeadStatusIds();
    getBannerData(); // no date filter — always shows all-time values in the banner
    projectList(1);
    categoryList(1);
    cityList(1);
    leadStatusList();
    leadSourceList();
  }, []);

  useEffect(() => {
    if (state.propertyCity?.value) {
      areaList(1);
    } else {
      setState({ areaOptions: [] });
    }
  }, [state.propertyCity]);

  useEffect(() => {
    getDashboradData();
  }, [state.activeDateTab, state.startDate, state.endDate]);

  useEffect(() => {
    const developerId = localStorage.getItem("userId");
    setState({
      developerId: developerId,
    });
  }, []);

  // dashboard api call

  const getDashboradData = async () => {
    try {
      const body = bodydata();

      const res: any = await Models.dashboard.dashboard(body);

      setState({
        dashboardData: res,
      });
    } catch (error) {
      console.log("dashboard error", error);
    }
  };

  // Fetch all opportunity statuses without pagination (same as lead/list.tsx leadStatusList)
  // Then find the IDs for Won, Lose, and Follow Up and store them in state
  const getLeadStatusIds = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      const results: any[] = res?.results ?? [];

      // lead/list.tsx uses: "Won", "Lose", "Follow Up" as the exact name strings
      const find = (name: string) =>
        results.find((item: any) => item.name === name)?.id ?? null;

      setState({
        wonStatusId: find("Won"),
        lostStatusId: find("Lose"),
        followUpStatusId: find("Follow Up"),
      });
    } catch (error) {
      console.log("getLeadStatusIds error:", error);
    }
  };

  // Fetch banner stats without any date filter so the KPI tiles always show
  // all-time values regardless of the selected date tab
  const getBannerData = async () => {
    try {
      const res: any = await Models.dashboard.dashboard({});
      setState({ bannerData: res });
    } catch (error) {
      console.log("getBannerData error:", error);
    }
  };

  // Filter dropdown's api --------------------------------

  const projectList = async (page) => {
    try {
      const userId = localStorage.getItem("userId");
      const body = {
        developer: userId,
      };
      const res: any = await Models.project.list(page, body);
      const droprdown = Dropdown(res?.results, "name");
      setState({
        projectOptions: droprdown,
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
          projectOptions: [...state.projectOptions, ...newOptions],
          projectNext: res.next,
          projectPage: state.projectPage + 1,
        });
      } else {
        setState({
          projectOptions: state.projectOptions,
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
        categoryOptions: droprdown,
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
          categoryOptions: [...state.categoryOptions, ...newOptions],
          categoryNext: res.next,
          categoryPage: state.categoryPage + 1,
        });
      } else {
        setState({
          categoryOptions: state.categoryOptions,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const cityList = async (page) => {
    try {
      const body: any = {};
      if (state.search) body.search = state.search;
      const res: any = await Models.city.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        cityOptions: droprdown,
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
          cityOptions: [...state.cityOptions, ...newOptions],
          cityNext: res.next,
          cityPage: state.cityPage + 1,
        });
      } else {
        setState({
          cityOptions: state.cityOptions,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const areaList = async (page) => {
    try {
      const body: any = {
        location: state.propertyCity?.value,
      };
      if (state.search) body.search = state.search;
      const res: any = await Models.area.list(page, body);
      const droprdown = Dropdown(res?.results, "name");

      setState({
        areaOptions: droprdown,
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

  const areaLoadMore = async () => {
    try {
      if (state.areaNext) {
        const res: any = await Models.area.list(state.areaPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          areaOptions: [...state.areaOptions, ...newOptions],
          areaNext: res.next,
          areaPage: state.areaPage + 1,
        });
      } else {
        setState({
          areaOptions: state.areaOptions,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const leadStatusList = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadStatusOptions: dropdownList,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const leadSourceList = async () => {
    try {
      const res: any = await Models.leadSource.list(1, { pagination: "No" });
      const dropdownList = Dropdown(res.results, "name");
      setState({
        leadSourceOptions: dropdownList,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  console.log("dashboardData", state.dashboardData);

  const bodydata = () => {
    const body: any = {};

    if (state.activeDateTab === "Custom") {
      if (state.startDate) {
        body.from_date = getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start;
      }

      if (state.endDate) {
        body.to_date = getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end;
      }
    } else if (state.activeDateTab && DATE_RANGES[state.activeDateTab]) {
      body.date_filter = DATE_RANGES[state.activeDateTab];
    }

    return body;
  };

  // Returns date filter params for individual card API calls.
  // When a preset tab is active sends date_filter, when Custom sends from_date + to_date.
  function getDateFilterBody(): Record<string, string> {
    if (state.activeDateTab === "Custom") {
      const params: Record<string, string> = {};
      if (state.startDate) params.from_date = toIso(state.startDate);
      if (state.endDate) params.to_date = toIso(state.endDate);
      return params;
    }
    if (state.activeDateTab && DATE_RANGES[state.activeDateTab]) {
      return { date_filter: DATE_RANGES[state.activeDateTab] };
    }
    return {};
  }

  function getCardFilterBody(metricId: MetricCardId): Record<string, any> {
    const body: Record<string, any> = {};
    const propertyMetric = [
      "total_properties",
      "sale_properties",
      "lease_properties",
      "approved_properties",
      "pending_properties",
    ].includes(metricId);
    const leadMetric = [
      "total_lead_list",
      "deal_won",
      "deal_lost",
      "follow_ups",
    ].includes(metricId);
    const inquiryMetric = ["booking_inquiries", "call_inquiries"].includes(
      metricId,
    );

    if (propertyMetric) {
      if (state.propertySearch) body.search = state.propertySearch;
      if (state.propertyProject) body.project = state.propertyProject.value;
      if (state.propertyType?.length)
        body.property_type = state.propertyType.map((item: any) => item.value);
      if (state.propertyOfferType)
        body.listing_type = state.propertyOfferType.value;
      if (state.propertyStatus) body.status = state.propertyStatus.value;
      if (state.propertyCity) body.city = state.propertyCity.value;
      if (state.propertyArea) body.area = state.propertyArea.value;
    }
    if (leadMetric) {
      if (state.leadSearch) body.search = state.leadSearch;
      if (state.leadSource) body.lead_source = state.leadSource.value;
      if (state.leadStatus) body.status = state.leadStatus.value;
      if (state.leadType?.value === "own") body.created_by = state.developerId;
      if (state.leadType?.value === "admin") body.team = true;
      if (state.leadType?.value === "website") body.website = true;
    }
    if (inquiryMetric && state.inquirySearch) body.search = state.inquirySearch;
    return body;
  }

  function getActiveFilters(
    metricId: MetricCardId,
  ): { label: string; onRemove: () => void }[] {
    const filters: { label: string; onRemove: () => void }[] = [];
    const add = (label: string, onRemove: () => void) =>
      filters.push({ label, onRemove });
    if (
      [
        "total_properties",
        "sale_properties",
        "lease_properties",
        "approved_properties",
        "pending_properties",
      ].includes(metricId)
    ) {
      if (state.propertySearch)
        add(`Search: ${state.propertySearch}`, () =>
          setState({ propertySearch: "" }),
        );
      if (state.propertyProject)
        add(`Project: ${state.propertyProject.label}`, () =>
          setState({ propertyProject: null }),
        );
      if (state.propertyType?.length)
        add(
          `Property Type: ${state.propertyType
            .map((item: any) => item.label)
            .join(", ")}`,
          () => setState({ propertyType: [] }),
        );
      if (state.propertyOfferType)
        add(`Offer: ${state.propertyOfferType.label}`, () =>
          setState({ propertyOfferType: null }),
        );
      if (state.propertyStatus)
        add(`Status: ${state.propertyStatus.label}`, () =>
          setState({ propertyStatus: null }),
        );
      if (state.propertyCity)
        add(`City: ${state.propertyCity.label}`, () =>
          setState({ propertyCity: null }),
        );
      if (state.propertyArea)
        add(`Area: ${state.propertyArea.label}`, () =>
          setState({ propertyArea: null }),
        );
    }
    if (
      ["total_lead_list", "deal_won", "deal_lost", "follow_ups"].includes(
        metricId,
      )
    ) {
      if (state.leadSearch)
        add(`Search: ${state.leadSearch}`, () => setState({ leadSearch: "" }));
      if (state.leadSource)
        add(`Lead Source: ${state.leadSource.label}`, () =>
          setState({ leadSource: null }),
        );
      if (state.leadStatus)
        add(`Status: ${state.leadStatus.label}`, () =>
          setState({ leadStatus: null }),
        );
      if (state.leadType)
        add(`Lead Type: ${state.leadType.label}`, () =>
          setState({ leadType: null }),
        );
    }
    if (
      ["booking_inquiries", "call_inquiries"].includes(metricId) &&
      state.inquirySearch
    ) {
      add(`Search: ${state.inquirySearch}`, () =>
        setState({ inquirySearch: "" }),
      );
    }
    return filters;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // LOAD TABLE DATA
  // Picks the right API + columns then updates state
  // ───────────────────────────────────────────────────────────────────────────

  async function loadTableData(metricId: MetricCardId, page: number) {
    // if (NO_API_CARDS.includes(metricId)) {
    //   setState({ tableRecords: [], tableColumns: [], totalCount: 0, loading: false, error: null });
    //   return;
    // }

    setState({ loading: true, error: null });

    try {
      let result = { count: 0, results: [] as any[] };

      if (metricId === "total_properties")
        result = await getTotalProperties(page);
      else if (metricId === "sale_properties")
        result = await getSaleProperties(page);
      else if (metricId === "lease_properties")
        result = await getLeaseProperties(page);
      else if (metricId === "approved_properties")
        result = await getApprovedProperties(page);
      else if (metricId === "pending_properties")
        result = await getPendingProperties(page);
      else if (metricId === "total_projects")
        result = await getTotalProjects(page);
      else if (metricId === "total_lead_list")
        result = await getTotalLeads(page);
      else if (metricId === "deal_won") result = await getDealWon(page);
      else if (metricId === "deal_lost") result = await getDealLost(page);
      else if (metricId === "follow_ups") result = await getFollowUps(page);
      else if (metricId === "booking_inquiries")
        result = await getBookingInquiries(page);
      else if (metricId === "call_inquiries")
        result = await getCallInquiries(page);
      else if (metricId === "conversion_rate")
        result = await getConversionRate(page);
      else if (metricId === "high_demand_projects")
        result = await getHighDemandPro(page);
      else if (metricId === "low_demand_projects")
        result = await getLowDemandPro(page);

      setState({
        tableRecords: result.results,
        tableColumns: getColumnsForMetric(metricId),
        totalCount: result.count,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.log("loadTableData error:", error);
      setState({
        tableRecords: [],
        tableColumns: [],
        totalCount: 0,
        loading: false,
        error: error?.message ?? "Failed to load data. Please try again.",
      });
    }
  }

  // API CALLS — each has its own try/catch
  // Each .map() is EXACT copy from the corresponding source page's list function

  // 1. Total Properties
  // Source: property/list.tsx → propertyList() .map()
  async function getTotalProperties(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("total_properties"),
        from_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item: any) => ({
        publish: item?.publish == true ? "Published" : "Draft",
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        total_area: item?.total_area,
        property_type:
          item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
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
        built_up_area: item?.built_up_area,
        is_approved: item?.is_approved,
        image:
          item?.primary_image ??
          "/assets/images/real-estate/property-info-img1.png",
        industry_name: item?.developer?.industry,
        total_unit: item?.total_unit,
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalProperties error:", error);
      throw error;
    }
  }

  // 2. Sale Properties
  async function getSaleProperties(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("sale_properties"),
        listing_type: "sale",
        from_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item: any) => ({
        publish: item?.publish == true ? "Published" : "Draft",
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        property_type:
          item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color: "secondary",
        },
        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name,
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
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
        total_unit: item?.total_unit,
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getSaleProperties error:", error);
      throw error;
    }
  }

  // 3. Lease Properties
  async function getLeaseProperties(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("lease_properties"),
        listing_type: "lease",
        from_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };

      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item: any) => ({
        publish: item?.publish == true ? "Published" : "Draft",
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        property_type:
          item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color: "info",
        },
        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name,
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
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
        total_unit: item?.total_unit,
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getLeaseProperties error:", error);
      throw error;
    }
  }

  // 4. Approved Properties
  async function getApprovedProperties(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("approved_properties"),
        is_approved: "Yes",
        from_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };

      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item: any) => ({
        publish: item?.publish == true ? "Published" : "Draft",
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        property_type:
          item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color:
            item?.listing_type == LISTING_TYPE_LIST.SALE ? "secondary" : "info",
        },
        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name,
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
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
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getApprovedProperties error:", error);
      throw error;
    }
  }

  // 5. Pending Properties
  async function getPendingProperties(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("pending_properties"),
        is_approved: "No",
        from_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_created_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };

      const res: any = await Models.property.list(page, body);
      const data = res?.results?.map((item: any) => ({
        publish: item?.publish == true ? "Published" : "Draft",
        title: capitalizeFLetter(item?.title),
        status: capitalizeFLetter(item?.status),
        id: item?.id,
        property_type:
          item?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        listing_type: {
          type: capitalizeFLetter(item?.listing_type),
          color:
            item?.listing_type == LISTING_TYPE_LIST.SALE ? "secondary" : "info",
        },
        date: commonDateFormat(item?.created_at),
        location: capitalizeFLetter(item?.city),
        developer: `${capitalizeFLetter(
          item?.developer?.first_name,
        )} ${capitalizeFLetter(item?.developer?.last_name)}`,
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
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getPendingProperties error:", error);
      throw error;
    }
  }

  // 6. Total Projects
  // Source: project/list.tsx → projectList() .map()
  async function getTotalProjects(page: number) {
    try {
      const body = {
        developer: state.developerId,
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item: any) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
        properties: item?.property_count,
        project: item?.project?.name,
        description: item?.description,
        developer: item?.developer?.industry || "-",
        property_type_counts: item?.property_type_counts || [],
        city: item?.location || "-",
        area: item?.area || "-",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalProjects error:", error);
      throw error;
    }
  }

  // 7. Total Leads
  // Source: lead/list.tsx → leadPropertyList() .map()
  async function getTotalLeads(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("total_lead_list"),
        created_after: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        created_before: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.lead.lead_properties(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.lead_details?.id,
        customer_name: item?.lead_details?.full_name,
        property_lead_id: item?.id,
        inquiry: item?.inquiry_details,
        property_id: item?.property,
        property_title: item?.title,
        property_image: item?.primary_image,
        property_city: item?.city,
        property_area: item?.lead_details?.area_details?.name,
        property_listing_type: item?.listing_type,
        property_status: item?.status,
        property_type:
          item?.lead_details?.properties_details
            ?.find((p: any) => p?.id === item?.property)
            ?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        project: item?.project_name,
        price_range: {
          minimum_price: item?.minimum_price,
          maximum_price: item?.maximum_price,
        },
        built_up_area: item?.built_up_area,
        full_name: item?.lead_details?.full_name,
        email: item?.lead_details?.email,
        lead_source: item?.lead_details?.lead_source_info,
        opportunity_status: item?.opportunity_status_details?.name,
        status: item?.lead_details?.status_info,
        date: commonDateFormat(item?.created_at),
        requirements: item?.lead_details?.requirements,
        assigned_to: item?.lead_details?.assigned_to_details
          ? `${item?.lead_details?.assigned_to_details?.first_name} ${item?.lead_details?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.lead_details?.assigned_by_details
          ? `${item?.lead_details?.assigned_by_details?.first_name} ${item?.lead_details?.assigned_by_details?.last_name}`
          : "",
        company_name: item?.lead_details?.company_name,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalLeads error:", error);
      throw error;
    }
  }

  // 8. Deal Won  (status = won)
  async function getDealWon(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("deal_won"),
        from_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        // Use the ID fetched from Models.leadStatus.list (same pattern as lead/list.tsx)
        // Status name in the API is "Won"
        ...(state.wonStatusId != null
          ? { status: state.wonStatusId }
          : { status: "won" }),
        ...getDateFilterBody(),
      };
      const res: any = await Models.lead.lead_properties(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.lead_details?.id,
        customer_name: item?.lead_details?.full_name,
        property_lead_id: item?.id,
        inquiry: item?.inquiry_details,
        property_id: item?.property,
        property_title: item?.title,
        property_image: item?.primary_image,
        property_city: item?.city,
        property_area: item?.lead_details?.area_details?.name,
        property_listing_type: item?.listing_type,
        property_status: item?.status,
        property_type:
          item?.lead_details?.properties_details
            ?.find((p: any) => p?.id === item?.property)
            ?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        project: item?.project_name,
        price_range: {
          minimum_price: item?.minimum_price,
          maximum_price: item?.maximum_price,
        },
        built_up_area: item?.built_up_area,
        full_name: item?.lead_details?.full_name,
        email: item?.lead_details?.email,
        lead_source: item?.lead_details?.lead_source_info,
        opportunity_status: item?.opportunity_status_details?.name,
        status: item?.lead_details?.status_info,
        date: commonDateFormat(item?.created_at),
        requirements: item?.lead_details?.requirements,
        assigned_to: item?.lead_details?.assigned_to_details
          ? `${item?.lead_details?.assigned_to_details?.first_name} ${item?.lead_details?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.lead_details?.assigned_by_details
          ? `${item?.lead_details?.assigned_by_details?.first_name} ${item?.lead_details?.assigned_by_details?.last_name}`
          : "",
        company_name: item?.lead_details?.company_name,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getDealWon error:", error);
      throw error;
    }
  }

  // 9. Deal Lost  (status = lost)
  async function getDealLost(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("deal_lost"),
        from_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        // Status name in the API is "Lose" (as used in lead/list.tsx opp_status.lose)
        ...(state.lostStatusId != null
          ? { status: state.lostStatusId }
          : { status: "lost" }),
        ...getDateFilterBody(),
      };
      const res: any = await Models.lead.lead_properties(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.lead_details?.id,
        customer_name: item?.lead_details?.full_name,
        property_lead_id: item?.id,
        inquiry: item?.inquiry_details,
        property_id: item?.property,
        property_title: item?.title,
        property_image: item?.primary_image,
        property_city: item?.city,
        property_area: item?.lead_details?.area_details?.name,
        property_listing_type: item?.listing_type,
        property_status: item?.status,
        property_type:
          item?.lead_details?.properties_details
            ?.find((p: any) => p?.id === item?.property)
            ?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        project: item?.project_name,
        price_range: {
          minimum_price: item?.minimum_price,
          maximum_price: item?.maximum_price,
        },
        built_up_area: item?.built_up_area,
        full_name: item?.lead_details?.full_name,
        email: item?.lead_details?.email,
        lead_source: item?.lead_details?.lead_source_info,
        opportunity_status: item?.opportunity_status_details?.name,
        status: item?.lead_details?.status_info,
        date: commonDateFormat(item?.created_at),
        requirements: item?.lead_details?.requirements,
        assigned_to: item?.lead_details?.assigned_to_details
          ? `${item?.lead_details?.assigned_to_details?.first_name} ${item?.lead_details?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.lead_details?.assigned_by_details
          ? `${item?.lead_details?.assigned_by_details?.first_name} ${item?.lead_details?.assigned_by_details?.last_name}`
          : "",
        company_name: item?.lead_details?.company_name,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getDealLost error:", error);
      throw error;
    }
  }

  // 10. Follow Ups  (status = follow_up)
  async function getFollowUps(page: number) {
    try {
      const body = {
        developer: state.developerId,
        ...getCardFilterBody("follow_ups"),
        from_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_opportunity_status_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        // Status name in the API is "Follow Up" (as used in lead/list.tsx opp_status.follow_up)
        ...(state.followUpStatusId != null
          ? { status: state.followUpStatusId }
          : { status: "follow_up" }),
        ...getDateFilterBody(),
      };
      const res: any = await Models.lead.lead_properties(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.lead_details?.id,
        customer_name: item?.lead_details?.full_name,
        property_lead_id: item?.id,
        inquiry: item?.inquiry_details,
        property_id: item?.property,
        property_title: item?.title,
        property_image: item?.primary_image,
        property_city: item?.city,
        property_area: item?.lead_details?.area_details?.name,
        property_listing_type: item?.listing_type,
        property_status: item?.status,
        property_type:
          item?.lead_details?.properties_details
            ?.find((p: any) => p?.id === item?.property)
            ?.property_type?.map((pt: any) => capitalizeFLetter(pt?.name)) ||
          [],
        project: item?.project_name,
        price_range: {
          minimum_price: item?.minimum_price,
          maximum_price: item?.maximum_price,
        },
        built_up_area: item?.built_up_area,
        full_name: item?.lead_details?.full_name,
        email: item?.lead_details?.email,
        lead_source: item?.lead_details?.lead_source_info,
        opportunity_status: item?.opportunity_status_details?.name,
        status: item?.lead_details?.status_info,
        date: commonDateFormat(item?.created_at),
        requirements: item?.lead_details?.requirements,
        assigned_to: item?.lead_details?.assigned_to_details
          ? `${item?.lead_details?.assigned_to_details?.first_name} ${item?.lead_details?.assigned_to_details?.last_name}`
          : "",
        assigned_by: item?.lead_details?.assigned_by_details
          ? `${item?.lead_details?.assigned_by_details?.first_name} ${item?.lead_details?.assigned_by_details?.last_name}`
          : "",
        company_name: item?.lead_details?.company_name,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getFollowUps error:", error);
      throw error;
    }
  }

  // 11. Booking Inquiries
  // Source: dev_booking_inquiry_list.tsx → leadList() .map()
  async function getBookingInquiries(page: number) {
    try {
      const body = {
        developer_user: state.developerId,
        ...getCardFilterBody("booking_inquiries"),
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.inquiry.booking_inquiry(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        email: item?.email,
        phone: item?.phone_number,
        message: item?.message,
        property: item?.property_details ?? null,
        created_at: commonDateFormat(item?.created_at),
        interested_area: item?.search,
        schedule_date_time: item?.schedule_date_time
          ? moment(item?.schedule_date_time).format("DD-MM-YYYY")
          : null,
        created_date: item?.created_at
          ? moment(item?.created_at).format("DD-MM-YYYY")
          : null,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getBookingInquiries error:", error);
      throw error;
    }
  }

  // 12. Call Inquiries
  // Source: dev_call_inquiry_list.tsx → leadList() .map()
  async function getCallInquiries(page: number) {
    try {
      const body = {
        developer_user: state.developerId,
        ...getCardFilterBody("call_inquiries"),
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
      };
      const res: any = await Models.inquiry.callback(page, body);
      const data = res?.results?.map((item: any) => ({
        id: item?.id,
        email: item?.email,
        phone: item?.phone_number,
        message: item?.message,
        property: item?.property_details ?? null,
        created_at: commonDateFormat(item?.created_at),
        interested_area: item?.search,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getCallInquiries error:", error);
      throw error;
    }
  }

  // 6. Total Projects
  // Source: project/list.tsx → projectList() .map()
  async function getConversionRate(page: number) {
    try {
      const body = {
        developer: state.developerId,
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        has_conversion_rate: true,
      };
      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item: any) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
        properties: item?.property_count,
        project: item?.project?.name,
        description: item?.description,
        developer: item?.developer?.industry || "-",
        property_type_counts: item?.property_type_counts || [],
        city: item?.location || "-",
        area: item?.area || "-",
        min_price: item?.min_price || "-",
        max_price: item?.max_price || "-",
        lead_conversion_rate: item?.lead_conversion_rate,
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalProjects error:", error);
      throw error;
    }
  }

  async function getHighDemandPro(page: number) {
    try {
      const body = {
        developer: state.developerId,
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        demand_status: "high",
      };
      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item: any) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
        properties: item?.property_count,
        project: item?.project?.name,
        description: item?.description,
        developer: item?.developer?.industry || "-",
        property_type_counts: item?.property_type_counts || [],
        city: item?.location || "-",
        area: item?.area || "-",
        min_price: item?.min_price || "-",
        max_price: item?.max_price || "-",
        callback_count: item?.callback_count || "-",
        booking_inquiry_count: item?.booking_inquiry_count || "-",
        lead_count: item?.lead_count || "-",
        demand: "High",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalProjects error:", error);
      throw error;
    }
  }

  async function getLowDemandPro(page: number) {
    try {
      const body = {
        developer: state.developerId,
        from_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).start,
        to_date: getDateRange(
          state.activeDateTab,
          state.startDate,
          state.endDate,
        ).end,
        demand_status: "low",
      };
      const res: any = await Models.project.list(page, body);
      const data = res?.results?.map((item: any) => ({
        name: item?.name,
        location: item?.location,
        status: item?.status,
        id: item?.id,
        properties: item?.property_count,
        project: item?.project?.name,
        description: item?.description,
        developer: item?.developer?.industry || "-",
        property_type_counts: item?.property_type_counts || [],
        city: item?.location || "-",
        area: item?.area || "-",
        min_price: item?.min_price || "-",
        max_price: item?.max_price || "-",
        callback_count: item?.callback_count || "-",
        booking_inquiry_count: item?.booking_inquiry_count || "-",
        lead_count: item?.lead_count || "-",
        demand: "Low",
      }));
      return { count: res?.count ?? 0, results: data ?? [] };
    } catch (error) {
      console.log("getTotalProjects error:", error);
      throw error;
    }
  }

  // Returns the right column set for the selected card
  function getColumnsForMetric(metricId: MetricCardId): any[] {
    if (
      [
        "total_properties",
        "sale_properties",
        "lease_properties",
        "approved_properties",
        "pending_properties",
      ].includes(metricId)
    ) {
      return getPropertyColumns();
    }
    if (metricId === "total_projects") {
      return getProjectColumns();
    }
    if (
      ["total_lead_list", "deal_won", "deal_lost", "follow_ups"].includes(
        metricId,
      )
    ) {
      return getLeadColumns();
    }
    if (metricId === "booking_inquiries") {
      return getBookingInquiryColumns();
    }
    if (metricId === "call_inquiries") {
      return getCallInquiryColumns();
    }
    if (metricId === "conversion_rate") {
      return getConverRateColumns();
    }
    if (metricId === "high_demand_projects") {
      return getHighDemandColumns();
    }
    if (metricId === "low_demand_projects") {
      return getLowDemandColumns();
    }
    return [];
  }

  // COLUMN DEFINITIONS
  // Each function returns the EXACT column array from the corresponding page.

  // ── 1. PROPERTY COLUMNS ────────────────────────────────────────────────────
  // Source: pages/real-estate/property/list.tsx → tableColumns
  function getPropertyColumns() {
    return [
      {
        accessor: "title",
        title: "Property Name",
        sortable: true,
        render: (row: any) => (
          <div className="relative">
            <div
              className="flex cursor-pointer gap-3"
              onClick={() =>
                router.push(`/real-estate/property/detail/${row?.id}`)
              }
              onMouseEnter={(e) => {
                const rect = (
                  e.currentTarget as HTMLElement
                ).getBoundingClientRect();
                setTooltip({ row, x: rect.left, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
            >
              <div className="flex flex-col justify-between">
                <div className="flex cursor-pointer gap-3 text-sm">
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
        ),
      },
      {
        accessor: "project",
        title: "Project",
        sortable: true,
        render: (row: any) => (
          <span title={row.project}>{row.project || "-"}</span>
        ),
      },
      {
        accessor: "price",
        title: "Price Range",
      },
      {
        accessor: "built_up_area",
        title: "Sq.ft",
      },
      {
        accessor: "property_type",
        title: "Property Type",
        render: (row: any) => {
          const property_type = row.property_type;
          if (!property_type || property_type?.length === 0) {
            return <span>-</span>;
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
        title: "City",
        sortable: true,
        render: (row: any) => <span>{row.city?.name || row.city || "-"}</span>,
      },
      {
        accessor: "area",
        title: "Area",
        sortable: true,
        render: (row: any) => <span>{row.area?.name || row.area || "-"}</span>,
      },
      {
        accessor: "action",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/property/detail/${row?.id}`)
              }
              title="View"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
            <button
              className="flex text-primary"
              onClick={() =>
                router.push(`/real-estate/property/update/${row?.id}`)
              }
              title="Edit"
            >
              <IconEdit className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 2. PROJECT COLUMNS ─────────────────────────────────────────────────────
  // Source: pages/real-estate/project/list.tsx → DataTable columns prop
  function getProjectColumns() {
    return [
      {
        accessor: "name",
        title: "Project Name",
        sortable: true,
        render: (row: any) => (
          <div className="flex flex-col gap-0.5">
            <span
              className="cursor-pointer font-medium"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
            >
              {row.name}
            </span>
          </div>
        ),
      },
      {
        accessor: "properties",
        title: "Properties",
        render: (row: any) => (
          <span
            className="cursor-pointer"
            onClick={() => router.push(`/real-estate/project/view/${row?.id}`)}
          >
            {row.properties}
          </span>
        ),
      },
      {
        accessor: "city",
        title: "City",
        sortable: true,
        render: (row: any) => <span>{row.city?.name || row.city || "-"}</span>,
      },
      {
        accessor: "area",
        title: "Area",
        sortable: true,
        render: (row: any) => <span>{row.area?.name || row.area || "-"}</span>,
      },
      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 3. LEAD COLUMNS ────────────────────────────────────────────────────────
  // Source: pages/real-estate/lead/list.tsx → const columns
  function getLeadColumns() {
    return [
      {
        accessor: "full_name",
        title: "Lead Name",
        sortable: true,
        render: (row: any) => (
          <div
            onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}
            className="cursor-pointer text-sm font-medium hover:underline"
          >
            {row?.full_name || "-"}
          </div>
        ),
      },
      {
        accessor: "property_title",
        title: "Property Name",
        sortable: true,
        render: (row: any) => (
          <div
            className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
            onClick={() =>
              router.push(`/real-estate/property/detail/${row?.property_id}`)
            }
            title={row?.property_title}
          >
            {row?.property_title || "-"}
          </div>
        ),
      },
      {
        accessor: "project",
        title: "Project",
        sortable: true,
        render: (row: any) => <span>{row?.project || "-"}</span>,
      },
      {
        accessor: "lead_source",
        title: "Lead Source",
        sortable: true,
        render: (row: any) => {
          const source = row?.lead_source?.name;
          return (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                ${
                  source === "Website"
                    ? "bg-green-100 text-green-700"
                    : source === "Social Media"
                    ? "bg-blue-100 text-blue-700"
                    : source === "Referral"
                    ? "bg-purple-100 text-purple-700"
                    : source === "Walk In"
                    ? "bg-yellow-100 text-yellow-700"
                    : source === "Cold Call"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {source || "-"}
            </span>
          );
        },
      },
      {
        accessor: "opportunity_status",
        title: "Lead Status",
        sortable: true,
        render: (row: any) => {
          const status = row?.opportunity_status;
          const config = (statusChipConfig as any)?.[status];
          return (
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium
                ${config?.bg || "bg-gray-100"} ${
                config?.text || "text-gray-600"
              }`}
            >
              {status || "-"}
            </span>
          );
        },
      },
      {
        accessor: "date",
        title: "Date",
        sortable: true,
        render: (row: any) => (
          <div className="text-sm font-medium">{row?.date || "-"}</div>
        ),
      },
      {
        accessor: "action",
        title: "Actions",
        textAlign: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() => router.push(`/real-estate/lead/view/${row?.id}`)}
              title="View Lead Details"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 4. BOOKING INQUIRY COLUMNS ─────────────────────────────────────────────
  // Source: pages/real-estate/inquiry/dev_booking_inquiry_list.tsx → const columns
  function getBookingInquiryColumns() {
    return [
      {
        accessor: "email",
        title: "Type",
        sortable: true,
        render: (row: any) => (
          <div
            onClick={() =>
              router.push(
                `/real-estate/inquiry/view_booking_inquiry/${row?.id}`,
              )
            }
            className="cursor-pointer"
          >
            <div>{row?.property ? "Property" : "General"}</div>
          </div>
        ),
      },
      {
        accessor: "property",
        title: "Property",
        sortable: true,
        render: (row: any) => (
          <div
            className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
            onClick={() =>
              router.push(`/real-estate/property/detail/${row?.property?.id}`)
            }
          >
            {row?.property ? row?.property?.title : "-"}
          </div>
        ),
      },
      {
        accessor: "phone",
        title: "Phone",
        sortable: true,
      },
      {
        accessor: "email",
        title: "Email",
        sortable: true,
      },
      {
        accessor: "schedule_date_time",
        title: "Schedule Date",
        sortable: true,
        render: (row: any) => (
          <div className="w-fit cursor-pointer">
            <div>{row?.schedule_date_time || "-"}</div>
          </div>
        ),
      },
      {
        accessor: "created_date",
        title: "Created Date",
        sortable: true,
        width: 150,
        render: (row: any) => (
          <div className="w-fit cursor-pointer">
            <div>{row?.created_date || "-"}</div>
          </div>
        ),
      },
      {
        accessor: "message",
        title: "Message",
        sortable: true,
        width: 150,
        render: (row: any) => (
          <Tippy
            content={row?.message || "-"}
            placement="top"
            className="rounded-lg bg-black p-1 text-sm text-white"
          >
            <div className="cursor-default">
              {row?.message?.length > 20
                ? `${capitalizeFLetter(row.message.slice(0, 15))}...`
                : capitalizeFLetter(row?.message) || "-"}
            </div>
          </Tippy>
        ),
      },
      {
        accessor: "action",
        title: "Actions",
        textAlign: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(
                  `/real-estate/inquiry/view_booking_inquiry/${row?.id}`,
                )
              }
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 5. CALL INQUIRY COLUMNS ────────────────────────────────────────────────
  // Source: pages/real-estate/inquiry/dev_call_inquiry_list.tsx → const columns
  function getCallInquiryColumns() {
    return [
      {
        accessor: "email",
        title: "Type",
        sortable: true,
        render: (row: any) => (
          <div
            onClick={() =>
              router.push(`/real-estate/inquiry/view_call_inquiry/${row?.id}`)
            }
            className="cursor-pointer"
          >
            <div>{row?.property ? "Property" : "General"}</div>
          </div>
        ),
      },
      {
        accessor: "property",
        title: "Property",
        sortable: true,
        render: (row: any) => (
          <div
            className="cursor-pointer text-sm font-medium text-[#9b0f09] hover:underline"
            onClick={() =>
              router.push(`/real-estate/property/detail/${row?.property?.id}`)
            }
          >
            {row?.property ? row?.property?.title : "-"}
          </div>
        ),
      },
      {
        accessor: "phone",
        title: "Phone",
        sortable: true,
      },
      {
        accessor: "email",
        title: "Email",
        sortable: true,
      },
      {
        accessor: "created_at",
        title: "Created Date",
        sortable: true,
        width: 150,
        render: (row: any) => (
          <div className="w-fit cursor-pointer">
            <div>{row?.created_at || "-"}</div>
          </div>
        ),
      },
      {
        accessor: "message",
        title: "Message",
        sortable: true,
        width: 150,
        render: (row: any) => (
          <Tippy
            content={row?.message || "-"}
            placement="top"
            className="rounded-lg bg-black p-1 text-sm text-white"
          >
            <div className="cursor-default">
              {row?.message?.length > 20
                ? `${capitalizeFLetter(row.message.slice(0, 15))}...`
                : capitalizeFLetter(row?.message) || "-"}
            </div>
          </Tippy>
        ),
      },
      {
        accessor: "action",
        title: "Actions",
        textAlign: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/inquiry/view_call_inquiry/${row?.id}`)
              }
              title="View"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 6. Conversion rate COLUMNS ────────────────────────────────────────────────

  function getConverRateColumns() {
    return [
      {
        accessor: "name",
        title: "Project Name",
        sortable: true,
        render: (row: any) => (
          <div className="flex flex-col gap-0.5">
            <span
              className="cursor-pointer font-medium"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
            >
              {row.name}
            </span>
          </div>
        ),
      },
      {
        accessor: "properties",
        title: "Properties",
        render: (row: any) => (
          <span
            className="cursor-pointer"
            onClick={() => router.push(`/real-estate/project/view/${row?.id}`)}
          >
            {row.properties}
          </span>
        ),
      },
      {
        accessor: "city",
        title: "City",
        sortable: true,
        render: (row: any) => <span>{row.city?.name || row.city || "-"}</span>,
      },
      {
        accessor: "area",
        title: "Area",
        sortable: true,
        render: (row: any) => <span>{row.area?.name || row.area || "-"}</span>,
      },

      {
        accessor: "min_price",
        title: "Min Price",
        sortable: true,
        render: (row: any) => (
          <span>₹{row.min_price.toLocaleString("en-IN") || "-"}</span>
        ),
      },

      {
        accessor: "max_price",
        title: "Max Price",
        sortable: true,
        render: (row: any) => (
          <span>₹{row.max_price.toLocaleString("en-IN") || "-"}</span>
        ),
      },

      {
        accessor: "lead_conversion_rate",
        title: "Lead conversion rate",
        sortable: true,
        render: (row: any) => (
          <span>
            {row.lead_conversion_rate ? `${row.lead_conversion_rate}%` : "-"}
          </span>
        ),
      },

      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 7. High demand COLUMNS ────────────────────────────────────────────────

  function getHighDemandColumns() {
    return [
      {
        accessor: "name",
        title: "Project Name",
        sortable: true,
        render: (row: any) => (
          <div className="flex flex-col gap-0.5">
            <span
              className="cursor-pointer font-medium"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
            >
              {row.name}
            </span>
          </div>
        ),
      },
      {
        accessor: "properties",
        title: "Properties",
        render: (row: any) => (
          <span
            className="cursor-pointer"
            onClick={() => router.push(`/real-estate/project/view/${row?.id}`)}
          >
            {row.properties}
          </span>
        ),
      },
      {
        accessor: "city",
        title: "City",
        sortable: true,
        render: (row: any) => <span>{row.city?.name || row.city || "-"}</span>,
      },
      {
        accessor: "area",
        title: "Area",
        sortable: true,
        render: (row: any) => <span>{row.area?.name || row.area || "-"}</span>,
      },
      {
        accessor: "callback_count",
        title: "Call Inquiries",
        sortable: true,
        render: (row: any) => <span>{row.callback_count || "-"}</span>,
      },
      {
        accessor: "booking_inquiry_count",
        title: "Booking Inquiries",
        sortable: true,
        render: (row: any) => <span>{row.booking_inquiry_count || "-"}</span>,
      },
      {
        accessor: "lead_count",
        title: "Lead",
        sortable: true,
        render: (row: any) => <span>{row.lead_count || "-"}</span>,
      },
      {
        accessor: "demand",
        title: "Demand",
        sortable: true,
        render: (row: any) => {
          const status = row?.demand;
          const config = (statusChipConfig as any)?.[status];
          return row?.demand == "High" ? (
            <span
              className={`inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-medium `}
            >
              {status || "-"}
            </span>
          ) : (
            <span
              className={`inline-flex items-center rounded-full bg-red-200 px-3 py-1 text-xs font-medium `}
            >
              {status || "-"}
            </span>
          );
        },
      },
      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
    ];
  }

  // ── 8. Low demand COLUMNS ────────────────────────────────────────────────

  function getLowDemandColumns() {
    return [
      {
        accessor: "name",
        title: "Project Name",
        sortable: true,
        render: (row: any) => (
          <div className="flex flex-col gap-0.5">
            <span
              className="cursor-pointer font-medium"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
            >
              {row.name}
            </span>
          </div>
        ),
      },
      {
        accessor: "properties",
        title: "Properties",
        render: (row: any) => (
          <span
            className="cursor-pointer"
            onClick={() => router.push(`/real-estate/project/view/${row?.id}`)}
          >
            {row.properties}
          </span>
        ),
      },
      {
        accessor: "city",
        title: "City",
        sortable: true,
        render: (row: any) => <span>{row.city?.name || row.city || "-"}</span>,
      },
      {
        accessor: "area",
        title: "Area",
        sortable: true,
        render: (row: any) => <span>{row.area?.name || row.area || "-"}</span>,
      },
      {
        accessor: "actions",
        title: "Actions",
        textAlignment: "center",
        render: (row: any) => (
          <div className="mx-auto flex w-max items-center gap-4">
            <button
              className="text-dred flex"
              onClick={() =>
                router.push(`/real-estate/project/view/${row?.id}`)
              }
              title="View Details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        ),
      },
      {
        accessor: "callback_count",
        title: "Call Inquiries",
        sortable: true,
        render: (row: any) => <span>{row.callback_count || "-"}</span>,
      },
      {
        accessor: "booking_inquiry_count",
        title: "Booking Inquiries",
        sortable: true,
        render: (row: any) => <span>{row.booking_inquiry_count || "-"}</span>,
      },
      {
        accessor: "lead_count",
        title: "Lead",
        sortable: true,
        render: (row: any) => <span>{row.lead_count || "-"}</span>,
      },
      {
        accessor: "demand",
        title: "Demand",
        sortable: true,
        render: (row: any) => {
          const status = row?.demand;
          const config = (statusChipConfig as any)?.[status];
          return row?.demand == "High" ? (
            <span
              className={`inline-flex items-center rounded-full bg-green-200 px-3 py-1 text-xs font-medium `}
            >
              {status || "-"}
            </span>
          ) : (
            <span
              className={`inline-flex items-center rounded-full bg-red-200 px-3 py-1 text-xs font-medium `}
            >
              {status || "-"}
            </span>
          );
        },
      },
    ];
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ───────────────────────────────────────────────────────────────────────────

  function clearCardFilters() {
    setState({
      propertySearch: '',
      propertyProject: null,
      propertyType: [],
      propertyOfferType: null,
      propertyStatus: null,
      propertyCity: null,
      propertyArea: null,
      leadSearch: '',
      leadSource: null,
      leadStatus: null,
      leadType: null,
      inquirySearch: '',
    });
  }

  function handleCardSelect(id: MetricCardId) {
    clearCardFilters();
    setState({ selectedMetricId: id, page: 1 });
  }

  function handleDrillDownClose() {
    setState({
      selectedMetricId: "" as MetricCardId,
      tableRecords: [],
      tableColumns: [],
      totalCount: 0,
      page: 1,
      loading: false,
      error: null,
    });
  }
  function handleDateTabClick(tab: string) {
    setState({
      activeDateTab: tab,
      ...(tab !== "Custom" ? { startDate: "", endDate: "" } : {}),
      page: 1,
    });
  }

  function handleCustomDateChange(start: string, end: string) {
    setState({ startDate: start, endDate: end, page: 1 });
  }

  // Paginations component calls this with the new page number
  function handlePageChange(newPage: number) {
    setState({ page: newPage });
    loadTableData(state.selectedMetricId, newPage);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // EFFECT — re-fetch when card or dates change
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadTableData(state.selectedMetricId, 1);
    setState({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.startDate,
    state.endDate,
    state.activeDateTab,
    state.selectedMetricId,
    state.propertySearch,
    state.propertyProject,
    state.propertyType,
    state.propertyOfferType,
    state.propertyStatus,
    state.propertyCity,
    state.propertyArea,
    state.leadSearch,
    state.leadSource,
    state.leadStatus,
    state.leadType,
    state.inquirySearch,
  ]);

  function renderCardFilters() {
    const propertyMetric = [
      "total_properties",
      "sale_properties",
      "lease_properties",
      "approved_properties",
      "pending_properties",
    ].includes(state.selectedMetricId);
    const leadMetric = [
      "total_lead_list",
      "deal_won",
      "deal_lost",
      "follow_ups",
    ].includes(state.selectedMetricId);
    const inquiryMetric = ["booking_inquiries", "call_inquiries"].includes(
      state.selectedMetricId,
    );
    if (!propertyMetric && !leadMetric && !inquiryMetric) return null;

    return (
      <div className="mb-3  flex items-center justify-start gap-5">
        {propertyMetric && (
          <>
            <TextInput
              type="text"
              placeholder="Search properties"
              value={state.propertySearch}
              onChange={(e: any) =>
                setState({ propertySearch: e.target.value })
              }
            />
            <CustomSelect
              placeholder="Project"
              value={state.propertyProject}
              onChange={(value: any) => setState({ propertyProject: value })}
              options={state.projectOptions}
              loadMore={() => projectListLoadMore()}
              isClearable
            />
            <CustomSelect
              placeholder="Property Type"
              value={state.propertyType}
              onChange={(value: any) => setState({ propertyType: value || [] })}
              options={state.categoryOptions}
              isMulti
              isClearable
              loadMore={() => catListLoadMore()}
            />
            {/* {(state.selectedMetricId == "total_properties" || state.selectedMetricId == "approved_properties" || state.selectedMetricId == "pending_properties" ) &&
             <CustomSelect
              placeholder="Offer Type"
              value={state.propertyOfferType}
              onChange={(value: any) => setState({ propertyOfferType: value })}
              options={[
                { value: "sale", label: "Sale" },
                { value: "lease", label: "Lease" },
                { value: "rent", label: "Rent" },
              ]}
              isClearable
            />}
           { (state.selectedMetricId == "total_properties" || state.selectedMetricId == "sale_properties" || state.selectedMetricId == "lease_properties" ) && <CustomSelect
              placeholder="Property Status"
              value={state.propertyStatus}
              onChange={(value: any) => setState({ propertyStatus: value })}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              isClearable
            />} */}
            <CustomSelect
              placeholder="City"
              value={state.propertyCity}
              onChange={(value: any) =>
                setState({ propertyCity: value, propertyArea: null })
              }
              options={state.cityOptions}
              loadMore={() => cityLoadMore()}
              isClearable
            />
            <CustomSelect
              placeholder="Area"
              value={state.propertyArea}
              onChange={(value: any) => setState({ propertyArea: value })}
              options={state.areaOptions}
              isClearable
              disabled={!state.propertyCity}
              loadMore={() => areaLoadMore()}
            />
          </>
        )}
        {leadMetric && (
          <>
            <TextInput
              type="text"
              placeholder="Search leads"
              value={state.leadSearch}
              onChange={(e: any) => setState({ leadSearch: e.target.value })}
              className="w-[500px]"
              parentClass="w-[500px]"
            />
            <CustomSelect
              placeholder="Lead Source"
              value={state.leadSource}
              onChange={(value: any) => setState({ leadSource: value })}
              options={state.leadSourceOptions}
              isClearable
              className="w-[600px]"
            />
            {state.selectedMetricId == "total_lead_list" && (
              <CustomSelect
                placeholder="Status"
                value={state.leadStatus}
                onChange={(value: any) => setState({ leadStatus: value })}
                options={state.leadStatusOptions}
                isClearable
                className="w-[600px]"
              />
            )}
            {/* <CustomSelect
              placeholder="Lead Type"
              value={state.leadType}
              onChange={(value: any) => setState({ leadType: value })}
              options={[
                { value: "own", label: "Own Records" },
                { value: "admin", label: "Admin Records" },
                { value: "website", label: "Website Leads" },
              ]}
              isClearable
            /> */}
          </>
        )}
        {inquiryMetric && (
          <TextInput
            type="text"
            placeholder={`Search ${
              state.selectedMetricId === "booking_inquiries"
                ? "booking"
                : "call"
            } inquiries`}
            value={state.inquirySearch}
            onChange={(e: any) => setState({ inquirySearch: e.target.value })}
            className="w-[600px]"
            parentClass="w-[600px]"
          />
        )}
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <main className="space-y-4">
      {/* 1 — Hero Banner */}
      <HeroBanner bannerData={state.bannerData} />

      {/* 2 — Date Filter Bar */}
      <div className="sticky top-14 z-40 shadow-lg rounded-xl">
      <DateFilterBar
        activeDateTab={state.activeDateTab}
        startDate={state.startDate}
        endDate={state.endDate}
        onTabClick={handleDateTabClick}
        onCustomDateChange={handleCustomDateChange}
      />
      </div>

      {/* 3 — Metric Cards */}

      <MetricCards
        selectedMetricId={state.selectedMetricId}
        onSelect={handleCardSelect}
        dashboardData={state.dashboardData}
      />

      {/* 4 — Drill-Down Table */}
      {/* {state.selectedMetricId && renderCardFilters()} */}
      {state.selectedMetricId && (
        <DrillDownTable
          selectedMetric={selectedMetric}
          records={state.tableRecords}
          columns={state.tableColumns}
          totalCount={state.totalCount}
          page={state.page}
          onPageChange={handlePageChange}
          pageSize={PAGE_SIZE}
          loading={state.loading}
          error={state.error}
          onClose={handleDrillDownClose}
          activeFilters={getActiveFilters(state.selectedMetricId)}
          filterList={renderCardFilters}
          onClearFilters={clearCardFilters}
        />
      )}

      {/* 5 — Analytics Header */}
      <div className="pt-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-[#8b181b]">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#000] sm:text-lg">
              Analytics, Trends &amp; Market Intelligence
            </h2>
            <p className="text-xs text-slate-600">
              Comprehensive data visualizers covering property types, location
              pricing, lead conversion funnels, and project demand.
            </p>
          </div>
        </div>
      </div>

      {/* 6 — Charts */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PropertyTypeDonut dashboardData={state.dashboardData} />
          <PropertyStatusBar dashboardData={state.dashboardData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PricePerSqft dashboardData={state.dashboardData} />
          <RegionalRadar dashboardData={state.dashboardData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LeadSourcesDonut dashboardData={state.dashboardData} />
          <ConversionFunnel dashboardData={state.dashboardData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <LeadVelocity dashboardData={state.dashboardData} />
          <BookingVsCallbacks dashboardData={state.dashboardData} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BuyerWishlist dashboardData={state.dashboardData} />
          <PropertyMatrix dashboardData={state.dashboardData} />
        </div>
      </div>

      {/* Fixed tooltip rendered outside table — exact copy from property/list.tsx */}
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

          {/* Unit Count */}
          <div className="bg-dred mb-3 mt-2 flex w-fit items-center justify-between gap-3 rounded-2xl px-3 py-1">
            <span className="text-sm text-white/80">Total Units</span>
            <span className="text-md text-white">
              {tooltip.row.total_unit ?? "—"}
            </span>
          </div>

          {/* Offer Type */}
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

          {/* Publish */}
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

          {/* Created By */}
          {tooltip.row?.created_by && (
            <div className="mb-1 flex items-start gap-2 text-xs">
              <span className="shrink-0 font-semibold text-gray-500">
                Created By:
              </span>
              <span className="text-gray-800 dark:text-white">
                {tooltip.row.industry_name}
              </span>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
