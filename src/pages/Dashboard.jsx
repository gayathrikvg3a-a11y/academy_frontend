import { useEffect, useState } from "react";
import {
  RotateCw,
  GraduationCap,
  Library,
  Users,
  MessageSquare,
  CalendarDays,
  Images,
  Award,
  CreditCard,
} from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

import api from "../api/axios";

import PageHeader from "../components/common/PageHeader";

const stats = [
  {
    key: "total_students",
    title: "Students",
    icon: GraduationCap,
  },
  {
    key: "total_courses",
    title: "Courses",
    icon: Library,
  },
  {
    key: "total_batches",
    title: "Batches",
    icon: Users,
  },
  {
    key: "total_enquiries",
    title: "Enquiries",
    icon: MessageSquare,
  },
  {
    key: "total_events",
    title: "Events",
    icon: CalendarDays,
  },
  {
    key: "total_gallery_items",
    title: "Gallery",
    icon: Images,
  },
  {
    key: "total_internships",
    title: "Internships",
    icon: Award,
  },
  {
    key: "total_payments",
    title: "Payments",
    icon: CreditCard,
  },
];

function DashboardCard({ title, value, icon: Icon }) {
  return (
    <Card className="h-full">
      <CardContent className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    total_students: 0,
    total_courses: 0,
    total_batches: 0,
    total_enquiries: 0,
    total_events: 0,
    total_gallery_items: 0,
    total_internships: 0,
    total_payments: 0,
    total_collection: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard/");

      setDashboard(response.data);
    } catch (err) {
      console.error(err);

      setError("Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Error */}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}

      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's your academy overview."
        action={
          <Button onClick={loadDashboard}>
            <RotateCw data-icon="inline-start" />
            Refresh
          </Button>
        }
      />

      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <DashboardCard
            key={stat.key}
            title={stat.title}
            value={dashboard[stat.key]}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Total Collection */}

      <Card>
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">
            Total Collection
          </p>
          <p className="mt-1 text-2xl font-semibold text-success">
            ₹{" "}
            {Number(
              dashboard.total_collection
            ).toLocaleString("en-IN")}
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
