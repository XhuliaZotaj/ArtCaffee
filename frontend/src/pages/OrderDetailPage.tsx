import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
	Container,
	Typography,
	Box,
	Paper,
	Grid,
	Divider,
	Button,
	CircularProgress,
	Chip,
	Card,
	CardContent,
	List,
	ListItem,
	ListItemText,
} from "@mui/material";
import {
	ArrowBack as BackIcon,
	AccessTime as TimeIcon,
	LocationOn as LocationIcon,
	Payment as PaymentIcon,
	Receipt as ReceiptIcon,
} from "@mui/icons-material";

interface OrderItem {
	id: number;
	product_name: string;
	quantity: number;
	price: number;
	customizations: { [key: string]: string };
	notes?: string;
}

interface Order {
	id: number;
	order_date: string;
	status: string;
	total_amount: number;
	items: OrderItem[];
	table_number?: number;
	payment_method: string;
}

const OrderDetailPage: React.FC = () => {
	const { orderId } = useParams<{ orderId: string }>();
	const navigate = useNavigate();
	const [order, setOrder] = useState<Order | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchOrderDetails = async () => {
			try {
				setLoading(true);
				// In a real app, we would fetch from API
				// const response = await axios.get(`/api/orders/${orderId}`);
				// setOrder(response.data.order);

				// For now, we'll use mock data
				// Create a mock order based on the orderId
				const mockOrder: Order = {
					id: parseInt(orderId || "0"),
					order_date: "2023-06-15T10:30:00Z",
					status: "completed",
					total_amount: 12.95,
					payment_method: "Credit Card",
					table_number: 5,
					items: [
						{
							id: 1,
							product_name: "Cappuccino",
							quantity: 1,
							price: 4.5,
							customizations: {
								"1": "Medium",
								"2": "Oat Milk",
							},
						},
						{
							id: 2,
							product_name: "Chocolate Croissant",
							quantity: 1,
							price: 3.95,
							customizations: {},
						},
						{
							id: 3,
							product_name: "Americano",
							quantity: 1,
							price: 3.5,
							customizations: {
								"1": "Large",
							},
							notes: "Extra hot",
						},
					],
				};

				// Simulate API delay
				await new Promise((resolve) => setTimeout(resolve, 800));

				if (parseInt(orderId || "0") > 0) {
					setOrder(mockOrder);
					setError(null);
				} else {
					setError("Order not found");
				}
			} catch (error) {
				console.error("Error fetching order details:", error);
				setError("Failed to load order details. Please try again later.");
				toast.error("Failed to load order details.");
			} finally {
				setLoading(false);
			}
		};

		if (orderId) {
			fetchOrderDetails();
		}
	}, [orderId]);

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

	const getTotalItems = () => {
		if (!order) return 0;
		return order.items.reduce((total, item) => total + item.quantity, 0);
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !order) {
		return (
			<Container maxWidth="md" sx={{ my: 5 }}>
				<Paper sx={{ p: 3, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						{error || "Order not found"}
					</Typography>
					<Button
						variant="contained"
						startIcon={<BackIcon />}
						onClick={() => navigate("/orders")}
						sx={{
							mt: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Back to Orders
					</Button>
				</Paper>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ my: 5 }}>
			<Button
				startIcon={<BackIcon />}
				onClick={() => navigate("/orders")}
				sx={{ mb: 3, color: "#5c3d2e" }}>
				Back to Orders
			</Button>

			<Grid container spacing={4}>
				{/* Order Summary */}
				<Grid item xs={12}>
					<Paper sx={{ p: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								mb: 2,
							}}>
							<Typography variant="h5" gutterBottom>
								Order #{order.id}
							</Typography>
							<Chip
								label={order.status}
								color={getStatusColor(order.status) as any}
								sx={{ textTransform: "capitalize" }}
							/>
						</Box>

						<Grid container spacing={3}>
							<Grid item xs={12} sm={6}>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<TimeIcon sx={{ mr: 1, color: "text.secondary" }} />
									<Typography variant="body1">
										{new Date(order.order_date).toLocaleString()}
									</Typography>
								</Box>
								{order.table_number && (
									<Box sx={{ display: "flex", alignItems: "center" }}>
										<LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
										<Typography variant="body1">
											Table #{order.table_number}
										</Typography>
									</Box>
								)}
							</Grid>
							<Grid item xs={12} sm={6}>
								<Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
									<PaymentIcon sx={{ mr: 1, color: "text.secondary" }} />
									<Typography variant="body1">
										{order.payment_method}
									</Typography>
								</Box>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									<ReceiptIcon sx={{ mr: 1, color: "text.secondary" }} />
									<Typography variant="body1">
										{getTotalItems()} item{getTotalItems() !== 1 && "s"}
									</Typography>
								</Box>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				{/* Order Items */}
				<Grid item xs={12}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Order Items
						</Typography>
						<Divider sx={{ mb: 2 }} />

						<List disablePadding>
							{order.items.map((item, index) => (
								<React.Fragment key={item.id}>
									{index > 0 && <Divider component="li" />}
									<ListItem sx={{ py: 2, px: 0 }}>
										<Grid container spacing={2}>
											<Grid item xs={7} sm={8}>
												<ListItemText
													primary={
														<Typography variant="subtitle1">
															{item.product_name}
														</Typography>
													}
													secondary={
														<>
															{Object.values(item.customizations).length >
																0 && (
																<Typography
																	variant="body2"
																	color="text.secondary"
																	sx={{ mt: 0.5 }}>
																	{Object.values(item.customizations).join(
																		", "
																	)}
																</Typography>
															)}
															{item.notes && (
																<Typography
																	variant="body2"
																	color="text.secondary"
																	sx={{ mt: 0.5, fontStyle: "italic" }}>
																	Note: {item.notes}
																</Typography>
															)}
														</>
													}
												/>
											</Grid>
											<Grid item xs={2} sm={2} sx={{ textAlign: "center" }}>
												<Typography variant="body2">
													Qty: {item.quantity}
												</Typography>
											</Grid>
											<Grid item xs={3} sm={2} sx={{ textAlign: "right" }}>
												<Typography variant="body1" sx={{ fontWeight: "bold" }}>
													${(item.price * item.quantity).toFixed(2)}
												</Typography>
											</Grid>
										</Grid>
									</ListItem>
								</React.Fragment>
							))}
						</List>

						<Divider sx={{ my: 2 }} />

						<Grid container spacing={1}>
							<Grid item xs={8}>
								<Typography variant="subtitle1">Subtotal</Typography>
							</Grid>
							<Grid item xs={4} sx={{ textAlign: "right" }}>
								<Typography variant="subtitle1">
									${order.total_amount.toFixed(2)}
								</Typography>
							</Grid>
							<Grid item xs={8}>
								<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
									Total
								</Typography>
							</Grid>
							<Grid item xs={4} sx={{ textAlign: "right" }}>
								<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
									${order.total_amount.toFixed(2)}
								</Typography>
							</Grid>
						</Grid>
					</Paper>
				</Grid>

				{/* Additional Info */}
				<Grid item xs={12}>
					<Card variant="outlined">
						<CardContent>
							<Typography variant="body2" color="text.secondary" align="center">
								{order.status === "completed"
									? "Thank you for your order! We hope you enjoyed it."
									: "Your order is being processed. Thank you for your patience."}
							</Typography>
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</Container>
	);
};

export default OrderDetailPage;
