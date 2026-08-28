// =========================================================================
// TYPES & INTERFACES
// =========================================================================

export type MetricCardId =
  | 'total_properties'
  | 'sale_properties'
  | 'lease_properties'
  | 'approved_properties'
  | 'pending_properties'
  | 'total_projects'
  | 'total_lead_list'
  | 'booking_inquiries'
  | 'call_inquiries'
  | 'deal_won'
  | 'deal_lost'
  | 'follow_ups'
  | 'conversion_rate'
  | 'high_demand_projects'
  | 'low_demand_projects';

export interface MetricCardItem {
  id: MetricCardId;
  index: number;
  category: 'PROPERTIES' | 'PROJECTS' | 'LEADS' | 'DEALS' | 'DEMAND';
  label: string;
  value: string | number;
  sub: string;
  change: string;
  isPositive: boolean;
  highlight?: boolean;
  filterDescription: string;
}

export interface DrillDownRecord {
  id: string | number;
  name: string;
  developer?: string;
  location?: string;
  category?: string;
  priceRange?: string;
  priceAvg?: string;
  callbacks?: number;
  bookingInquiries?: number;
  totalLeads?: number;
  demandScore?: number;
  status: string;
  statusType?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  dateCreated?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  conversionRate?: string;
  valueAmount?: string;
  unitsCount?: number;
  image?: string;
  details?: Record<string, string | number>;
}

export interface FunnelStep {
  id: number;
  title: string;
  subtitle: string;
  value: number;
  totalPercentage: string;
  retentionRate?: string;
  color: string;
}

export interface WishlistProject {
  rank: number;
  name: string;
  saves: number;
  demandLevel: 'High Demand' | 'Moderate Demand' | 'Low Demand';
  maxSaves: number;
}
