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
import { UserCheck, Building2 } from "lucide-react";
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
        setState({ profile: res });
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
      await Utils.Validation.change_password.validate(body, { abortEarly: false });
      await Models.auth.change_password(body);
      Success("Password updated successfully");
      setState({ btnLoading: false, current_password: "", new_password: "", confirm_password: "", error: {} });
    } catch (error: any) {
      setState({ btnLoading: false });
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => { validationErrors[err.path!] = err.message; });
        setState({ error: validationErrors, btnLoading: false });
      } else if (error?.old_password) {
        Failure(error?.old_password);
      } else if (error?.new_password?.length > 0) {
        Failure(error?.new_password?.[0]);
      } else {
        Failure(error?.error);
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
      await Models.user.update(body, userString);
      Success("Profile updated successfully");
      setState({ isOpen: false, error: {}, btnLoading: false });
      profile();
    } catch (error: any) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: any = {};
        error.inner.forEach((err) => { validationErrors[err.path!] = err.message; });
        setState({ error: validationErrors, btnLoading: false });
      } else {
        setState({ btnLoading: false });
        Failure(error?.error);
      }
    }
  };

  const navItems = [
    { key: "profile", label: "Profile Info", icon: <UserCheck className="h-4 w-4" /> },
    { key: "password", label: "Change Password", icon: <IconLockDots className="h-4 w-4" /> },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-lg  font-semibold dark:text-white-light">My Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your personal information and settings</p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-4">

        {/* ── Sidebar ── */}
        <div className="lg:col-span-1">
          {/* Avatar Card */}
          <div className="panel border shadow-none overflow-hidden rounded-xl p-0">
            <div className="h-20 w-full bg-[#9b0f09]" />
            <div className="flex flex-col items-center px-5 pb-5">
              <div className="-mt-10 mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-[#9b0f09] text-2xl font-bold text-white shadow">
                {state.profile?.first_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                {capitalizeFLetter(state.profile?.first_name)} {state.profile?.last_name}
              </h2>
              <span className="mt-1 rounded-full bg-[#9b0f09] px-3 py-0.5 text-xs font-semibold text-white">
                {capitalizeFLetter(state?.profile?.groups?.[0])}
              </span>
              {state.profile?.email && (
                <p className="mt-2 text-xs text-gray-400 truncate max-w-full px-2">{state.profile?.email}</p>
              )}
            </div>
          </div>

          {/* Nav */}
          <div className="panel border shadow-none mt-4 rounded-xl py-5 px-2">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === item.key
                    ? "bg-[#9b0f09] text-white"
                    : "text-gray-600 hover:bg-[#fdf4f4] hover:text-[#9b0f09] dark:text-gray-300"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            </div>
            
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="panel border shadow-none rounded-xl lg:col-span-3">

          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div>
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Profile Information</h3>
                  <p className="mt-0.5 text-sm text-gray-400">View and manage your personal details</p>
                </div>
                <button
                  onClick={() =>
                    setState({
                      isOpen: true,
                      first_name: capitalizeFLetter(state.profile?.first_name),
                      last_name: capitalizeFLetter(state.profile?.last_name),
                      email: state.profile?.email,
                      industry: capitalizeFLetter(state.profile?.industry),
                      industry_start_year: state.profile?.industry_start_year,
                      location: state.profile?.location,
                    })
                  }
                  className="flex items-center gap-2 rounded-md bg-[#9b0f09] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#7d0c07]"
                >
                  <IconEdit className="h-4 w-4" />
                  Edit Profile
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoCard icon={<IconUser className="h-4 w-4" />} label="Full Name"
                  value={`${capitalizeFLetter(state.profile?.first_name)} ${state.profile?.last_name}`} />
                <InfoCard icon={<IconMail className="h-4 w-4" />} label="Email" value={state?.profile?.email} />
                {state?.profile?.industry && (
                  <InfoCard icon={<Building2 className="h-4 w-4" />} label="Industry" value={capitalizeFLetter(state?.profile?.industry)} />
                )}
                {state.profile?.industry_start_year && (
                  <InfoCard icon={<IconCalendar className="h-4 w-4" />} label="Industry Start Year" value={`${state.profile?.industry_start_year}`} />
                )}
                {state.profile?.location && (
                  <InfoCard icon={<IconMapPin className="h-4 w-4" />} label="Location" value={`${state.profile?.location}`} />
                )}
              </div>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div>
              <div className="mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Change Password</h3>
                <p className="mt-0.5 text-sm text-gray-400">Update your account password</p>
              </div>

              <form className="max-w-md space-y-5" onSubmit={submitForm}>
                <TextInput
                  title="Current Password"
                  type={state.showCurrentPassword ? "text" : "password"}
                  value={state.current_password}
                  onChange={(e) => setState({ current_password: e.target.value })}
                  error={state.error?.old_password}
                  icon={<IconLockDots fill />}
                  rightIcon={state.showCurrentPassword ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() => setState({ showCurrentPassword: !state.showCurrentPassword })}
                  required
                />
                <TextInput
                  title="New Password"
                  type={state.showPassword ? "text" : "password"}
                  value={state.new_password}
                  onChange={(e) => setState({ new_password: e.target.value })}
                  error={state.error?.new_password}
                  icon={<IconLockDots fill />}
                  rightIcon={state.showPassword ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() => setState({ showPassword: !state.showPassword })}
                  required
                />
                <TextInput
                  title="Confirm Password"
                  type={state.showPassword1 ? "text" : "password"}
                  value={state.confirm_password}
                  onChange={(e) => setState({ confirm_password: e.target.value })}
                  error={state.error?.confirm_password}
                  icon={<IconLockDots fill />}
                  rightIcon={state.showPassword1 ? <IconEyeOff /> : <IconEye />}
                  rightIconOnlick={() => setState({ showPassword1: !state.showPassword1 })}
                  required
                />
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-md bg-[#9b0f09] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7d0c07]"
                  >
                    {state.btnLoading ? <IconLoader className="animate-spin" /> : "Update Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        open={state.isOpen}
        close={() => setState({ isOpen: false })}
        addHeader="Update Profile"
        renderComponent={() => (
          <div className="space-y-4 p-2">
            <TextInput title="First Name" placeholder="Enter your first name" value={state.first_name}
              onChange={(e) => setState({ first_name: e.target.value })} error={state.error?.first_name} icon={<IconUser fill />} />
            <TextInput title="Last Name" placeholder="Enter your last name" value={state.last_name}
              onChange={(e) => setState({ last_name: e.target.value })} error={state.error?.last_name} icon={<IconUser fill />} />
            <TextInput title="Email Address" placeholder="Enter your email" value={state.email}
              onChange={(e) => setState({ email: e.target.value })} error={state.error?.email} icon={<IconMail fill />} />
            <TextInput title="Industry Name" placeholder="Enter your industry" value={state.industry}
              onChange={(e) => setState({ industry: e.target.value })} icon={<IconHome />} />
            <NumberInput title="Industry Start Year" placeholder="Enter Start Year" value={state.industry_start_year}
              onChange={(e) => setState({ industry_start_year: e.target.value })} icon={<IconMenuDatatables />} />
            <TextInput title="Location" placeholder="Enter your location" value={state.location}
              onChange={(e) => setState({ location: e.target.value })} icon={<IconMapPin />} />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setState({ isOpen: false })}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={updateProfile}
                className="flex flex-1 items-center justify-center rounded-md bg-[#9b0f09] py-2.5 text-sm font-semibold text-white transition hover:bg-[#7d0c07]">
                {state.btnLoading ? <IconLoader className="animate-spin" /> : "Save Changes"}
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#9b0f09]">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900 dark:text-white">{value || "—"}</p>
    </div>
  );
}
