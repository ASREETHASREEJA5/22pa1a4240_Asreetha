import StatsTable from "@/components/stats/StatsTable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function StatsPage() {
  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-3xl">URL Statistics</CardTitle>
            <CardDescription>
                View performance data for all your shortened URLs.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <StatsTable />
        </CardContent>
      </Card>
    </div>
  );
}
