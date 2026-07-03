-- Add btree_gist extension
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Partial index for active bookings
CREATE INDEX "active_booking_idx" ON "Booking" ("room_id", "check_in")
WHERE "status" IN ('CONFIRMED', 'PENDING', 'BLOCKED');

-- GiST Exclusion Constraint for overlapping dates
ALTER TABLE "Booking" ADD CONSTRAINT "prevent_overlapping_bookings"
EXCLUDE USING gist (
  "room_id" WITH =,
  tsrange("check_in", "check_out", '[)') WITH &&
)
WHERE ("status" IN ('CONFIRMED', 'BLOCKED'));