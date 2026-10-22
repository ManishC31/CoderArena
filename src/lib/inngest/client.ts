import { Inngest } from "inngest";

// Background jobs (repository indexing). Locally, run the Inngest dev server next to the app:
// `npx inngest-cli@latest dev`, with INNGEST_DEV=1.
export const inngest = new Inngest({ id: "coderarena" });
