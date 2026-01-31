// types/location.d.ts

export interface WorkerLocation {
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export interface LocationState {
  location: WorkerLocation | null;
  isLoading: boolean;
  error: string | null;
}
