# Calendar & Engagement Module Concept

This module handles the church's scheduling, resource management, and member follow-up engagement. It maps directly to the "Calendar" sidebar section.

## Core Entities

### 1. Appointments System
Facilitates automated booking for pastors, counseling, or church services.

*   **AppointmentType**: A template for a booking (e.g., "30 min counseling").
    *   Fields: `id`, `name`, `description`, `location` (Physical/Online), `visibility` (Public/Private), `duration` (mins), `churchId`.
*   **AppointmentSchedule**: Defines the availability for a type.
    *   Fields: `id`, `appointmentTypeId`, `dayOfWeek` (Mon-Sun), `startTime`, `endTime`.
*   **AppointmentBooking**: A specific slot booked by a user/member.
    *   Fields: `id`, `appointmentTypeId`, `userId`, `startTime`, `endTime`, `status`.

### 2. Follow-Ups
Task management for member care and engagement.

*   **FollowUp**: A task assigned to a church staff to check on a member.
    *   Fields: `id`, `memberId` (who to follow up), `assignedToId` (who does it), `type` (e.g., First-timer, Absence), `action` (e.g., Call, Visit), `date`, `time`, `notes`, `status`.

### 3. Resource & Room Management
Prevents double-booking of physical assets.

*   **Room**: Physical spaces (e.g., Sanctuary, Meeting Room 1).
*   **Resource**: Shared equipment (e.g., Sound system, projector, bus).

### 4. General Calendar
General church events (Service times, Bible study, Special events).

*   **CalendarEvent**: `id`, `title`, `description`, `startTime`, `endTime`, `location`, `recurrenceRule`.

## UI Alignment
*   The **Appointments** table uses booked counts to show "Schedules", "Open for bookings", and "Completed appointments".
*   The **Follow-Up** modal enables direct assignment to staff members (via `assignedToId`).
*   The **Create Appointment Type** flow maps "General Info" to `AppointmentType` and "Schedule" to `AppointmentSchedule`.

## Engagement & Communications

### 1. Announcements
Official church-wide notices.
*   **Announcement**:
    *   Fields: `id`, `title`, `content` (Rich text/HTML), `isPinned` (bool), `isScheduled` (bool), `scheduledFor` (timestamp), `churchId`, `status` (Active, Draft, Scheduled).

### 2. Custom Forms
Dynamic form builder for church events and requests.
*   **Form**:
    *   Fields: `id`, `name`, `description`, `status` (Open, Closed), `type` (Registration, Prayer, etc.), `schema` (JSON for fields), `churchId`.
*   **FormSubmission**:
    *   Fields: `id`, `formId`, `memberId` (optional), `data` (JSON response), `submittedAt`.

## Reports and Metrics
Derived data used for the church dashboard.

### 1. People Metrics
*   Aggregated counts for Gender distribution, Age demographics, and Group/Family participation.
*   "Adults / Children" ratio based on member birthdates.

### 2. Finance Metrics
*   **Overview**: Total Donations, Total Donors, Total Amount, Avg Donation.
*   **Donor Breakdown**: Distinction between Recurring vs One-time donors, Avg per donor, and Global donation range.
*   **Fund Performance**: Per-fund tracking of total collected, donation counts, and average gift size.
*   **Distribution**: Breakdowns by Fund, Payment Method (Cash, Card, etc.), and Type (Online vs Offline).
*   **Giving Trends**: Historical count and amount tracking over months.

## Church Settings & Customization

### 1. Extra Fields
Enables per-church customization of member profiles.
*   **CustomField**:
    *   Fields: `id`, `label`, `type` (Text, Number, Date, Select), `placeholder`, `showOnPortal`, `options` (for Select types).

### 2. Account Defaults
Global settings to streamline data entry and localization.
*   **Person Defaults**: Gender options (Basic to Full List), age group toggles (Child/Adult/Elder).
*   **Localization**: Default Currency (e.g., USD), Timezone (e.g., Africa/Douala), and Currency format.
*   **Communication**: Default country codes for phone number formatting.
*   **Portal**: Access controls for the Member Directory.
