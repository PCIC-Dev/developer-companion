# PCIC Developer Companion

A project-based learning platform designed for PCIC members.

## The Core Learning Loop

The platform operates around a continuous growth loop:

1. **Publish:** A mentor publishes a project brief and its grading rubric.

2. **Build & Ship:** A member develops and ships a real repository.

3. **Review:** A mentor reviews the submission against the specific rubric.

4. **Track:** Progress becomes visible, ranked, and time-boxed.

## Tech Stack

* **Frontend:** Progressive Web App (PWA) built with **Next.js**

* **Backend:** **Node.js** with **Express**

* **Databases & Storage:**

  * **Supabase:** Dedicated strictly to user information and authentication.

  * **PostgreSQL:** Primary relational database for application and project data.

* **Containerization:** **Docker**

## Architecture Overview

To optimize performance and resource management:

* **Authentication & User Management** are handled via Supabase.

* **Application Data & Project State** are housed in a dedicated PostgreSQL database powered by a Node.js/Express backend.

* The frontend is delivered as a responsive Progressive Web App (PWA) for seamless member interaction across devices.

* **Docker** is integrated to containerize the services for consistent development and deployment environments.

## Getting Started

*(Instructions for cloning, installing dependencies, and running via Docker will be added here as development progresses.)*
