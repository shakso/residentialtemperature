// Import pg types
import type { QueryResult as PgQueryResult, QueryResultRow } from 'pg';

// Validate and transform PgQueryResult to safe QueryResult
export function validateQueryResult<T extends QueryResultRow>(result: PgQueryResult<T>): {
  rows: T[];
  rowCount: number;
} {
  if (result.rowCount === null) {
    throw new Error('Invalid query result: rowCount is null');
  }
  return {
    rows: result.rows,
    rowCount: result.rowCount
  };
}

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
}

export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
  subscription_plan: string;
  wifi_configured: boolean;
  wifi_ssid: string;
  wifi_password: string;
  payment_id: string;
}

export interface CreateSubscriptionParams {
  priceId: string;
  email?: string;
  firstName: string;
  lastName: string;
  couponCode?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    postal_code: string;
    country: string;
  };
  metadata?: Record<string, string>;
}

export interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}
