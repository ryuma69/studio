---
description: Implement data storage for aptitude results and parent reports in Firestore
---

# Store Aptitude Results and Analysis in Firestore

This plan outlines the steps to persist aptitude quiz results, analysis outcomes, and parent reports in Firestore to ensure data durability and enable feature retrieval.

## Data Structure

We will use the existing `users/{userId}` document and adding sub-collections or fields:

1.  **Aptitude Results**: stored in `users/{userId}/aptitudeResults` (already partially implemented, needs verification of fields).
2.  **Analysis Results**: Store the immediate recommendation (stream + motivation) in `users/{userId}/careerAnalysis`.
3.  **Parent Reports**: Store the detailed report in a sub-collection `users/{userId}/reports`, allowing for multiple reports over time.

## Steps

1.  **Verify Aptitude Storage**:
    - Check `src/app/aptitude-test/page.tsx` to ensure it saves `answers` and `timeTaken` correctly to `users/{userId}`.
    - Confirm the field structure is consistent.

2.  **Store Analysis Result**:
    - Modify `src/components/dashboard-client.tsx`.
    - In the `useEffect` where `aptitudeAnalysisAction` is called, add a Firestore write operation.
    - After receiving the `analysisResult` from the AI, save it to `users/{userId}/careerAnalysis` with a timestamp.

3.  **Store Parent Report**:
    - Modify `src/components/dashboard-client.tsx`.
    - In `handleGenerateReport`, after `generateDetailedReport` returns successfully:
        - Create a new document in `users/{userId}/reports`.
        - Store the full `DetailedReportOutput` along with the `selectedStream` and `timestamp`.

4.  **Retrieve Logic (Optional Enhancement)**:
    - Update `DashboardClient` to check Firestore for existing analysis/reports on load, reducing unnecessary re-runs of the AI if data persists (optimize cost/latency).

## Implementation Details

-   **File**: `src/components/dashboard-client.tsx`
    - Import `doc`, `setDoc`, `collection`, `addDoc` from `firebase/firestore`.
    - Import `useFirestore` hook.
    - Add writing logic in `useEffect` (for initial analysis) and `handleGenerateReport` (for detailed report).

## Verification

-   Run the app.
-   Complete the quiz.
-   Check Firestore (via console or temporary log) to see `aptitudeResults` and `careerAnalysis` populated.
-   Generate a report.
-   Check Firestore for a new document in the `reports` sub-collection.
