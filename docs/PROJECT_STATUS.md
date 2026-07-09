# Crazy Desert Racing — Project Status (June 2026)

## Project Goal

Crazy Desert Racing — Full Stack portfolio project + startup concept for a desert racing and festival community in Israel.

Vision:

* Desert races in the Negev
* Festival experience
* Camping
* Music events
* VIP Club
* User garages
* Race registrations
* Marketplace
* Teams and social features
* Admin management
* Production deployment

---

# Tech Stack

## Backend

* Java 21
* Spring Boot
* Spring Security
* JWT
* Hibernate / JPA
* PostgreSQL
* Maven

## Frontend

* React
* TypeScript
* Vite
* React Router

---

# Backend Status

## Users

Completed:

* Registration
* Login
* JWT Authentication
* User Roles (USER / ADMIN)
* Get Current User
* Verify License
* Make Admin

---

## Race Cars

Completed:

* Create Car
* Update Car
* Get Car By ID
* Get My Cars
* Delete Car
* Image URL Support
* Image Position Support

Image Positions:

* CENTER
* LEFT
* RIGHT
* TOP
* BOTTOM

---

## Races

Completed:

* Create Race
* Edit Race
* Get Race Details
* Race Status Support

Statuses:

* UPCOMING
* PAST
* POSTPONED
* CANCELED

---

## Registrations

Completed:

* Register Car For Race
* Duplicate Registration Validation
* Race Full Validation
* Ownership Validation
* License Verification Validation

---

# Frontend Status

## Authentication

Completed:

* Login Page
* Registration Page
* Protected Routes
* Logout

---

## Dashboard

Completed:

* Driver Profile
* User Information
* Dashboard Navigation

---

## Cars

Completed:

* My Cars Page
* Add Car Page
* Car Details Page
* Edit Car Page
* Delete Car
* Image URL Support
* Image Position Support

Planned:

* Marketplace Status
* Focus Point Image Positioning
* Upload Real Images

---

## Races

Completed:

* Races Page
* Race Details Page
* Register For Race
* Admin Edit Race
* Postpone Race
* Cancel Race

Planned:

* Participants Counter
* Participants List
* Registered Cars List

---

## VIP Club

Completed:

* VIP Club Page

---

# Desert UI Library

Completed

Reusable Components:

## Cards

* du-entity-card
* du-showcase-card
* du-details-card

## Forms

* du-form-panel
* du-form-header
* du-form

## Buttons

* du-button
* du-button-primary

## Status Components

* du-status

Result:

Project UI is now component-oriented.

---

# Current Phase

Frontend MVP Completion

---

# Marketplace Planning

Not implemented yet.

Planned Car Statuses:

* GARAGE
* FOR_SALE
* SOLD
* RACE_READY
* BLOCKED

Rules:

Owner can:

* Edit own car
* Delete own car
* Put car for sale
* Mark as sold

Admin can:

* View all cars
* Block suspicious listings
* Unblock listings
* Moderate marketplace

Admin should NOT normally delete user cars.

Blocked cars remain in database.

---

# Admin Dashboard

Planned

## Users

* List Users
* Verify License
* Make Admin
* User Details

## Cars

* View All Cars
* Marketplace Moderation
* Block Listing

## Races

* Create Race
* Edit Race
* Cancel Race
* Postpone Race

## Statistics

* Total Users
* Total Cars
* Total Races
* Total Registrations

---

# Future Community Features

## User Profiles

* Avatar
* Bio
* Experience
* Favorite Vehicle

## Teams

* Create Team
* Join Team
* Leave Team

## Friends

* Add Friend
* Remove Friend

---

# Festival Features

Planned

* Festival Schedule
* Camping Area
* Food Zone
* Music Stage

VIP Features:

* VIP Parking
* VIP Camp
* VIP Lounge

---

# Chat System

Future Phase

* Global Chat
* Race Chat
* VIP Chat

---

# Production Deployment

Planned

Backend:

* Docker
* Docker Compose
* PostgreSQL Container
* Environment Variables

Frontend:

* Production Build
* Nginx

Infrastructure:

* Domain
* HTTPS
* SSL Certificate

---

# Startup Roadmap

Phase 1

Portfolio Full Stack Project

Phase 2

Deploy To Production

Phase 3

Find First Community Members

Phase 4

Validate Market Interest In Israel

Phase 5

Build Real Club And Events

---

# Current Priority

1. Marketplace Status
2. Race Participants
3. Admin Dashboard
4. Docker Deployment
5. Production Launch

---

# Last Completed Task

✅ Delete Car Functionality

Commit:

Add delete race car functionality


Правило Crazy Desert Racing №1

Перед тем как написать новый HTML/CSS, всегда задаём себе вопросы:

Есть ли уже похожий компонент в Desert UI?
Можно ли его переиспользовать?
Если нет — нужен ли он ещё минимум в двух местах проекта?
Если да — сначала добавляем его в Desert UI, только потом используем на странице.

Запрещается создавать локальные стили страницы, если они являются универсальными.
