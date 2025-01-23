export type FishCatch = {
  id: string;
  fish_type: string;
  caught_on: string;
  length?: number;
  weight?: number;
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
  fish_catches: FishCatch[];
};
