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
  title: Yup.string().required("Property Name is required"),
  property_type: Yup.object().required("Property Type is required"),
  listing_type: Yup.object().required("Listing Type is required"),
  commercial_type: Yup.object().required("Commercial Type is required"),

  // Step 2: Property Information
  address: Yup.string().required("Address is required"),
  city: Yup.object().required("City is required"),
  state: Yup.object().required("State is required"),
  country: Yup.object().required("Country is required"),
  postal_code: Yup.string().required("Zip Code is required"),

  // Conditional fields
  plot_area: Yup.number().required("Plot Area is required"),

  land_type: Yup.number().required("Land Type is required"),

  built_up_area: Yup.number().required("Built-up Area is required"),

  buy_price: Yup.number().required("Buy Price is required"),

  price_per_sqft: Yup.number().required("Price Per Sq.ft is required"),

  lease_rent: Yup.number().required("Monthly Rent is required"),

  lease_duration: Yup.number().required("Lease Duration is required"),

  plot_price: Yup.number().required("Plot Price is required"),

  // Step 6: Contact Information
  full_name: Yup.string().required("Full Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone Number is required"),
});
