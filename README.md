# School Administration & Scheduling Platform

An automated, cloud-based administrative workspace designed to optimize teacher absence management, substitution workflows, and automated official document generation for educational institutions.

> **Note:** Developed and successfully defended as the graduation capstone project for the State Professional Qualification in System Programming at the High School of Mathematics "Acad. Kiril Popov", Plovdiv.

## Architecture & Data Flow

The platform utilizes a decoupled client-server architecture hosted in a secure Google Workspace environment:

- **Frontend:** Responsive SPA-style interface built with **HTML5**, **Bootstrap 5**, and asynchronous **Vanilla JavaScript**.
- **Backend:** Modular, type-safe server logic implemented in **TypeScript** executed via **Google Apps Script**.
- **Database Layer:** Managed relational database on **Google Cloud SQL (MySQL)** communicating via Google Apps Script JDBC API with parameterized queries.
- **Document Automation:** Seamless integration with **Google Docs API** and **Google Drive API** for dynamic template filling and file organization.

## Core Modules

- **Role-Based Access Control:** Separate interfaces and permission tiers for Administrators and Teachers.
- **Absence & Substitution Engine:** Dynamic reporting of teacher leaves, conflict checking against master schedules, and teacher assignment approvals.
- **Automated Declarations:** Automatic generation of official substitution forms into Google Drive folders based on predefined Google Docs templates.
- **Room Schedule Visualization:** Interactive weekly overview of classroom utilization by shifts to avoid scheduling collisions.
- **Real-Time Notifications:** In-app notification center notifying teachers of substitution request decisions.
- **Developer Multi-Tenant Panel:** Administrative dashboard for provisioning and managing multiple school workspaces.

## Technologies Used

- **Languages:** TypeScript, JavaScript, SQL, HTML5, CSS3
- **Cloud & Services:** Google Apps Script, Google Cloud SQL, Google Docs API, Google Drive API
- **Frontend Framework:** Bootstrap 5
- **Dev Tools:** clasp (Command Line Apps Script Projects), VS Code, DrawSQL
