import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RoutePlaceholder({
  description,
}: {
  description: string;
}) {
  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Foundation placeholder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-[#64748B] dark:text-slate-400">
          {description}
        </p>
        <p className="text-sm leading-7 text-[#64748B] dark:text-slate-400">
          This route exists so the App Router structure is stable before auth,
          data, inventory, Mapbox, or Gemini features are added in later phases.
        </p>
      </CardContent>
    </Card>
  );
}
