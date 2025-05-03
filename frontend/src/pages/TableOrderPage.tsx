import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import {
	Container,
	Typography,
	Box,
	Paper,
	Button,
	Divider,
	CircularProgress,
	Stepper,
	Step,
	StepLabel,
	Card,
	CardContent,
	Grid,
	Alert,
	AlertTitle,
} from "@mui/material";
import {
	QrCode as QrCodeIcon,
	Restaurant as RestaurantIcon,
	ShoppingCart as CartIcon,
	LocalCafe as LocalCafeIcon,
	CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";

const TableOrderPage: React.FC = () => {
	const { tableNumber } = useParams<{ tableNumber: string }>();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [loading, setLoading] = useState<boolean>(true);
	const [tableValid, setTableValid] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	// Validate the table number
	useEffect(() => {
		const validateTable = async () => {
			if (!tableNumber) {
				setError("No table number provided");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const response = await axios.get(
					`/api/qr-order/validate/${tableNumber}`
				);
				setTableValid(true);
				setError(null);
			} catch (error) {
				console.error("Error validating table:", error);
				setError(
					"This table QR code is invalid. Please scan the QR code again or ask for assistance."
				);
				setTableValid(false);
			} finally {
				setLoading(false);
			}
		};

		validateTable();
	}, [tableNumber]);

	const handleViewMenu = () => {
		navigate("/menu");
	};

	const handleCart = () => {
		// If the user is not logged in, redirect to login
		if (!isAuthenticated) {
			toast.info("Please log in to place an order.");
			navigate("/login");
			return;
		}

		// Otherwise redirect to cart and pass the table number as state
		navigate("/cart", { state: { tableNumber } });
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
					<QrCodeIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
					<Typography variant="h5" color="error" gutterBottom>
						{error}
					</Typography>
					<Button
						variant="contained"
						onClick={() => navigate("/")}
						sx={{
							mt: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Return to Home
					</Button>
				</Paper>
			</Container>
		);
	}

	return (
		<Container maxWidth="md" sx={{ my: 5 }}>
			<Paper sx={{ p: { xs: 2, md: 4 }, textAlign: "center" }}>
				<QrCodeIcon sx={{ fontSize: 80, color: "#5c3d2e", mb: 2 }} />
				<Typography variant="h4" gutterBottom>
					Table #{tableNumber}
				</Typography>
				<Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
					Order directly from your table without waiting in line
				</Typography>

				<Alert severity="info" sx={{ mb: 4, textAlign: "left" }}>
					<AlertTitle>Table Service</AlertTitle>
					Your order will be delivered directly to your table. Simply browse our
					menu, add items to your cart, and check out with this table number.
				</Alert>

				<Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
					<Grid item xs={12} sm={6}>
						<Card sx={{ height: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									height: "100%",
								}}>
								<LocalCafeIcon sx={{ fontSize: 60, color: "#b85c38", mb: 2 }} />
								<Typography variant="h6" gutterBottom>
									View Menu
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 3 }}>
									Browse our selection of coffee, food, and pastries
								</Typography>
								<Button
									variant="contained"
									size="large"
									fullWidth
									onClick={handleViewMenu}
									sx={{
										mt: "auto",
										backgroundColor: "#5c3d2e",
										"&:hover": {
											backgroundColor: "#b85c38",
										},
									}}>
									View Menu
								</Button>
							</CardContent>
						</Card>
					</Grid>

					<Grid item xs={12} sm={6}>
						<Card sx={{ height: "100%" }}>
							<CardContent
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									height: "100%",
								}}>
								<CartIcon sx={{ fontSize: 60, color: "#b85c38", mb: 2 }} />
								<Typography variant="h6" gutterBottom>
									Go to Cart
								</Typography>
								<Typography
									variant="body2"
									color="text.secondary"
									sx={{ mb: 3 }}>
									View your cart and complete your order for this table
								</Typography>
								<Button
									variant="outlined"
									size="large"
									fullWidth
									onClick={handleCart}
									sx={{
										mt: "auto",
										color: "#5c3d2e",
										borderColor: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									View Cart
								</Button>
							</CardContent>
						</Card>
					</Grid>
				</Grid>

				<Divider sx={{ mb: 4 }} />

				<Typography variant="h5" gutterBottom>
					How Table Ordering Works
				</Typography>

				<Stepper alternativeLabel sx={{ mb: 4 }}>
					<Step active>
						<StepLabel StepIconComponent={() => <QrCodeIcon color="primary" />}>
							<Typography variant="body2">Scan QR Code</Typography>
						</StepLabel>
					</Step>
					<Step active>
						<StepLabel
							StepIconComponent={() => <RestaurantIcon color="primary" />}>
							<Typography variant="body2">Select Items</Typography>
						</StepLabel>
					</Step>
					<Step active>
						<StepLabel StepIconComponent={() => <CartIcon color="primary" />}>
							<Typography variant="body2">Place Order</Typography>
						</StepLabel>
					</Step>
					<Step active>
						<StepLabel
							StepIconComponent={() => <CheckCircleIcon color="primary" />}>
							<Typography variant="body2">Enjoy</Typography>
						</StepLabel>
					</Step>
				</Stepper>

				<Typography variant="body2" color="text.secondary">
					Your order will be delivered directly to your table.
				</Typography>
			</Paper>
		</Container>
	);
};

export default TableOrderPage;
