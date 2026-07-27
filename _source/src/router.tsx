import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const getBasePath = () => {
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/barilochesuite")) {
      return "/barilochesuite";
    }
  }
  return undefined;
};

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: getBasePath(),
  });

  return router;
};
