export const CLIENT_ID =
  "625052261407-4p8ihs05c67d778mr5d91lqjvnvpkd8k.apps.googleusercontent.com";

// export const BACKEND_URL = "http://31.97.206.165/api/";

export const BACKEND_URL = "https://file.boomrealtys.com/api/";
export const FRONTEND_URL = "https://realestate-front-eight.vercel.app/";

export const  CAPTCHA_SITE_KEY = "6LeEe9gsAAAAAKddSPmwNUF4J-v7zaz8CgeKZ7n3"


// menuConfig.ts
export const menuConfig = {
  Admin: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/",
    },
    {
      type: "section",
      label: "Property Management",
      children: [
        // {
        //   type: "link",
        //   icon: "IconMenuMailbox",
        //   label: "Waiting For Approval",
        //   href: "/real-estate/project/approval",
        // },

        {
          type: "submenu",
          icon: "IconMenuDashboard",
          label: "Property",
          key: "Property",
          children: [
            {
              type: "link",
              label: "Property List",
              href: "/real-estate/property/list",
            },
            {
              type: "link",
              label: "Waiting For Approval",
              href: "/real-estate/property/approval",
            },

            // {
            //   type: "link",
            //   label: "Create Property",
            //   href: "/real-estate/property/create",
            // },
            // {
            //   type: "link",
            //   label: "Property Types",
            //   href: "/real-estate/property/property-type",
            // },
            // {
            //   type: "link",
            //   label: "Amenities",
            //   href: "/real-estate/property/amenities",
            // },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            {
              type: "link",
              label: "List",
              href: "/real-estate/project/adminlist",
            },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/real-estate/property/myProperty",
        },
      ],
    },
    {
      type: "section",
      label: "User Management",
      children: [
        {
          type: "link",
          icon: "IconMenuMailbox",
          label: "Waiting For Approval",
          href: "/real-estate/users/approval",
        },
        {
          type: "link",
          icon: "IconMenuUsers",
          label: "All Users",
          href: "/real-estate/users/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Create",
        //   href: "/real-estate/users/create",
        // },
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
          href: "/real-estate/lead/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuForms",
        //   label: "Assign Leads",
        //   href: "/real-estate/lead/assignLead",
        // },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Bookings",
    //       href: "/real-estate/inquiry/bookingList",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Reports",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuCharts",
    //       label: "Reports",
    //       href: "/",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Master Data",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "Property Types",
          href: "/real-estate/property/property-type",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Amenities",
          href: "/real-estate/property/amenities",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Furnishing Types",
        //   href: "/real-estate/masters/furnishing-type",
        // },
      ],
    },
  ],

  Agent: [
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
        // {
        //   type: "submenu",
        //   icon: "IconMenuApps",
        //   label: "Projects",
        //   key: "Projects",
        //   children: [
        //     { type: "link", label: "List", href: "/real-estate/project/list" },
        //     // { type: "link", label: "Create", href: "/apps/invoice/preview" },
        //   ],
        // },
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
            // {
            //   type: "link",
            //   label: "Property Types",
            //   href: "/real-estate/property/property-type",
            // },
            // {
            //   type: "link",
            //   label: "Amenities",
            //   href: "/real-estate/property/amenities",
            // },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        {
          type: "link",
          icon: "IconMenuNotes",
          label: "My Properties",
          href: "/real-estate/property/myProperty",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
    // {
    //   type: "link",
    //   icon: "IconMenuScrumboard",
    //   label: "Create",
    //   href: "/real-estate/users/create",
    // },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuForms",
        //   label: "Assign Leads",
        //   href: "/real-estate/lead/assignLead",
        // },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Reports",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuCharts",
    //       label: "Reports",
    //       href: "/real-estate/report",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Master Data",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "Property Types",
          href: "/real-estate/property/property-type",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Amenities",
          href: "/real-estate/property/amenities",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Furnishing Types",
        //   href: "/real-estate/masters/furnishing-type",
        // },
      ],
    },
  ],

  Seller: [
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
        // {
        //   type: "submenu",
        //   icon: "IconMenuApps",
        //   label: "Projects",
        //   key: "Projects",
        //   children: [
        //     { type: "link", label: "List", href: "/real-estate/project/list" },
        //     // { type: "link", label: "Create", href: "/apps/invoice/preview" },
        //   ],
        // },
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
            // {
            //   type: "link",
            //   label: "Property Types",
            //   href: "/real-estate/property/property-type",
            // },
            // {
            //   type: "link",
            //   label: "Amenities",
            //   href: "/real-estate/property/amenities",
            // },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        // {
        //   type: "link",
        //   icon: "IconMenuNotes",
        //   label: "My Properties",
        //   href: "/real-estate/property/myProperty",
        // },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
    //     // {
    //     //   type: "link",
    //     //   icon: "IconMenuScrumboard",
    //     //   label: "Create",
    //     //   href: "/real-estate/users/create",
    //     // },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuForms",
        //   label: "Assign Leads",
        //   href: "/real-estate/lead/assignLead",
        // },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Leads",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuTables",
    //       label: "List",
    //       href: "/real-estate/lead/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuForms",
    //       label: "Assign Leads",
    //       href: "/real-estate/lead/assignLead",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create Leads",
    //       href: "/real-estate/lead/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Bookings",
    //       href: "/real-estate/inquiry/bookingList",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Reports",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuCharts",
    //       label: "Reports",
    //       href: "/real-estate/report",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Master Data",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "Property Types",
          href: "/real-estate/property/property-type",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Amenities",
          href: "/real-estate/property/amenities",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Furnishing Types",
        //   href: "/real-estate/masters/furnishing-type",
        // },
      ],
    },
  ],

  Developer: [
    {
      type: "link",
      icon: "IconMenuWidgets",
      label: "dashboard",
      href: "/",
    },
    {
      type: "section",
      label: "Property Management",
      children: [
        {
          type: "submenu",
          icon: "IconMenuApps",
          label: "Projects",
          key: "Projects",
          children: [
            { type: "link", label: "List", href: "/real-estate/project/list" },
            // { type: "link", label: "Create", href: "/apps/invoice/preview" },
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
            // {
            //   type: "link",
            //   label: "Property Types",
            //   href: "/real-estate/property/property-type",
            // },
            // {
            //   type: "link",
            //   label: "Amenities",
            //   href: "/real-estate/property/amenities",
            // },
            // { type: "link", label: "City", href: "/apps/invoice/edit" },
            // { type: "link", label: "Media", href: "/apps/invoice/edit" },
            // { type: "link", label: "Zip code", href: "/apps/invoice/edit" },
            // { type: "link", label: "Reviews", href: "/apps/invoice/edit" },
          ],
        },
        // {
        //   type: "link",
        //   icon: "IconMenuNotes",
        //   label: "My Properties",
        //   href: "/real-estate/property/myProperty",
        // },
      ],
    },
    // {
    //   type: "section",
    //   label: "User Management",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuUsers",
    //       label: "All Users",
    //       href: "/real-estate/users/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create",
    //       href: "/real-estate/users/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Leads",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuTables",
    //       label: "List",
    //       href: "/real-estate/lead/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuForms",
    //       label: "Assign Leads",
    //       href: "/real-estate/lead/assignLead",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuScrumboard",
    //       label: "Create Leads",
    //       href: "/real-estate/lead/create",
    //     },
    //   ],
    // },
    // {
    //   type: "section",
    //   label: "Inquiries",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuChat",
    //       label: "Inquiries",
    //       href: "/real-estate/inquiry/list",
    //     },
    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Bookings",
    //       href: "/real-estate/inquiry/bookingList",
    //     },

    //     {
    //       type: "link",
    //       icon: "IconMenuPages",
    //       label: "Create Booking",
    //       href: "/real-estate/inquiry/createBooking",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Leads",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "List",
          href: "/real-estate/lead/list",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuForms",
        //   label: "Assign Leads",
        //   href: "/real-estate/lead/assignLead",
        // },
        {
          type: "link",
          icon: "IconMenuScrumboard",
          label: "Create Leads",
          href: "/real-estate/lead/create",
        },
        {
          type: "link",
          icon: "IconMenuPages",
          label: "Bookings",
          href: "/real-estate/inquiry/bookingList",
        },
      ],
    },
    // {
    //   type: "section",
    //   label: "Reports",
    //   children: [
    //     {
    //       type: "link",
    //       icon: "IconMenuCharts",
    //       label: "Reports",
    //       href: "/real-estate/report",
    //     },
    //   ],
    // },
    {
      type: "section",
      label: "Users",
      children: [
        {
          type: "link",
          icon: "IconMenuUsers",
          label: "Users",
          href: "/real-estate/users/developer_user",
        }
      ],
    },
    {
      type: "section",
      label: "Master Data",
      children: [
        {
          type: "link",
          icon: "IconMenuTables",
          label: "Property Types",
          href: "/real-estate/property/property-type",
        },
        {
          type: "link",
          icon: "IconMenuForms",
          label: "Amenities",
          href: "/real-estate/property/amenities",
        },

        {
          type: "link",
          icon: "IconMenuForms",
          label: "Lead Source",
          href: "/real-estate/masters/lead_source",
        },

        {
          type: "link",
          icon: "IconMenuForms",
          label: "Lead Status",
          href: "/real-estate/masters/lead_status",
        },
        // {
        //   type: "link",
        //   icon: "IconMenuScrumboard",
        //   label: "Furnishing Types",
        //   href: "/real-estate/masters/furnishing-type",
        // },
      ],
    },
  ],
};

export const propertyType = [
  { value: 1, label: "Sale" },
  { value: 2, label: "Rent" },
  { value: 3, label: "Lease" },

  { value: 4, label: "Plot" },
];

export const FURNISHING_TYPE = [
  { value: "furnished", label: "Furnished" },
  {
    value: "semi_furnished",
    label: "Semi-Furnished",
  },
  { value: "unfurnished", label: "Unfurnished" },
];

export const ListType = [
  { value: "sale", label: "Sale" },
  // { value: "rent", label: "Rent" },
  { value: "lease", label: "Lease" },
];

export const commemrcialType = [
  { value: 1, label: "Buy" },
  { value: 2, label: "Lease" },
];

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
  { value: 10, label: "West-Facing Corner" },
];

export const Furnishing = [
  { value: 1, label: "Furnished" },
  {
    value: 2,
    label: "Semi-Furnished",
  },
  { value: 3, label: "Unfurnished" },
];

export const FLOORPLANS_CATEGORY = [
  { value: "plots", label: "Plots" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "4bhk", label: "4 BHK" },
  { value: "2.5bhk", label: "2.5 BHK" },
  { value: "3.5bhk", label: "3.5 BHK" },
];

export const Property_status = [
  { value: "available", label: "Available" },
  {
    value: "sold",
    label: "Sold",
  },
  { value: "rented", label: "Rented" },
  { value: "off_market", label: "Off Market" },
  { value: "under_contract", label: "Under Contract" },
  { value: "pending", label: "pending" },
];

export const ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  BUYER: "buyer",
  DEVELOPER: "developer",
  AGENT: "agent",
  ALL: "All",
};

export const PROPERTY_TYPE = {
  COMMERCIAL: "Commercial",
  RESIDENTIAL: "Residential",
  INDUSTRY: "Industry",
  AGRICULTURAL: "Agricultural",
};

export const LISTING_TYPE = {
  SALE: "Sale",
  RENT: "Rent",
  LEASE: "Lease",
};

export const LISTING_TYPE_LIST = {
  LEASE: "lease",
  SALE: "sale",
  RENT: "rent",
};

export const roleList = [
  {
    value: "developer",
    label: "Developer",
  },
  {
    value: "agent",
    label: "Agent",
  },
  {
    value: "seller",
    label: "Seller",
  },
  {
    value: "buyer",
    label: "Buyer",
  },
];

export const PROPERTY_STATUS = [
  {
    value: "Publish",
    label: "Publish",
  },
  {
    value: "Draft",
    label: "Draft",
  },
];

export const APPROVED_STATUS = [
  {
    value: "Approved",
    label: "Approved",
  },
  {
    value: "Pending",
    label: "Pending",
  },
];

export const PLAN_TYPE = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Residential Plot", label: "Residential Plot" },
];
export const FLOOR_FLAN = [
  { value: "plots", label: "Plots" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "2.5bhk", label: "2.5 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "3.5bhk", label: "3.5 BHK" },
  { value: "4bhk", label: "4 BHK" },
];

export const PROPERTY_IMG = [
  "https://www.pexels.com/photo/sun-piercing-of-brown-concrete-house-near-sea-1732414/",
  "https://www.pexels.com/photo/high-angle-photography-of-village-280221/",
  "https://www.pexels.com/photo/white-and-gray-wooden-house-near-grass-field-and-trees-280222/",
  "https://www.pexels.com/photo/lighted-beige-house-1396132/",
];

export const LEAD_SOURCE_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "social_media", label: "Social Media" },
  { value: "advertisement", label: "Advertisement" },
  { value: "cold_call", label: "Cold Call" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "walk_in", label: "Walk In" },
  // { value: "other", label: "Other" }
];

export const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
];

export const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const RECORDS_TYPE = [
  {
    value: "created",
    label: "Created Records",
  },
  {
    value: "assigned",
    label: "Assigned Records",
  },
];

export const FILTER_ROLES = [
  {
    value: "developer",
    label: "Developer",
  },
  {
    value: "agent",
    label: "Agent",
  },
  {
    value: "seller",
    label: "Seller",
  },
];

export const FILTER_ADMINROLES = [
  {
    value: "own",
    label: "Own Records",
  },
  {
    value: "developer",
    label: "Developer Records",
  },
  {
    value: "agent",
    label: "Agent Records",
  },
  {
    value: "seller",
    label: "Seller Records",
  },
];

export const statusConfig = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Qualified: "bg-cyan-100 text-cyan-700",
  "Proposal Sent": "bg-orange-100 text-orange-700",
  Negotiation: "bg-purple-100 text-purple-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export const sourceConfig = {
  Advertisement: "border border-pink-500 bg-pink-50 text-pink-600",
  "Cold Call": "border border-blue-500 bg-blue-50 text-blue-600",
  "Email Campaign": "border border-indigo-500 bg-indigo-50 text-indigo-600",
  Other: "border border-gray-400 bg-gray-50 text-gray-600",
  Referral: "border border-green-500 bg-green-50 text-green-600",
  "Social Media": "border border-purple-500 bg-purple-50 text-purple-600",
  "Walk In": "border border-orange-500 bg-orange-50 text-orange-600",
  Website: "border border-cyan-500 bg-cyan-50 text-cyan-600",
};
