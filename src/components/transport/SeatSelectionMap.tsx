
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, UserCheck } from 'lucide-react';

interface SeatSelectionMapProps {
  serviceType: 'bus' | 'train' | 'flight' | 'shuttle';
  totalSeats: number;
  occupiedSeats: number[];
  onSeatSelect: (seatNumbers: number[]) => void;
  passengerCount: number;
}

export const SeatSelectionMap = ({ 
  serviceType, 
  totalSeats, 
  occupiedSeats, 
  onSeatSelect, 
  passengerCount 
}: SeatSelectionMapProps) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  const getSeatLayout = () => {
    switch (serviceType) {
      case 'bus':
        return { rows: Math.ceil(totalSeats / 4), seatsPerRow: 4, aisleAfter: [2] };
      case 'shuttle':
        return { rows: Math.ceil(14 / 4), seatsPerRow: 4, aisleAfter: [2] };
      case 'train':
        return { rows: Math.ceil(totalSeats / 6), seatsPerRow: 6, aisleAfter: [2, 4] };
      case 'flight':
        return { rows: Math.ceil(totalSeats / 6), seatsPerRow: 6, aisleAfter: [2, 4] };
      default:
        return { rows: Math.ceil(totalSeats / 4), seatsPerRow: 4, aisleAfter: [2] };
    }
  };

  const layout = getSeatLayout();
  const maxSeats = serviceType === 'shuttle' ? 14 : totalSeats;

  const handleSeatClick = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) return;

    let newSelection = [...selectedSeats];
    
    if (selectedSeats.includes(seatNumber)) {
      newSelection = selectedSeats.filter(seat => seat !== seatNumber);
    } else if (selectedSeats.length < passengerCount) {
      newSelection.push(seatNumber);
    }

    setSelectedSeats(newSelection);
    onSeatSelect(newSelection);
  };

  const getSeatStatus = (seatNumber: number) => {
    if (occupiedSeats.includes(seatNumber)) return 'occupied';
    if (selectedSeats.includes(seatNumber)) return 'selected';
    return 'available';
  };

  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-500 text-white cursor-not-allowed';
      case 'selected': return 'bg-blue-500 text-white';
      case 'available': return 'bg-gray-200 hover:bg-gray-300 cursor-pointer';
      default: return 'bg-gray-200';
    }
  };

  const renderSeatMap = () => {
    const seats = [];
    let seatNumber = 1;

    for (let row = 0; row < layout.rows && seatNumber <= maxSeats; row++) {
      const rowSeats = [];
      
      for (let col = 0; col < layout.seatsPerRow && seatNumber <= maxSeats; col++) {
        const status = getSeatStatus(seatNumber);
        
        rowSeats.push(
          <Button
            key={seatNumber}
            variant="outline"
            size="sm"
            className={`w-10 h-10 text-xs ${getSeatColor(status)}`}
            onClick={() => handleSeatClick(seatNumber)}
            disabled={status === 'occupied'}
          >
            {status === 'occupied' ? <UserCheck className="h-4 w-4" /> : seatNumber}
          </Button>
        );

        // Add aisle space
        if (layout.aisleAfter.includes(col + 1) && col < layout.seatsPerRow - 1) {
          rowSeats.push(<div key={`aisle-${row}-${col}`} className="w-4" />);
        }

        seatNumber++;
      }

      seats.push(
        <div key={row} className="flex justify-center gap-1 mb-2">
          {rowSeats}
        </div>
      );
    }

    return seats;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Select Your Seats ({selectedSeats.length}/{passengerCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 border rounded"></div>
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

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-center mb-4 text-sm font-medium text-gray-600">
              {serviceType === 'flight' ? 'Front (Cockpit)' : 'Front (Driver)'}
            </div>
            {renderSeatMap()}
          </div>

          {selectedSeats.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Selected Seats:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSeats.map(seat => (
                  <Badge key={seat} variant="secondary">
                    Seat {seat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {selectedSeats.length < passengerCount && (
            <p className="text-sm text-amber-600">
              Please select {passengerCount - selectedSeats.length} more seat(s)
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
