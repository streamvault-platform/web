// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────

const { mockBack, mockReplace, mockSetTokens, mockCheckInvite, mockRegister } = vi.hoisted(() => ({
  mockBack: vi.fn(),
  mockReplace: vi.fn(),
  mockSetTokens: vi.fn().mockResolvedValue(undefined),
  mockCheckInvite: vi.fn(),
  mockRegister: vi.fn(),
}));

vi.mock("expo-router", () => ({
  router: { back: mockBack, replace: mockReplace, push: vi.fn() },
  useLocalSearchParams: vi.fn(() => ({})),
}));

vi.mock("@/lib/api/auth", async (importActual) => {
  const actual = await importActual<typeof import("@/lib/api/auth")>();
  return { ...actual, checkInvite: mockCheckInvite, register: mockRegister };
});

vi.mock("@/stores/auth", () => ({
  useAuthStore: vi.fn(() => ({ setTokens: mockSetTokens })),
}));

vi.mock("@/stores/settings", () => ({
  useSettingsStore: vi.fn(() => ({
    serverUrl: "http://localhost:8080",
    setServerUrl: vi.fn(),
  })),
}));

vi.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ─── Dynamic imports ──────────────────────────────────────────────────────────

import { useLocalSearchParams } from "expo-router";
const { AuthApiError } = await import("@/lib/api/auth");
const { default: RegisterScreen } = await import("./register");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("RegisterScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetTokens.mockResolvedValue(undefined);
    vi.mocked(useLocalSearchParams).mockReturnValue({});
  });

  it("renders the Create account heading", () => {
    render(<RegisterScreen />);
    expect(screen.getAllByText("Create account").length).toBeGreaterThanOrEqual(1);
  });

  it("shows generic subtitle when no invite param is present", () => {
    render(<RegisterScreen />);
    expect(screen.getByText("Choose a username and password")).toBeTruthy();
  });

  it("does not call checkInvite when no invite param is set", () => {
    render(<RegisterScreen />);
    expect(mockCheckInvite).not.toHaveBeenCalled();
  });

  it("calls checkInvite on mount when invite param is present", async () => {
    mockCheckInvite.mockResolvedValue(true);
    vi.mocked(useLocalSearchParams).mockReturnValue({ invite: "abc123" });
    render(<RegisterScreen />);
    await waitFor(() => expect(mockCheckInvite).toHaveBeenCalledWith("http://localhost:8080", "abc123"));
  });

  it("shows invite valid indicator after successful check", async () => {
    mockCheckInvite.mockResolvedValue(true);
    vi.mocked(useLocalSearchParams).mockReturnValue({ invite: "abc123" });
    render(<RegisterScreen />);
    await waitFor(() => expect(screen.getByText("✓ Invite link valid")).toBeTruthy());
  });

  it("shows invalid invite message when check returns false", async () => {
    mockCheckInvite.mockResolvedValue(false);
    vi.mocked(useLocalSearchParams).mockReturnValue({ invite: "abc123" });
    render(<RegisterScreen />);
    await waitFor(() =>
      expect(screen.getByText("This invite link is invalid or has already been used")).toBeTruthy()
    );
  });

  it("shows error when submitting with empty fields", async () => {
    render(<RegisterScreen />);
    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);
    await waitFor(() =>
      expect(screen.getByText("Username and password are required")).toBeTruthy()
    );
  });

  it("calls register with username, password, and invite token on submit", async () => {
    mockCheckInvite.mockResolvedValue(true);
    mockRegister.mockResolvedValue({ accessToken: "at", refreshToken: "rt" });
    vi.mocked(useLocalSearchParams).mockReturnValue({ invite: "abc123" });
    render(<RegisterScreen />);

    await waitFor(() => expect(screen.getByText("✓ Invite link valid")).toBeTruthy());

    const inputs = screen.getAllByDisplayValue("");
    const usernameInput = inputs[0] as HTMLInputElement;
    const passwordInput = inputs[1] as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "alice" } });
    fireEvent.change(passwordInput, { target: { value: "s3cr3t" } });

    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith("http://localhost:8080", "alice", "s3cr3t", "abc123")
    );
  });

  it("calls register without invite token when no invite is in the URL", async () => {
    mockRegister.mockResolvedValue({ accessToken: "at", refreshToken: "rt" });
    vi.mocked(useLocalSearchParams).mockReturnValue({});
    render(<RegisterScreen />);

    const inputs = screen.getAllByDisplayValue("");
    const usernameInput = inputs[0] as HTMLInputElement;
    const passwordInput = inputs[1] as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "alice" } });
    fireEvent.change(passwordInput, { target: { value: "s3cr3t" } });

    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(mockRegister).toHaveBeenCalledWith("http://localhost:8080", "alice", "s3cr3t", undefined)
    );
  });

  it("calls setTokens and navigates to library on success", async () => {
    mockRegister.mockResolvedValue({ accessToken: "at", refreshToken: "rt" });
    mockSetTokens.mockResolvedValue(undefined);
    render(<RegisterScreen />);

    const inputs = screen.getAllByDisplayValue("");
    const usernameInput = inputs[0] as HTMLInputElement;
    const passwordInput = inputs[1] as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "alice" } });
    fireEvent.change(passwordInput, { target: { value: "s3cr3t" } });

    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSetTokens).toHaveBeenCalledWith("at", "rt"));
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(tabs)/library"));
  });

  it("shows 'Username already taken' on 409", async () => {
    mockRegister.mockRejectedValue(new AuthApiError(409, "Conflict"));
    render(<RegisterScreen />);

    const inputs = screen.getAllByDisplayValue("");
    const usernameInput = inputs[0] as HTMLInputElement;
    const passwordInput = inputs[1] as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "alice" } });
    fireEvent.change(passwordInput, { target: { value: "s3cr3t" } });

    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() => expect(screen.getByText("Username already taken")).toBeTruthy());
  });

  it("shows invite error on 410", async () => {
    mockRegister.mockRejectedValue(new AuthApiError(410, "Gone"));
    render(<RegisterScreen />);

    const inputs = screen.getAllByDisplayValue("");
    const usernameInput = inputs[0] as HTMLInputElement;
    const passwordInput = inputs[1] as HTMLInputElement;

    fireEvent.change(usernameInput, { target: { value: "alice" } });
    fireEvent.change(passwordInput, { target: { value: "s3cr3t" } });

    const buttons = screen.getAllByText("Create account");
    const submitButton = buttons[buttons.length - 1];
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(screen.getByText("Invite link is invalid or already used")).toBeTruthy()
    );
  });
});
