import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export function EditableDatePicker({
  label,
  date,
  placeholder,
  dateFormat = 'yyyy-MM-dd',
  onChange,
}: {
  label: string;
  date?: Date;
  placeholder?: string;
  dateFormat?: string;
  onChange: (date: Date | undefined) => void;
}) {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    setInputValue(date ? format(date, dateFormat) : '');
  }, [date]);

  const handleBlur = () => {
    if (!inputValue) {
      onChange(undefined);
      return;
    }

    const parsed = dayjs(inputValue, 'YYYY-MM-DD', true);
    if (parsed.isValid()) {
      onChange(parsed.toDate());
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative w-full max-w-[250px]">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          className="pl-3 pr-3"
        />
        <Popover>
          <PopoverTrigger asChild>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer">
              <CalendarIcon className="h-4 w-4" />
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                if (newDate) {
                  setInputValue(format(newDate, dateFormat));
                  onChange(newDate);
                }
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
