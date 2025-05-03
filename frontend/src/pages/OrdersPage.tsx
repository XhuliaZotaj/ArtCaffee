import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
	Container,
	Typography,
	Box,
	Paper,
	Divider,
	List,
	ListItem,
	ListItemText,
	Button,
	Chip,
	CircularProgress,
	Grid,
	Card,
	CardContent,
	CardActions,
	Badge,
	Stack,
	Alert,
} from "@mui/material";
import {
	Receipt as ReceiptIcon,
	VisibilityOutlined as ViewIcon,
	LocalCafe as CoffeeIcon,
	Cake as DessertIcon,
	Restaurant as FoodIcon,
	RestaurantMenu as MenuIcon,
	CalendarToday as CalendarIcon,
	AttachMoney as MoneyIcon,
	Loyalty as LoyaltyIcon,
	Info as InfoIcon,
} from "@mui/icons-material";
import { getDataWithLocalStorageFallback } from "../utils/csvUtils";

interface Order {
	id: number;
	order_date: string;
	status: string;
	total_amount: number;
	items_count: number;
	points_earned?: number;
	items?: Array<{
		product_id: number;
		product_name?: string;
		quantity: number;
		price?: number;
		customizations?: { [key: string]: string };
	}>;
}

// Default mock orders if none in localStorage
const DEFAULT_MOCK_ORDERS: Order[] = [
	{
		id: 1001,
		order_date: "2023-06-15T10:30:00Z",
		status: "completed",
		total_amount: 12.95,
		items_count: 2,
		points_earned: 13,
	},
	{
		id: 1002,
		order_date: "2023-06-10T14:20:00Z",
		status: "completed",
		total_amount: 8.5,
		items_count: 1,
		points_earned: 9,
	},
	{
		id: 1003,
		order_date: "2023-06-05T09:15:00Z",
		status: "completed",
		total_amount: 15.75,
		items_count: 3,
		points_earned: 16,
	},
];

const OrdersPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [orders, setOrders] = useState<Order[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [usingMockData, setUsingMockData] = useState<boolean>(true);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				setLoading(true);

				// Get orders from localStorage (loaded from CSV if available)
				const orders = getDataWithLocalStorageFallback(
					"userOrders",
					DEFAULT_MOCK_ORDERS
				);
				setOrders(orders);

				setUsingMockData(true);
				setError(null);

				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 400));
			} catch (error) {
				console.error("Error fetching orders:", error);
				setError("Failed to load orders. Please try again later.");
				toast.error("Failed to load orders.");
			} finally {
				setLoading(false);
			}
		};

		fetchOrders();
	}, []);

	const handleViewOrder = (orderId: number) => {
		navigate(`/orders/${orderId}`);
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "completed":
				return "success";
			case "processing":
				return "info";
			case "cancelled":
				return "error";
			default:
				return "default";
		}
	};

	// Helper function to get a random icon for the order card
	const getOrderIcon = (index: number) => {
		const icons = [
			<CoffeeIcon fontSize="large" sx={{ color: "#5c3d2e" }} />,
			<DessertIcon fontSize="large" sx={{ color: "#b85c38" }} />,
			<FoodIcon fontSize="large" sx={{ color: "#e09132" }} />,
		];
		return icons[index % icons.length];
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Container maxWidth="md" sx={{ my: 5 }}>
				<Paper sx={{ p: 3, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						{error}
					</Typography>
					<Button
						variant="contained"
						onClick={() => window.location.reload()}
						sx={{
							mt: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Try Again
					</Button>
				</Paper>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ my: 5 }}>
			<Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
				<ReceiptIcon sx={{ fontSize: 35, color: "#5c3d2e", mr: 2 }} />
				<Typography variant="h4" component="h1" fontWeight="bold">
					My Orders
				</Typography>
			</Box>

			<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
				View your order history and track earned loyalty points
			</Typography>

			{usingMockData && (
				<Paper sx={{ p: 2, mb: 3, backgroundColor: "#fff4e6" }}>
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}>
						<InfoIcon color="warning" sx={{ mr: 1 }} />
						<Typography variant="body2" color="text.secondary">
							Demo Mode: Using sample order data and orders from your checkout
							process.
						</Typography>
					</Box>
				</Paper>
			)}

			{orders.length === 0 ? (
				<Paper
					sx={{
						p: 4,
						textAlign: "center",
						borderRadius: 2,
						boxShadow: 3,
					}}>
					<ReceiptIcon sx={{ fontSize: 60, color: "#aaa", mb: 2 }} />
					<Typography variant="h6" gutterBottom>
						No Orders Yet
					</Typography>
					<Typography variant="body1" color="text.secondary" paragraph>
						You haven't placed any orders with us yet.
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/menu")}
						sx={{
							mt: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Browse Menu
					</Button>
				</Paper>
			) : (
				<Grid container spacing={3}>
					{orders.map((order, index) => (
						<Grid item xs={12} sm={6} md={4} key={order.id}>
							<Card
								elevation={3}
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									borderRadius: 2,
									transition: "transform 0.2s",
									"&:hover": {
										transform: "translateY(-5px)",
										boxShadow: 6,
									},
									position: "relative",
									overflow: "visible",
								}}>
								<Box
									sx={{
										position: "absolute",
										top: -15,
										right: 20,
										zIndex: 1,
									}}>
									<Chip
										label={order.status}
										color={getStatusColor(order.status) as any}
										size="small"
										sx={{
											textTransform: "capitalize",
											fontWeight: "bold",
											border: "2px solid white",
										}}
									/>
								</Box>

								<CardContent sx={{ flexGrow: 1, pt: 3 }}>
									<Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
										{getOrderIcon(index)}
										<Typography variant="h6" sx={{ ml: 1, fontWeight: "bold" }}>
											Order #{order.id}
										</Typography>
									</Box>

									<Stack spacing={1.5} sx={{ mt: 3 }}>
										<Box sx={{ display: "flex", alignItems: "center" }}>
											<CalendarIcon
												sx={{ color: "#777", fontSize: 18, mr: 1 }}
											/>
											<Typography variant="body2" color="text.secondary">
												{new Date(order.order_date).toLocaleDateString()} at{" "}
												{new Date(order.order_date).toLocaleTimeString([], {
													hour: "2-digit",
													minute: "2-digit",
												})}
											</Typography>
										</Box>

										<Box sx={{ display: "flex", alignItems: "center" }}>
											<MenuIcon sx={{ color: "#777", fontSize: 18, mr: 1 }} />
											<Typography variant="body2">
												{order.items_count}{" "}
												{order.items_count === 1 ? "item" : "items"}
											</Typography>
										</Box>

										<Box sx={{ display: "flex", alignItems: "center" }}>
											<MoneyIcon sx={{ color: "#777", fontSize: 18, mr: 1 }} />
											<Typography variant="body1" fontWeight="bold">
												${order.total_amount.toFixed(2)}
											</Typography>
										</Box>

										{order.points_earned && (
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													bgcolor: "#f8f4e5",
													p: 1,
													borderRadius: 1,
													mt: 1,
												}}>
												<LoyaltyIcon
													sx={{ color: "#b85c38", fontSize: 18, mr: 1 }}
												/>
												<Typography variant="body2" sx={{ color: "#5c3d2e" }}>
													<b>+{order.points_earned}</b> loyalty points earned
												</Typography>
											</Box>
										)}
									</Stack>
								</CardContent>

								<Divider />

								<CardActions sx={{ p: 2, justifyContent: "center" }}>
									<Button
										variant="outlined"
										size="medium"
										startIcon={<ViewIcon />}
										onClick={() => handleViewOrder(order.id)}
										fullWidth
										sx={{
											color: "#5c3d2e",
											borderColor: "#5c3d2e",
											"&:hover": {
												borderColor: "#b85c38",
												backgroundColor: "rgba(92, 61, 46, 0.04)",
											},
										}}>
										View Details
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}

			{orders.length > 0 && (
				<Box
					sx={{
						mt: 4,
						p: 3,
						bgcolor: "#f8f4e5",
						borderRadius: 2,
						boxShadow: 1,
					}}>
					<Typography
						variant="subtitle1"
						sx={{ display: "flex", alignItems: "center", fontWeight: "bold" }}>
						<LoyaltyIcon sx={{ color: "#b85c38", mr: 1 }} />
						Loyalty Points Information
					</Typography>
					<Typography variant="body2" sx={{ mt: 1 }}>
						For every $1 spent, you earn 1 loyalty point. Points can be redeemed
						during checkout for discounts!
					</Typography>
				</Box>
			)}
		</Container>
	);
};

export default OrdersPage;
