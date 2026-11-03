# Salon web

Static React site. Name, phone, address, hours and services come from the salon function (`VITE_SALON_URL`). Book Now goes to `VITE_BOOKING_URL`.

The owner edits `src/siteCopy.ts` for the tagline, hero lines, the four Why Choose cards, the call to action and an optional stats list. Only claim what is true. The stats list is empty by default, and the stat band then shows values from the salon data.

Home shows the most expensive service of each category, in category order (four at most, filled with the next most expensive if there are fewer than four categories). Booking buttons are hidden and the phone is shown when online booking is off.

Commands: `npm run lint`, `npm test`, `npm run build`.
