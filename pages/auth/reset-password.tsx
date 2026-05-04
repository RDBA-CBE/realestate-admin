import Link from "next/link";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { setPageTitle } from "../../store/themeConfigSlice";
import { useRouter } from "next/router";
import BlankLayout from "@/components/Layouts/BlankLayout";
import IconMail from "@/components/Icon/IconMail";
import TextInput from "@/components/FormFields/TextInput.component";
import { Failure, Success, useSetState } from "@/utils/function.utils";
import Models from "@/imports/models.import";
import IconLoader from "@/components/Icon/IconLoader";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [state, setState] = useSetState({
    email: "",
    error: {},
    btnLoading: false,
  });

  useEffect(() => {
    dispatch(setPageTitle("Forgot Password"));
  });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!state.email) {
      setState({ error: { email: "Email is required" } });
      return;
    }
    try {
      setState({ btnLoading: true });
      await Models.auth.forget_password({ email: state.email.trim() });
      Success("Password reset link sent to your email");
      router.push("/auth/signin");
    } catch (error: any) {
      console.log("✌️error --->", error);
      Failure(error?.error || error?.detail || "Something went wrong");
      setState({ btnLoading: false });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-6 py-10 sm:px-16">
      <div className="w-full max-w-[600px] flex flex-col justify-center rounded-md bg-lred px-4 py-10 h-fit shadow-none border-dred">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-10">
            <h1 className="text-xl text-center font-bold uppercase md:text-2xl">
              Forgot Password
            </h1>
            <p className="text-base text-center font-medium leading-normal text-white-dark">
              Enter your email to receive a password reset link
            </p>
          </div>
          <form className="space-y-5 dark:text-white" onSubmit={handleSubmit}>
            <TextInput
              name="email"
              type="email"
              title="Email"
              placeholder="Enter Email"
              value={state.email}
              onChange={(e) =>
                setState({ email: e.target.value, error: { ...state.error, email: "" } })
              }
              error={state.error?.email}
              icon={<IconMail fill={true} className="text-dred" />}
              required
            />
            <button
              type="submit"
              className="btn btn-dred !mt-6 w-full border-0 uppercase"
            >
              {state.btnLoading ? <IconLoader className="animate-spin" /> : "Send Reset Link"}
            </button>
          </form>
          <div className="relative my-7 text-center md:mb-9">
            <span className="absolute inset-x-0 top-3 h-px w-full -translate-y-1 bg-[#ffb1b1] dark:bg-white-dark"></span>
            <span className="relative bg-lred px-2 font-medium uppercase text-white-dark dark:bg-dark dark:text-white-light">
              or
            </span>
          </div>
          <div className="text-center dark:text-white">
            Remember your password?&nbsp;
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

ForgotPassword.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default ForgotPassword;
