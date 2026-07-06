# Make Project RFIs Page Dynamic

This plan outlines the steps to make the `project-rfis` page fully dynamic, including building out the necessary backend models and APIs, and integrating them directly into the frontend.

## Proposed Changes

### Backend Models & Serializers

#### [MODIFY] `backend/app/employee/models.py`
- Add `trade` field (Char) to the existing `RFI` model.
- Create `RFIMessage` model:
  - `rfi`: ForeignKey to `RFI`
  - `author`: ForeignKey to `UserAccount`
  - `text`: TextField
  - `document_url`: URLField (to support attachments)
  - `created_at`: DateTimeField

#### [MODIFY] `backend/app/employee/serializers.py` (or creating new serializers in `project_admin/serializers.py`)
- Create `RFIMessageSerializer`.
- Create `DashboardRFISerializer` that formats the RFI exactly as the frontend expects (`rfiRef`, `date`, `project` name, `createdBy` name, `trade`, `messages`, etc.).

### Backend Views & URLs

#### [MODIFY] `backend/app/project_admin/views.py` (or `employee/views.py`)
- Create `DashboardRFIListView` (GET):
  - Fetches RFIs for the authenticated user.
  - If user is `admin`, `super_admin`, or `project_admin`, return all RFIs in the user's company.
  - Otherwise, return RFIs where the project is in `user.assigned_projects`.
- Create `RFICloseView` (POST):
  - Allows an authorized user to close an RFI.
- Create `RFIMessageCreateView` (POST):
  - Accepts text and optional `attachment` file (multipart form data).
  - Uploads the attachment to Cloudinary and creates an `RFIMessage`.

#### [MODIFY] `backend/app/project_admin/urls.py`
- Register the new RFI endpoints.

### Frontend Integration

#### [NEW] `frontend/lib/api/rfis.ts`
- Implement `getRFIs()`
- Implement `closeRFI(rfiId: string)`
- Implement `sendRFIMessage(rfiId: string, text: string, file?: File)`

#### [MODIFY] `frontend/app/(dashboard)/project-rfis/page.tsx`
- Replace `SEED_RFIS` with state populated by `getRFIs()` via a `useEffect` hook.
- Update `handleCloseRFI` to invoke the `closeRFI` API and update the UI upon success.
- Update `handleSendMessage` to invoke `sendRFIMessage` API (using `FormData` for attachments) and append the message locally upon success.
- Map the backend response fields to the frontend table columns.

## Verification Plan

### Automated Tests
- Run `flutter analyze` to ensure no related flutter code broke (unlikely since we are only touching frontend Next.js and Django).
- (Optionally run any existing pytest tests for the backend).

### Manual Verification
- Log in to the Next.js frontend as a user (e.g. `project_admin` or `manager`).
- Navigate to the Project RFIs page.
- Verify that real RFIs are fetched and displayed in the table.
- Click on an RFI to view its thread.
- Send a test message with an attachment and verify it saves and appears.
- Close the RFI and verify its status updates appropriately on the UI and backend.
