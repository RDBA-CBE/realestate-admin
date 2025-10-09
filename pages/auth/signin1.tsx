import Link from 'next/link';
import { useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { setPageTitle } from '../../store/themeConfigSlice';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import IconMail from '@/components/Icon/IconMail';
import IconLockDots from '@/components/Icon/IconLockDots';
import IconInstagram from '@/components/Icon/IconInstagram';
import IconFacebookCircle from '@/components/Icon/IconFacebookCircle';
import IconTwitter from '@/components/Icon/IconTwitter';
import IconGoogle from '@/components/Icon/IconGoogle';
import TextInput from '@/components/FormFields/TextInput.component';
import { Failure, Success, useSetState } from '@/utils/function.utils';
import IconEye from '@/components/Icon/IconEye';
import IconEyeOff from '@/components/Icon/IconEyeOff';
import Utils from '@/imports/utils.import';
import * as Yup from 'yup';
import Models from '@/imports/models.import';
import PrimaryButton from '@/components/FormFields/PrimaryButton.component';
import { userData } from '@/store/userConfigSlice';
import { useFormik } from 'formik';

// Validation schemas
const signUpValidationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const loginValidationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: Yup.boolean(),
});

const SignUpForm = () => {
  const [activeTab, setActiveTab] = useState('signup');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();

  // Sign Up Form
  const signUpFormik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
    },
    validationSchema: signUpValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Sign Up Values:', values);
        // Add your sign up API call here
        // await Models.auth.signUp(values);
        Success('Account created successfully!');
        // router.push('/dashboard');
      } catch (error: any) {
        Failure(error?.message || 'Sign up failed. Please try again.');
      }
    },
  });

  // Login Form
  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      try {
        console.log('Login Values:', values);
        // Add your login API call here
        // const response = await Models.auth.login(values);
        // Utils.setLocalStorage('token', response.token);
        Success('Login successful!');
        // router.push('/dashboard');
      } catch (error: any) {
        Failure(error?.message || 'Login failed. Please check your credentials.');
      }
    },
  });

  useEffect(() => {
    dispatch(setPageTitle('Login / Sign Up'));
  }, [dispatch]);

  const resetForms = () => {
    signUpFormik.resetForm();
    loginFormik.resetForm();
    setShowPassword(false);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetForms();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          {/* Tabs */}
          <div className='mb-6 flex border-b border-gray-200'>
            <button
              onClick={() => handleTabChange('signup')}
              className={`flex-1 px-4 py-2 text-center text-sm font-medium ${
                activeTab === 'signup'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 px-4 py-2 text-center text-sm font-medium ${
                activeTab === 'login'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
          </div>

          {/* Header */}
          <div className='mb-6 text-center'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {activeTab === 'signup' ? 'Sign up' : 'Login'}
            </h2>
          </div>

          {/* Social Sign Up Buttons */}
          <div className='space-y-3'>
            <button 
              type="button"
              className='flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              <IconFacebookCircle className='mr-2 h-5 w-5 text-blue-600' />
              {activeTab === 'signup'
                ? 'Sign up with Facebook'
                : 'Login with Facebook'}
            </button>

            <button 
              type="button"
              className='flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            >
              <IconGoogle className='mr-2 h-5 w-5 text-red-600' />
              {activeTab === 'signup'
                ? 'Sign up with Google'
                : 'Login with Google'}
            </button>
          </div>

          {/* OR Separator */}
          <div className='mb-6 mt-6'>
            <div className='relative'>
              <div className='absolute inset-0 flex items-center'>
                <div className='w-full border-t border-gray-300'></div>
              </div>
              <div className='relative flex justify-center text-sm'>
                <span className='bg-white px-2 text-gray-500'>OR</span>
              </div>
            </div>
          </div>

          {/* Forms */}
          {activeTab === 'signup' ? (
            // Sign Up Form
            <form className='space-y-4' onSubmit={signUpFormik.handleSubmit}>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <TextInput
                    type='text'
                    name='firstName'
                    placeholder='First name'
                    value={signUpFormik.values.firstName}
                    onChange={signUpFormik.handleChange}
                    onBlur={signUpFormik.handleBlur}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                      signUpFormik.touched.firstName && signUpFormik.errors.firstName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {signUpFormik.touched.firstName && signUpFormik.errors.firstName && (
                    <div className="mt-1 text-sm text-red-600">
                      {signUpFormik.errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <TextInput
                    type='text'
                    name='lastName'
                    placeholder='Last name'
                    value={signUpFormik.values.lastName}
                    onChange={signUpFormik.handleChange}
                    onBlur={signUpFormik.handleBlur}
                    className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                      signUpFormik.touched.lastName && signUpFormik.errors.lastName
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {signUpFormik.touched.lastName && signUpFormik.errors.lastName && (
                    <div className="mt-1 text-sm text-red-600">
                      {signUpFormik.errors.lastName}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <TextInput
                  type='email'
                  name='email'
                  placeholder='Email address'
                  value={signUpFormik.values.email}
                  onChange={signUpFormik.handleChange}
                  onBlur={signUpFormik.handleBlur}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                    signUpFormik.touched.email && signUpFormik.errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {signUpFormik.touched.email && signUpFormik.errors.email && (
                  <div className="mt-1 text-sm text-red-600">
                    {signUpFormik.errors.email}
                  </div>
                )}
              </div>

              <div>
                <PrimaryButton
                  type='submit'
                  disabled={!signUpFormik.isValid || signUpFormik.isSubmitting}
                  className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !signUpFormik.isValid || signUpFormik.isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {signUpFormik.isSubmitting ? 'Signing up...' : 'Sign up'}
                </PrimaryButton>
              </div>
            </form>
          ) : (
            // Login Form
            <form className='space-y-4' onSubmit={loginFormik.handleSubmit}>
              <div>
                <TextInput
                  type='email'
                  name='email'
                  placeholder='Email address'
                  value={loginFormik.values.email}
                  onChange={loginFormik.handleChange}
                  onBlur={loginFormik.handleBlur}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                    loginFormik.touched.email && loginFormik.errors.email
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                {loginFormik.touched.email && loginFormik.errors.email && (
                  <div className="mt-1 text-sm text-red-600">
                    {loginFormik.errors.email}
                  </div>
                )}
              </div>

              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  placeholder='Password'
                  value={loginFormik.values.password}
                  onChange={loginFormik.handleChange}
                  onBlur={loginFormik.handleBlur}
                  className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-blue-500 sm:text-sm ${
                    loginFormik.touched.password && loginFormik.errors.password
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <IconEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
                {loginFormik.touched.password && loginFormik.errors.password && (
                  <div className="mt-1 text-sm text-red-600">
                    {loginFormik.errors.password}
                  </div>
                )}
              </div>

              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  <input
                    id='remember-me'
                    name='rememberMe'
                    type='checkbox'
                    checked={loginFormik.values.rememberMe}
                    onChange={loginFormik.handleChange}
                    className='h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                  />
                  <label
                    htmlFor='remember-me'
                    className='ml-2 block text-sm text-gray-900'
                  >
                    Remember me
                  </label>
                </div>

                <div className='text-sm'>
                  <Link
                    href='/forgot-password'
                    className='font-medium text-blue-600 hover:text-blue-500'
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <PrimaryButton
                  type='submit'
                  disabled={!loginFormik.isValid || loginFormik.isSubmitting}
                  className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    !loginFormik.isValid || loginFormik.isSubmitting
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loginFormik.isSubmitting ? 'Logging in...' : 'Login'}
                </PrimaryButton>
              </div>
            </form>
          )}

          {/* Additional Links */}
          <div className='mt-6 text-center text-sm text-gray-600'>
            {activeTab === 'signup' ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => handleTabChange('login')}
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Login
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => handleTabChange('signup')}
                  className='font-medium text-blue-600 hover:text-blue-500'
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

SignUpForm.getLayout = (page: any) => {
  return <BlankLayout>{page}</BlankLayout>;
};

export default SignUpForm;