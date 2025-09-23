export const BASEURL = "https://zenbkad.zenwellnesslounge.com/api";


export const CLIENT_ID =
  "625052261407-4p8ihs05c67d778mr5d91lqjvnvpkd8k.apps.googleusercontent.com";

export const BACKEND_URL="http://31.97.206.165/api/"


// menuConfig.ts
export const menuConfig = {
  admin: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      path: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "link",
          icon: "IconMenuMailbox",
          label: "Waiting For Approval",
          path: "/apps/mailbox",
        },
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", path: "/apps/invoice/list" },
            { type: "link", label: "Create", path: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", path: "/apps/invoice/list" },
            { type: "link", label: "Create Property", path: "/real-estate/property/create" },
            { type: "link", label: "Property Catergory", path: "/apps/invoice/add" },
            { type: "link", label: "Amenities List", path: "/apps/invoice/edit" },
            { type: "link", label: "City", path: "/apps/invoice/edit" },
            { type: "link", label: "Media", path: "/apps/invoice/edit" },
            { type: "link", label: "Zip code", path: "/apps/invoice/edit" },
            { type: "link", label: "Reviews", path: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          path: "/apps/mailbox",
        },
      ],
    },
    {
      type: "section",
      label: "User Management",
      children: [
        {
          type: "link",
          icon: "IconMenuUsers",
          label: "All Users",
          path: "/real-estate/users/list",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create",
          path: "/charts",
        },
      ],
    },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          path: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Assign Leads",
          path: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          path: "/leads",
        },
      ],
    },
    {
      type: "section",
      label: "Inquiries",
      children: [
        {
          type: "link",
          icon: "IconMenuChat",
          label: "Inquiries List",
          path: "/users/profile",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Booking List",
          path: "/profile",
        },
      ],
    },
    {
      type: "section",
      label: "Reports",
      children: [
        {
          type: "link",
          icon: "IconMenuCharts",
          label: "Reports",
          path: "https://vristo.sbthemes.com",
          external: true,
        },
      ],
    },
  ],
};