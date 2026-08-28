/**
 * normaliseRecords.ts
 *
 * Converts raw API results into the DrillDownRecord shape the table renders.
 * Field paths are derived directly from the existing list pages so they are
 * guaranteed to match the real API response shape.
 */

import type { DrillDownRecord, MetricCardId } from './types';

// ─── Safe string helpers ──────────────────────────────────────────────────────

/** Always returns a string, never an object. */
function str(val: any): string {
  if (val == null) return '—';
  if (typeof val === 'string') return val.trim() || '—';
  if (typeof val === 'number') return String(val);
  // Object passed by mistake — return '—' instead of crashing React renderer
  return '—';
}

/** Build "First Last" from a user object that has first_name / last_name keys. */
function fullName(user: any): string {
  if (!user) return '—';
  if (typeof user === 'string') return user.trim() || '—';
  const first = str(user?.first_name);
  const last  = str(user?.last_name);
  const combined = [first, last].filter((s) => s !== '—').join(' ').trim();
  return combined || '—';
}

/** Resolve a location/city/area field that might be an object {name:…} or a plain string/null. */
function locName(val: any): string {
  if (!val) return '—';
  if (typeof val === 'string') return val.trim() || '—';
  if (typeof val === 'object' && val.name) return str(val.name);
  return '—';
}

/** Format a price number into a compact string. */
function currency(val: any): string {
  if (val == null || val === '') return '';
  const n = parseFloat(val);
  if (isNaN(n)) return '';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}

function priceRange(min: any, max: any): string {
  const a = currency(min);
  const b = currency(max);
  if (!a && !b) return '—';
  if (!b) return a;
  if (!a) return b;
  return `${a} – ${b}`;
}

// ─── Property normaliser ──────────────────────────────────────────────────────
// Raw shape (from property/list.tsx mapping):
//   item.title, item.developer (user obj: first_name/last_name/industry),
//   item.location (city obj: {name}), item.area (obj: {name}),
//   item.listing_type (string: "sale"/"lease"),
//   item.property_type ([{name}]), item.price_range.{minimum_price, maximum_price},
//   item.built_up_area, item.project.name, item.is_approved, item.primary_image

export function normaliseProperty(raw: any): DrillDownRecord {
  const isApproved: boolean = raw?.is_approved === true;

  // developer is a full user object
  const devName = fullName(raw?.developer);

  // listing_type is a raw string "sale"/"lease" — NOT an object
  const listingType = str(raw?.listing_type);

  // city/location can be string or object
  const cityName = locName(raw?.location) !== '—'
    ? locName(raw?.location)
    : locName(raw?.city);

  // property_type is [{name: "..."}]
  const propTypes: string[] = Array.isArray(raw?.property_type)
    ? raw.property_type.map((pt: any) => str(pt?.name)).filter((s: string) => s !== '—')
    : [];

  const minPrice = raw?.price_range?.minimum_price ?? raw?.minimum_price;
  const maxPrice = raw?.price_range?.maximum_price ?? raw?.maximum_price;

  return {
    id: raw?.id ?? '—',
    name: str(raw?.title) !== '—' ? str(raw?.title) : 'Untitled Property',
    developer: devName,
    location: cityName,
    category: listingType,
    priceRange: priceRange(minPrice, maxPrice),
    priceAvg: raw?.price_per_sqft ? `$${raw.price_per_sqft}/sq.ft` : '—',
    status: isApproved ? 'Approved' : 'Pending Review',
    statusType: isApproved ? 'success' : 'warning',
    image: typeof raw?.primary_image === 'string' ? raw.primary_image : undefined,
    details: {
      'Offer Type': listingType !== '—' ? listingType.charAt(0).toUpperCase() + listingType.slice(1) : '—',
      'Property Type': propTypes.length > 0 ? propTypes.slice(0, 2).join(', ') : '—',
      'Area': raw?.built_up_area ? `${raw.built_up_area} sq.ft` : '—',
      'Project': str(raw?.project?.name),
    },
  };
}

// ─── Project normaliser ───────────────────────────────────────────────────────
// Raw shape (from project/list.tsx):
//   item.name, item.developer (user obj with .industry),
//   item.location (obj: {name}), item.area (obj: {name}),
//   item.status, item.property_count, item.property_type_counts

export function normaliseProject(raw: any): DrillDownRecord {
  // developer.industry is a string like "Real Estate"
  const devDisplay = str(raw?.developer?.industry) !== '—'
    ? str(raw?.developer?.industry)
    : fullName(raw?.developer);

  return {
    id: raw?.id ?? '—',
    name: str(raw?.name) !== '—' ? str(raw?.name) : 'Untitled Project',
    developer: devDisplay,
    location: locName(raw?.location),
    priceRange: '—',
    priceAvg: raw?.property_count != null ? `${raw.property_count} properties` : '—',
    status: str(raw?.status) !== '—' ? str(raw?.status) : 'Active',
    statusType: 'info',
    image: typeof raw?.primary_image === 'string' ? raw.primary_image : undefined,
    details: {
      'Area': locName(raw?.area),
      'Properties': raw?.property_count != null ? String(raw.property_count) : '—',
      'Status': str(raw?.status),
    },
  };
}

// ─── Lead normaliser (total / deal_won / deal_lost / follow_up) ───────────────
// Raw shape (from lead/list.tsx using lead_properties endpoint):
//   item.lead_details.full_name, item.lead_details.email,
//   item.lead_details.lead_source_info (obj), item.lead_details.area_details.name,
//   item.lead_details.assigned_to_details (user obj: first_name/last_name),
//   item.opportunity_status_details.name (string),
//   item.title (property title), item.listing_type (string),
//   item.minimum_price, item.maximum_price,
//   item.project_name, item.primary_image, item.city (string or obj)

export function normaliseLead(raw: any): DrillDownRecord {
  const lead = raw?.lead_details ?? {};

  const customerName = str(lead?.full_name) !== '—' ? str(lead?.full_name) : 'Unknown Lead';

  const assignedTo = fullName(lead?.assigned_to_details);

  const opportunityStatus = str(raw?.opportunity_status_details?.name) !== '—'
    ? str(raw?.opportunity_status_details?.name)
    : str(raw?.status);

  const isWon  = opportunityStatus.toLowerCase().includes('won');
  const isLost = opportunityStatus.toLowerCase().includes('lost');

  // city can be a raw string from the lead_properties API
  const cityDisplay = locName(raw?.city) !== '—'
    ? locName(raw?.city)
    : str(lead?.area_details?.name);

  // lead_source_info can be an object {name: "website"} or a string
  const sourceDisplay = typeof raw?.lead_details?.lead_source_info === 'object'
    ? str(raw.lead_details.lead_source_info?.name)
    : str(raw?.lead_details?.lead_source_info);

  return {
    id: raw?.id ?? lead?.id ?? '—',
    name: customerName,
    developer: assignedTo !== '—' ? assignedTo : str(lead?.email),
    location: cityDisplay,
    priceRange: priceRange(raw?.minimum_price, raw?.maximum_price),
    priceAvg: str(raw?.project_name),
    status: opportunityStatus !== '—' ? opportunityStatus : 'New',
    statusType: isWon ? 'success' : isLost ? 'danger' : 'info',
    image: typeof raw?.primary_image === 'string' ? raw.primary_image : undefined,
    details: {
      'Lead Source': sourceDisplay,
      'Property': str(raw?.title),
      'Listing Type': str(raw?.listing_type),
    },
  };
}

// ─── Booking Inquiry normaliser ───────────────────────────────────────────────
// Raw shape (from dev_booking_inquiry_list.tsx):
//   item.id, item.email, item.phone_number, item.message,
//   item.property_details (obj: {title, ...} or null),
//   item.schedule_date_time, item.search (interested area), item.created_at

export function normaliseBookingInquiry(raw: any): DrillDownRecord {
  const propertyTitle = typeof raw?.property_details === 'object' && raw?.property_details !== null
    ? str(raw.property_details?.title)
    : '—';

  const scheduledAt = raw?.schedule_date_time
    ? (() => {
        try {
          return new Date(raw.schedule_date_time).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          });
        } catch { return str(raw.schedule_date_time); }
      })()
    : '—';

  const createdAt = raw?.created_at
    ? (() => {
        try { return new Date(raw.created_at).toLocaleDateString(); }
        catch { return str(raw.created_at); }
      })()
    : '—';

  return {
    id: raw?.id ?? '—',
    name: propertyTitle !== '—' ? propertyTitle : str(raw?.email) !== '—' ? str(raw?.email) : 'Booking Inquiry',
    developer: str(raw?.email),
    location: str(raw?.search) !== '—' ? str(raw?.search) : '—',
    priceRange: scheduledAt !== '—' ? `Scheduled: ${scheduledAt}` : '—',
    priceAvg: str(raw?.phone_number),
    status: 'Booking Confirmed',
    statusType: 'success',
    image: undefined,
    details: {
      'Message': str(raw?.message),
      'Created': createdAt,
    },
  };
}

// ─── Call Inquiry normaliser ──────────────────────────────────────────────────
// Raw shape (from dev_call_inquiry_list.tsx):
//   item.id, item.email, item.phone_number, item.message,
//   item.property_details (obj: {title, ...} or null),
//   item.search (interested area), item.created_at

export function normaliseCallInquiry(raw: any): DrillDownRecord {
  const propertyTitle = typeof raw?.property_details === 'object' && raw?.property_details !== null
    ? str(raw.property_details?.title)
    : '—';

  const createdAt = raw?.created_at
    ? (() => {
        try { return new Date(raw.created_at).toLocaleDateString(); }
        catch { return str(raw.created_at); }
      })()
    : '—';

  return {
    id: raw?.id ?? '—',
    name: propertyTitle !== '—' ? propertyTitle : str(raw?.email) !== '—' ? str(raw?.email) : 'Call Inquiry',
    developer: str(raw?.email),
    location: str(raw?.search) !== '—' ? str(raw?.search) : '—',
    priceRange: str(raw?.phone_number),
    priceAvg: createdAt,
    status: 'Call Logged',
    statusType: 'info',
    image: undefined,
    details: {
      'Message': str(raw?.message),
      'Created': createdAt,
    },
  };
}

// ─── Master dispatcher ────────────────────────────────────────────────────────

const PROPERTY_IDS = ['total_properties', 'sale_properties', 'lease_properties', 'approved_properties', 'pending_properties'];
const PROJECT_IDS  = ['total_projects'];
const LEAD_IDS     = ['total_lead_list', 'deal_won', 'deal_lost', 'follow_ups'];
const BOOKING_IDS  = ['booking_inquiries'];
const CALL_IDS     = ['call_inquiries'];

export function normaliseRecords(metricId: MetricCardId, rawResults: any[]): DrillDownRecord[] {
  if (!Array.isArray(rawResults)) return [];
  if (PROPERTY_IDS.includes(metricId)) return rawResults.map(normaliseProperty);
  if (PROJECT_IDS.includes(metricId))  return rawResults.map(normaliseProject);
  if (LEAD_IDS.includes(metricId))     return rawResults.map(normaliseLead);
  if (BOOKING_IDS.includes(metricId))  return rawResults.map(normaliseBookingInquiry);
  if (CALL_IDS.includes(metricId))     return rawResults.map(normaliseCallInquiry);
  return [];
}
