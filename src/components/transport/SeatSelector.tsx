
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Steering } from 'lucide-react';

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
            { seats: [1, 2], type: 'front', label: 'Front Row' },
            { seats: [3, 4, 5], type: 'row', label: 'Row 2' },
            { seats: [6, 7, 8], type: 'row', label: 'Row 3' },
            { seats: [9, 10, 11], type: 'row', label: 'Row 4' },
            { seats: [12, 13, 14], type: 'back', label: 'Back Row' }
          ]
        };
      case '17-seater':
        return {
          totalSeats: 17,
          rows: [
            { seats: [1, 2], type: 'front', label: 'Front Row' },
            { seats: [3, 4, 5, 6], type: 'row', label: 'Row 2' },
            { seats: [7, 8, 9, 10], type: 'row', label: 'Row 3' },
            { seats: [11, 12, 13, 14], type: 'row', label: 'Row 4' },
            { seats: [15, 16, 17], type: 'back', label: 'Back Row' }
          ]
        };
      case '24-seater':
        return {
          totalSeats: 24,
          rows: [
            { seats: [1, 2], type: 'front', label: 'Front Row' },
            { seats: [3, 4, 5, 6], type: 'row', label: 'Row 2' },
            { seats: [7, 8, 9, 10], type: 'row', label: 'Row 3' },
            { seats: [11, 12, 13, 14], type: 'row', label: 'Row 4' },
            { seats: [15, 16, 17, 18], type: 'row', label: 'Row 5' },
            { seats: [19, 20, 21, 22], type: 'row', label: 'Row 6' },
            { seats: [23, 24], type: 'back', label: 'Back Row' }
          ]
        };
      default:
        return {
          totalSeats: 14,
          rows: [
            { seats: [1, 2], type: 'front', label: 'Front Row' },
            { seats: [3, 4, 5], type: 'row', label: 'Row 2' },
            { seats: [6, 7, 8], type: 'row', label: 'Row 3' },
            { seats: [9, 10, 11], type: 'row', label: 'Row 4' },
            { seats: [12, 13, 14], type: 'back', label: 'Back Row' }
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

  const getSeatButtonClass = (status: string) => {
    const baseClasses = "seat-button font-bold text-sm transition-all duration-200 border-2 shadow-md";
    
    switch (status) {
      case 'occupied':
        return cn(baseClasses, "seat-occupied");
      case 'selected':
        return cn(baseClasses, "seat-selected");
      case 'available':
        return cn(baseClasses, "seat-available");
      default:
        return cn(baseClasses, "bg-gray-100 text-gray-600 border-gray-300");
    }
  };

  return (
    <Card className="mobile-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg font-bold text-gray-800">
          Select Your Seat{requiredSeats > 1 ? 's' : ''}
        </CardTitle>
        
        {/* Enhanced Legend */}
        <div className="flex justify-center gap-6 mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-300 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded shadow-sm"></div>
            <span className="text-sm font-medium text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gradient-to-br from-red-200 to-red-300 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Taken</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Driver Section */}
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-4 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-gray-600 font-medium mb-2">
            <Steering className="h-4 w-4" />
            <span>Driver</span>
          </div>
          <div className="flex justify-center">
            <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center shadow-sm">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>

        {/* Vehicle Layout */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-inner">
          <div className="space-y-4">
            {seatLayout.rows.map((row, rowIndex) => (
              <div key={rowIndex} className="space-y-2">
                <div className="text-center">
                  <Badge variant="outline" className="text-xs text-gray-500 bg-gray-50">
                    {row.label}
                  </Badge>
                </div>
                <div className="flex justify-center gap-2">
                  {row.seats.map((seatNumber) => {
                    const status = getSeatStatus(seatNumber);
                    return (
                      <Button
                        key={seatNumber}
                        variant="outline"
                        className={getSeatButtonClass(status)}
                        onClick={() => handleSeatClick(seatNumber)}
                        disabled={status === 'occupied'}
                      >
                        {seatNumber}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selection Info */}
        <div className="text-center space-y-2">
          <div className="text-sm font-medium text-gray-700">
            <span className="text-blue-600 font-bold">{localSelectedSeats.length}</span>
            <span className="text-gray-500"> / </span>
            <span className="font-bold">{requiredSeats}</span>
            <span> seat{requiredSeats > 1 ? 's' : ''} selected</span>
          </div>
          
          {localSelectedSeats.length > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-800 mb-1">Selected Seats:</div>
              <div className="flex justify-center gap-1">
                {localSelectedSeats.sort((a, b) => a - b).map((seat, index) => (
                  <Badge key={seat} variant="default" className="bg-blue-500 text-white text-xs px-2 py-1">
                    {seat}{index < localSelectedSeats.length - 1 && ','}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
