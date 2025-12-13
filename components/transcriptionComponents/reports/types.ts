export type Report = {
  id: string;
  userId: string;
  file_url: string;
  note: string | null;
  created_at: Date; // ✅ Date, not string
};
