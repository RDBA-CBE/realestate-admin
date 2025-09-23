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
