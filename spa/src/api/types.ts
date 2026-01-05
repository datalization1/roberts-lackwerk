export type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  company?: string;
  notes?: string;
  source: "rental" | "damage-report" | "manual" | "both";
  created_date: string;
  customer_since: string;
};

export type DamageReport = {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone: string;
  car_brand: string;
  car_model: string;
  vin?: string;
  first_registration?: string;
  mileage?: number;
  car_part?: string;
  damaged_parts: string[];
  affected_parts: string[];
  damage_type: string;
  accident_date: string;
  accident_location: string;
  message: string;
  address: string;
  plate?: string;
  no_plate?: boolean;
  insurer?: string;
  other_insurer?: string;
  policy_number?: string;
  accident_number?: string;
  insurer_contact?: string;
  other_party_involved?: boolean;
  police_involved?: boolean;
  documents: string[];
  status: string;
  admin_notes?: string;
  created_at: string;
  photos: DamagePhoto[];
};

export type DamagePhoto = {
  id: string;
  image: string;
  file_url?: string;
  uploaded_at: string;
};

export type Vehicle = {
  id: string;
  type: "small" | "medium" | "large";
  license_plate: string;
  brand: string;
  model: string;
  year?: number;
  mileage?: number;
  volume?: number;
  payload?: number;
  features: string[];
  daily_rate: number;
  vin?: string;
  insurance_number?: string;
  next_service?: string;
  status: string;
  photo?: string;
};

export type Transporter = {
  id: string;
  name: string;
  kennzeichen: string;
  farbe?: string;
  preis_chf: string;
  verfuegbar_ab: string;
  description?: string;
  buchung?: string;
  image?: string;
};

export type Booking = {
  id: string;
  transporter: number;
  transporter_detail?: Transporter;
  vehicle?: number;
  vehicle_detail?: Vehicle;
  customer?: number;
  customer_detail?: Customer;
  date: string;
  time_slot: string;
  pickup_date?: string;
  return_date?: string;
  pickup_time?: string;
  return_time?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  driver_license_number: string;
  additional_insurance?: boolean;
  moving_blankets?: boolean;
  hand_truck?: boolean;
  tie_down_straps?: boolean;
  additional_notes?: string;
  status: string;
  admin_notes?: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  km_package: string;
  extras: string[];
  insurance: string;
  total_price: string;
  created_at: string;
  updated_at: string;
};

export type MetaOptions = {
  extras: Record<string, string>;
  km_packages: {
    prices: Record<string, string>;
    descriptions: Record<string, string>;
  };
  insurance: {
    prices: Record<string, string>;
    descriptions: Record<string, string>;
  };
};
