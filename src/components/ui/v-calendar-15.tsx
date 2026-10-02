"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/v-calendar-15-utils/calendar";

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

export default function Particle({
  className,
  onDateChange,
}: {
  className?: string;
  onDateChange?: (checkIn: Date, checkOut: Date | undefined, nights: number) => void;
} = {}) {
  const [checkout, setCheckout] = React.useState<Date | undefined>(
    addDays(today, 5),
  );

  const nights = checkout
    ? Math.round((checkout.getTime() - today.getTime()) / 86_400_000)
    : 0;

  React.useEffect(() => {
    if (onDateChange) {
      onDateChange(today, checkout, nights);
    }
  }, [checkout, nights, onDateChange]);

  return (
    <div className={`flex flex-col gap-3 ${className || ""}`}>
      <Calendar
        disabled={{ before: addDays(today, 1) }}
        mode="single"
        modifiers={{ checkin: [today] }}
        modifiersClassNames={{
          checkin:
            "bg-primary text-primary-foreground rounded-md font-semibold",
        }}
        onSelect={setCheckout}
        selected={checkout}
        startMonth={today}
      />
      <div className="rounded-lg border px-4 py-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Check-in</span>
          <span className="font-medium">
            {today.toLocaleDateString("en-US", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
        <div className="mt-1 flex justify-between">
          <span className="text-muted-foreground">Check-out</span>
          <span className="font-medium">
            {checkout
              ? checkout.toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })
              : "—"}
          </span>
        </div>
        {nights > 0 && (
          <p className="mt-2 border-t pt-2 text-center font-semibold">
            {nights} night{nights !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export { Particle as BookingCalendar };
