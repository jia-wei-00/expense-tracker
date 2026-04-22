import React, { useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { HStack } from "@/components/ui/hstack";
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
} from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";
import type { IMonthYearPicker } from "@/types/components/home/month-year-picker";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthYearPicker = ({ value, onChange }: IMonthYearPicker) => {
  const { t } = useTranslation("home");

  const years = useMemo(() => {
    const currentYear = dayjs().year();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const selectedMonth = dayjs(value).month();
  const selectedYear = dayjs(value).year();

  const handleMonthChange = (month: string) => {
    onChange(dayjs(value).month(Number(month)).toDate());
  };

  const handleYearChange = (year: string) => {
    onChange(dayjs(value).year(Number(year)).toDate());
  };

  return (
    <HStack space="sm">
      <Select
        selectedValue={String(selectedMonth)}
        onValueChange={handleMonthChange}
        className="flex-1"
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput
            placeholder={t("month")}
            value={MONTHS[selectedMonth]}
            className="flex-1"
          />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {MONTHS.map((name, index) => (
              <SelectItem key={index} label={name} value={String(index)} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>

      <Select
        selectedValue={String(selectedYear)}
        onValueChange={handleYearChange}
        className="flex-1"
      >
        <SelectTrigger variant="outline" size="md">
          <SelectInput
            placeholder={t("year")}
            value={String(selectedYear)}
            className="flex-1"
          />
          <SelectIcon className="mr-3" as={ChevronDownIcon} />
        </SelectTrigger>
        <SelectPortal>
          <SelectBackdrop />
          <SelectContent>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            {years.map((year) => (
              <SelectItem key={year} label={String(year)} value={String(year)} />
            ))}
          </SelectContent>
        </SelectPortal>
      </Select>
    </HStack>
  );
};

export default MonthYearPicker;
