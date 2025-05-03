import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	ReactNode,
	useRef,
} from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Set up default base URL and headers for axios
axios.defaults.baseURL = "http://localhost:5000";
axios.defaults.headers.common["Content-Type"] = "application/json";

interface User {
	id: number;
	username: string;
	email: string;
	first_name: string;
	last_name: string;
	loyalty_points: number;
}

interface StoredCredentials {
	email: string;
	password: string;
	expiresAt: number;
}

interface AuthContextType {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		username: string,
		email: string,
		password: string,
		first_name?: string,
		last_name?: string
	) => Promise<void>;
	logout: () => void;
	getProfile: () => Promise<void>;
	savedCredentials: StoredCredentials | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

// One week in milliseconds for credential expiration
const CREDENTIALS_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [token, setToken] = useState<string | null>(
		localStorage.getItem("token")
	);
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [savedCredentials, setSavedCredentials] =
		useState<StoredCredentials | null>(null);
	const [prevLoyaltyPoints, setPrevLoyaltyPoints] = useState<number | null>(
		null
	);

	// Add counters to prevent infinite loops
	const autoLoginAttempts = useRef(0);
	const profileLoadAttempts = useRef(0);

	// Load saved credentials from localStorage
	useEffect(() => {
		const loadSavedCredentials = () => {
			const credentialsJson = localStorage.getItem("devCredentials");

			if (credentialsJson) {
				try {
					const credentials: StoredCredentials = JSON.parse(credentialsJson);

					// Check if credentials have expired
					if (credentials.expiresAt > Date.now()) {
						setSavedCredentials(credentials);
					} else {
						// Remove expired credentials
						localStorage.removeItem("devCredentials");
					}
				} catch (error) {
					console.error("Error parsing saved credentials:", error);
					localStorage.removeItem("devCredentials");
				}
			}
		};

		loadSavedCredentials();
	}, []);

	// Configure axios to use token for all requests
	useEffect(() => {
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
		} else {
			delete axios.defaults.headers.common["Authorization"];
		}
	}, [token]);

	// Try to load user profile when token changes with delay
	useEffect(() => {
		const loadUser = async () => {
			if (token) {
				// Reset profile load attempts when token changes
				profileLoadAttempts.current = 0;

				// Add a slight delay before loading the profile to ensure token is set
				setTimeout(async () => {
					try {
						await getProfile();
					} catch (error) {
						console.error("Error loading user profile:", error);

						// Only logout if we haven't tried too many times
						if (profileLoadAttempts.current < 3) {
							profileLoadAttempts.current++;
							// Add a slight delay before trying again
							setTimeout(() => getProfile(), 500);
						} else {
							// After several attempts, just give up and logout
							logout();
						}
					} finally {
						setIsLoading(false);
					}
				}, 500);
			} else {
				setIsLoading(false);
			}
		};

		loadUser();
	}, [token]); // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-login with saved credentials when the app starts
	useEffect(() => {
		const autoLogin = async () => {
			if (!token && savedCredentials && autoLoginAttempts.current < 2) {
				autoLoginAttempts.current++;
				try {
					await login(savedCredentials.email, savedCredentials.password);
				} catch (error) {
					console.error("Auto-login failed:", error);
					// If auto-login fails, clear saved credentials
					localStorage.removeItem("devCredentials");
					setSavedCredentials(null);
				}
			}
		};

		if (savedCredentials && !isAuthenticated && !isLoading) {
			autoLogin();
		}
	}, [savedCredentials, isAuthenticated, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

	const login = async (email: string, password: string) => {
		try {
			setIsLoading(true);
			const response = await axios.post("/api/auth/login", { email, password });
			const { access_token, user } = response.data;

			localStorage.setItem("token", access_token);
			setToken(access_token);
			setUser(user);
			setIsAuthenticated(true);

			// Save user data to localStorage for loyalty points calculation
			localStorage.setItem("user", JSON.stringify(user));

			// Reset counters on successful login
			autoLoginAttempts.current = 0;
			profileLoadAttempts.current = 0;

			// Save credentials for development purposes
			const credentials: StoredCredentials = {
				email,
				password,
				expiresAt: Date.now() + CREDENTIALS_EXPIRY,
			};
			localStorage.setItem("devCredentials", JSON.stringify(credentials));
			setSavedCredentials(credentials);
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (
		username: string,
		email: string,
		password: string,
		first_name?: string,
		last_name?: string
	) => {
		try {
			setIsLoading(true);
			const response = await axios.post("/api/auth/register", {
				username,
				email,
				password,
				first_name,
				last_name,
			});

			const { access_token, user } = response.data;

			localStorage.setItem("token", access_token);
			localStorage.setItem("user", JSON.stringify(user));
			setToken(access_token);
			setUser(user);
			setIsAuthenticated(true);

			// Reset counters on successful registration
			autoLoginAttempts.current = 0;
			profileLoadAttempts.current = 0;

			// Save credentials for development purposes
			const credentials: StoredCredentials = {
				email,
				password,
				expiresAt: Date.now() + CREDENTIALS_EXPIRY,
			};
			localStorage.setItem("devCredentials", JSON.stringify(credentials));
			setSavedCredentials(credentials);
		} catch (error) {
			console.error("Registration error:", error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		// Don't remove credentials on logout for development environment
		// In a production environment, you would want to remove them
		setToken(null);
		setUser(null);
		setIsAuthenticated(false);
	};

	const getProfile = async () => {
		try {
			// Get the previous point value before updating
			const previousPoints = user?.loyalty_points || 0;

			// Get user data from localStorage for offline/demo mode
			const userJson = localStorage.getItem("user");
			if (userJson) {
				const userData = JSON.parse(userJson);
				setUser(userData);

				// Check if points changed and show a notification
				if (
					prevLoyaltyPoints !== null &&
					userData.loyalty_points !== prevLoyaltyPoints
				) {
					const pointsDiff = userData.loyalty_points - prevLoyaltyPoints;
					if (pointsDiff > 0) {
						toast.success(`You earned ${pointsDiff} loyalty points!`, {
							icon: "🏆",
							position: "top-right",
							autoClose: 3000,
						});
					} else if (pointsDiff < 0) {
						toast.info(`You used ${Math.abs(pointsDiff)} loyalty points.`, {
							icon: "💰",
							position: "top-right",
							autoClose: 3000,
						});
					}
				}

				// Update previous points for next comparison
				setPrevLoyaltyPoints(userData.loyalty_points);
				return userData;
			}

			// Explicitly set the Authorization header for this request
			const response = await axios.get("/api/auth/profile", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			setUser(response.data.user);
			// Update user in localStorage
			localStorage.setItem("user", JSON.stringify(response.data.user));

			// Check if points changed and show a notification
			if (
				prevLoyaltyPoints !== null &&
				response.data.user.loyalty_points !== prevLoyaltyPoints
			) {
				const pointsDiff =
					response.data.user.loyalty_points - prevLoyaltyPoints;
				if (pointsDiff > 0) {
					toast.success(`You earned ${pointsDiff} loyalty points!`, {
						icon: "🏆",
						position: "top-right",
						autoClose: 3000,
					});
				} else if (pointsDiff < 0) {
					toast.info(`You used ${Math.abs(pointsDiff)} loyalty points.`, {
						icon: "💰",
						position: "top-right",
						autoClose: 3000,
					});
				}
			}

			// Update previous points for next comparison
			setPrevLoyaltyPoints(response.data.user.loyalty_points);
			return response.data.user;
		} catch (error) {
			console.error("Get profile error:", error);
			profileLoadAttempts.current++;
			throw error;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				isAuthenticated,
				isLoading,
				login,
				register,
				logout,
				getProfile,
				savedCredentials,
			}}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
