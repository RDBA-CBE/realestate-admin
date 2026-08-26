import Link from "next/link";
import { useDispatch } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import IconMail from "@/components/Icon/IconMail";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconInstagram from "@/components/Icon/IconInstagram";
import IconFacebookCircle from "@/components/Icon/IconFacebookCircle";
import IconTwitter from "@/components/Icon/IconTwitter";
import IconGoogle from "@/components/Icon/IconGoogle";
import TextInput from "@/components/FormFields/TextInput.component";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import Utils from "@/imports/utils.import";
import * as Yup from "yup";
import Models from "@/imports/models.import";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import { userData } from "@/store/userConfigSlice";
import { CAPTCHA_SITE_KEY } from "@/utils/constant.utils";
import ReCAPTCHA from "react-google-recaptcha";


const LoginBoxed = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [loginCaptchaToken, setLoginCaptchaToken] = useState("");
  const captchaRef = useRef<ReCAPTCHA>(null);

  const resetCaptcha = () => {
    captchaRef.current?.reset();
    setLoginCaptchaToken("");
  };


  const [state, setState] = useSetState({
    showPassword: false,
    email: "",
    password: "",
    error: {} as Record<string, string>,
    btnLoading: false,
    showBuyerModal: false,
  });

  useEffect(() => {
    dispatch(setPageTitle("Login"));
  });

  const submitForm = async (e: any) => {
    e.preventDefault();
    try {
      setState({ btnLoading: true, error: {} });
      const body = {
        email: state.email.trim(),
        password: state.password,
        recaptcha_token: loginCaptchaToken,
      };

      await Utils.Validation.login.validate(body, { abortEarly: false });
      const res: any = await Models.auth.login(body);

      if (res?.user_type === "buyer") {
        resetCaptcha();
        setState({ btnLoading: false, showBuyerModal: true,password:"",email:"" });
        return;
      }

      Success("Login Successfully");
      localStorage.setItem("real_estate_admin_token", res.access);
      localStorage.setItem("real_estate_admin_refresh", res.refresh);
      localStorage.setItem("userId", res.user_id);
      if (res?.groups?.length > 0) {
        localStorage.setItem("group", res.groups[0]?.name);
      }
      resetCaptcha();
      router.replace("/");
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
        resetCaptcha();
        setState({ btnLoading: false });
      }
    }
  };

  return (
    <div>
      {state.showBuyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center shadow-xl">
            <h2 className="text-lg font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              This portal is not accessible for buyers. Please use the buyer portal to login.
            </p>
            <a
              href="https://www.boomrealtys.com/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full py-2 px-4 bg-dred text-white rounded uppercase font-semibold hover:opacity-90 transition"
            >
              Go to Buyer Portal
            </a>
            <button
              onClick={() => setState({ showBuyerModal: false })}
              className="mt-3 w-full py-2 px-4 border border-gray-300 rounded text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div className="relative flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-16">
        <div className="w-full max-w-[600px] flex flex-col justify-center rounded-md bg-lred px-4 py-10 h-fit shadow-none border-dred">
          <div className="mx-auto w-full max-w-[440px]">
            <div className="mb-10">
              <h1 className="text-xl text-center font-bold uppercase md:text-2xl">
                Sign in
              </h1>
              <p className="text-base text-center font-medium leading-normal text-white-dark">
                Enter your email and password to login
              </p>
            </div>
            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
              <TextInput
                name="email"
                type="email"
                title="Email"
                placeholder="Enter Email"
                value={state.email}
                onChange={(e) => setState({ email: e.target.value })}
                error={state.error?.email}
                icon={<IconMail fill={true} className="text-dred" />}
              />
              <TextInput
                id="Password"
                title="Password"
                type={state.showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className="form-input ps-10 placeholder:text-white-dark"
                onChange={(e) => setState({ password: e.target.value })}
                value={state.password}
                error={state.error?.password}
                icon={<IconLockDots fill={true} className="text-dred" />}
                rightIcon={state.showPassword ? <IconEyeOff className="text-dred" /> : <IconEye className="text-dred" />}
                rightIconOnlick={() => setState({ showPassword: !state.showPassword })}
              />
              <div className="text-right">
                <Link href="/auth/reset-password" className="text-sm text-dred hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="flex flex-col w-full items-center justify-center py-2">
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={CAPTCHA_SITE_KEY}
                  onChange={(token) => setLoginCaptchaToken(token || "")}
                />
                {state.error?.recaptcha_token && (
                  <p className="text-red-500 text-sm mt-1">{state.error.recaptcha_token}</p>
                )}
              </div>
              <PrimaryButton
                type="submit"
                text="Submit"
                className="btn !btn-dred !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                loading={state.btnLoading}
              />
            </form>
           {/* <div className="relative my-7 text-center md:mb-9">
              <span className="absolute inset-x-0 top-3 h-px w-full -translate-y-1 bg-[#ffb1b1] dark:bg-white-dark"></span>
              <span className="relative bg-lred px-2 font-medium uppercase text-white-dark dark:bg-dark dark:text-white-light">
                or
              </span>
            </div>
            <div className="text-center dark:text-white">
              Don't have an account ?&nbsp;
              <Link
                href="/auth/signup"
                className="uppercase text-dred underline transition hover:text-black dark:hover:text-white"
              >
                SIGN UP
              </Link>
            </div>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};
LoginBoxed.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};
export default LoginBoxed;
