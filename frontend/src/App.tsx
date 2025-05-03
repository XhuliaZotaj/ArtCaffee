import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { CircularProgress, Box } from "@mui/material";

// Layout components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import DataExport from "./components/DataExport";

// Page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import MenuPage from "./pages/MenuPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import GiftCardPage from "./pages/GiftCardPage";
import TableOrderPage from "./pages/TableOrderPage";
import NotFoundPage from "./pages/NotFoundPage";

// Protected route wrapper
interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" />;
	}

	return <>{children}</>;
};

const App = () => {
	const { isAuthenticated, isLoading } = useAuth();

	if (isLoading) {
		return (
			<Box
				display="flex"
				justifyContent="center"
				alignItems="center"
				minHeight="100vh">
				<CircularProgress />
			</Box>
		);
	}

	return (
		<div className="app">
			<Navbar />

			<main className="app-container">
				<Routes>
					{/* Public routes */}
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/menu" element={<MenuPage />} />
					<Route path="/menu/:productId" element={<ProductDetailPage />} />
					<Route path="/table/:tableNumber" element={<TableOrderPage />} />

					{/* Protected routes */}
					<Route
						path="/profile"
						element={
							<ProtectedRoute>
								<ProfilePage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/cart"
						element={
							<ProtectedRoute>
								<CartPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/orders"
						element={
							<ProtectedRoute>
								<OrdersPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/orders/:orderId"
						element={
							<ProtectedRoute>
								<OrderDetailPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/loyalty"
						element={
							<ProtectedRoute>
								<LoyaltyPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/gift-cards"
						element={
							<ProtectedRoute>
								<GiftCardPage />
							</ProtectedRoute>
						}
					/>

					{/* 404 route */}
					<Route path="*" element={<NotFoundPage />} />
				</Routes>

				{/* CSV Data Import/Export button (only for authenticated users and not on loyalty page) */}
				{isAuthenticated && window.location.pathname !== "/loyalty" && (
					<DataExport />
				)}
			</main>

			<Footer />
		</div>
	);
};

export default App;
