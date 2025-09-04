# Open Source Readiness Checklist

Use this checklist before making the repository public.

## 1) Secrets #43; Configuration

- [ ] Remove all secrets and access keys from the repo
- [ ] Provide .env.example files for backend and app with placeholders
- [ ] Verify CI does not echo secrets in logs
- [ ] Use a secrets manager (GitHub Actions Secrets, AWS SSM, etc.)

## 2) Licenses #43; Policies

- [ ] Choose a license (MIT, Apache&#45;2.0, etc.) and add LICENSE
- [ ] Add a clear COPYRIGHT notice if needed
- [ ] Ensure third&#45;party licenses are compatible (npm packages, fonts, media)

## 3) Security

- [ ] Add SECURITY.md with how to report vulnerabilities
- [ ] Redact sensitive fields from logs and analytics by default
- [ ] Validate and authorize on server for every privileged action [^1]
- [ ] Review data retention and PII handling; avoid storing raw phone if possible
- [ ] Add CodeQL or similar static analysis to CI

## 4) Docs

- [ ] README with overview, architecture, local dev, deploy, and contribution guide
- [ ] docs/publish.md (end&#45;to&#45;end publishing)
- [ ] docs/phone&#45;encryption.md (if adopting one&#45;way storage)
- [ ] API reference (OpenAPI or markdown with routes and payloads)

## 5) Community #43; Process

- [ ] CONTRIBUTING.md (how to set up dev env, run tests, style guide)
- [ ] CODE_OF_CONDUCT.md
- [ ] Issue templates and PR templates (.github/ISSUE_TEMPLATE, PULL_REQUEST_TEMPLATE.md)
- [ ] CODEOWNERS to make reviews explicit
- [ ] DCO or CLA policy (if required by your org)

## 6) Quality

- [ ] CI (lint, typecheck, tests) must pass on PRs and main
- [ ] Minimum test coverage threshold; add tests for critical services
- [ ] Prettier/ESLint enforced
- [ ] Dependabot or Renovate for dependency updates

## 7) UX #43; Accessibility

- [ ] Basic accessibility labels and readable contrast in the app
- [ ] Document how to build and run on simulators / devices

## 8) Release #43; Versioning

- [ ] Version tags for app (e.g., app&#45;v1.0.0) and backend image
- [ ] CHANGELOG.md describing user&#45;visible changes
- [ ] Release notes templates

## 9) Compliance

- [ ] Ensure data policies meet your jurisdiction (GDPR/CCPA as applicable)
- [ ] Remove production tracing endpoints and internal dashboards

## 10) Final Pre&#45;Public Review

- [ ] Scan repo history for secrets
- [ ] Run a dry run of the full installation per docs
- [ ] Check that sample data and screenshots don’t expose PII

Security references:
- Validate client input and re&#45;verify auth server&#45;side for every action [^1]
- Avoid relying on encryption alone; prefer layered controls [^1]

[^1]: Guides: Data Security | Next.js
