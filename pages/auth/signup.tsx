import Link from "next/link";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import IconMail from "@/components/Icon/IconMail";
import IconGoogle from "@/components/Icon/IconGoogle";
import TextInput from "@/components/FormFields/TextInput.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import {
  Failure,
  getPasswordStrength,
  Success,
  useSetState,
} from "@/utils/function.utils";
import NumberInput from "@/components/FormFields/NumberInputs.component";
import CustomSelect from "@/components/FormFields/CustomSelect.component";
import Utils from "@/imports/utils.import";
import Models from "@/imports/models.import";
import * as Yup from "yup";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import ReCAPTCHA from "react-google-recaptcha";
import { CAPTCHA_SITE_KEY } from "@/utils/constant.utils";
import IconEye from "@/components/Icon/IconEye";

const RegisterBoxed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [signupCaptchaToken, setSignupCaptchaToken] = useState("");

  const [state, setState] = useSetState({
    showPassword: false,
    assignRole: null,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    passwordStrength: "",
    btnLoading: false,
  });

  useEffect(() => {
    dispatch(setPageTitle("Register"));
  });

  const submitForm = async (e: any) => {
    e.preventDefault();
    try {
      setState({ btnLoading: true });
      const body = {
        email: state.email.trim(),
        first_name: state.first_name,
        last_name: state.last_name,
        phone: state.phone,
        user_type: state.assignRole?.value,
        password: state.password,
        terms_accepted: true,
        recaptcha_token: signupCaptchaToken,
      };
      console.log("✌️body --->", body);

      await Utils.Validation.signin.validate(body, { abortEarly: false });
      const res: any = await Models.auth.singup(body);
      Success("Register Successfully");
      // localStorage.setItem("token", res.access);
      // localStorage.setItem("refresh", res.refresh);
      // localStorage.setItem("userId", res.user_id);
      // if (res?.groups?.length > 0) {
      //   localStorage.setItem("group", res.groups[0]);
      // }
      router.replace("/auth/signin");
      setState({ btnLoading: false });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors = {};
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setState({
      [name]: value,
      error: { ...state.error, [name]: "" },
    });
  };

  return (
   
     

      <div className="relative flex min-h-screen items-center justify-center bg-white  px-6 py-10  sm:px-16">
        
        
          <div className="w-full max-w-[750px] flex flex-col justify-center rounded-md bg-lred px-10 py-10 h-fit shadow-none border-dred">
            <div className="mx-auto w-full ">
              <div className="mb-10">
                <h1 className="text-xl font-bold uppercase md:text-2xl text-center">
                  Sign Up
                </h1>
                <p className="text-base text-center font-medium leading-normal text-white-dark">
                  Enter your details to register
                </p>
              </div>
              <form className=" dark:text-white " onSubmit={submitForm} >
                <div className="grid md:grid-cols-2 gap-5">
                <TextInput
                  name="first_name"
                  type="text"
                  title="First Name"
                  placeholder="Enter Email"
                  value={state.first_name}
                  onChange={handleInputChange}
                  error={state.error?.first_name}
                  icon={<IconMail fill={true} className="text-dred"/>}
                  required
                />
                <TextInput
                  name="last_name"
                  type="text"
                  title="Last Name"
                  placeholder="Enter Email"
                  value={state.last_name}
                  onChange={handleInputChange}
                  error={state.error?.last_name}
                  icon={<IconMail fill={true} className="text-dred"/>}
                  required
                />
                <TextInput
                  name="email"
                  id="email"
                  type="email"
                  title="Email"
                  placeholder="Enter Email"
                  value={state.email}
                  onChange={handleInputChange}
                  error={state.error?.email}
                  icon={<IconMail fill={true} className="text-dred"/>}
                  required
                />
                <NumberInput
                  name="phone"
                  title="Phone Number"
                  value={state.phone}
                  onChange={handleInputChange}
                  placeholder={"Phone Number"}
                  error={state.error?.phone}
                  required
                />
                <CustomSelect
                  value={state.assignRole}
                  onChange={(e) =>
                    setState({
                      assignRole: e,

                      error: { ...state.error, user_type: "" },
                    })
                  }
                  placeholder={"Select Role"}
                  title={"Choose Role"}
                  options={[
                    { value: "seller", label: "Seller" },
                    { value: "developer", label: "Developer" },
                    { value: "agent", label: "Agent" },

                  ]}
                  required
                  error={state.error?.user_type}
                />
                <div className="flex flex-col gap-1">
                <TextInput
              
                  name="password"
                  id="password"
                  title="Password"
                  type={state.showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="form-input ps-10 placeholder:text-white-dark"
                  onChange={(e) => {
                    const value = e.target.value;
                    setState({
                      password: e.target.value,
                      error: { ...state.error, password: "" },
                      passwordStrength: getPasswordStrength(value),
                    });
                  }}
                  value={state.password}
                  error={state.error?.password}
                  icon={<IconLockDots fill={true} className="text-dred"/>}
                  rightIcon={state.showPassword ? <IconEyeOff className="text-dred"/> : <IconEye className="text-dred"/>}
                  rightIconOnlick={() =>
                    setState({ showPassword: !state.showPassword })
                  }
                />
                {state.password && (
                  <p
                    className={`text-sm ${
                      state.passwordStrength === "weak"
                        ? "text-red-500"
                        : state.passwordStrength === "medium"
                        ? "text-yellow-500"
                        : "text-green-600"
                    }`}
                  >
                    {state.passwordStrength === "weak" && "Weak password"}
                    {state.passwordStrength === "medium" && "Medium strength"}
                    {state.passwordStrength === "strong" && "Strong password"}
                  </p>
                )}
                </div>

                </div>

               

                {/* <TextInput
                  id="Password"
                  type={state.showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  className="form-input ps-10 placeholder:text-white-dark"
                  onChange={(e) => setState({ password: e.target.value })}
                  value={state.password}
                  error={state.error?.password}
                  icon={<IconLockDots fill={true} />}
                  rightIcon={state.showPassword ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() =>
                    setState({ showPassword: !state.showPassword })
                  }
                /> */}

                {/* <button
                  type="submit"
                  className="btn btn-dred !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                >
                  Sign in
                </button> */}
                {/* <PrimaryButton text={"Sign In"} /> */}
                <div className="flex justify-center mt-4">
                  <PrimaryButton
                  type="submit"
                  text="Submit"
                  className="btn btn-dred !mt-6 w-fit  px-20 text-center border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                  loading={state.btnLoading}
                />
                </div>
                
              </form>
              <div className="relative my-7 text-center md:mb-9">
                <span className="absolute inset-x-0 top-3 h-px w-full -translate-y-1 bg-[#ffb1b1] dark:bg-white-dark"></span>
                <span className="relative bg-lred px-2 font-medium uppercase text-white-dark dark:bg-dark dark:text-white-light">
                  or
                </span>
              </div>
              
              <div className="text-center dark:text-white">
                Already have an account ?&nbsp;
                <Link
                  href="/auth/signin"
                  className="uppercase text-dred underline transition hover:text-black dark:hover:text-white"
                >
                  SIGN IN
                </Link>
              </div>
            </div>
          </div>
        
      </div>
   
  );
};
RegisterBoxed.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default RegisterBoxed;
