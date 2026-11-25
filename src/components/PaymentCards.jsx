import { IndianRupee, Receipt, CalendarDays, TrendingUp } from "lucide-react";
import { format } from "date-fns";

import { Card, CardContent } from "@/components/ui/card";

function PaymentCards({ payments }) {
  const totalCollection = payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const totalPayments = payments.length;

  // Local date, not toISOString's UTC one, which is yesterday before 5:30 AM IST.
  const today = format(new Date(), "yyyy-MM-dd");

  const todayCollection = payments
    .filter(
      (payment) => payment.payment_date === today
    )
    .reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

  const averagePayment =
    totalPayments > 0
      ? totalCollection / totalPayments
      : 0;

  const cards = [
    {
      title: "Total Collection",
      value: `₹${totalCollection.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: IndianRupee,
    },
    {
      title: "Total Payments",
      value: totalPayments,
      icon: Receipt,
    },
    {
      title: "Today's Collection",
      value: `₹${todayCollection.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: CalendarDays,
    },
    {
      title: "Average Payment",
      value: `₹${averagePayment.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="mb-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className="h-full">
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

export default PaymentCards;
