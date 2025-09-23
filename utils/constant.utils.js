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
            { type: "link", label: "List", href: "real-estate/property/list" },
            { type: "link", label: "Create Property", href: "/real-estate/property/create" },
            { type: "link", label: "Property Catergory", href: "/apps/invoice/add" },
            { type: "link", label: "Amenities List", href: "/apps/invoice/edit" },
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

export const  propertyType = [
  { value: 1,
    label:"Appartment"
  },
   { value: 2,
    label:"House"
  },
   { value: 3,
    label:"Office"
  },

   { value: 4,
    label:"Loft"
  }
]

export const facingDirection = [
  { value: 1, label: "North" },
  { value: 2, label: "East" },
  { value: 3, label: "West" },
  { value: 4, label: "South" },
  { value: 5, label: "North-East" },
  { value: 6, label: "South-East" },
  { value: 7, label: "South-West" },
  { value: 8, label: "North-West" },
  { value: 9, label: "East-Facing Corner" },
  { value: 10, label: "West-Facing Corner" }
];

export const amenitiesList = [
  { value: "parking", label: "Car Parking" },
  { value: "power_backup", label: "Power Backup" },
  { value: "lift", label: "Lift / Elevator" },
  { value: "security", label: "24x7 Security" },
  { value: "cctv", label: "CCTV Surveillance" },
  { value: "water_supply", label: "24x7 Water Supply" },
  { value: "gym", label: "Gym / Fitness Center" },
  { value: "swimming_pool", label: "Swimming Pool" },
  { value: "children_play_area", label: "Children's Play Area" },
  { value: "clubhouse", label: "Clubhouse / Community Hall" },
  { value: "garden", label: "Park / Garden" },
  { value: "intercom", label: "Intercom Facility" },
  { value: "internet", label: "Wi-Fi / Internet" },
  { value: "fire_safety", label: "Fire Safety" },
  { value: "rainwater_harvesting", label: "Rainwater Harvesting" },
  { value: "shopping_center", label: "Shopping Center" },
  { value: "sports_facilities", label: "Sports Facilities" },
  { value: "visitor_parking", label: "Visitor Parking" },
  { value: "community_events", label: "Community Events Area" }
];

export const ROLES = {
  ADMIN: "Admin",
  SELLER: "Sellers",
  BUYER: "Buyer",
  DEVELOPER: "Developers",
  AGENT: "Agents",
};
