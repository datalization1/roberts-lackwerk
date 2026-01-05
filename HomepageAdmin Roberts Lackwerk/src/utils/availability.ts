// Verfügbarkeitslogik für Transporter-Vermietung

export interface Booking {
  id: string;
  truckId: string;
  startDate: string;
  endDate: string;
  customerName: string;
}

// Mock-Daten für bestehende Buchungen
export const existingBookings: Booking[] = [
  {
    id: 'B001',
    truckId: 'red',
    startDate: '2025-12-01',
    endDate: '2025-12-03',
    customerName: 'Max Mustermann',
  },
  {
    id: 'B002',
    truckId: 'white1',
    startDate: '2025-12-05',
    endDate: '2025-12-07',
    customerName: 'Anna Schmidt',
  },
  {
    id: 'B003',
    truckId: 'red',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    customerName: 'Peter Müller',
  },
  {
    id: 'B004',
    truckId: 'white2',
    startDate: '2025-12-15',
    endDate: '2025-12-18',
    customerName: 'Sarah Weber',
  },
];

/**
 * Prüft ob ein Datum zwischen zwei anderen Daten liegt
 */
function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Prüft ob zwei Datumsbereiche sich überschneiden
 */
function doRangesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 <= end2 && end1 >= start2;
}

/**
 * Prüft ob ein Fahrzeug für einen bestimmten Zeitraum verfügbar ist
 */
export function isVehicleAvailable(
  truckId: string,
  startDate: string,
  endDate: string,
  bookings: Booking[] = existingBookings
): boolean {
  if (!startDate || !endDate || !truckId) {
    return true; // Wenn keine Daten angegeben, als verfügbar betrachten
  }

  const requestedStart = new Date(startDate);
  const requestedEnd = new Date(endDate);

  // Prüfe ob es Überschneidungen mit bestehenden Buchungen gibt
  const hasConflict = bookings.some((booking) => {
    if (booking.truckId !== truckId) {
      return false; // Andere Fahrzeuge interessieren nicht
    }

    const bookingStart = new Date(booking.startDate);
    const bookingEnd = new Date(booking.endDate);

    return doRangesOverlap(requestedStart, requestedEnd, bookingStart, bookingEnd);
  });

  return !hasConflict;
}

/**
 * Gibt alle Fahrzeuge mit ihrer Verfügbarkeit für einen Zeitraum zurück
 */
export function getVehicleAvailability(
  startDate: string,
  endDate: string,
  bookings: Booking[] = existingBookings
): Record<string, { available: boolean; nextAvailableDate?: string }> {
  const vehicles = ['red', 'white1', 'white2'];
  const result: Record<string, { available: boolean; nextAvailableDate?: string }> = {};

  vehicles.forEach((truckId) => {
    const available = isVehicleAvailable(truckId, startDate, endDate, bookings);
    
    if (!available && startDate) {
      // Finde das nächste verfügbare Datum
      const nextAvailable = findNextAvailableDate(truckId, startDate, bookings);
      result[truckId] = { available, nextAvailableDate: nextAvailable };
    } else {
      result[truckId] = { available };
    }
  });

  return result;
}

/**
 * Findet das nächste verfügbare Datum für ein Fahrzeug
 */
function findNextAvailableDate(
  truckId: string,
  fromDate: string,
  bookings: Booking[]
): string | undefined {
  const vehicleBookings = bookings
    .filter((b) => b.truckId === truckId)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  if (vehicleBookings.length === 0) {
    return undefined;
  }

  // Finde die nächste Buchung nach dem gewünschten Startdatum
  const relevantBooking = vehicleBookings.find(
    (b) => new Date(b.startDate) >= new Date(fromDate)
  );

  if (relevantBooking) {
    // Das nächste verfügbare Datum ist einen Tag nach Ende der Buchung
    const endDate = new Date(relevantBooking.endDate);
    endDate.setDate(endDate.getDate() + 1);
    return endDate.toISOString().split('T')[0];
  }

  return undefined;
}

/**
 * Gibt alle Buchungen für ein bestimmtes Fahrzeug zurück
 */
export function getBookingsForVehicle(
  truckId: string,
  bookings: Booking[] = existingBookings
): Booking[] {
  return bookings
    .filter((b) => b.truckId === truckId)
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

/**
 * Gibt alle blockierten Daten für ein Fahrzeug zurück (für Kalender)
 */
export function getBlockedDates(
  truckId: string,
  bookings: Booking[] = existingBookings
): Date[] {
  const vehicleBookings = getBookingsForVehicle(truckId, bookings);
  const blockedDates: Date[] = [];

  vehicleBookings.forEach((booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    
    // Füge alle Daten zwischen Start und Ende hinzu
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      blockedDates.push(new Date(date));
    }
  });

  return blockedDates;
}
