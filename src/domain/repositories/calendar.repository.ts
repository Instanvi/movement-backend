import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../../core/db.provider';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../../core/schema/calendar.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class CalendarRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: NodePgDatabase<Record<string, never>>,
  ) {}

  // Rooms
  async createRoom(data: typeof schema.room.$inferInsert) {
    const results = await this.db.insert(schema.room).values(data).returning();
    return results[0];
  }

  async findRooms(churchId: string) {
    return await this.db
      .select()
      .from(schema.room)
      .where(eq(schema.room.churchId, churchId));
  }

  // Appointment Types
  async createAppointmentType(
    data: typeof schema.appointmentType.$inferInsert,
  ) {
    const results = await this.db
      .insert(schema.appointmentType)
      .values(data)
      .returning();
    return results[0];
  }

  async findAppointmentTypes(churchId: string) {
    return await this.db
      .select()
      .from(schema.appointmentType)
      .where(eq(schema.appointmentType.churchId, churchId));
  }

  // Bookings
  async createBooking(data: typeof schema.appointmentBooking.$inferInsert) {
    const results = await this.db
      .insert(schema.appointmentBooking)
      .values(data)
      .returning();
    return results[0];
  }

  // Events
  async createEvent(data: typeof schema.calendarEvent.$inferInsert) {
    const results = await this.db
      .insert(schema.calendarEvent)
      .values(data)
      .returning();
    return results[0];
  }

  async findEvents(churchId: string) {
    return await this.db
      .select()
      .from(schema.calendarEvent)
      .where(eq(schema.calendarEvent.churchId, churchId));
  }
}
