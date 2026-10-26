import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, within } from "@testing-library/react";
vi.mock("../auth.js", async () => {
  const { createStandInSession, useSession } = await import("./standInSession.js");
  return { session: createStandInSession(), useSession };
});

import { App } from "../App.jsx";
import { session } from "../auth.js";
import { config } from "../config.js";
import { PLACES, navigate } from "../router.js";
import { tabDockStore } from "../tabDock.js";

const ada = { claims: { sub: "u1", name: "Ada Lovelace", preferred_username: "ada" } };

beforeEach(() => {
  window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  Object.assign(config, { api: "", issuer: "https://auth.example.com", clientId: "starter" });
  navigate("/items", { replace: true });
});

afterEach(async () => {
  cleanup();
  await act(async () => { await session.signOut(); });
  vi.restoreAllMocks();
});

describe("the shell", () => {
  it("draws the frame and the page for a signed-in person", () => {
    act(() => session.adopt(ada, async () => null));
    render(<App />);
    expect(screen.getAllByRole("navigation").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Items" })).toBeTruthy();
    expect(screen.getByText("No items")).toBeTruthy();
    expect(screen.getByLabelText("Ada Lovelace")).toBeTruthy();
  });

  it("sends a signed-out person to sign in and draws nothing", () => {
    const signIn = vi.spyOn(session, "signIn");
    const { container } = render(<App />);
    expect(signIn).toHaveBeenCalledWith({ returnTo: "/items" });
    expect(container.textContent).toBe("");
  });

  it("draws a public page for a signed-out person", () => {
    const signIn = vi.spyOn(session, "signIn");
    navigate("/nowhere", { replace: true });
    render(<App />);
    expect(signIn).not.toHaveBeenCalled();
    expect(screen.getByText("Page not found")).toBeTruthy();
    expect(screen.getAllByText("Sign in").length).toBeGreaterThan(0);
  });

  it("draws one screen with one action when the session has ended", () => {
    const signIn = vi.spyOn(session, "signIn");
    act(() => session.end("revoked"));
    render(<App />);
    act(() => screen.getByRole("button", { name: "Sign in again" }).click());
    expect(signIn).toHaveBeenCalled();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("draws the phone's tab dock: Home in the middle, every place in the sheet", () => {
    act(() => session.adopt(ada, async () => null));
    render(<App />);
    const bar = screen.getByRole("navigation", { name: "Main" });
    const tabs = within(bar).getAllByRole("button").map((b) => b.getAttribute("aria-label") || b.textContent);
    expect(tabs.filter((t) => t === "Home").length).toBe(1);
    for (const place of PLACES) expect(document.body.textContent).toContain(place.label);
    expect(tabDockStore.getState()).toBeNull();
  });
});
