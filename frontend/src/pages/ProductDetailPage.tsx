import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
	Container,
	Grid,
	Typography,
	Paper,
	Box,
	Button,
	Divider,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
	Checkbox,
	TextField,
	CircularProgress,
	Chip,
	Card,
	CardContent,
	CardMedia,
	MenuItem,
	Select,
	InputLabel,
	SelectChangeEvent,
	IconButton,
} from "@mui/material";
import {
	AddCircleOutline as AddIcon,
	RemoveCircleOutline as RemoveIcon,
	ShoppingCart as CartIcon,
	ArrowBack as BackIcon,
	Star as StarIcon,
} from "@mui/icons-material";

interface ProductCustomization {
	id: number;
	name: string;
	options: string[];
	price_impact: { [key: string]: number };
}

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	category: string;
	image_url: string;
	points_value: number;
	customizations: ProductCustomization[];
}

// Define API base URL
const API_BASE_URL = "http://localhost:5000";

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
	// If the image path is already a full URL, return it
	if (
		imagePath &&
		(imagePath.startsWith("http://") || imagePath.startsWith("https://"))
	) {
		return imagePath;
	}

	// Otherwise, prepend the API base URL
	return `${API_BASE_URL}${imagePath}`;
};

const ProductDetailPage: React.FC = () => {
	const { productId } = useParams<{ productId: string }>();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const { addToCart } = useCart();

	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [selectedCustomizations, setSelectedCustomizations] = useState<{
		[key: string]: string;
	}>({});
	const [notes, setNotes] = useState<string>("");
	const [totalPrice, setTotalPrice] = useState<number>(0);
	const [addingToCart, setAddingToCart] = useState<boolean>(false);

	useEffect(() => {
		const fetchProductDetails = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`/api/products/${productId}`);
				setProduct(response.data.product);

				// Initialize selected customizations with default values
				const initialCustomizations: { [key: string]: string } = {};
				response.data.product.customizations.forEach(
					(customization: ProductCustomization) => {
						if (customization.options.length > 0) {
							initialCustomizations[customization.id.toString()] =
								customization.options[0];
						}
					}
				);
				setSelectedCustomizations(initialCustomizations);

				setError(null);
			} catch (error) {
				console.error("Error fetching product details:", error);
				setError("Failed to load product details. Please try again later.");
				toast.error("Failed to load product details.");
			} finally {
				setLoading(false);
			}
		};

		if (productId) {
			fetchProductDetails();
		}
	}, [productId]);

	// Calculate total price whenever product, quantity or customizations change
	useEffect(() => {
		if (product) {
			let price = product.price;

			// Add price impacts from customizations
			Object.entries(selectedCustomizations).forEach(
				([customizationId, selectedOption]) => {
					const customization = product.customizations.find(
						(c) => c.id.toString() === customizationId
					);
					if (customization && customization.price_impact[selectedOption]) {
						price += customization.price_impact[selectedOption];
					}
				}
			);

			setTotalPrice(price * quantity);
		}
	}, [product, quantity, selectedCustomizations]);

	const handleQuantityChange = (change: number) => {
		const newQuantity = quantity + change;
		if (newQuantity >= 1) {
			setQuantity(newQuantity);
		}
	};

	const handleCustomizationChange = (
		customizationId: string,
		value: string
	) => {
		setSelectedCustomizations((prev) => ({
			...prev,
			[customizationId]: value,
		}));
	};

	const handleAddToCart = async () => {
		if (!isAuthenticated) {
			toast.info("Please log in to add items to your cart.");
			navigate("/login");
			return;
		}

		if (!product) return;

		try {
			setAddingToCart(true);

			// Create cart item
			const cartItem = {
				product_id: product.id,
				quantity,
				customizations: selectedCustomizations,
				notes: notes.trim(),
				product: product,
			};

			// Add to cart using the cart context
			addToCart(cartItem);

			toast.success("Added to cart successfully!");

			// Reset form or navigate to cart
			// navigate('/cart');
		} catch (error) {
			console.error("Error adding to cart:", error);
			toast.error("Failed to add item to cart. Please try again.");
		} finally {
			setAddingToCart(false);
		}
	};

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !product) {
		return (
			<Container maxWidth="md" sx={{ my: 5 }}>
				<Paper sx={{ p: 3, textAlign: "center" }}>
					<Typography variant="h5" color="error" gutterBottom>
						{error || "Product not found"}
					</Typography>
					<Button
						variant="contained"
						startIcon={<BackIcon />}
						onClick={() => navigate("/menu")}
						sx={{
							mt: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Back to Menu
					</Button>
				</Paper>
			</Container>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ my: 5 }}>
			<Button
				startIcon={<BackIcon />}
				onClick={() => navigate("/menu")}
				sx={{ mb: 3, color: "#5c3d2e" }}>
				Back to Menu
			</Button>

			<Grid container spacing={4}>
				{/* Product Image */}
				<Grid item xs={12} md={6}>
					<Card elevation={2}>
						<CardMedia
							component="img"
							height="400"
							image={
								product.image_url
									? getImageUrl(product.image_url)
									: `${API_BASE_URL}/static/images/${product.category}.jpg`
							}
							alt={product.name}
							sx={{ objectFit: "cover" }}
							onError={(e) => {
								// Fallback image if the main one fails to load
								const target = e.target as HTMLImageElement;
								target.onerror = null; // Prevent infinite loop
								target.src = `${API_BASE_URL}/static/images/default.jpg`;
							}}
						/>
						{product.points_value > 0 && (
							<Box sx={{ p: 1, bgcolor: "#f9f5eb" }}>
								<Typography
									variant="body2"
									sx={{ display: "flex", alignItems: "center" }}>
									<StarIcon
										fontSize="small"
										sx={{ color: "#e09132", mr: 0.5 }}
									/>
									Earn {product.points_value} loyalty points with this purchase
								</Typography>
							</Box>
						)}
					</Card>
				</Grid>

				{/* Product Details */}
				<Grid item xs={12} md={6}>
					<Paper elevation={2} sx={{ p: 3 }}>
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
							}}>
							<Typography variant="h4" component="h1" gutterBottom>
								{product.name}
							</Typography>
							<Chip
								label={`$${product.price.toFixed(2)}`}
								sx={{
									fontSize: "1.25rem",
									fontWeight: "bold",
									backgroundColor: "#5c3d2e",
									color: "white",
									px: 1,
								}}
							/>
						</Box>

						<Chip
							label={product.category}
							size="small"
							sx={{
								textTransform: "capitalize",
								mb: 2,
								backgroundColor: "#e0c2a8",
								color: "#5c3d2e",
							}}
						/>

						<Typography variant="body1" paragraph>
							{product.description || "A delicious item from our menu."}
						</Typography>

						<Divider sx={{ my: 3 }} />

						{/* Customizations */}
						{product.customizations.length > 0 && (
							<>
								<Typography variant="h6" gutterBottom>
									Customize Your Order
								</Typography>

								{product.customizations.map((customization) => (
									<Box key={customization.id} sx={{ mb: 3 }}>
										<FormControl fullWidth>
											<FormLabel
												sx={{ color: "#5c3d2e", fontWeight: "medium" }}>
												{customization.name}
											</FormLabel>
											<RadioGroup
												value={
													selectedCustomizations[customization.id.toString()] ||
													""
												}
												onChange={(e) =>
													handleCustomizationChange(
														customization.id.toString(),
														e.target.value
													)
												}>
												{customization.options.map((option) => {
													const priceImpact =
														customization.price_impact[option] || 0;
													return (
														<FormControlLabel
															key={option}
															value={option}
															control={<Radio />}
															label={
																<Box
																	sx={{
																		display: "flex",
																		justifyContent: "space-between",
																		width: "100%",
																	}}>
																	<span>{option}</span>
																	{priceImpact !== 0 && (
																		<Typography
																			variant="body2"
																			color={
																				priceImpact > 0 ? "error" : "success"
																			}>
																			{priceImpact > 0
																				? `+$${priceImpact.toFixed(2)}`
																				: `-$${Math.abs(priceImpact).toFixed(
																						2
																				  )}`}
																		</Typography>
																	)}
																</Box>
															}
														/>
													);
												})}
											</RadioGroup>
										</FormControl>
									</Box>
								))}

								<Divider sx={{ my: 3 }} />
							</>
						)}

						{/* Quantity and Special Instructions */}
						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" gutterBottom>
								Quantity
							</Typography>
							<Box sx={{ display: "flex", alignItems: "center" }}>
								<IconButton
									onClick={() => handleQuantityChange(-1)}
									disabled={quantity <= 1}
									color="primary">
									<RemoveIcon />
								</IconButton>
								<Typography sx={{ mx: 2, fontWeight: "bold" }}>
									{quantity}
								</Typography>
								<IconButton
									onClick={() => handleQuantityChange(1)}
									color="primary">
									<AddIcon />
								</IconButton>
							</Box>
						</Box>

						<Box sx={{ mb: 3 }}>
							<Typography variant="h6" gutterBottom>
								Special Instructions
							</Typography>
							<TextField
								fullWidth
								multiline
								rows={2}
								placeholder="Any special requests for this order?"
								variant="outlined"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
							/>
						</Box>

						{/* Total and Add to Cart */}
						<Divider sx={{ my: 3 }} />
						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								mb: 2,
							}}>
							<Typography variant="h6">Total:</Typography>
							<Typography variant="h6" fontWeight="bold">
								${totalPrice.toFixed(2)}
							</Typography>
						</Box>

						<Button
							variant="contained"
							size="large"
							fullWidth
							startIcon={<CartIcon />}
							onClick={handleAddToCart}
							disabled={addingToCart}
							sx={{
								py: 1.5,
								backgroundColor: "#5c3d2e",
								"&:hover": {
									backgroundColor: "#b85c38",
								},
							}}>
							{addingToCart ? <CircularProgress size={24} /> : "Add to Cart"}
						</Button>
					</Paper>
				</Grid>
			</Grid>
		</Container>
	);
};

export default ProductDetailPage;
