import { PageLoader } from "@/shared/ui/feedback/page-loader";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader />
    </div>
  );
}
