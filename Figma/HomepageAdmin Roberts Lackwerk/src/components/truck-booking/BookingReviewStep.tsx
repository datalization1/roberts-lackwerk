import { BookingData } from '../TruckBookingForm';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

interface BookingReviewStepProps {
  bookingData: BookingData;
}

const TRUCK_SIZES = {
  red: { name: 'Transporter Rot', price: 129 },
  white1: { name: 'Transporter Weiss #1', price: 129 },
  white2: { name: 'Transporter Weiss #2', price: 129 },
};

const OPTION_PRICES = {
  insurance: 25,
  blankets: 15,
  dolly: 10,
  straps: 8,
};

const OPTION_NAMES = {
  insurance: 'Zusatzversicherung',
  blankets: 'Umzugsdecken (10 Stück)',
  dolly: 'Sackkarre',
  straps: 'Zurrgurte (4 Stück)',
};

const TIME_BLOCK_NAMES = {
  morning: 'Vormittag (08:00 - 12:00)',
  afternoon: 'Nachmittag (13:00 - 18:00)',
  fullday: 'Ganztag (08:00 - 18:00)',
};

export function BookingReviewStep({ bookingData }: BookingReviewStepProps) {
  const calculateTotal = () => {
    const truckSize = bookingData.rental.truckSize as keyof typeof TRUCK_SIZES;
    const basePrice = TRUCK_SIZES[truckSize]?.price || 0;
    
    // Calculate number of days
    const pickup = new Date(bookingData.rental.pickupDate);
    const returnDate = new Date(bookingData.rental.returnDate);
    const days = Math.max(1, Math.ceil((returnDate.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    let total = basePrice * days;
    
    // Add options
    if (bookingData.options.insurance) total += OPTION_PRICES.insurance * days;
    if (bookingData.options.blankets) total += OPTION_PRICES.blankets;
    if (bookingData.options.dolly) total += OPTION_PRICES.dolly;
    if (bookingData.options.straps) total += OPTION_PRICES.straps;
    
    return { total, days, basePrice };
  };

  const { total, days, basePrice } = calculateTotal();
  const truckSize = bookingData.rental.truckSize as keyof typeof TRUCK_SIZES;
  const pickupBlock = bookingData.rental.pickupTimeBlock as keyof typeof TIME_BLOCK_NAMES;

  return (
    <div className="space-y-6">
      <p className="text-gray-600">Bitte überprüfen Sie Ihre Buchungsdetails, bevor Sie bestätigen.</p>

      <Card>
        <CardHeader>
          <CardTitle>Mietdetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Transporter Grösse:</span>
            <span>{TRUCK_SIZES[truckSize]?.name || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">Abholung:</span>
            <span>{bookingData.rental.pickupDate} - {TIME_BLOCK_NAMES[pickupBlock] || '-'}</span>
          </div>
          {bookingData.rental.pickupTimeBlock === 'fullday' && bookingData.rental.returnDate && (
            <>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-600">Rückgabe:</span>
                <span>{bookingData.rental.returnDate}</span>
              </div>
            </>
          )}
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">Mietdauer:</span>
            <span>{days} Tag(e)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kundendetails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span>{bookingData.customer.name || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">Adresse:</span>
            <span className="text-right">{bookingData.customer.address || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">Telefon:</span>
            <span>{bookingData.customer.phone || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">E-Mail:</span>
            <span>{bookingData.customer.email || '-'}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-gray-600">Führerschein:</span>
            <span>{bookingData.customer.driverLicense || '-'}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zusatzoptionen</CardTitle>
        </CardHeader>
        <CardContent>
          {!bookingData.options.insurance && 
           !bookingData.options.blankets && 
           !bookingData.options.dolly && 
           !bookingData.options.straps ? (
            <p className="text-gray-500">Keine zusätzlichen Optionen ausgewählt</p>
          ) : (
            <div className="space-y-2">
              {bookingData.options.insurance && (
                <div className="flex justify-between items-center">
                  <span>{OPTION_NAMES.insurance}</span>
                  <Badge variant="secondary">CHF {OPTION_PRICES.insurance}/Tag</Badge>
                </div>
              )}
              {bookingData.options.blankets && (
                <div className="flex justify-between items-center">
                  <span>{OPTION_NAMES.blankets}</span>
                  <Badge variant="secondary">CHF {OPTION_PRICES.blankets}</Badge>
                </div>
              )}
              {bookingData.options.dolly && (
                <div className="flex justify-between items-center">
                  <span>{OPTION_NAMES.dolly}</span>
                  <Badge variant="secondary">CHF {OPTION_PRICES.dolly}</Badge>
                </div>
              )}
              {bookingData.options.straps && (
                <div className="flex justify-between items-center">
                  <span>{OPTION_NAMES.straps}</span>
                  <Badge variant="secondary">CHF {OPTION_PRICES.straps}</Badge>
                </div>
              )}
            </div>
          )}
          {bookingData.options.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <span className="text-gray-600">Zusätzliche Hinweise:</span>
                <p className="mt-2 text-gray-900 whitespace-pre-wrap">
                  {bookingData.options.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Basistarif ({days} Tag(e)):</span>
              <span>CHF {(basePrice * days).toFixed(2)}</span>
            </div>
            {bookingData.options.insurance && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Versicherung ({days} Tag(e)):</span>
                <span>CHF {(OPTION_PRICES.insurance * days).toFixed(2)}</span>
              </div>
            )}
            {bookingData.options.blankets && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Umzugsdecken:</span>
                <span>CHF {OPTION_PRICES.blankets.toFixed(2)}</span>
              </div>
            )}
            {bookingData.options.dolly && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Sackkarre:</span>
                <span>CHF {OPTION_PRICES.dolly.toFixed(2)}</span>
              </div>
            )}
            {bookingData.options.straps && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Zurrgurte:</span>
                <span>CHF {OPTION_PRICES.straps.toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center text-xl">
              <span>Gesamt:</span>
              <span className="text-blue-600">CHF {total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}