"use client";

import { MapPin, Info, DollarSign, Home, Star, Phone } from "lucide-react";
import TextInput from "@/components/FormFields/TextInput.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import { useSetState } from "@/utils/function.utils";
import {
  amenitiesList,
  facingDirection,
  propertyType,
} from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import NumberInput from "@/components/FormFields/NumberInputs.component";

const steps = [
  { id: 1, title: "Basic Detail", icon: MapPin },
  { id: 2, title: "Property Information", icon: Info },
  { id: 3, title: "Price & Area", icon: DollarSign },
  { id: 4, title: "Features & Amenities", icon: Home },
  { id: 5, title: "Extra Facilities", icon: Star },
  { id: 6, title: "Contact Information", icon: Phone },
];

export default function AddPropertyPage() {
  const [state, setState] = useSetState({
    propertyTypeList: propertyType,
    property_name: "",
    description: "",
    propertyType: null,
    listType: null,
  });
  return (
    <>
      <div className="panel mb-5 flex flex-col gap-5 md:flex-row md:items-center">
        <h5 className="text-lg font-semibold dark:text-white-light">
          Add New Property
        </h5>
      </div>

      <div className="space-y-5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="grid grid-cols-1 gap-6 xl:grid-cols-7 md:gap-5"
          >
            <div className="relative flex items-start xl:col-span-1">
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
            <div className="xl:col-span-6">
              {step.id === 1 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">Basic Detail</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      name="title"
                      title="Property Name"
                      placeholder="Enter Property Name"
                      value={state.title}
                      onChange={(e) => setState({ title: e.target.value })}
                    />
                    <CustomSelect
                      title="Property Type"
                      placeholder="Enter Property Type"
                      options={state.propertyTypeList}
                      value={state.property_type}
                      onChange={(selectedOption) =>
                        setState({ property_type: selectedOption })
                      }
                      isClearable={true}
                    />
                  </div>

                  <div className="mt-4 flex w-full">
                    <TextArea
                      name="description"
                      title="Description"
                      placeholder="Enter Description"
                      value={state.description}
                      onChange={(e) =>
                        setState({ description: e.target.value })
                      }
                    />
                  </div>

                  <div className="mt-4 ">
                    <label htmlFor="listType" className="mb-3 ">
                      List Type
                    </label>

                    <div className="flex items-center gap-6">
                      <CheckboxInput
                        type="radio"
                        name="listType"
                        label="Sale"
                        checked={state.listing_type === "sale"}
                        onChange={() =>
                          setState({ ...state, listing_type: "sale" })
                        }
                      />

                      <CheckboxInput
                        type="radio"
                        name="listType"
                        label="Lease"
                        checked={state.listing_type === "lease"}
                        onChange={() =>
                          setState({ ...state, listing_type: "lease" })
                        }
                      />

                      <CheckboxInput
                        type="radio"
                        name="listType"
                        label="Rent"
                        checked={state.listing_type === "rent"}
                        onChange={() =>
                          setState({ ...state, listing_type: "rent" })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex w-full">
                    <TextArea
                      name="address"
                      title="Address"
                      placeholder="Enter address"
                      value={state.address}
                      onChange={(e) => setState({ address: e.target.value })}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <CustomSelect
                      title="City"
                      placeholder="Enter City"
                      options={state.propertyTypeList}
                      value={state.city}
                      onChange={(selectedOption) =>
                        setState({ city: selectedOption })
                      }
                      isClearable={true}
                    />

                    <CustomSelect
                      title="State"
                      placeholder="Enter State"
                      options={state.propertyTypeList}
                      value={state.state}
                      onChange={(selectedOption) =>
                        setState({ state: selectedOption })
                      }
                      isClearable={true}
                    />

                    <CustomSelect
                      title="Country"
                      placeholder="Enter Country"
                      options={state.propertyTypeList}
                      value={state.country}
                      onChange={(selectedOption) =>
                        setState({ country: selectedOption })
                      }
                      isClearable={true}
                    />

                    <TextInput
                      name="postal_code"
                      title="Zip Code"
                      placeholder="Enter Zip Code"
                      value={state.postal_code}
                      onChange={(e) =>
                        setState({ postal_code: e.target.value })
                      }
                    />

                    <TextInput
                      name="latitude"
                      title="Latitute of the Location"
                      placeholder="Enter location"
                      value={state.latitude}
                      onChange={(e) => setState({ latitude: e.target.value })}
                    />

                    <TextInput
                      name="logitude"
                      title="Longitude of the Location"
                      placeholder="Enter location"
                      value={state.logitude}
                      onChange={(e) => setState({ logitude: e.target.value })}
                    />
                  </div>

                  <div className="mt-4 flex h-40 w-full items-center justify-center bg-gray-100 text-gray-400">
                    Google Map Here
                  </div>
                </div>
              )}

              {step.id === 2 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="mb-4 text-lg font-semibold">
                    Property Information
                  </h2>

                  <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* --- Area Group --- */}
                    <NumberInput
                      name="plot_area"
                      title="Plot Area (sq.ft.)"
                      placeholder="Enter total plot area"
                      value={state.plot_area}
                      onChange={(e) => setState({ plot_area: e.target.value })}
                    />
                    <NumberInput
                      name="built_up_area"
                      title="Built-up Area (sq.ft.)"
                      placeholder="Enter total built-up area"
                      value={state.built_up_area}
                      onChange={(e) =>
                        setState({ built_up_area: e.target.value })
                      }
                    />
                    <NumberInput
                      name="carpet_area"
                      title="Carpet Area (sq.ft.)"
                      placeholder="Enter total carpet area"
                      value={state.carpet_area}
                      onChange={(e) =>
                        setState({ carpet_area: e.target.value })
                      }
                    />

                    {/* --- Rooms Group --- */}
                    <TextInput
                      name="bedrooms"
                      title="Bedrooms (Number Only)"
                      placeholder="Enter number of bedrooms"
                      value={state.bedrooms}
                      onChange={(e) => setState({ bedrooms: e.target.value })}
                    />
                    <TextInput
                      name="bathrooms"
                      title="Bathrooms (Number Only)"
                      placeholder="Enter number of bathrooms"
                      value={state.bathrooms}
                      onChange={(e) => setState({ bathrooms: e.target.value })}
                    />
                    <TextInput
                      name="balconies"
                      title="Balconies (Number Only)"
                      placeholder="Enter number of balconies"
                      value={state.balconies}
                      onChange={(e) => setState({ balconies: e.target.value })}
                    />

                    {/* --- Floor Info --- */}
                    <TextInput
                      name="floor_number"
                      title="Floor No (Number Only)"
                      placeholder="Enter floor number"
                      value={state.floor_number}
                      onChange={(e) =>
                        setState({ floor_number: e.target.value })
                      }
                    />
                    <TextInput
                      name="total_floors"
                      title="Total Floors (Number Only)"
                      placeholder="Enter total number of floors"
                      value={state.total_floors}
                      onChange={(e) =>
                        setState({ total_floors: e.target.value })
                      }
                    />

                    {/* --- Building Info --- */}
                    <NumberInput
                      name="built_year"
                      title="Built Year"
                      placeholder="Enter the built year"
                      value={state.built_year}
                      onChange={(e) => setState({ built_year: e.target.value })}
                    />
                    <CustomSelect
                      title="Property Facing Direction"
                      placeholder="Select facing direction"
                      options={facingDirection}
                      value={state.facing}
                      onChange={(selectedOption) =>
                        setState({ facing: selectedOption })
                      }
                      isClearable={true}
                    />

                    {/* --- Optional Fields --- */}
                    <CustomSelect
                      title="Property Status"
                      placeholder="Select property status"
                      options={[
                        { value: "ready", label: "Ready to Move" },
                        {
                          value: "under_construction",
                          label: "Under Construction",
                        },
                      ]}
                      value={state.status}
                      onChange={(selectedOption) =>
                        setState({ status: selectedOption })
                      }
                      isClearable={true}
                    />
                    <CustomSelect
                      title="Furnishing Type"
                      placeholder="Select furnishing type"
                      options={[
                        { value: "furnished", label: "Furnished" },
                        { value: "semi_furnished", label: "Semi-Furnished" },
                        { value: "unfurnished", label: "Unfurnished" },
                      ]}
                      value={state.furnishing}
                      onChange={(selectedOption) =>
                        setState({ furnishing: selectedOption })
                      }
                      isClearable={true}
                    />
                    {/* <NumberInput
                      name="parking"
                      title="Parking Slots (Optional)"
                      placeholder="Enter number of parking slots"
                      value={state.parking}
                      onChange={(e) => setState({ parking: e.target.value })}
                    />
                    <CustomSelect
                      title="Amenities (Optional)"
                      placeholder="Select amenities"
                      options={[
                        { value: "gym", label: "Gym" },
                        { value: "lift", label: "Lift" },
                        { value: "garden", label: "Garden" },
                        { value: "security", label: "Security" },
                      ]}
                      value={state.amenities}
                      onChange={(selectedOption) =>
                        setState({ amenities: selectedOption })
                      }
                      isMulti
                    /> */}
                  </div>

                  {/* --- More Details --- */}
                  <div className="mt-4">
                    <TextArea
                      name="more_details"
                      title="More Details"
                      placeholder="Enter more details about the property"
                      value={state.more_details}
                      onChange={(e) =>
                        setState({ more_details: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}

              {step.id === 3 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">Price </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <NumberInput
                      name="price"
                      title="Price"
                      placeholder="Enter price"
                      value={state.price}
                      onChange={(e) => setState({ price: e.target.value })}
                    />
                    <NumberInput
                      name="price_per_sqft"
                      title="Price per Sq.Ft (auto-calc or manual input)"
                      placeholder="Enter price per Sq.Ft"
                      value={state.price_per_sqft}
                      onChange={(e) =>
                        setState({ price_per_sqft: e.target.value })
                      }
                    />
                    {/* <NumberInput
                      name="maintenance_charges"
                      title="Maintenance Charge"
                      placeholder="Enter Maintenance Charge"
                       value={state.maintenance_charges}
                      onChange={(e) =>
                        setState({ maintenance_charges: e.target.value })
                      }
                    /> */}
                  </div>
                </div>
              )}

              {step.id === 4 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Features & Amenities
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    {amenitiesList.map((amenity) => (
                      <CheckboxInput
                        key={amenity.value}
                        type="checkbox"
                        name="amenities"
                        label={amenity.label}
                        checked={state.amenities?.includes(amenity.value)}
                        onChange={() => {
                          const updatedAmenities = state.amenities?.includes(
                            amenity.value
                          )
                            ? state.amenities.filter(
                                (item) => item !== amenity.value
                              )
                            : [...(state.amenities || []), amenity.value];

                          setState({ ...state, amenities: updatedAmenities });
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step.id === 5 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Extra Facilities
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      name="cityCenter"
                      title="City Center"
                      placeholder="Enter distance from the city center"
                      value={state.city_center}
                      onChange={(e) =>
                        setState({ city_center: e.target.value })
                      }
                    />

                    <TextInput
                      name="hospital"
                      title="Hospital"
                      placeholder="Enter distance from the Hospital"
                      value={state.hospital}
                      onChange={(e) => setState({ hospital: e.target.value })}
                    />

                    <TextInput
                      name="shop"
                      title="Shop"
                      placeholder="Enter distance from the Shop"
                      value={state.shop}
                      onChange={(e) => setState({ shop: e.target.value })}
                    />
                    <TextInput
                      name="park"
                      title="Park"
                      placeholder="Enter distance from the Park"
                      value={state.park}
                      onChange={(e) => setState({ park: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {step.id === 6 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      name="full_name"
                      title="Full Name"
                      placeholder="Enter contact person's name"
                      value={state.full_name}
                      onChange={(e) => setState({ full_name: e.target.value })}
                    />
                    <TextInput
                      name="designation"
                      title="Designation"
                      placeholder="Enter contact person's designation"
                      value={state.designation}
                      onChange={(e) =>
                        setState({ designation: e.target.value })
                      }
                    />

                    <TextInput
                      name="email"
                      title="Email"
                      placeholder="Enter contact person's email"
                      value={state.email}
                      onChange={(e) => setState({ email: e.target.value })}
                    />

                    <TextInput
                      name="phone"
                      title="Phone Number"
                      placeholder="Enter contact person's Phone Number"
                      value={state.phone}
                      onChange={(e) => setState({ phone: e.target.value })}
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
    </>
  );
}
