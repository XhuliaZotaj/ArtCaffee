import React from "react";
import { useNavigate } from "react-router-dom";
import {
	Box,
	Container,
	Typography,
	Button,
	Grid,
	Card,
	CardContent,
	CardMedia,
	CardActions,
	Paper,
	Divider,
} from "@mui/material";
import {
	Coffee as CoffeeIcon,
	CardGiftcard as GiftIcon,
	Loyalty as LoyaltyIcon,
	QrCode as QrIcon,
} from "@mui/icons-material";

const HomePage: React.FC = () => {
	const navigate = useNavigate();

	const features = [
		{
			icon: <CoffeeIcon fontSize="large" />,
			title: "Custom Coffee Orders",
			description:
				"Personalize your coffee just the way you like it. Choose from various flavors, milk options, and more.",
			action: () => navigate("/menu"),
		},
		{
			icon: <GiftIcon fontSize="large" />,
			title: "Send Gift Cards",
			description:
				"Send digital gift cards to friends and family for any occasion with a personalized message.",
			action: () => navigate("/gift-cards"),
		},
		{
			icon: <LoyaltyIcon fontSize="large" />,
			title: "Loyalty Program",
			description:
				"Earn points with every purchase and redeem them for free drinks, pastries, and more.",
			action: () => navigate("/loyalty"),
		},
		{
			icon: <QrIcon fontSize="large" />,
			title: "Scan & Order",
			description:
				"Scan the QR code at your table to order directly from your seat without waiting in line.",
			action: () => navigate("/menu"),
		},
	];

	return (
		<Box>
			{/* Hero Section */}
			<Paper
				sx={{
					position: "relative",
					backgroundColor: "grey.900",
					color: "#fff",
					mb: 4,
					backgroundSize: "cover",
					backgroundRepeat: "no-repeat",
					backgroundPosition: "center",
					backgroundImage: `url(https://source.unsplash.com/random?coffee)`,
					height: "60vh",
				}}>
				{/* Increase the priority of the hero background image */}
				<Box
					sx={{
						position: "absolute",
						top: 0,
						bottom: 0,
						right: 0,
						left: 0,
						backgroundColor: "rgba(0,0,0,.5)",
					}}
				/>
				<Grid container>
					<Grid item md={6}>
						<Box
							sx={{
								position: "relative",
								p: { xs: 3, md: 6 },
								pr: { md: 0 },
								height: "60vh",
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
							}}>
							<Typography
								component="h1"
								variant="h3"
								color="inherit"
								gutterBottom>
								Welcome to Digital Café
							</Typography>
							<Typography variant="h5" color="inherit" paragraph>
								Experience coffee in a whole new way. Order, earn points, and
								enjoy special offers.
							</Typography>
							<Button
								variant="contained"
								size="large"
								onClick={() => navigate("/menu")}
								sx={{
									mt: 3,
									alignSelf: "flex-start",
									backgroundColor: "#b85c38",
									"&:hover": {
										backgroundColor: "#e09132",
									},
								}}>
								View Menu
							</Button>
						</Box>
					</Grid>
				</Grid>
			</Paper>

			{/* Features Section */}
			<Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
				<Typography variant="h4" align="center" gutterBottom>
					Our Digital Features
				</Typography>
				<Typography
					variant="subtitle1"
					align="center"
					color="text.secondary"
					paragraph>
					Enhancing your café experience with modern digital solutions
				</Typography>
				<Divider sx={{ mt: 2, mb: 6 }} />

				<Grid container spacing={4}>
					{features.map((feature, index) => (
						<Grid item key={index} xs={12} sm={6} md={3}>
							<Card
								sx={{
									height: "100%",
									display: "flex",
									flexDirection: "column",
									transition: "transform 0.3s ease-in-out",
									"&:hover": {
										transform: "translateY(-5px)",
										boxShadow: 6,
									},
								}}>
								<Box
									sx={{
										p: 2,
										display: "flex",
										justifyContent: "center",
										color: "#b85c38",
									}}>
									{feature.icon}
								</Box>
								<CardContent sx={{ flexGrow: 1 }}>
									<Typography
										gutterBottom
										variant="h5"
										component="h2"
										align="center">
										{feature.title}
									</Typography>
									<Typography align="center">{feature.description}</Typography>
								</CardContent>
								<CardActions>
									<Button
										size="small"
										onClick={feature.action}
										sx={{ mx: "auto", color: "#5c3d2e" }}>
										Learn More
									</Button>
								</CardActions>
							</Card>
						</Grid>
					))}
				</Grid>
			</Container>

			{/* Special Offers Section */}
			<Box sx={{ bgcolor: "#f9f5eb", py: 8 }}>
				<Container maxWidth="lg">
					<Typography variant="h4" align="center" gutterBottom>
						Special Offers
					</Typography>
					<Typography
						variant="subtitle1"
						align="center"
						color="text.secondary"
						paragraph>
						Check out our latest deals and seasonal specials
					</Typography>
					<Divider sx={{ mt: 2, mb: 6 }} />

					<Grid container spacing={4}>
						<Grid item xs={12} md={4}>
							<Card>
								<CardMedia
									component="img"
									height="200"
									image="https://source.unsplash.com/random?latte"
									alt="Signature Latte"
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="div">
										Signature Latte: 20% Off
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Try our signature latte with a special discount this week.
										Available in-store or via the app.
									</Typography>
								</CardContent>
								<CardActions>
									<Button
										size="small"
										onClick={() => navigate("/menu")}
										sx={{ color: "#5c3d2e" }}>
										Order Now
									</Button>
								</CardActions>
							</Card>
						</Grid>
						<Grid item xs={12} md={4}>
							<Card>
								<CardMedia
									component="img"
									height="200"
									image="https://source.unsplash.com/random?breakfast"
									alt="Breakfast Deal"
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="div">
										Breakfast Combo Deal
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Get a coffee and breakfast sandwich for just $8.99. Perfect
										way to start your day!
									</Typography>
								</CardContent>
								<CardActions>
									<Button
										size="small"
										onClick={() => navigate("/menu")}
										sx={{ color: "#5c3d2e" }}>
										Order Now
									</Button>
								</CardActions>
							</Card>
						</Grid>
						<Grid item xs={12} md={4}>
							<Card>
								<CardMedia
									component="img"
									height="200"
									image="https://source.unsplash.com/random?coffee-beans"
									alt="Coffee Beans"
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="div">
										Double Points Weekend
									</Typography>
									<Typography variant="body2" color="text.secondary">
										Earn double loyalty points on all purchases this weekend!
										Don't miss this opportunity.
									</Typography>
								</CardContent>
								<CardActions>
									<Button
										size="small"
										onClick={() => navigate("/loyalty")}
										sx={{ color: "#5c3d2e" }}>
										Learn More
									</Button>
								</CardActions>
							</Card>
						</Grid>
					</Grid>
				</Container>
			</Box>
		</Box>
	);
};

export default HomePage;
