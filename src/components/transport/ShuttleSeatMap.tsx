import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Users, CheckCircle, XCircle, ArrowLeftRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Seat {
  id: number;
  status: 'available' | 'selected' | 'occupied' | 'reserved';
  position: { row: number; col: number };
}

interface ShuttleSeatMapProps {
  vehicleType: '14-seater' | '17-seater' | '24-seater';
  occupiedSeats: number[];
  selectedSeats: number[];
  onSeatChange: (seats: number[]) => void;
  maxSeats: number;
}

// We're using a more visual seat layout similar to theguardian.co.ke booking
export const ShuttleSeatMap: React.FC<ShuttleSeatMapProps> = ({
  vehicleType = '14-seater',
  occupiedSeats = [],
  selectedSeats = [],
  onSeatChange,
  maxSeats = 4
}) => {
  const [seatLayout, setSeatLayout] = useState<Seat[]>([]);
  
  useEffect(() => {
    // Generate seats based on vehicle type
    generateSeats();
  }, [vehicleType, occupiedSeats]);
  
  const generateSeats = () => {
    const layouts = {
      '14-seater': { rows: 5, cols: 3 }, // 4 rows of 3 seats + driver seat
      '17-seater': { rows: 6, cols: 3 }, // 5 rows of 3 seats + driver seat + rear seats
      '24-seater': { rows: 8, cols: 3 }, // 7 rows of 3 seats + driver seat + rear seats
    };
    
    const layout = layouts[vehicleType] || layouts['14-seater'];
    const seats: Seat[] = [];
    
    // Driver seat is always occupied
    seats.push({
      id: 0,
      status: 'occupied',
      position: { row: 0, col: 0 }
    });
    
    // Generate passenger seats
    let seatId = 1;
    for (let row = 1; row < layout.rows; row++) {
      for (let col = 0; col < layout.cols; col++) {
        // Skip the aisle in the middle column except for the last row (which might have a bench)
        if (col === 1 && row !== layout.rows - 1) continue;
        
        const status = getStatus(seatId);
        
        seats.push({
          id: seatId,
          status,
          position: { row, col }
        });
        
        seatId++;
      }
    }
    
    // For 17 and 24 seaters, add rear bench seats
    if (vehicleType !== '14-seater') {
      const rearRow = layout.rows;
      for (let col = 0; col < 3; col++) {
        const status = getStatus(seatId);
        
        seats.push({
          id: seatId,
          status,
          position: { row: rearRow, col }
        });
        
        seatId++;
      }
    }
    
    setSeatLayout(seats);
  };
  
  const getStatus = (seatId: number): 'available' | 'selected' | 'occupied' | 'reserved' => {
    if (occupiedSeats.includes(seatId)) return 'occupied';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };
  
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied' || seat.id === 0) return; // Driver's seat or occupied seats cannot be selected
    
    const newSelectedSeats = [...selectedSeats];
    
    if (selectedSeats.includes(seat.id)) {
      // Remove seat from selection
      const index = newSelectedSeats.indexOf(seat.id);
      newSelectedSeats.splice(index, 1);
    } else if (selectedSeats.length < maxSeats) {
      // Add seat to selection
      newSelectedSeats.push(seat.id);
    } else {
      // Max seats reached
      return;
    }
    
    onSeatChange(newSelectedSeats);
  };
  
  // Helper for seat colors
  const getSeatColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-gray-400 text-white cursor-not-allowed';
      case 'selected': return 'bg-royal-blue text-white';
      case 'available': return 'bg-white border-2 border-gray-300 hover:border-royal-blue cursor-pointer';
      case 'reserved': return 'bg-royal-red-light text-white cursor-not-allowed';
      default: return 'bg-white border border-gray-300';
    }
  };

  return (
    <Card className="card-enhanced">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Select Your Seats ({selectedSeats.length}/{maxSeats})</span>
          </div>
          <Badge variant="outline" className="bg-royal-blue/10">
            {vehicleType}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-6">
          <div className="relative bg-gray-100 p-4 rounded-lg w-full max-w-xs">
            {/* Vehicle front */}
            <div className="flex justify-center mb-6">
              <div className="bg-gray-300 w-24 h-8 rounded-t-3xl flex items-center justify-center text-xs text-gray-700">
                FRONT
              </div>
            </div>
            
            {/* Vehicle body with seats */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 relative">
              {/* Driver's area */}
              <div className="absolute -top-2 left-4 flex space-x-2 items-center">
                <div className="w-9 h-9 bg-gray-700 text-white rounded-full flex items-center justify-center text-xs">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-xs text-gray-500">Driver</span>
              </div>
              
              {/* Steering wheel */}
              <div className="w-8 h-8 rounded-full border-2 border-gray-400 absolute top-2 left-4 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 rounded-full"></div>
              </div>
              
              {/* Dashboard */}
              <div className="bg-gray-200 h-10 w-full rounded-lg mb-6"></div>
              
              {/* Seats grid */}
              <div className="grid grid-cols-3 gap-2">
                {seatLayout.map(seat => {
                  if (seat.id === 0) return null; // Skip driver's seat as we show it separately
                  
                  // Determine if we need to add spacers for aisle
                  if (seat.position.col === 2 && seat.position.row !== seatLayout[seatLayout.length - 1].position.row) {
                    return (
                      <React.Fragment key={seat.id}>
                        <div className="w-9 h-9 invisible"></div>
                        <div className="w-9 h-9 flex items-center justify-center">
                          <ArrowLeftRight className="h-4 w-4 text-gray-300" />
                        </div>
                        <div 
                          className={`w-9 h-9 ${getSeatColor(seat.status)} rounded flex items-center justify-center text-xs font-semibold`}
                          onClick={() => handleSeatClick(seat)}
                        >
                          {seat.status === 'occupied' ? (
                            <XCircle className="h-4 w-4" />
                          ) : seat.status === 'selected' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            seat.id
                          )}
                        </div>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <div 
                      key={seat.id}
                      className={`w-9 h-9 ${getSeatColor(seat.status)} rounded flex items-center justify-center text-xs font-semibold`}
                      onClick={() => handleSeatClick(seat)}
                    >
                      {seat.status === 'occupied' ? (
                        <XCircle className="h-4 w-4" />
                      ) : seat.status === 'selected' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        seat.id
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Back door */}
              <div className="w-12 h-4 bg-gray-300 absolute -bottom-4 right-8"></div>
            </div>
            
            {/* Vehicle rear */}
            <div className="flex justify-center mt-6">
              <div className="bg-gray-300 w-24 h-8 rounded-b-lg flex items-center justify-center text-xs text-gray-700">
                BACK
              </div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center gap-4 text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-royal-blue rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <span>Occupied</span>
          </div>
        </div>
        
        {selectedSeats.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="font-medium text-sm text-green-800">
              You've selected seats: {selectedSeats.join(", ")}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
