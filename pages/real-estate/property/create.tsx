"use client";

import { MapPin, Info, Home, Star, Phone, File } from "lucide-react";
import TextInput from "@/components/FormFields/TextInput.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import {
  buildFormData,
  Dropdown,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";
import {
  facingDirection,
  FURNISHING_TYPE,
  LISTING_TYPE,
  ListType,
  PROPERTY_IMG,
  PROPERTY_TYPE,
  propertyType,
  ROLES,
} from "@/utils/constant.utils";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import CheckboxInput from "@/components/FormFields/CheckBoxInput.component";
import TextArea from "@/components/FormFields/TextArea.component";
import NumberInput from "@/components/FormFields/NumberInputs.component";
import { useEffect } from "react";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Models from "@/imports/models.import";
import Modal from "@/components/modal/modal.component";
import IconLoader from "@/components/Icon/IconLoader";
import ImageUploadWithPreview from "@/components/ImageUploadWithPreview/ImageUploadWithPreview.component";
import VideoUpload from "@/components/videoUpload/videoUpload.compoent";
import PrivateRouter from "@/hook/privateRouter";

const AddPropertyPage = () => {
  const router = useRouter();
  const [state, setState] = useSetState({
    propertyTypeList: propertyType,
    group: null,
    btnLoading: false,
    isOpenAmenit: false,
    amenityLoading: false,
    plot: true,
    categoryList: [],
    developerList: [],
    projectList: [],
    categoryPage: 1,
    categoryNext: null,
    //Form
    property_type: null,
    property_name: "",
    description: "",
    virtual_tour: "",
    //Buy,
    built_up_area: null,
    carpet_area: null,
    bedroom: null,
    bathroom: null,
    balconie: null,
    floor_no: null,
    total_floor: null,
    build_year: null,
    facing_direction: null,
    furnishing_type: null,
    price: null,
    price_per_sqft: null,
    //Media
    images: [],
    video: null,
    latitude: null,
    longitude: null,
    country: null,
    state: null,
    city: null,
    postal_code: null,
    amenities: [],
    project: null,
    developer: null,
    isAssignAgent: false,
    agent: null,
    //Lease
    lease_price: null,
    lease_duration: null,
    //Rent
    monthly_rent: null,
    rent_duration: null,
  });

  useEffect(() => {
    const group = localStorage.getItem("group") || "";

    setState({ group: group });
  }, [state.group]);

  useEffect(() => {
    amenityList(1);
    categoryList(1);
    projectList(1);
    developerList(1);
  }, []);

  const amenityList = async (page) => {
    try {
      const res: any = await Models.amenity.list(page, {});
      const dropdown = Dropdown(res?.results, "name");
      setState({
        amenityList: dropdown,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const categoryList = async (page) => {
    try {
      const res: any = await Models.category.list(page, {});
      console.log("✌️res --->", res);

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

  const projectList = async (page) => {
    try {
      const res: any = await Models.project.list(page, {});

      const droprdown = Dropdown(res?.results, "name");

      setState({
        projectList: droprdown,
        projectPage: page,
        projectNext: res.next,
      });
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const developerList = async (page) => {
    try {
      const body = {
        group: ROLES.DEVELOPER,
      };
      const res: any = await Models.user.list(page, body);
      const dropdown = res?.results?.map((item) => ({
        value: item?.id,
        label: `${item?.first_name} ${item?.last_name}`,
      }));
      setState({
        developerList: dropdown,
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

  const projectLoadMore = async () => {
    try {
      if (state.projectNext) {
        const res: any = await Models.project.list(state.projectPage + 1, {});
        const newOptions = Dropdown(res?.results, "name");
        setState({
          projectList: [...state.projectList, ...newOptions],
          projectNext: res.next,
          projectPage: state.projectPage + 1,
        });
      } else {
        setState({
          projectList: state.projectList,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const createAmenity = async () => {
    try {
      setState({ amenityLoading: true });

      const body = {
        name: state.name,
        location: state.location,
        description: state.description,
        developer: 3,
      };
      await Utils.Validation.amenity.validate(body, { abortEarly: false });

      const res = await Models.amenity.create(body);

      setState({
        isOpenAmenit: false,
        name: "",
        description: "",
        amenityLoading: false,
      });
      amenityList(1);
      Success("Amenity created succssfully");
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
        error.inner.forEach((err) => {
          validationErrors[err.path] = err?.message;
        });
        console.log("✌️validationErrors --->", validationErrors);

        setState({ error: validationErrors, amenityLoading: false });
      } else {
        Failure(error?.error);
        setState({ amenityLoading: false });
      }
    }
  };

  const onSubmit = async () => {
    try {
      setState({ btnLoading: true });
      const body = {
        property_type: state.property_type?.value,
        listing_type: state.listing_type?.value,
      };

      if (state.listing_type?.label == LISTING_TYPE.SALE) {
        createSaleProperty();
      } else if (state.listing_type?.label == LISTING_TYPE.LEASE) {
        createLeaseProperty();
      } else if (state.listing_type?.label == LISTING_TYPE.RENT) {
        createRentProperty();
      }

      await Utils.Validation.property_type.validate(body, {
        abortEarly: false,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
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

  const createSaleProperty = async () => {
    try {
      // setState({ btnLoading: true });

      const saleBody: any = {
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,
        listing_type: "sale",
        price: state.price,
        price_per_sqft: state.price_per_sqft,
        project: state.project?.value,
        developers: [state.developer?.value],
        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.images,
        longitude: state.longitude,
        latitude: state.latitude,
        developer: state.developer?.value,
        address: state.address,
        validatePropertyType: state.property_type,
      };

      await Utils.Validation.propertySaleCreate.validate(saleBody, {
        abortEarly: false,
      });
      delete saleBody.images;
      delete saleBody.validatePropertyType
      console.log("✌️buyBody --->", saleBody);

      const formData = buildFormData(saleBody);

      const res: any = await Models.property.create(formData);
      if (state.images?.length > 0) {
        state.images?.map((item, index) => createImage(res?.id, item, index));
      }
      if (state.virtual_tour) {
        await createVirtualTour(res?.id);
      }
      if (state.video) {
        await createVideo(res?.id);
      }

      Success("Property Created Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
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

  const createLeaseProperty = async () => {
    try {
      // setState({ btnLoading: true });

      const buyBody: any = {
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,

        listing_type: "lease",
        lease_total_amount: state.lease_total_amount,
        price: state.lease_total_amount,
        lease_duration: state.lease_duration,
        price_per_sqft: state.price_per_sqft,
        project: state.project?.value,
        developers: [state.developer?.value],
        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.images,
        longitude: state.longitude,
        latitude: state.latitude,
        developer: state.developer?.value,
        address: state.address,
        validatePropertyType: state.property_type,
      };
      await Utils.Validation.propertyLeaseCreate.validate(buyBody, {
        abortEarly: false,
      });
      delete buyBody.images;
      delete buyBody.validatePropertyType

      console.log("✌️buyBody --->", buyBody);

      const formData = buildFormData(buyBody);

      const res: any = await Models.property.create(formData);
      if (state.images?.length > 0) {
        state.images?.map((item, i) => createImage(res?.id, item, i));
      }
      if (state.virtual_tour) {
        await createVirtualTour(res?.id);
      }
      if (state.video) {
        await createVideo(res?.id);
      }

      Success("Property Created Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
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

  const createRentProperty = async () => {
    try {
      // setState({ btnLoading: true });

      const buyBody: any = {
        title: state.title,
        description: state.description,
        property_type: state.property_type?.value,
        listing_type: "rent",
        project: state.project?.value,
        developers: [state.developer?.value],
        amenities: state.amenities,
        furnishing: state.furnishing?.value,
        built_up_area: state.built_up_area,
        total_area: state.total_area,
        carpet_area: state.carpet_area,
        bedrooms: state.bedrooms,
        bathrooms: state.bathrooms,
        total_floors: state.total_floors,
        balconies: state.balconies,
        floor_number: state.floor_number,
        built_year: state.built_year,
        facing_direction: state.facing?.value,
        city: state.city,
        state: state.state,
        country: state.country,
        postal_code: state.postal_code,
        images: state.images,
        longitude: state.longitude,
        latitude: state.latitude,
        developer: state.developer?.value,
        address: state.address,
        monthly_rent: state.monthly_rent,
        price: state.monthly_rent,
        rent_duration: state.rent_duration,
        validatePropertyType: state.property_type,
      };
      await Utils.Validation.propertyRentCreate.validate(buyBody, {
        abortEarly: false,
      });
      delete buyBody.images;
      delete buyBody.validatePropertyType

      console.log("✌️buyBody --->", buyBody);

      const formData = buildFormData(buyBody);

      const res: any = await Models.property.create(formData);
      if (state.images?.length > 0) {
        state.images?.map((item, i) => createImage(res?.id, item, i));
      }
      if (state.virtual_tour) {
        await createVirtualTour(res?.id);
      }
      console.log("✌️state.video --->", state.video);

      if (state.video) {
        await createVideo(res?.id);
      }

      Success("Property Created Successfully");
      router.push("/real-estate/property/list/");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
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

  const createImage = async (property, img, index) => {
    try {
      const body = {
        property: property,
        image: img,
        order: index,
      };
      const formData = buildFormData(body);

      const res = await Models.image.create(formData);
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createVideo = async (property) => {
    try {
      const body = {
        property: property,
        video: state.video,
      };
      const formData = buildFormData(body);

      const res = await Models.video.create(formData);
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const createVirtualTour = async (property) => {
    try {
      const body = {
        property: property,
        tour_url: state.virtual_tour,
      };

      const res = await Models.virtualTour.create(body);
      return res;
    } catch (error) {
      console.log("✌️error --->", error);
    }
  };

  const bodyData = () => ({
    title: state.title || null,
    property_type: state.property_type?.value || null,
    description: state.description || null,
    listing_type: state.listing_type?.value || null,
    commercial_type: state.commercial_type?.value || null,
    plot_area: state.plot_area || null,
    land_type: state.land_type?.value || null,
    built_up_area: state.built_up_area || null,
    carpet_area: state.carpet_area || null,
    bedrooms: state.bedrooms || null,
    bathrooms: state.bathrooms || null,
    balconies: state.balconies || null,
    floor_number: state.floor_number || null,
    total_floors: state.total_floors || null,
    built_year: state.built_year || null,
    facing: state.facing?.value || null,
    furnishing: state.furnishing?.value || null,
    address: state.address,
    city: state.city,
    state: state.state,
    country: state.country,
    postal_code: state.postal_code || null,
    latitude: state.latitude || null,
    longitude: state.longitude || null,

    price_per_sqft: state.price_per_sqft || null,
    lease_rent: state.lease_rent || null,
    lease_duration: state.lease_duration || null,
    plot_price: state.price || null,
    amenities: state.amenities,
    images: state.images,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
      error: { ...state.error, [name]: "" },
    });
  };

  const steps = [
    { id: 1, title: "Basic Detail", icon: MapPin },
    { id: 2, title: "Property Information", icon: Info },
    { id: 7, title: "Media", icon: File },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Amenities", icon: Home },
    // { id: 5, title: "Extra Facilities", icon: Star },
    { id: 6, title: "Contact Information", icon: Phone },
  ];

  console.log("state.property_type", state.property_type);

  return (
    <>
      <div className="panel mb-5 flex flex flex-col justify-between gap-5  md:flex-row md:items-center">
        <h5 className="text-lg font-semibold dark:text-white-light ">
          Add New Property
        </h5>
        {/* <PrimaryButton
          type="submit"
          text="Post Property"
          className="border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
          onClick={onSubmit}
        /> */}
      </div>

      <div className="space-y-5">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="grid grid-cols-1 gap-6 md:gap-5 xl:grid-cols-10"
          >
            <div className="relative flex items-start xl:col-span-2">
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
            <div className="xl:col-span-8">
              {/* Step 1: Basic Detail */}
              {step.id === 1 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">Basic Detail</h2>
                  <div className={`${"mt-4 grid grid-cols-2 gap-4"}`}>
                    <CustomSelect
                      title="Property type"
                      value={state.property_type}
                      onChange={(e) => {
                        setState({
                          property_type: e,
                          contact: "",
                          error: { ...state.error, property_type: "" },
                        });
                      }}
                      placeholder={"Select Property type "}
                      options={state.categoryList}
                      error={state.error?.property_type}
                      required
                      isClearable={false}
                      loadMore={() => catListLoadMore()}
                    />

                    <CustomSelect
                      title="Offer type"
                      value={state.listing_type}
                      onChange={(e) => {
                        setState({
                          listing_type: e,
                          contact: "",
                          error: { ...state.error, listing_type: "" },
                        });
                      }}
                      placeholder={"Select Offer type "}
                      options={ListType}
                      error={state.error?.listing_type}
                      required
                      isClearable={false}
                      // loadMore={() => catListLoadMore()}
                    />
                  </div>
                  <div className="mt-4 flex w-full">
                    <TextInput
                      name="title"
                      title="Property Name"
                      placeholder="Enter Property Name"
                      value={state.title}
                      onChange={handleInputChange}
                      required
                      error={state.error?.title}
                    />
                  </div>

                  <div className="mt-4 flex w-full">
                    <TextArea
                      name="description"
                      title="Description"
                      placeholder="Enter Description"
                      value={state.description}
                      onChange={(e) =>
                        setState({
                          description: e.target.value,
                          error: { ...state.error, description: "" },
                        })
                      }
                      required
                      error={state.error?.description}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Property Information */}
              {step.id === 2 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="text-lg font-semibold">
                    Property Information
                  </h2>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* {state.property_type?.label == PROPERTY_TYPE.PLOT ? ( */}
                    {/* <>
                        <NumberInput
                          name="plot_area"
                          title="Plot Area (sq.ft.)"
                          placeholder="Enter total plot area"
                          value={state.plot_area}
                          onChange={handleInputChange}
                          required
                          error={state.error?.plot_area}
                        />
                        <CustomSelect
                          title="Land Type / Zone"
                          placeholder="Select Land Type / Zone"
                          options={[
                            { value: "residential", label: "Residential" },
                            { value: "commercial", label: "Commercial" },
                            { value: "agricultural", label: "Agricultural" },
                            { value: "industrial", label: "Industrial" },
                          ]}
                          value={state.land_type}
                          onChange={(selectedOption) =>
                            setState({
                              land_type: selectedOption,
                              error: {
                                ...state.error,
                                land_type: null,
                              },
                            })
                          }
                          isClearable
                          required
                          error={state.error?.land_type}
                        />
                        <NumberInput
                          name="price"
                          title="Plot Price"
                          placeholder="Enter Plot Price"
                          value={state.price}
                          onChange={handleInputChange}
                          required
                          error={state.error?.price}
                        />
                        <NumberInput
                          name="price_per_sqft"
                          title="Price Per Sq.ft."
                          placeholder="Price Per Sq.ft."
                          value={state.price_per_sqft}
                          onChange={handleInputChange}
                          required
                          error={state.error?.price_per_sqft}
                        />
                      </> */}

                    <>
                      <NumberInput
                        name="total_area"
                        title="Total Area (sq.ft.)"
                        placeholder="Enter total area"
                        value={state.total_area}
                        onChange={handleInputChange}
                        required
                        error={state.error?.total_area}
                      />

                      {state.property_type?.label !==
                        PROPERTY_TYPE.AGRICULTURAL && (
                        <NumberInput
                          name="built_up_area"
                          title="Built-up Area (sq.ft.)"
                          placeholder="Enter total built-up area"
                          value={state.built_up_area}
                          onChange={handleInputChange}
                          required
                          error={state.error?.built_up_area}
                        />
                      )}

                      {state.property_type?.label ==
                        PROPERTY_TYPE.RESIDENTIAL && (
                        <>
                          <TextInput
                            name="bedrooms"
                            title="Bedrooms (Number Only)"
                            placeholder="Enter number of bedrooms"
                            value={state.bedrooms}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="bathrooms"
                            title="Bathrooms (Number Only)"
                            placeholder="Enter number of bathrooms"
                            value={state.bathrooms}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="balconies"
                            title="Balconies (Number Only)"
                            placeholder="Enter number of balconies"
                            value={state.balconies}
                            onChange={handleInputChange}
                          />
                        </>
                      )}

                      {state.property_type?.label !==
                        PROPERTY_TYPE.AGRICULTURAL && (
                        <>
                          <TextInput
                            name="floor_number"
                            title="Floor No (Number Only)"
                            placeholder="Enter floor number"
                            value={state.floor_number}
                            onChange={handleInputChange}
                          />
                          <TextInput
                            name="total_floors"
                            title="Total Floors (Number Only)"
                            placeholder="Enter total number of floors"
                            value={state.total_floors}
                            onChange={handleInputChange}
                          />
                          <NumberInput
                            name="built_year"
                            title="Built Year"
                            placeholder="Enter the built year"
                            value={state.built_year}
                            onChange={handleInputChange}
                          />

                          <CustomSelect
                            title="Furnishing Type"
                            placeholder="Select furnishing type"
                            options={[
                              { value: "furnished", label: "Furnished" },
                              {
                                value: "semi_furnished",
                                label: "Semi-Furnished",
                              },
                              { value: "unfurnished", label: "Unfurnished" },
                            ]}
                            value={state.furnishing}
                            onChange={(selectedOption) =>
                              setState({
                                furnishing: selectedOption,
                                error: { ...state.error, furnishing: "" },
                              })
                            }
                            required
                            isClearable
                            error={state.error?.furnishing}
                          />
                        </>
                      )}

                      <CustomSelect
                        title="Property Facing Direction"
                        placeholder="Select facing direction"
                        options={facingDirection}
                        value={state.facing}
                        onChange={(selectedOption) =>
                          setState({ facing: selectedOption })
                        }
                        isClearable
                      />

                      {state.listing_type?.label == LISTING_TYPE.RENT ? (
                        <>
                          <NumberInput
                            name="monthly_rent"
                            title="Monthly Rent"
                            placeholder="Enter monthly rent"
                            value={state.monthly_rent}
                            onChange={handleInputChange}
                            required
                            error={state.error?.monthly_rent}
                          />
                          <NumberInput
                            name="rent_duration"
                            title="Rent Duration"
                            placeholder="Enter rent duration"
                            value={state.rent_duration}
                            onChange={handleInputChange}
                            required
                            error={state.error?.rent_duration}
                          />
                        </>
                      ) : state.listing_type?.label == LISTING_TYPE.SALE ? (
                        <>
                          <NumberInput
                            name="price"
                            title="Price"
                            placeholder="Enter Price"
                            value={state.price}
                            onChange={handleInputChange}
                            required
                            error={state.error?.price}
                          />
                          <NumberInput
                            name="price_per_sqft"
                            title="Price Per Sq.ft"
                            placeholder="Enter Price Per Sq.ft"
                            value={state.price_per_sqft}
                            onChange={handleInputChange}
                            required
                            error={state.error?.price_per_sqft}
                          />
                        </>
                      ) : state.listing_type?.label == LISTING_TYPE.LEASE ? (
                        <>
                          <NumberInput
                            name="lease_total_amount"
                            title="Lease Price"
                            placeholder="Enter Lease Price"
                            value={state.lease_total_amount}
                            onChange={handleInputChange}
                            required
                            error={state.error?.lease_total_amount}
                          />
                          <NumberInput
                            name="lease_duration"
                            title="Lease Duration (Year)"
                            placeholder="Enter lease duration"
                            value={state.lease_duration}
                            onChange={handleInputChange}
                            required
                            error={state.error?.lease_duration}
                          />
                        </>
                      ) : null}
                    </>
                    {/* )} */}
                  </div>
                </div>
              )}

              {step.id === 7 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="text-lg font-semibold">
                    Upload photos of your property
                  </h2>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <ImageUploadWithPreview
                        onImagesChange={(image) => {
                          setState({
                            images: image,
                            error: { ...state.error, images: "" },
                          });
                          console.log("onImageUrlsChange", image);
                        }}
                      />

                      {state.error?.images && (
                        <p
                          className="mt-1 text-sm text-red-600"
                          id={`${name}-error`}
                        >
                          {state.error?.images}
                        </p>
                      )}
                    </div>
                    <div className="">
                      <VideoUpload
                        onVideoChange={(file) => {
                          setState({ video: file });
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 ">
                    <TextInput
                      name="virtual_tour"
                      title="Virtual Tour"
                      placeholder="Enter virtual tour url"
                      value={state.virtual_tour}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Price */}
              {step.id === 3 && (
                <div className="panel rounded-lg p-6">
                  <h2 className="mb-4 text-lg font-semibold">Location</h2>
                  <TextArea
                    name="Address"
                    title="Address"
                    placeholder="Enter Address"
                    value={state.address}
                    onChange={(e) => setState({ address: e.target.value })}
                    required
                    error={state.error?.address}
                  />
                  {/* <CustomSelect
                    title="Address"
                    placeholder="Search Address"
                    options={state.propertyTypeList}
                    value={state.city}
                    onChange={(selectedOption) =>
                      setState({
                        city: selectedOption,
                        error: {
                          ...state.error,
                          city: null,
                        },
                      })
                    }
                    isClearable
                  /> */}
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <NumberInput
                      name="latitude"
                      title="Latitude of the Location"
                      placeholder="Enter location"
                      value={state.latitude}
                      onChange={handleInputChange}
                      required
                      error={state.error?.latitude}
                    />
                    <NumberInput
                      name="longitude"
                      title="Longitude of the Location"
                      placeholder="Enter location"
                      value={state.longitude}
                      onChange={handleInputChange}
                      required
                      error={state.error?.longitude}
                    />
                  </div>
                  <div className="mt-4 flex h-60 w-full items-center justify-center rounded rounded-md bg-gray-100 text-gray-400">
                    <iframe
                      className="h-64 w-full rounded-2xl"
                      src={`https://maps.google.com/maps?q=${state?.latitude},${state?.longitude}&z=13&ie=UTF8&iwloc=&output=embed`
                      }
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput
                      name="city"
                      title="City"
                      placeholder="Enter city"
                      value={state.city}
                      onChange={handleInputChange}
                      error={state.error?.city}
                      required
                    />
                    <TextInput
                      name="state"
                      title="State"
                      placeholder="Enter state"
                      value={state.state}
                      onChange={handleInputChange}
                      error={state.error?.state}
                      required
                    />

                    {/* <CustomSelect
                      title="City"
                      placeholder="Enter City"
                      options={state.propertyTypeList}
                      value={state.city}
                      onChange={(selectedOption) =>
                        setState({
                          city: selectedOption,
                          error: {
                            ...state.error,
                            city: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.city}
                    />
                    <CustomSelect
                      title="State"
                      placeholder="Enter State"
                      options={state.propertyTypeList}
                      value={state.state}
                      onChange={(selectedOption) =>
                        setState({
                          state: selectedOption,
                          error: {
                            ...state.error,
                            state: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.state}
                    /> */}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <TextInput
                      name="country"
                      title="Country"
                      placeholder="Enter country"
                      value={state.country}
                      onChange={handleInputChange}
                      error={state.error?.country}
                      required
                    />
                    {/* <CustomSelect
                      title="Country"
                      placeholder="Enter Country"
                      options={state.propertyTypeList}
                      value={state.country}
                      onChange={(selectedOption) =>
                        setState({
                          country: selectedOption,
                          error: {
                            ...state.error,
                            country: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.country}
                    /> */}
                    <TextInput
                      name="postal_code"
                      title="Zip Code"
                      placeholder="Enter Zip Code"
                      value={state.postal_code}
                      onChange={handleInputChange}
                      required
                      error={state.error?.postal_code}
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Features & Amenities */}
              {step.id === 4 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Features & Amenities
                  </h2>
                  <div className="grid grid-cols-4 gap-4">
                    {state.amenityList?.map((amenity) => (
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
                          setState({
                            amenities: updatedAmenities,
                            error: { ...state.error, amenities: "" },
                          });
                        }}
                      />
                    ))}
                  </div>
                  {state.error?.amenities && (
                    <p
                      className="mt-1 text-sm text-red-600"
                      id={`${name}-error`}
                    >
                      {state.error?.amenities}
                    </p>
                  )}
                  <div className="mt-6 flex justify-end">
                    <PrimaryButton
                      type="button"
                      text="New Amenities"
                      className="!mt-6 border-0 shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                      onClick={() =>
                        setState({
                          isOpenAmenit: true,
                          name: "",
                          description: "",
                          amenityLoading: false,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Step 6: Contact Information */}
              {step.id === 6 && (
                <div className="panel rounded-lg">
                  <h2 className="mb-4 text-lg font-semibold">
                    Contact Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <CustomSelect
                      title="Project"
                      placeholder="Select Project"
                      options={state.projectList}
                      value={state.project}
                      onChange={(selectedOption) =>
                        setState({
                          project: selectedOption,
                          error: {
                            ...state.error,
                            project: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.project}
                      loadMore={() => projectLoadMore()}
                    />

                    <CustomSelect
                      title="Assign Developer"
                      placeholder="Select Developer"
                      options={state.developerList}
                      value={state.developer}
                      onChange={(selectedOption) =>
                        setState({
                          developer: selectedOption,
                          error: {
                            ...state.error,
                            developer: null,
                          },
                        })
                      }
                      isClearable
                      required
                      error={state.error?.developer}
                    />
                    <div>
                      <CheckboxInput
                        key={"assign"}
                        type="checkbox"
                        name="amenities"
                        label={"Assign Agent"}
                        checked={state.assignAgent}
                        onChange={() => {
                          setState({ assignAgent: !state.assignAgent });
                        }}
                      />
                      {state.assignAgent && (
                        <CustomSelect
                          title="Authorize Agent"
                          placeholder="Select Agent"
                          options={state.agentList}
                          value={state.agent}
                          onChange={(selectedOption) =>
                            setState({
                              agent: selectedOption,
                              error: {
                                ...state.error,
                                agent: null,
                              },
                            })
                          }
                          isClearable
                          required
                          error={state.error?.agent}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <PrimaryButton
                      type="submit"
                      text="Post Property"
                      className="!mt-6 border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                      onClick={onSubmit}
                      loading={state.btnLoading}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        addHeader={"Create Amenity"}
        open={state.isOpenAmenit}
        close={() => {
          setState({ isOpenAmenit: false, name: "", description: "" });
        }}
        renderComponent={() => (
          <div className=" pb-7">
            <form className="flex flex-col gap-3">
              <div className=" w-full space-y-5">
                <TextInput
                  name="name"
                  title="Amenity Name"
                  placeholder="Enter amenity name"
                  value={state.name}
                  onChange={(e) => {
                    setState({
                      name: e.target.value,
                      error: { ...state.error, name: "" },
                    });
                  }}
                  error={state.error?.name}
                  required
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
                  className="btn btn-outline-primary gap-2"
                  onClick={() => {
                    setState({
                      isOpenAmenit: false,
                      name: "",
                      description: "",
                      amenityLoading: false,
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => createAmenity()}
                  className="btn btn-primary ltr:ml-4 rtl:mr-4"
                >
                  {state.amenityLoading ? <IconLoader /> : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        )}
      />
    </>
  );
};
export default PrivateRouter(AddPropertyPage);
