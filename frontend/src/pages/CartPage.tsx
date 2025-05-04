import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
	Container,
	Typography,
	Box,
	Button,
	Paper,
	Divider,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Grid,
	TextField,
	Checkbox,
	FormControlLabel,
	CircularProgress,
	Card,
	CardContent,
	Chip,
} from "@mui/material";
import {
	DeleteOutline as DeleteIcon,
	AddCircleOutline as AddIcon,
	RemoveCircleOutline as RemoveIcon,
	ShoppingCartCheckout as CheckoutIcon,
	ArrowBack as BackIcon,
	LoyaltyOutlined as LoyaltyIcon,
} from "@mui/icons-material";
import { saveToCSVWithLocalStorageFallback } from "../utils/csvUtils";

interface Product {
	id: number;
	name: string;
	price: number;
	image_url: string;
	category: string;
}

const CartPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated, getProfile } = useAuth();
	const {
		cartItems,
		cartCount,
		removeFromCart,
		updateQuantity,
		clearCart,
		subtotal,
		total,
		usePoints,
		setUsePoints,
		pointsDiscount,
	} = useCart();

	const [loading, setLoading] = useState<boolean>(true);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [tableNumber, setTableNumber] = useState<string>("");
	const [error, setError] = useState<string | null>(null);

	// Load product details for cart items
	useEffect(() => {
		const loadProductDetails = async () => {
			try {
				setLoading(true);

				// In a real implementation, we'd fetch product details from the API
				// This would be handled by the cart context, but for this mock implementation
				// we're just simulating a delay

				await new Promise((resolve) => setTimeout(resolve, 800));
				setError(null);
			} catch (error) {
				console.error("Error loading cart:", error);
				setError("Failed to load your cart. Please try again.");
				toast.error("Failed to load your cart.");
			} finally {
				setLoading(false);
			}
		};

		if (isAuthenticated) {
			loadProductDetails();
		} else {
			navigate("/login");
		}
	}, [isAuthenticated, navigate]);

	const handleCheckout = async () => {
		if (cartItems.length === 0) {
			toast.error("Your cart is empty");
			return;
		}

		try {
			setSubmitting(true);

			// Prepare order data for API
			const orderItems = cartItems.map((item) => ({
				product_id: item.product_id,
				quantity: item.quantity,
				customizations: item.customizations || {},
				notes: item.notes || "",
			}));

			// Create order payload
			const orderPayload = {
				items: orderItems,
				use_points: usePoints,
				table_number: tableNumber ? parseInt(tableNumber) : null,
			};

			// Send order to backend API
			try {
				const API_BASE_URL = "http://localhost:5000";
				const response = await axios.post(
					`${API_BASE_URL}/api/orders`,
					orderPayload,
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem("token")}`,
							"Content-Type": "application/json",
						},
					}
				);

				const orderData = response.data;

				// Show success message with points information
				let pointsMessage = "";
				if (
					orderData.order.points_earned > 0 ||
					orderData.order.points_used > 0
				) {
					if (
						orderData.order.points_earned > 0 &&
						orderData.order.points_used > 0
					) {
						pointsMessage = ` You earned ${orderData.order.points_earned} points and used ${orderData.order.points_used} points.`;
					} else if (orderData.order.points_earned > 0) {
						pointsMessage = ` You earned ${orderData.order.points_earned} points!`;
					} else if (orderData.order.points_used > 0) {
						pointsMessage = ` You used ${orderData.order.points_used} points.`;
					}
				}

				toast.success(`Order placed successfully!${pointsMessage}`);

				// Refresh user profile to update loyalty points
				await getProfile();

				// Clear cart after successful order
				clearCart();

				// Navigate to orders page
				navigate("/orders");
			} catch (error) {
				// Fallback to local storage if API fails
				console.error(
					"API order creation failed, using local storage fallback",
					error
				);

				// Calculate points earned (1 point per dollar, rounded down)
				const pointsEarned = Math.floor(subtotal);

				// Calculate points used if usePoints is true
				const pointsUsed = usePoints ? Math.floor(pointsDiscount * 10) : 0;

				// Create new order
				const newOrderId = Date.now();
				const newOrder = {
					id: newOrderId,
					order_date: new Date().toISOString(),
					status: "completed",
					total_amount: total,
					items_count: cartItems.reduce((sum, item) => sum + item.quantity, 0),
					points_earned: pointsEarned,
					items: orderItems,
				};

				// Get existing orders from localStorage or create empty array
				const existingOrdersJson = localStorage.getItem("userOrders");
				const existingOrders = existingOrdersJson
					? JSON.parse(existingOrdersJson)
					: [];

				// Add new order at the beginning
				const updatedOrders = [newOrder, ...existingOrders];

				// Save updated orders to localStorage and CSV
				saveToCSVWithLocalStorageFallback(
					updatedOrders,
					"digital-cafe-orders.csv",
					"userOrders"
				);

				// Update point history
				// Create a point history entry
				const newPointHistoryEntry = {
					order_id: newOrderId,
					date: new Date().toISOString(),
					points_earned: pointsEarned,
					points_used: pointsUsed,
				};

				// Get existing point history
				const existingHistoryJson = localStorage.getItem("pointHistory");
				const existingHistory = existingHistoryJson
					? JSON.parse(existingHistoryJson)
					: [];

				// Add new entry at the beginning
				const updatedHistory = [newPointHistoryEntry, ...existingHistory];

				// Save updated history to localStorage and CSV
				saveToCSVWithLocalStorageFallback(
					updatedHistory,
					"digital-cafe-point-history.csv",
					"pointHistory"
				);

				// Update user's loyalty points
				if (user) {
					// Calculate new loyalty points
					const currentPoints = user.loyalty_points || 0;
					const updatedPoints = currentPoints - pointsUsed + pointsEarned;

					const updatedUser = {
						...user,
						loyalty_points: updatedPoints,
					};

					// Save updated user to localStorage and CSV
					saveToCSVWithLocalStorageFallback(
						[updatedUser],
						"digital-cafe-user-data.csv",
						"user"
					);

					// Refresh user context to update the UI
					await getProfile();

					// Show the points earned in the success message
					const pointsMessage =
						pointsUsed > 0
							? `You earned ${pointsEarned} points and used ${pointsUsed} points.`
							: `You earned ${pointsEarned} points!`;

					toast.success(
						`Order placed successfully! ${pointsMessage} (Local storage fallback used)`
					);
				} else {
					toast.success(
						"Order placed successfully! (Local storage fallback used)"
					);
				}

				// Clear cart after successful order
				clearCart();

				// Navigate to orders page or confirmation
				navigate("/orders");
			}
		} catch (error) {
			console.error("Error placing order:", error);
			toast.error("Failed to place order. Please try again.");
		} finally {
			setSubmitting(false);
		}
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
		<Container maxWidth="lg" sx={{ my: 5 }}>
			<Button
				startIcon={<BackIcon />}
				onClick={() => navigate(-1)}
				sx={{ mb: 3, color: "#5c3d2e" }}>
				Continue Shopping
			</Button>

			<Typography variant="h4" component="h1" gutterBottom>
				Your Cart
			</Typography>

			{cartItems.length === 0 ? (
				<Paper sx={{ p: 4, mt: 2, textAlign: "center" }}>
					<Typography variant="h6" gutterBottom>
						Your cart is empty
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
				<Grid container spacing={4}>
					{/* Cart Items */}
					<Grid item xs={12} md={8}>
						<Paper elevation={2} sx={{ mb: { xs: 3, md: 0 } }}>
							<List disablePadding>
								{cartItems.map((item, index) => (
									<React.Fragment key={item.id}>
										{index > 0 && <Divider />}
										<ListItem sx={{ py: 2, px: 3 }}>
											<Grid container spacing={2} alignItems="center">
												<Grid item xs={7} sm={8}>
													<ListItemText
														primary={item.product?.name || "Unknown Product"}
														secondary={
															<>
																{Object.entries(item.customizations).map(
																	([key, value]) => (
																		<Typography
																			key={key}
																			variant="body2"
																			color="text.secondary">
																			{value}
																		</Typography>
																	)
																)}
																{item.notes && (
																	<Typography
																		variant="body2"
																		color="text.secondary"
																		sx={{ mt: 1, fontStyle: "italic" }}>
																		Note: {item.notes}
																	</Typography>
																)}
															</>
														}
													/>
												</Grid>
												<Grid item xs={3} sm={2}>
													<Box sx={{ display: "flex", alignItems: "center" }}>
														<IconButton
															size="small"
															onClick={() => updateQuantity(item.id || "", -1)}
															disabled={item.quantity <= 1}>
															<RemoveIcon fontSize="small" />
														</IconButton>
														<Typography sx={{ mx: 1 }}>
															{item.quantity}
														</Typography>
														<IconButton
															size="small"
															onClick={() => updateQuantity(item.id || "", 1)}>
															<AddIcon fontSize="small" />
														</IconButton>
													</Box>
												</Grid>
												<Grid item xs={1} sm={1} sx={{ textAlign: "right" }}>
													<Typography
														variant="body2"
														sx={{ fontWeight: "bold" }}>
														$
														{(
															(item.product?.price || 0) * item.quantity
														).toFixed(2)}
													</Typography>
												</Grid>
												<Grid item xs={1} sm={1} sx={{ textAlign: "right" }}>
													<IconButton
														edge="end"
														aria-label="delete"
														onClick={() => removeFromCart(item.id || "")}
														color="error"
														size="small">
														<DeleteIcon fontSize="small" />
													</IconButton>
												</Grid>
											</Grid>
										</ListItem>
									</React.Fragment>
								))}
							</List>
						</Paper>
					</Grid>

					{/* Order Summary */}
					<Grid item xs={12} md={4}>
						<Card elevation={3}>
							<CardContent>
								<Typography variant="h6" gutterBottom>
									Order Summary
								</Typography>
								<Box sx={{ my: 2 }}>
									<Grid container spacing={1}>
										<Grid item xs={8}>
											<Typography variant="body1">Subtotal</Typography>
										</Grid>
										<Grid item xs={4} sx={{ textAlign: "right" }}>
											<Typography variant="body1">
												${subtotal.toFixed(2)}
											</Typography>
										</Grid>

										{user && user.loyalty_points > 0 && (
											<>
												<Grid item xs={12}>
													<FormControlLabel
														control={
															<Checkbox
																checked={usePoints}
																onChange={(e) => setUsePoints(e.target.checked)}
																sx={{
																	color: "#b85c38",
																	"&.Mui-checked": { color: "#b85c38" },
																}}
															/>
														}
														label={
															<Box
																sx={{ display: "flex", alignItems: "center" }}>
																<LoyaltyIcon
																	fontSize="small"
																	sx={{ mr: 0.5, color: "#b85c38" }}
																/>
																<Typography variant="body2">
																	Use loyalty points ({user.loyalty_points}{" "}
																	available)
																</Typography>
															</Box>
														}
													/>
												</Grid>

												{usePoints && pointsDiscount > 0 && (
													<>
														<Grid item xs={8}>
															<Typography variant="body1" color="success.main">
																Points Discount
															</Typography>
														</Grid>
														<Grid item xs={4} sx={{ textAlign: "right" }}>
															<Typography variant="body1" color="success.main">
																-${pointsDiscount.toFixed(2)}
															</Typography>
														</Grid>
													</>
												)}
											</>
										)}

										<Grid item xs={12}>
											<Divider sx={{ my: 1 }} />
										</Grid>

										<Grid item xs={8}>
											<Typography variant="h6">Total</Typography>
										</Grid>
										<Grid item xs={4} sx={{ textAlign: "right" }}>
											<Typography variant="h6">${total.toFixed(2)}</Typography>
										</Grid>
									</Grid>
								</Box>

								<Box sx={{ mt: 3 }}>
									<Typography variant="subtitle2" gutterBottom>
										Table Number (Optional)
									</Typography>
									<TextField
										fullWidth
										placeholder="Enter table number if ordering in-store"
										variant="outlined"
										size="small"
										type="number"
										value={tableNumber}
										onChange={(e) => setTableNumber(e.target.value)}
										sx={{ mb: 2 }}
									/>

									<Button
										variant="contained"
										fullWidth
										size="large"
										startIcon={<CheckoutIcon />}
										onClick={handleCheckout}
										disabled={submitting || cartItems.length === 0}
										sx={{
											py: 1.5,
											backgroundColor: "#5c3d2e",
											"&:hover": {
												backgroundColor: "#b85c38",
											},
										}}>
										{submitting ? <CircularProgress size={24} /> : "Checkout"}
									</Button>
								</Box>

								<Box sx={{ mt: 3 }}>
									<Chip
										icon={<LoyaltyIcon />}
										label={`You'll earn approximately ${Math.floor(
											subtotal
										)} loyalty points with this purchase`}
										variant="outlined"
										sx={{ width: "100%", justifyContent: "flex-start" }}
									/>

									{usePoints && pointsDiscount > 0 && (
										<Typography
											variant="caption"
											color="text.secondary"
											sx={{ display: "block", mt: 1 }}>
											Using {Math.floor(pointsDiscount * 10)} points for a
											discount of ${pointsDiscount.toFixed(2)}
										</Typography>
									)}
								</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			)}
		</Container>
	);
};

export default CartPage;
