export type Category = 'Police' | 'Fire' | 'Ambulance' | 'Hospital' | 'Emergency';

export interface FirstResponder {
  id: string;
  title: string;
  category: Category;
  city: string;
  state: string;
  address: string;
  locationLat: number;
  locationLng: number;
  phoneNumber: string;
  websiteUrl?: string;
  googleLocationUrl: string;
}

export interface FilterState {
  title: string;
  category: Category | 'All';
  city: string;
  state: string;
}

