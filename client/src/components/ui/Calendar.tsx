"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navButtonStyles = "inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 h-9 w-9 transition-colors focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed";
const dayStyles = "inline-flex items-center justify-center rounded-lg h-10 w-10 text-sm transition-colors hover:bg-gray-100 cursor-pointer focus:bg-gray-100 focus:outline-none";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-white", className)} 
      classNames={{
        months: "relative", 
        month: "space-y-4",
        month_caption: "flex justify-center items-center h-10 relative mb-4",
        caption_label: "text-sm font-bold text-gray-900 capitalize",
        
        // El contenedor 'nav' debe permitir que los botones reciban clics
        nav: "flex items-center",
        
        // Selectores de botones para v9.14+
        button_previous: cn(navButtonStyles, "absolute left-0 z-10"),
        button_next: cn(navButtonStyles, "absolute right-0 z-10"),
        
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-2",
        weekday: "text-gray-400 w-10 font-normal text-xs uppercase text-center",
        week: "flex w-full justify-between mt-1", 
        
        day: cn(dayStyles),
        day_button: "h-full w-full flex items-center justify-center",
        selected: "bg-black text-white hover:bg-black hover:text-white rounded-xl", 
        today: "text-orange-600 font-bold",
        outside: "text-gray-300 opacity-50",
        disabled: "text-gray-200",
        hidden: "invisible",
        
        ...classNames,
      }}
      components={{
        // Importante: Usamos Chevron y nos aseguramos de que los iconos no bloqueen el evento
        Chevron: ({ orientation }) => (
          orientation === "left" 
            ? <ChevronLeft size={18} strokeWidth={2} className="pointer-events-none" /> 
            : <ChevronRight size={18} strokeWidth={2} className="pointer-events-none" />
        ),
      }}
      {...props}
    />
  );
}

export { Calendar };