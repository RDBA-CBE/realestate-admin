import moment from "moment";
import * as Yup from "yup";

export const sessionCreate = Yup.object().shape({
  lounge_type: Yup.string().required("Lounge type is required"),
  start_time: Yup.string().when("lounge_type", {
    is: (val) => String(val) != "15",
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export const login = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export const signin = Yup.object().shape({
  password: Yup.string().required("Password is required"),
  user_type: Yup.string().required("Role is required"),
  phone: Yup.string().required("Phone Number is required"),
  email: Yup.string().required("Email is required"),
  last_name: Yup.string().required("Last name is required"),
  first_name: Yup.string().required("First name is required"),
});

export const propertyCreate = Yup.object().shape({
  // Step 1: Basic Details
  title: Yup.string().required("Property Name is required").nullable(),
  property_type: Yup.string().required("Property Type is required").nullable(),
  listing_type: Yup.object().required("Listing Type is required").nullable(),
  commercial_type: Yup.object()
    .required("Commercial Type is required")
    .nullable(),

  // Step 2: Property Information
  address: Yup.string().required("Address is required").nullable(),
  city: Yup.object().required("City is required").nullable(),
  state: Yup.object().required("State is required").nullable(),
  country: Yup.object().required("Country is required").nullable(),
  postal_code: Yup.string().required("Zip Code is required").nullable(),

  // Conditional fields
  plot_area: Yup.string().required("Plot Area is required").nullable(),

  land_type: Yup.string().required("Land Type is required").nullable(),

  built_up_area: Yup.string().required("Built-up Area is required").nullable(),

  buy_price: Yup.string().required("Buy Price is required").nullable(),

  price_per_sqft: Yup.string()
    .required("Price Per Sq.ft is required")
    .nullable(),

  price: Yup.string().required("Price is required").nullable(),
  developer: Yup.string().required("Developer is required").nullable(),

  longitude: Yup.string().required("Longitude is required").nullable(),

  latitude: Yup.string().required("Latitude is required").nullable(),


  images: Yup.array()
    .required("Property image is required")
    .min(1, "At least one image is required")
    .max(7, "Maximum 7 images allowed"),

  amenities: Yup.array()
    .required("Amenities is required")
    .min(1, "At least one amenities is required")
});

export const category = Yup.object().shape({
  name: Yup.string().required("Category Name is required"),
});

export const project = Yup.object().shape({
  name: Yup.string().required("Project Name is required"),
  location: Yup.string().required("Location is required"),
});

export const amenity = Yup.object().shape({
  name: Yup.string().required("Amenity Name is required"),
});

export const user = Yup.object().shape({
  email: Yup.string().required("Email is required"),
  password: Yup.string().required("Password is required"),
});
