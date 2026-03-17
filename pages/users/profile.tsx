"use client";

import NumberInput from "@/components/FormFields/NumberInputs.component";
import PrimaryButton from "@/components/FormFields/PrimaryButton.component";
import TextInput from "@/components/FormFields/TextInput.component";
import IconCalendar from "@/components/Icon/IconCalendar";
import IconEdit from "@/components/Icon/IconEdit";
import IconEye from "@/components/Icon/IconEye";
import IconEyeOff from "@/components/Icon/IconEyeOff";
import IconHome from "@/components/Icon/IconHome";
import IconLoader from "@/components/Icon/IconLoader";
import IconLockDots from "@/components/Icon/IconLockDots";
import IconMail from "@/components/Icon/IconMail";
import IconMapPin from "@/components/Icon/IconMapPin";
import IconUser from "@/components/Icon/IconUser";
import IconMenuDatatables from "@/components/Icon/Menu/IconMenuDatatables";
import Modal from "@/components/modal/modal.component";
import Models from "@/imports/models.import";
import Utils from "@/imports/utils.import";
import {
  buildFormData,
  capitalizeFLetter,
  Failure,
  Success,
  useSetState,
} from "@/utils/function.utils";

import { UserCheck, Building2, GraduationCap, BookOpen } from "lucide-react";

import { useEffect, useState } from "react";
import * as Yup from "yup";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("profile");

  const [state, setState] = useSetState({
    confirm_password: "",
    current_password: "",
    new_password: "",
    error: {},
    showCurrentPassword: false,
    showPassword: false,
    showPassword1: false,
    btnLoading: false,
    isOpen: false,
    username: "",
    email: "",
    profile: null,
    industry_start_year: "",
    location: "",
  });

  useEffect(() => {
    profile();
  }, []);

  const profile = async () => {
    try {
      const userString = localStorage.getItem("userId");

      if (userString) {
        const res: any = await Models.user.details(userString);
        console.log("getUserRole --->", res);
        setState({
          profile: res,
        });
      }
    } catch (error) {
      console.log("error: ", error);
    }
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    try {
      setState({ btnLoading: true });

      const body = {
        old_password: state.current_password,
        new_password: state.new_password,
        confirm_password: state.confirm_password,
      };

      await Utils.Validation.change_password.validate(body, {
        abortEarly: false,
      });

      await Models.auth.change_password(body);

      Success("Password updated successfully");

      setState({
        btnLoading: false,
        current_password: "",
        new_password: "",
        confirm_password: "",
        error: {},
      });
    } catch (error: any) {
      console.log("✌️error --->", error);
      setState({ btnLoading: false });

      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};

        error.inner.forEach((err) => {
          validationErrors[err.path!] = err.message;
        });

        setState({ error: validationErrors, btnLoading: false });
      } else if (error?.old_password) {
        Failure(error?.old_password);
      } else if (error?.new_password?.length > 0) {
        Failure(error?.new_password?.[0]);
      } else {
        Failure(error?.error);
        setState({ btnLoading: false });
      }
    }
  };

  const updateProfile = async () => {
    try {
      setState({ btnLoading: true });
      const userString = localStorage.getItem("userId");

      if (!userString) return;

      const body = {
        first_name: state.first_name,
        last_name: state.last_name,
        email: state.email,
        industry: state.industry,
        industry_start_year: state.industry_start_year,
        location: state.location,
      };

      //   await Utils.Validation.update_profile.validate(body, {
      //     abortEarly: false,
      //   });

      await Models.user.update(body, userString);

      Success("Profile updated successfully");

      setState({
        isOpen: false,
        error: {},
        btnLoading: false,
      });

      profile();
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};

        error.inner.forEach((err) => {
          validationErrors[err.path!] = err.message;
        });

        setState({ error: validationErrors, btnLoading: false });
      } else {
        setState({ btnLoading: false });

        Failure(error?.error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}

      <div className="mb-8">
        <h1 className="page-ti text-transparent">My Profile</h1>

        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
        <div className="flex min-h-[600px] flex-col md:flex-row">
          {/* Sidebar */}

          <div className="w-full border-r border-gray-200 bg-gradient-to-b from-gray-50 to-white dark:border-gray-700 dark:from-gray-900 dark:to-gray-800 md:w-72">
            <div className="p-6">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-2xl font-bold text-white shadow-lg">
                  {state.profile?.first_name?.charAt(0)?.toUpperCase()}
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {`${capitalizeFLetter(state.profile?.first_name)} ${
                      state.profile?.last_name
                    }`}
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {capitalizeFLetter(state?.profile?.groups?.[0])}
                  </p>
                </div>
              </div>
            </div>

            <nav className="flex flex-col space-y-1 px-3 pb-6">
              <button
                onClick={() => setActiveTab("profile")}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                  activeTab === "profile"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <UserCheck className="h-5 w-5" />
                Profile Info
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-left font-medium transition ${
                  activeTab === "password"
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <IconLockDots className="h-5 w-5" />
                Change Password
              </button>
            </nav>
          </div>

          {/* Content */}

          <div className="flex-1 p-8">
            {/* PROFILE TAB */}

            {activeTab === "profile" && (
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Profile Information
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      View and manage your personal details
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setState({
                        isOpen: true,

                        first_name: capitalizeFLetter(
                          state.profile?.first_name
                        ),
                        last_name: capitalizeFLetter(state.profile?.last_name),
                        email: state.profile?.email,
                        industry: capitalizeFLetter(state.profile?.industry),
                      })
                    }
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    <IconEdit className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <InfoCard
                    icon={<IconUser className="h-5 w-5" />}
                    label="Username"
                    value={`${capitalizeFLetter(state.profile?.first_name)} ${
                      state.profile?.last_name
                    }`}
                  />

                  <InfoCard
                    icon={<IconMail className="h-5 w-5" />}
                    label="Email"
                    value={state?.profile?.email}
                  />
                  {state?.profile?.industry && (
                    <InfoCard
                      icon={<Building2 className="h-5 w-5" />}
                      label="Industry"
                      value={capitalizeFLetter(state?.profile?.industry)}
                    />
                  )}
                  {state.profile?.industry_start_year && (
                    <InfoCard
                      icon={<IconCalendar className="h-5 w-5" />}
                      label="Industry Start Year"
                      value={`${state.profile?.industry_start_year}`}
                    />
                  )}
                  {state.profile?.location && (
                    <InfoCard
                      icon={<IconMapPin className="h-5 w-5" />}
                      label="Location"
                      value={`${state.profile?.location}`}
                    />
                  )}

                </div>
              </div>
            )}

            {/* PASSWORD TAB */}

            {activeTab === "password" && (
              <div>
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Change Password
                  </h3>
                </div>

                <form className="max-w-xl space-y-6" onSubmit={submitForm}>
                  <TextInput
                    title="Current Password"
                    type={state.showCurrentPassword ? "text" : "password"}
                    value={state.current_password}
                    onChange={(e) =>
                      setState({ current_password: e.target.value })
                    }
                    error={state.error?.old_password}
                    icon={<IconLockDots fill />}
                    rightIcon={
                      state.showCurrentPassword ? <IconEyeOff /> : <IconEye />
                    }
                    rightIconOnlick={() =>
                      setState({
                        showCurrentPassword: !state.showCurrentPassword,
                      })
                    }
                    required
                  />

                  <TextInput
                    title="New Password"
                    type={state.showPassword ? "text" : "password"}
                    value={state.new_password}
                    onChange={(e) => setState({ new_password: e.target.value })}
                    error={state.error?.new_password}
                    icon={<IconLockDots fill />}
                    rightIcon={
                      state.showPassword ? <IconEyeOff /> : <IconEye />
                    }
                    rightIconOnlick={() =>
                      setState({ showPassword: !state.showPassword })
                    }
                    required
                  />

                  <TextInput
                    title="Confirm Password"
                    type={state.showPassword1 ? "text" : "password"}
                    value={state.confirm_password}
                    onChange={(e) =>
                      setState({ confirm_password: e.target.value })
                    }
                    error={state.error?.confirm_password}
                    icon={<IconLockDots fill />}
                    rightIcon={
                      state.showPassword1 ? <IconEyeOff /> : <IconEye />
                    }
                    rightIconOnlick={() =>
                      setState({ showPassword1: !state.showPassword1 })
                    }
                    required
                  />

                  <div className="flex justify-end">
                    <PrimaryButton
                      type="submit"
                      text="Update Password"
                      loading={state.btnLoading}
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}

      <Modal
        open={state.isOpen}
        close={() => setState({ isOpen: false })}
        addHeader="Update Profile"
        renderComponent={() => (
          <div className="w-full  p-6">
            {/* Header */}
            {/* <div className="mb-6 text-center">
              <div className="bg-dblue mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full dark:from-blue-900 dark:to-purple-900">
                <IconUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Update Profile
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Modify your username and email
              </p>
            </div> */}

            {/* Form */}
            <div className="space-y-5">
              <TextInput
                title="First Name"
                placeholder="Enter your first name"
                value={state.first_name}
                onChange={(e) => setState({ first_name: e.target.value })}
                error={state.error?.first_name}
                icon={<IconUser fill />}
              />

              <TextInput
                title="Last Name"
                placeholder="Enter your last name"
                value={state.last_name}
                onChange={(e) => setState({ last_name: e.target.value })}
                error={state.error?.last_name}
                icon={<IconUser fill />}
              />

              <TextInput
                title="Email Address"
                placeholder="Enter your email"
                value={state.email}
                onChange={(e) => setState({ email: e.target.value })}
                error={state.error?.email}
                icon={<IconMail fill />}
              />

              <TextInput
                title="Industry Name"
                placeholder="Enter your industry"
                value={state.industry}
                onChange={(e) => setState({ industry: e.target.value })}
                icon={<IconHome />}
              />

              <NumberInput
                title="Industry Start Year"
                placeholder="Enter Start Year"
                value={state.industry_start_year}
                onChange={(e) =>
                  setState({ industry_start_year: e.target.value })
                }
                icon={<IconMenuDatatables />}
              />
              <TextInput
                title="Location"
                placeholder="Enter your industry location"
                value={state.location}
                onChange={(e) => setState({ location: e.target.value })}
                icon={<IconMapPin />}
              />
            </div>

            {/* Footer */}
            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setState({ isOpen: false })}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>

              <button
                onClick={updateProfile}
                className="flex flex-1 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:shadow-lg"
              >
                {state.btnLoading ? (
                  <IconLoader className="animate-spin" />
                ) : (
                  "Update Profile"
                )}
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

function InfoCard({ label, value, icon }: any) {
  return (
    <div className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
      <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        {icon}
        {label}
      </div>

      <p className="font-semibold text-gray-900 dark:text-white">
        {value || "-"}
      </p>
    </div>
  );
}
