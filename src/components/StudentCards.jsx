import { GraduationCap, User, IndianRupee, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

function StudentCards({ students = [], onSelect }) {
  const totalStudents = students.length;

  const activeStudents = students.filter(
    (student) => student.status === "ACTIVE"
  ).length;

  const totalRevenue = students.reduce(
    (sum, student) =>
      sum + Number(student.course_fee || 0),
    0
  );

  const totalBalance = students.reduce(
    (sum, student) =>
      sum + Number(student.balance || 0),
    0
  );

  const cards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: GraduationCap,
      status: "",
    },
    {
      title: "Active Students",
      value: activeStudents,
      icon: User,
      status: "ACTIVE",
    },
    {
      title: "Course Revenue",
      value: `₹${totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
    },
    {
      title: "Pending Balance",
      value: `₹${totalBalance.toLocaleString("en-IN")}`,
      icon: Wallet,
    },
  ];

  return (
    <div className="mb-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="h-full cursor-pointer"
          onClick={() => onSelect?.(card.status ?? null)}
        >
          <CardContent className="flex items-center justify-between gap-2 p-2.5">
            <div className="min-w-0">
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <p className="text-xl font-semibold">{card.value}</p>
            </div>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <card.icon />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StudentCards;
