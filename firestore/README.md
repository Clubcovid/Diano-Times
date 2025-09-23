# Firestore Indexes

This directory contains the index configuration for the Diano Times Firestore database. These indexes are required for the complex queries used throughout the application to fetch and sort posts efficiently.

Without these indexes, certain queries will fail with a `FAILED_PRECONDITION` error, indicating that a composite index is needed.

## How to Deploy Indexes

You can deploy these indexes automatically using the Firebase CLI or create them manually in the Firebase Console.

### Option 1: Deploy with Firebase CLI (Recommended)

This is the fastest and most reliable method.

1.  **Install the Firebase CLI** if you haven't already:
    ```bash
    npm install -g firebase-tools
    ```

2.  **Login to Firebase**:
    ```bash
    firebase login
    ```

3.  **Initialize Firebase** in your project directory if you haven't already. Make sure to select your existing Firebase project.
    ```bash
    firebase init firestore
    ```
    When prompted, accept the default `firestore.rules` and `firestore.indexes.json` file names. You can then replace the generated `firestore.indexes.json` with the one from this project.

4.  **Deploy the indexes**:
    ```bash
    firebase deploy --only firestore:indexes
    ```

The CLI will upload the index configuration, and Firebase will begin building the indexes in the background. This process can take a few minutes.

### Option 2: Create Indexes Manually

You can also create each index manually in the Firebase Console. Follow these steps for each index defined in `firestore.indexes.json`:

1.  Go to the **Firebase Console** for your project.
2.  Navigate to **Firestore Database** > **Indexes**.
3.  Click **Create Index**.
4.  For the **Collection ID**, enter `posts`.
5.  Add the fields to index exactly as specified in the `fields` array for each index in the `firestore.indexes.json` file, paying close attention to the order and whether the field is **Ascending** or **Descending**.

#### Index 1: Published Posts by Date
-   **Collection**: `posts`
-   **Fields**:
    1.  `status` (Ascending)
    2.  `createdAt` (Descending)

#### Index 2: Published Tagged Posts by Date
-   **Collection**: `posts`
-   **Fields**:
    1.  `tags` (Array-contains)
    2.  `status` (Ascending)
    3.  `createdAt` (Descending)

It is highly recommended to use the Firebase CLI to avoid manual errors.
