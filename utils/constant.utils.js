export const BASEURL = "https://zenbkad.zenwellnesslounge.com/api";

export const CLIENT_ID =
  "625052261407-4p8ihs05c67d778mr5d91lqjvnvpkd8k.apps.googleusercontent.com";

export const BACKEND_URL = "http://31.97.206.165/api/";

// menuConfig.ts
export const menuConfig = {
  admin: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "link",
          icon: "IconMenuMailbox",
          label: "Waiting For Approval",
          href: "/apps/mailbox",
        },
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/real-estate/property/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Property Catergory",
              href: "/apps/invoice/add",
            },
            {
              type: "link",
              label: "Amenities List",
              href: "/apps/invoice/edit",
            },
            { type: "link", label: "City", href: "/apps/invoice/edit" },
            { type: "link", label: "Media", href: "/apps/invoice/edit" },
            { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/apps/mailbox",
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
          href: "/real-estate/users/list",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create",
          href: "/charts",
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
          href: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Assign Leads",
          href: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/leads",
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
          href: "/users/profile",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Booking List",
          href: "/profile",
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
          href: "https://vristo.sbthemes.com",
          external: true,
        },
      ],
    },
  ],

  agent: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Property Catergory",
              href: "/apps/invoice/add",
            },
            {
              type: "link",
              label: "Amenities List",
              href: "/apps/invoice/edit",
            },
            { type: "link", label: "City", href: "/apps/invoice/edit" },
            { type: "link", label: "Media", href: "/apps/invoice/edit" },
            { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/apps/mailbox",
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
          href: "/real-estate/users/list",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create",
          href: "/charts",
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
          href: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Assign Leads",
          href: "/leads",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/leads",
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
          href: "/users/profile",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Booking List",
          href: "/profile",
        },
      ],
    },
  ],

  seller: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            { type: "link", label: "Create", href: "/apps/invoice/preview" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            {
              type: "link",
              label: "Create Property",
              href: "/real-estate/property/create",
            },
            {
              type: "link",
              label: "Property Catergory",
              href: "/apps/invoice/add",
            },
            {
              type: "link",
              label: "Amenities List",
              href: "/apps/invoice/edit",
            },
            { type: "link", label: "City", href: "/apps/invoice/edit" },
            { type: "link", label: "Media", href: "/apps/invoice/edit" },
            { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/apps/mailbox",
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
          href: "/real-estate/users/list",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create",
          href: "/charts",
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
          href: "/users/profile",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Booking List",
          href: "/profile",
        },
      ],
    },
  ],

  developer: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/profile",
    },
    {
      type: "section",
      label: "Project Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/apps/invoice/list" },
            { type: "link", label: "Create", href: "/apps/invoice/preview" },
            {
              type: "link",
              label: "Property Catergory",
              href: "/apps/invoice/add",
            },
            {
              type: "link",
              label: "Amenities List",
              href: "/apps/invoice/edit",
            },
            { type: "link", label: "City", href: "/apps/invoice/edit" },
            { type: "link", label: "Media", href: "/apps/invoice/edit" },
            { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },

        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Projects",
          href: "/apps/mailbox",
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
          href: "/real-estate/users/list",
        },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create",
          href: "/charts",
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
          href: "/users/profile",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Booking List",
          href: "/profile",
        },
      ],
    },
  ],
};

export const ROLES = {
  ADMIN: "Admin",
  SELLER: "Sellers",
  BUYER: "Buyer",
  DEVELOPER: "Developers",
  AGENT: "Agents",
};
