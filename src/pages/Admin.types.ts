export interface DogFormData {
  name: string;
  breeds: string[];
  age: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  rescueSinceDate: string;
  size: string;
  gender: string;
  status: 'available' | 'reserved' | 'adopted' | 'on_hold' | 'fostered' | 'withdrawn';
  status_notes: string;
  location: string;
  rescue_id: string;
  image: string;
  profileUrl: string;
  description: string;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  good_with_cats: boolean;
}

export interface RescueFormData {
  name: string;
  type: string;
  region: string;
  website: string;
  phone: string;
  email: string;
  address: string;
  postcode: string;
  charity_number: string;
  contact_notes: string;
  latitude: string;
  longitude: string;
}

export const initialFormData: DogFormData = {
  name: '',
  breeds: [],
  age: 'Adult',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  rescueSinceDate: '',
  size: 'Medium',
  gender: 'Male',
  status: 'available',
  status_notes: '',
  location: '',
  rescue_id: '',
  image: '',
  profileUrl: '',
  description: '',
  good_with_kids: false,
  good_with_dogs: false,
  good_with_cats: false,
};

export const initialRescueFormData: RescueFormData = {
  name: '',
  type: 'Full',
  region: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  postcode: '',
  charity_number: '',
  contact_notes: '',
  latitude: '',
  longitude: '',
};
