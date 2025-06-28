
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SeatSelectorProps {
  layout: string;
  requiredSeats: number;
  onSeatSelection: (seats: number[]) => void;
  selectedSeats: number[];
  occupiedSeats?: number[];
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  layout,
  requiredSeats,
  onSeatSelection,
  selectedSeats,
  occupiedSeats = []
}) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState<number[]>(selectedSeats);

  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
  }, [selectedSeats]);

  const getSeatLayout = () => {
    switch (layout) {
      case '14-seater':
        return {
          totalSeats: 14,
          rows: [
            { seats: [1, 2], type: 'front' },
            { seats: [3, 4, 5], type: 'row' },
            { seats: [6, 7, 8], type: 'row' },
            { seats: [9, 10, 11], type: 'row' },
            { seats: [12, 13, 14], type: 'back' }
          ]
        };
      case '17-seater':
        return {
          totalSeats: 17,
          rows: [
            { seats: [1, 2], type: 'front' },
            { seats: [3, 4, 5, 6], type: 'row' },
            { seats: [7, 8, 9, 10], type: 'row' },
            { seats: [11, 12, 13, 14], type: 'row' },
            { seats: [15, 16, 17], type: 'back' }
          ]
        };
      case '24-seater':
        return {
          totalSeats: 24,
          rows: [
            { seats: [1, 2], type: 'front' },
            { seats: [3, 4, 5, 6], type: 'row' },
            { seats: [7, 8, 9, 10], type: 'row' },
            { seats: [11, 12, 13, 14], type: 'row' },
            { seats: [15, 16, 17, 18], type: 'row' },
            { seats: [19, 20, 21, 22], type: 'row' },
            { seats: [23, 24], type: 'back' }
          ]
        };
      default:
        return {
          totalSeats: 14,
          rows: [
            { seats: [1, 2], type: 'front' },
            { seats: [3, 4, 5], type: 'row' },
            { seats: [6, 7, 8], type: 'row' },
            { seats: [9, 10, 11], type: 'row' },
            { seats: [12, 13, 14], type: 'back' }
          ]
        };
    }
  };

  const seatLayout = getSeatLayout();

  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) return;

    let newSelectedSeats: number[];

    if (localSelectedSeats.includes(seatNumber)) {
      // Deselect seat
      newSelectedSeats = localSelectedSeats.filter(seat => seat !== seatNumber);
    } else {
      // Select seat
      if (localSelectedSeats.length < requiredSeats) {
        newSelectedSeats = [...localSelectedSeats, seatNumber];
      } else {
        // Replace first selected seat with new one
        newSelectedSeats = [...localSelectedSeats.slice(1), seatNumber];
      }
    }

    setLocalSelectedSeats(newSelectedSeats);
    onSeatSelection(newSelectedSeats);
  };

  const getSeatStatus = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) return 'occupied';
    if (localSelectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-500 text-white cursor-not-allowed';
      case 'selected':
        return 'bg-blue-500 text-white border-blue-600';
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Legend */}
      <div className="flex justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Occupied</span>
        </div>
      </div>

      {/* Driver's section */}
      <div className="bg-gray-100 p-2 rounded-t-lg mb-4">
        <div className="text-center text-sm font-medium text-gray-600">Driver</div>
        <div className="w-8 h-8 bg-gray-300 rounded mx-auto mt-1"></div>
      </div>

      {/* Seat layout */}
      <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
        <div className="space-y-3">
          {seatLayout.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-2">
              {row.seats.map((seatNumber) => {
                const status = getSeatStatus(seatNumber);
                return (
                  <Button
                    key={seatNumber}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-10 h-10 p-0 border-2 font-semibold transition-all duration-200",
                      getSeatColor(status)
                    )}
                    onClick={() => handleSeatClick(seatNumber)}
                    disabled={status === 'occupied'}
                  >
                    {seatNumber}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selection info */}
      <div className="mt-4 text-center text-sm text-gray-600">
        {localSelectedSeats.length}/{requiredSeats} seats selected
        {localSelectedSeats.length > 0 && (
          <div className="mt-2">
            Selected: {localSelectedSeats.sort((a, b) => a - b).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
};
