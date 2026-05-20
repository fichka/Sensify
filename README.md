# Sensify

Inclusive mobile navigation for neurodivergent and sensory-sensitive users.

Sensify NeuroSafe is an `Expo` / `React Native` prototype focused on safer city movement for children, teens, and adults who may be affected by noise, crowds, bright spaces, stress, or sudden route changes. Instead of treating navigation as a shortest-path problem only, the product is designed around calmer movement, guided support, and fast access to help.

## Overview

The app combines:

- sensory-aware route guidance;
- real-time trip tracking;
- AI-assisted support during movement;
- quick nonverbal communication;
- emergency escalation through SOS;
- a guardian-facing monitoring view;
- accessibility-first interaction patterns.

The current version is a polished MVP prototype built for demo and product validation.

## Features

### User onboarding

- guided setup for trip goals and mobility habits;
- manual language selection with `RU`, `KZ`, and `EN`;
- theme selection;
- sensory sensitivity setup;
- permissions-oriented flow for location, notifications, smartwatch connection, and SOS readiness.

### Safe route screen

- calm, safe, adaptive, school, shortest, and night route modes;
- route load visualization by segment;
- nearby quiet places and safe zones;
- route warnings for noisy or overloaded areas;
- one-tap trip start for live trip mode.

### Live trip experience

- active trip progress state;
- soft warnings when the route becomes more difficult;
- nearby recovery points such as quiet spaces;
- UI prepared for future real-time GPS integration.

### AI assistant

- simple-language support;
- short, low-pressure route guidance;
- quick actions for breathing, pausing, and support requests;
- chat-style UI ready for future text and voice integrations.

### SOS and nonverbal support

- one-tap SOS access;
- emergency escalation modal with location-sharing intent;
- large public-facing support message for nearby adults;
- nonverbal quick phrases for overload situations.

### Guardian panel

- child profile summary;
- live movement status card;
- trusted contact overview;
- weekly analytics snapshot for trips, alerts, and route comfort.

### Accessibility

- high-contrast mode;
- simple language mode;
- one-hand mode;
- soft screen mode for overload scenarios;
- haptic feedback toggle.

## Tech Stack

- `Expo`
- `React Native`
- `TypeScript`

## Project Structure

- [App.tsx](/c:/Users/alikhan/Sensify/App.tsx) — main application UI and demo state
- [app.json](/c:/Users/alikhan/Sensify/app.json) — Expo configuration
- [package.json](/c:/Users/alikhan/Sensify/package.json) — scripts and dependencies

## Getting Started

### Prerequisites

- `Node.js 20+` recommended
- `npm`
- `Expo Go` on an iOS or Android device

### Install

```bash
npm install
```

### Run

```bash
npm run start
```

Then scan the QR code with `Expo Go`.

## Current MVP Scope

This repository currently ships a front-end prototype with local demo data. It does not yet include:

- production authentication;
- backend services;
- persistent storage;
- real map providers or live geolocation;
- smartwatch device APIs;
- push notification infrastructure;
- live AI or voice processing.

## Product Direction

Planned next steps:

- integrate location and map services;
- add persistent child and guardian profiles;
- support trip history and event logs;
- connect voice and AI assistant services;
- add biometric protection for sensitive screens;
- introduce real smartwatch actions and stress signals;
- build a web dashboard for guardians and administrators.

## Status

Prototype / hackathon MVP.

## License

Add a license before publishing publicly.
