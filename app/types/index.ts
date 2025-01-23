export type Profile = {
  id: string;
  full_name: string;
  username?: string | null;
  avatar_url?: string | null;
  short_bio?: string | null;
};

export type FishCatch = {
  id: string;
  fish_type: string;
  caught_on: string;
  length?: number | null;
  weight?: number | null;
};

export type FishingTrip = {
  id: string;
  user_id: string;
  date: string;
  time_of_day: string;
  location: string;
  weather: string;
  notes: string | null;
  image_url: string | null;
  catch_count: number;
  water_temperature?: number | null;
  air_temperature?: number | null;
  fish_catches: FishCatch[];
};
