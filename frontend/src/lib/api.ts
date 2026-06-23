export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL ?? "";

export const CAMPAIGN_SLUG = "the-orange-garden";

export interface CampaignProgress {
  raised_cents: number;
  donor_count: number;
  percent: number;
}

export interface Campaign {
  id: number;
  slug: string;
  title: string;
  goal_cents: number;
  currency: string;
  cover_image_url: string | null;
  progress: CampaignProgress;
}

export type Frequency = "one_time" | "recurring";
export type DisplayNameMode = "full_name" | "first_name" | "anonymous";

export interface Donation {
  id: number;
  amount_cents: number;
  frequency: Frequency;
  display_name_mode: DisplayNameMode;
  dedication: string | null;
  created_at: string;
  display_name: string;
}

export interface DonationsPage {
  donations: Donation[];
  next_cursor: string | null;
}

export interface CreateDonationInput {
  amount_cents: number;
  frequency: Frequency;
  display_name_mode: DisplayNameMode;
  donor_name?: string;
  dedication?: string;
}

export interface CreateDonationBody {
  donation: CreateDonationInput;
}

export interface CreateDonationResult {
  donation: Donation;
  progress: CampaignProgress;
}

// Mirrors ActiveRecord's errors.to_hash: field -> array of messages.
export type DonationErrors = Record<string, string[]>;

export class DonationValidationError extends Error {
  readonly status: number;
  readonly errors: DonationErrors;

  constructor(status: number, errors: DonationErrors) {
    super("Donation request failed");
    this.name = "DonationValidationError";
    this.status = status;
    this.errors = errors;
  }
}

function campaignUrl(): string {
  return `${API_BASE_URL}/api/campaigns/${CAMPAIGN_SLUG}`;
}

export async function fetchCampaign(): Promise<Campaign> {
  const response = await fetch(campaignUrl(), {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch campaign (${response.status})`);
  }

  return (await response.json()) as Campaign;
}

export async function fetchDonations(
  cursor?: string | null,
): Promise<DonationsPage> {
  let url = `${campaignUrl()}/donations?limit=20`;
  if (cursor) {
    url += `&cursor=${encodeURIComponent(cursor)}`;
  }

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch donations (${response.status})`);
  }

  return (await response.json()) as DonationsPage;
}

export async function createDonation(
  body: CreateDonationBody,
): Promise<CreateDonationResult> {
  const response = await fetch(`${campaignUrl()}/donations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return (await response.json()) as CreateDonationResult;
  }

  // Only 422 carries the field-level { errors } payload; surface it as a typed
  // error so callers can map messages back onto form fields. Any other non-OK
  // status is a system/transport failure, not a validation problem.
  if (response.status !== 422) {
    throw new Error(`Failed to create donation (${response.status})`);
  }

  const errors = await response
    .json()
    .then((payload: { errors?: DonationErrors }) => payload.errors ?? {})
    .catch(() => ({}) as DonationErrors);

  throw new DonationValidationError(response.status, errors);
}
