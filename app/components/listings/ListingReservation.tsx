'use client';

import { Range } from 'react-date-range';
import Calendar from '../Inputs/Calendar';

interface ListingReservationProps {
  price: number;
  dateRange: Range;
  totalPrice: number;
  onChangeDate: (value: Range) => void;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates: Date[];
}

const ListingReservation: React.FC<ListingReservationProps> = ({
  price,
  dateRange,
  totalPrice,
  onChangeDate,
  onSubmit,
  disabled,
  disabledDates
}) => {
  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden h-fit">
      <div className="flex flex-row items-center gap-1 p-4">
        <div className="text-2xl font-semibold">
          {price.toLocaleString()}₮
        </div>
        <div className="font-light text-neutral-600">хоног</div>
      </div>
      <hr />
    
      <div className="px-10 py-2">
        <Calendar
          value={dateRange}
          disabledDates={disabledDates}
          onChange={(value) => onChangeDate(value.selection)}
        />
      </div>

      <hr />

        <div className="p-4">
            <button
            onClick={onSubmit}
            disabled={disabled}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-xl transition duration-200 disabled:opacity-50"
            >
            Захиалах
            </button>
            <div className="p-4 flex flex-row items-center justify-between font-semibold text-lg">
                <div>Нийт үнэ</div>
                <div>{totalPrice.toLocaleString()}₮</div>
            </div>
        </div>
    </div>
  );
};

export default ListingReservation;
