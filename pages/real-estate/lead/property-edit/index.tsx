"use client"

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Models from "@/imports/models.import";
import {
  Failure,
  Success,
  capitalizeFLetter,
  commonDateFormat,
  formatPriceRange,
  useSetState,
} from "@/utils/function.utils";
import { ArrowLeft } from "lucide-react";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CustomeDatePicker from "@/components/datePicker";
import PrivateRouter from "@/hook/privateRouter";
import IconLoader from "@/components/Icon/IconLoader";
import moment from "moment";
import { Dropdown } from "@/utils/function.utils";

const PropertyEdit = () => {
  const router = useRouter();
  const { lead, property } = router.query;

  const [state, setState] = useSetState({
    loading: false,
    btnLoading: false,
    leadPropertyId: null,
    leadDetail: null as any,
    propertyDetail: null as any,
    // editable fields
    property_status: null,
    inquiry_details: "",
    closing_date: null,
    next_follow_up: null,
    leadStatusList: [],
  });

  useEffect(() => {
    if (lead && property) {
      fetchData();
      fetchLeadStatusList();
    }
  }, [lead, property]);

  const fetchData = async () => {
    try {
      setState({ loading: true });
      const [leadRes, propertyRes]: any = await Promise.all([
        Models.lead.details(lead),
        Models.property.details(property),
      ]);

      // get primary image from lead's properties_details
      const propFromLead = leadRes?.properties_details?.find(
        (p: any) => String(p?.id) === String(property)
      );
      const primaryImage = propFromLead?.primary_image
        || propertyRes?.images?.[0]?.image_url
        || propertyRes?.images?.[0]?.image
        || null;

      // find the lead_property record id from lead_properties list
      const lpRes: any = await Models.lead.lead_properties(1, { developer: localStorage.getItem("userId") });
      const lpRecord = lpRes?.results?.find(
        (item: any) => String(item?.lead) === String(lead) && String(item?.property) === String(property)
      );

      setState({
        loading: false,
        leadDetail: leadRes,
        propertyDetail: { ...propertyRes, primary_image: primaryImage },
        leadPropertyId: lpRecord?.id || null,
        property_status: propertyRes?.status
          ? { value: propertyRes.status, label: capitalizeFLetter(propertyRes.status) }
          : null,
        inquiry_details: lpRecord?.inquiry_details || leadRes?.requirements || "",
        closing_date: lpRecord?.closing_date || null,
        next_follow_up: leadRes?.next_follow_up || null,
      });
    } catch (error) {
      setState({ loading: false });
    }
  };

  const fetchLeadStatusList = async () => {
    try {
      const res: any = await Models.leadStatus.list(1, { pagination: "No" });
      setState({ leadStatusList: Dropdown(res.results, "name") });
    } catch (error) {}
  };

  const handleSubmit = async () => {
    try {
      setState({ btnLoading: true });

      // update lead next_follow_up
      await Models.lead.update(
        { next_follow_up: state.next_follow_up ? moment(state.next_follow_up).format("YYYY-MM-DD") : null },
        lead
      );

      // update lead_property record if exists
      if (state.leadPropertyId) {
        await Models.lead.lead_properties_update(
          {
            inquiry_details: state.inquiry_details,
            closing_date: state.closing_date ? moment(state.closing_date).format("YYYY-MM-DD") : null,
          },
          state.leadPropertyId
        );
      }

      setState({ btnLoading: false });
      Success("Updated successfully");
      router.back();
    } catch (error) {
      setState({ btnLoading: false });
      Failure("Update failed");
    }
  };

  const p = state.propertyDetail;
  const l = state.leadDetail;

  const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-800 dark:text-white">{value || "-"}</span>
    </div>
  );

  if (state.loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <IconLoader className="h-6 w-6 animate-spin text-[#9b0f09]" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-bold text-gray-800 dark:text-white">Property & Lead Details</h5>
          <p className="text-sm text-gray-500">{l?.full_name} · {p?.title}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Property Information */}
        <div className="panel rounded-xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base font-bold text-gray-800">Property Information</span>
          </div>
          {p?.primary_image && (
            <img
              src={p.primary_image}
              alt={p.title}
              className="mb-4 h-48 w-full rounded-lg object-cover"
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Property Name" value={p?.title} />
            <InfoRow label="Project" value={p?.project?.name} />
            <InfoRow label="Price Range" value={formatPriceRange(p?.price_range?.minimum_price, p?.price_range?.maximum_price)} />
            <InfoRow label="Sq.ft" value={p?.built_up_area} />
            <InfoRow label="Property Type" value={p?.property_type?.map((t: any) => capitalizeFLetter(t?.name)).join(", ")} />
            <InfoRow label="City" value={p?.city} />
            <InfoRow label="Area" value={p?.area?.name} />
            <InfoRow label="Bedrooms" value={p?.bedrooms} />
            <InfoRow label="Bathrooms" value={p?.bathrooms} />
            <InfoRow label="Listing Type" value={capitalizeFLetter(p?.listing_type)} />
          </div>
        </div>

        {/* Lead Information */}
        <div className="panel rounded-xl">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base font-bold text-gray-800">Lead Information</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <InfoRow label="Customer Name" value={l?.full_name} />
            <InfoRow label="Phone" value={l?.phone} />
            <InfoRow label="Email" value={l?.email} />
            <InfoRow label="Lead Source" value={l?.lead_source_info?.name} />
            <InfoRow label="Status" value={l?.status_info?.name} />
            <InfoRow label="Priority" value={capitalizeFLetter(l?.priority)} />
            <InfoRow label="Location" value={l?.location_details?.name} />
            <InfoRow label="Area" value={l?.area_details?.name} />
          </div>

          {/* Editable Fields */}
          <div className="border-t border-gray-100 pt-5">
            <p className="mb-4 text-sm font-bold text-gray-700">Edit Details</p>
            <div className="space-y-4">
              <CustomSelect
                title="Property Status"
                value={state.property_status}
                onChange={(e) => setState({ property_status: e })}
                placeholder="Select Status"
                options={[
                  { value: "available", label: "Available" },
                  { value: "sold", label: "Sold" },
                  { value: "rented", label: "Rented" },
                  { value: "pending", label: "Pending" },
                ]}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Inquiry Details</label>
                <textarea
                  className="form-textarea w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#9b0f09] focus:outline-none"
                  rows={3}
                  placeholder="Enter inquiry details"
                  value={state.inquiry_details}
                  onChange={(e) => setState({ inquiry_details: e.target.value })}
                />
              </div>
              <CustomeDatePicker
                title="Closing Date"
                value={state.closing_date}
                placeholder="Select Closing Date"
                onChange={(e) => setState({ closing_date: e })}
                showTimeSelect={false}
              />
              <CustomeDatePicker
                title="Next Follow Up Date"
                value={state.next_follow_up}
                placeholder="Select Next Follow Up Date"
                onChange={(e) => setState({ next_follow_up: e })}
                showTimeSelect={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button className="btn border-dred hover:btn-mred" onClick={() => router.back()}>
          Cancel
        </button>
        <button className="btn btn-dred border-none" onClick={handleSubmit} disabled={state.btnLoading}>
          {state.btnLoading ? <IconLoader className="h-4 w-4 animate-spin" /> : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default PrivateRouter(PropertyEdit);
