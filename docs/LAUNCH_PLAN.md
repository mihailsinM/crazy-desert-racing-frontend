# Crazy Desert Live Club — Three Steps to Launch

The first public version is built in three completed, testable stages. Each
stage uses the project workflow: branch, implementation, tests, commit, push,
pull request, review, merge, and branch cleanup.

## 1. The Story and Club Identity

Goal: make the purpose of Crazy Desert visible before adding more features.

- Combine the original Crazy Desert Racing dream with the full club manifesto
  in a slow, softly animated The Story sequence on the home page.
- Set story reading time proportionally from the orange copy length, using 4
  seconds for 35 characters and a 4-second minimum for shorter text. Do not
  include the white title in the character count.
- Let visitors move through the story immediately with the card's thin internal
  scrollbar, mouse wheel, keyboard arrows, or a mobile swipe.
- Open the compact story on click as a larger Details-style card, while keeping
  the current frame and hiding distracting home-page content behind it.
- Close The Story with the promise: **Today, it is a project. Tomorrow...
  reality.**
- Use **Club Member** as the shared community identity.
- Use **Crazy Desert Club Member** as the full profile signature.
- Keep Racing, Festivals, Camping, Music, Photography, and Off-Road as member
  interests rather than separate system roles.
- Preserve the manifesto and identity decisions in project documentation.
- Verify desktop and mobile layout, reduced-motion behavior, lint, and build.

Definition of done: the story is visible on the home page, member labels are
consistent, checks pass, and the PR is merged.

## 2. Demo World

Goal: make the existing product feel alive and make every important flow easy
to test.

- Create 15 populated profiles: one administrator and 14 demo Club Members.
- Give the profiles different interests, biographies, visibility settings,
  memberships, and license states.
- Add cars, races, race registrations, profile galleries, and Desert Live
  publications with realistic relationships between them.
- Add transparent **Demo Profile** labeling so visitors never mistake generated
  members, posts, sales, or events for real people or activity.
- Use polished, consistent Negev imagery with the existing avatar/card framing
  system.
- Make seed creation idempotent so restarting the backend never duplicates
  data.
- Enable demo data only through an explicit application profile or environment
  setting.
- Read demo passwords from environment configuration; never commit shared or
  production passwords to Git.
- Add automated tests for seed safety and the most important demo relationships.

Definition of done: a fresh demo database opens with a coherent community and
the core user, car, race, registration, profile-photo, and Desert Live flows can
be demonstrated immediately.

## 3. First Live Release

Goal: publish a safe version that can receive real feedback and be improved
without interrupting visitors.

- Add a feedback form with Bug, Something Unclear, and Suggestion categories.
- Store feedback for administrators with NEW, IN_REVIEW, and RESOLVED states.
- Prepare production PostgreSQL, environment variables, JWT secret, restricted
  CORS, HTTPS, health checks, upload limits, and backups.
- Add automated frontend and backend deployment from reviewed `main` branches.
- Launch staging first, run the release checklist, and then publish production.
- Connect the Crazy Desert domain after the production deployment is stable.

Definition of done: visitors can open the public site, use the main flows, and
send feedback; administrators can review it; releases are repeatable and the
database is backed up.
