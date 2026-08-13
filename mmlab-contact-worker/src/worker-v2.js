import baseWorker from "./worker.js";
import { handleAutomationRequest } from "./automation-endpoint.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/automation-analyze") {
      return handleAutomationRequest(request, env);
    }
    return baseWorker.fetch(request, env);
  },
};
