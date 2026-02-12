
export type Language = 'am' | 'en';

export type UserRole = 'reception' | 'police';

export interface User {
  username: string;
  role: UserRole;
  hotelInfo?: HotelInfo;
}

export interface HotelInfo {
  name: string;
  address: string;
  receptionistName: string;
  phone: string;
}

export interface Guest {
  id: string;
  hotelId: string;
  hotelName: string;
  fullName: string;
  nationality: string;
  fromLocation: string;
  purpose: string;
  bedNumber: string;
  idPhoto: string; // Base64
  permitPhoto?: string; // Base64
  timestamp: string;
  status: 'sent' | 'received';
}

export interface WantedPerson {
  id: string;
  fullName: string;
  description: string;
  photo?: string;
  addedBy: string;
  timestamp: string;
}

export interface Message {
  id: string;
  sender: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
}

export interface AppState {
  language: Language;
  user: User | null;
  guests: Guest[];
  wantedPersons: WantedPerson[];
  messages: Message[];
}
