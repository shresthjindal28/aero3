export type Report = {
  id: string;
  userId: string;
  file_url: string;
  title?: string;
  note: string | null;
  created_at: Date;
};
