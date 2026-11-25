import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function StatCard({ icon: Icon, label, value, note, href, alert = false }) {
  const chip = alert
    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
    : "bg-primary/10 text-primary";

  const content = (
    <Card className={href ? "h-full transition hover:shadow-md" : "h-full"}>
      <CardContent className="flex items-start gap-4">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${chip}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{note}</p>
        </div>
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {content}
    </Link>
  ) : (
    content
  );
}