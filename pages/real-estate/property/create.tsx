"use client";

import { MapPin, Info, DollarSign, Home, Star, Phone } from "lucide-react";
import TextInput from "@/components/FormFields/TextInput.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import { useSetState } from "@/utils/function.utils";

const steps = [
  { id: 1, title: "Property Location", icon: MapPin },
  { id: 2, title: "Property Information", icon: Info },
  { id: 3, title: "Price & Area", icon: DollarSign },
  { id: 4, title: "Features & Amenities", icon: Home },
  { id: 5, title: "Extra Facilities", icon: Star },
  { id: 6, title: "Contact Information", icon: Phone },
];

export default function AddPropertyPage() {

  const [state,setState]=useSetState({
    
  })
  return (
    <div className="space-y-12">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className="grid grid-cols-1 gap-6 md:grid-cols-5 md:gap-12"
        >
          <div className="relative flex items-start md:col-span-1">
            <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-white text-gray-500">
              <step.icon size={18} />
            </div>

            {index !== steps.length - 1 && (
              <div className="absolute left-5 top-11 h-full w-0.5 bg-gray-300" />
            )}

            <span className="text-md ml-4 mt-2 font-bold text-gray-700">
              {step.title}
            </span>
          </div>

          {/* Form section (right) */}
          <div className="md:col-span-4">
            {step.id === 1 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">Property Status</h2>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    name="propertyType"
                    title="Property Type"
                    placeholder="Select"
                  />
                  <TextInput
                    name="propertyCondition"
                    title="Property Condition"
                    placeholder="Select"
                  />
                  <TextInput
                    name="builtYear"
                    title="Built Year"
                    placeholder="Select"
                  />
                  <TextInput
                    name="dimension"
                    title="Dimension"
                    placeholder="Select"
                  />
                  <TextInput
                    name="country"
                    title="Country"
                    placeholder="Select"
                  />
                  <TextInput
                    name="city"
                    title="Property City"
                    placeholder="Select"
                  />
                </div>
                <div className="mt-4">
                  <TextInput
                    name="location"
                    title="Location"
                    placeholder="Enter location"
                  />
                </div>
                <div className="mt-4 flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400">
                  Google Map Here
                </div>
              </div>
            )}

            {step.id === 2 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">All Information</h2>
                <TextInput
                  name="propertyName"
                  title="Property Name"
                  placeholder="Enter name"
                />
                <div className="mt-4">
                  <TextInput
                    name="description"
                    title="Description"
                    placeholder="Write description"
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <TextInput
                    name="propertyImage"
                    title="Upload Property Image"
                    type="file"
                  />
                  <TextInput
                    name="propertyVideo"
                    title="Upload Property Video"
                    type="file"
                  />
                  <TextInput
                    name="floorPlan"
                    title="Upload Floor Plan"
                    type="file"
                  />
                  <TextInput name="pdf" title="Upload PDF" type="file" />
                </div>
              </div>
            )}

            {step.id === 3 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">Price & Area</h2>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    name="areaSize"
                    title="Area Size"
                    placeholder="Enter size"
                  />
                  <TextInput
                    name="price"
                    title="Price"
                    placeholder="Enter price"
                  />
                  <TextInput
                    name="price"
                    title="Price"
                    placeholder="Enter price"
                  />
                </div>
              </div>
            )}

            {step.id === 4 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">
                  Features & Amenities
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  <TextInput
                    name="bedroom"
                    title="Bedroom"
                    placeholder="Select"
                  />
                  <TextInput
                    name="dining"
                    title="Dining Room"
                    placeholder="Select"
                  />
                  <TextInput
                    name="bathroom"
                    title="Bathroom"
                    placeholder="Select"
                  />
                  <TextInput
                    name="balcony"
                    title="Balcony"
                    placeholder="Select"
                  />
                </div>
              </div>
            )}

            {step.id === 5 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">Extra Facilities</h2>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    name="cityCenter"
                    title="City Center"
                    placeholder="Enter distance"
                  />
                  <TextInput
                    name="hospital"
                    title="Hospital"
                    placeholder="Enter distance"
                  />
                  <TextInput
                    name="shop"
                    title="Shop"
                    placeholder="Enter distance"
                  />
                  <TextInput
                    name="park"
                    title="Park"
                    placeholder="Enter distance"
                  />
                </div>
              </div>
            )}

            {step.id === 6 && (
              <div className="rounded-md bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold">
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <TextInput
                    name="fullName"
                    title="Full Name"
                    placeholder="Enter full name"
                  />
                  <TextInput
                    name="designation"
                    title="Designation"
                    placeholder="Enter designation"
                  />
                  <TextInput
                    name="email"
                    title="Email Address"
                    placeholder="Enter email"
                  />
                  <TextInput
                    name="phone"
                    title="Phone Number"
                    placeholder="Enter phone"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <PrimaryButton>Post Property</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
