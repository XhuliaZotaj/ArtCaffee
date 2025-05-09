import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
	Container,
	Typography,
	Grid,
	Card,
	CardMedia,
	CardContent,
	CardActions,
	Button,
	Tabs,
	Tab,
	Box,
	CircularProgress,
	Chip,
	Paper,
	Divider,
} from "@mui/material";
import {
	LocalCafe as CoffeeIcon,
	LocalDining as FoodIcon,
	EmojiFoodBeverage as TeaIcon,
	Cake as DessertIcon,
	Category as CategoryIcon,
} from "@mui/icons-material";

// Define the API base URL
const API_BASE_URL = "http://localhost:5000";

// Mock data with updated image paths - used when API is unavailable
const MOCK_PRODUCTS = [
	{
		id: 1,
		name: "Espresso",
		description: "Strong coffee served in a small cup",
		price: 2.99,
		category: "coffee",
		image_url: "/static/images/espresso.jpg",
		points_value: 3,
	},
	{
		id: 2,
		name: "Cappuccino",
		description: "Espresso with steamed milk and foam",
		price: 3.99,
		category: "coffee",
		image_url: "/static/images/cappuccino.jpg",
		points_value: 4,
	},
	{
		id: 3,
		name: "Green Tea",
		description: "Refreshing tea with antioxidants",
		price: 2.5,
		category: "tea",
		image_url: "/static/images/green_tea.jpg",
		points_value: 2,
	},
	{
		id: 4,
		name: "Croissant",
		description: "Buttery and flaky pastry",
		price: 3.5,
		category: "food",
		image_url: "/static/images/croissant.jpg",
		points_value: 3,
	},
	{
		id: 5,
		name: "Chocolate Cake",
		description: "Rich chocolate cake with frosting",
		price: 4.99,
		category: "dessert",
		image_url: "/static/images/chocolate_cake.jpg",
		points_value: 5,
	},
	{
		id: 6,
		name: "Latte",
		description: "Espresso with steamed milk",
		price: 4.5,
		category: "coffee",
		image_url: "/static/images/latte.jpg",
		points_value: 4,
	},
	{
		id: 7,
		name: "Blueberry Muffin",
		description: "Soft muffin with fresh blueberries",
		price: 3.25,
		category: "food",
		image_url: "/static/images/blueberry_muffin.jpg",
		points_value: 3,
	},
	{
		id: 8,
		name: "Chai Tea",
		description: "Spiced tea with milk",
		price: 3.75,
		category: "tea",
		image_url: "/static/images/chai_latte.jpg",
		points_value: 3,
	},
];

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	category: string;
	image_url: string;
	points_value: number;
}

// Add this helper function to get full image URL
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

const MenuPage: React.FC = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState<boolean>(true);
	const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS); // Use mock data by default
	const [categoryFilter, setCategoryFilter] = useState<string>("all");
	const [error, setError] = useState<string | null>(null);
	const [usingMockData, setUsingMockData] = useState<boolean>(true);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true);
				// Set a shorter timeout for the request
				const response = await axios.get(`${API_BASE_URL}/api/products`, {
					timeout: 3000, // 3 seconds timeout
				});

				if (response.data.products && response.data.products.length > 0) {
					setProducts(response.data.products);
					setUsingMockData(false);
					setError(null);
				} else {
					// If response is empty, keep using mock data
					console.log("API returned empty products, using mock data");
					setUsingMockData(true);
				}
			} catch (error) {
				console.error("Error fetching products:", error);
				// Just use mock data without showing error to user
				setUsingMockData(true);
			} finally {
				setLoading(false);
			}
		};

		fetchProducts();
	}, []);

	const handleCategoryChange = (
		event: React.SyntheticEvent,
		newValue: string
	) => {
		setCategoryFilter(newValue);
	};

	const handleProductClick = (productId: number) => {
		navigate(`/menu/${productId}`);
	};

	const getFilteredProducts = () => {
		if (categoryFilter === "all") {
			return products;
		}
		return products.filter(
			(product) => product.category.toLowerCase() === categoryFilter
		);
	};

	const getCategoryIcon = (category: string) => {
		switch (category.toLowerCase()) {
			case "coffee":
				return <CoffeeIcon />;
			case "tea":
				return <TeaIcon />;
			case "food":
				return <FoodIcon />;
			case "dessert":
				return <DessertIcon />;
			default:
				return <CategoryIcon />;
		}
	};

	const filteredProducts = getFilteredProducts();

	// Get unique categories from products
	const categories = [
		"all",
		...Array.from(
			new Set(products.map((product) => product.category.toLowerCase()))
		),
	];

	if (loading) {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", my: 5 }}>
				<CircularProgress />
			</Box>
		);
	}

	return (
		<Container maxWidth="lg" sx={{ my: 5 }}>
			<Typography variant="h4" component="h1" align="center" gutterBottom>
				Our Menu
			</Typography>
			<Typography
				variant="subtitle1"
				align="center"
				color="text.secondary"
				sx={{ mb: 4 }}>
				Choose from our selection of premium coffee, tea, and food items
			</Typography>

			{/* Category Filter Tabs */}
			<Paper elevation={1} sx={{ mb: 4 }}>
				<Tabs
					value={categoryFilter}
					onChange={handleCategoryChange}
					variant="scrollable"
					scrollButtons="auto"
					textColor="inherit"
					indicatorColor="primary"
					sx={{
						"& .MuiTab-root": {
							textTransform: "capitalize",
							fontWeight: "medium",
							minWidth: 100,
						},
						backgroundColor: "#f5f5f5",
					}}>
					{categories.map((category) => (
						<Tab
							key={category}
							label={category === "all" ? "All Items" : category}
							value={category}
							icon={
								category === "all" ? (
									<CategoryIcon />
								) : (
									getCategoryIcon(category)
								)
							}
							iconPosition="start"
						/>
					))}
				</Tabs>
			</Paper>

			{filteredProducts.length === 0 ? (
				<Paper sx={{ p: 4, mt: 2, textAlign: "center" }}>
					<Typography variant="h6">
						No products available in this category.
					</Typography>
				</Paper>
			) : (
				<Grid container spacing={3}>
					{filteredProducts.map((product) => (
						<Grid item key={product.id} xs={12} sm={6} md={4}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									transition: "transform 0.3s ease",
									"&:hover": {
										transform: "scale(1.02)",
										boxShadow: 4,
									},
								}}>
								<CardMedia
									component="img"
									height="200"
									image={
										product.image_url
											? getImageUrl(product.image_url)
											: `${API_BASE_URL}/static/images/${product.category}.jpg`
									}
									alt={product.name}
									onError={(e) => {
										// Fallback image if the main one fails to load
										const target = e.target as HTMLImageElement;
										target.onerror = null; // Prevent infinite loop
										target.src = `${API_BASE_URL}/static/images/default.jpg`;
									}}
								/>
								<CardContent sx={{ flexGrow: 1 }}>
									<Box
										sx={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											mb: 1,
										}}>
										<Typography variant="h6" gutterBottom>
											{product.name}
										</Typography>
										<Chip
											size="small"
											label={`$${product.price.toFixed(2)}`}
											sx={{
												fontWeight: "bold",
												backgroundColor: "#5c3d2e",
												color: "white",
											}}
										/>
									</Box>
									<Typography variant="body2" color="text.secondary" paragraph>
										{product.description ||
											"A delicious item from our menu. Click for more details and customization options."}
									</Typography>
									{product.points_value > 0 && (
										<Chip
											size="small"
											label={`Earn ${product.points_value} points`}
											color="primary"
											variant="outlined"
											sx={{ mt: 1 }}
										/>
									)}
								</CardContent>
								<Divider />
								<CardActions>
									<Button
										size="small"
										onClick={() => handleProductClick(product.id)}
										sx={{ mx: "auto", color: "#5c3d2e" }}>
										View Details
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			)}
		</Container>
	);
};

export default MenuPage;
