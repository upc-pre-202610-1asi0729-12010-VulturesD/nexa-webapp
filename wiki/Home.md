# Nexa WebApp Engineering Wiki

Technical documentation for the Angular WebApp of Nexa.

## Purpose

This wiki explains how the WebApp is structured, how it consumes Nexa Platform, and how the team validates the Open Source delivery.

## Quick Navigation

| Area | Page |
| --- | --- |
| Product context | [Project Overview](Project-Overview.md) |
| Product scope | [Product Scope](Product-Scope.md) |
| Frontend architecture | [Frontend Architecture](Frontend-Architecture.md) |
| Repository structure | [Repository Structure](Repository-Structure.md) |
| Main technologies | [Main Technologies](Main-Technologies.md) |
| Environment setup | [Environment Setup](Environment-Setup.md) |
| Git workflow | [Branching and Commits](Branching-and-Commits.md) |
| Pull requests | [Pull Request Guidelines](Pull-Request-Guidelines.md) |
| API standards | [API Design Guidelines](API-Design-Guidelines.md) |
| Quality and security | [Quality and Security](Quality-and-Security.md) |

## Repository Role

`nexa-webapp` contains the Angular single-page application. It owns presentation, routing, client-side session state, HTTP adapters, and user workflows for commercial, logistics, warehouse, and buyer portal users.

## Stack

- Angular 21.
- TypeScript.
- Angular Router.
- Angular Material.
- Angular HttpClient.
- REST API integration with `nexa-platform` under `/api/v1`.
- Render Static Site deployment.

---

Team Nexa · Course 1ASI0729 · 2026-10
