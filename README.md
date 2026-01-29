# Event Ticket Booking System

## Project Overview
The Event Ticket Booking System is a web-based application designed to allow users to view events and book tickets online.
Users can book Normal and VIP tickets through a secure system.

The project focuses on combining full-stack web development with basic Data Structures to manage ticket booking efficiently.

## Authentication
- Firebase Authentication is used
- Google Sign-In for secure user login
- Each booking is associated with an authenticated user

## Features
- User login using Google Authentication
- Display of available events
- Ticket booking for:
  - Normal tickets
  - VIP tickets
- Ticket confirmation system
- Automatic ticket price calculation
- Priority handling for VIP users
- Secure storage of booking details
## Data Structures Used
- Arrays / Lists  
  Used to store event details and ticket information
- Stack  
  Used for managing ticket booking operations and confirmations
- Queue  
  Used for handling VIP ticket priority and counselling-style booking flow

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- Firebase (Google Authentication)

## Application Workflow
1. User logs in using Google Authentication
2. Available events are displayed
3. User selects an event
4. Ticket type is selected (Normal or VIP)
5. VIP users are handled using priority queue logic
6. Ticket booking is processed using stack operations
7. Total price is calculated
8. Booking details are stored in the database

## Learning Outcomes
- Implementation of Firebase Google Authentication
- Backend development using Node.js and Express
- Database operations using MongoDB
- Practical use of Stack and Queue data structures
- Understanding of full-stack application architecture

## Future Enhancements
- Online payment gateway integration
- Admin dashboard for event management
- Seat allocation system
- QR code-based ticket generation
- Email confirmation for bookings

## Author
Vaishali Bhandari  
Second Year Student
