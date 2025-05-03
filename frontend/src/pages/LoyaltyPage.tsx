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
	Grid,
	Card,
	CardContent,
	CardActions,
	Button,
	Divider,
	CircularProgress,
	List,
	ListItem,
	ListItemText,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogContentText,
	DialogActions,
	Chip,
	Stepper,
	Step,
	StepLabel,
	Alert,
} from "@mui/material";
import {
	Star as StarIcon,
	LocalCafe as CoffeeIcon,
	Cake as PastryIcon,
	Percent as DiscountIcon,
	BreakfastDining as BreakfastIcon,
	ArrowForward as ArrowIcon,
	Info as InfoIcon,
} from "@mui/icons-material";
import {
	saveToCSVWithLocalStorageFallback,
	getDataWithLocalStorageFallback,
} from "../utils/csvUtils";
import { keyframes } from "@mui/system";

interface LoyaltyReward {
	id: number;
	name: string;
	description: string;
	points_required: number;
	is_available: boolean;
}

interface PointHistory {
	order_id: number;
	date: string;
	points_earned: number;
	points_used: number;
}

// Mock data for rewards
const MOCK_REWARDS: LoyaltyReward[] = [
	{
		id: 1,
		name: "Free Coffee",
		description: "Get a free coffee of your choice, any size",
		points_required: 50,
		is_available: false,
	},
	{
		id: 2,
		name: "Free Pastry",
		description: "Enjoy a free pastry of your choice",
		points_required: 75,
		is_available: false,
	},
	{
		id: 3,
		name: "10% Discount",
		description: "Get 10% off your next order",
		points_required: 30,
		is_available: false,
	},
	{
		id: 4,
		name: "Breakfast Special",
		description: "Free breakfast sandwich with any drink purchase",
		points_required: 100,
		is_available: false,
	},
];

// Mock data for point history
const MOCK_POINT_HISTORY: PointHistory[] = [
	{
		order_id: 1001,
		date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
		points_earned: 13,
		points_used: 0,
	},
	{
		order_id: 1002,
		date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
		points_earned: 9,
		points_used: 0,
	},
	{
		order_id: 1003,
		date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		points_earned: 16,
		points_used: 0,
	},
];

// Add animation keyframes near the top of the file
const pointsPulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const pointsHighlight = keyframes`
  0% { background-color: #f9f5eb; }
  50% { background-color: #ffe7ba; }
  100% { background-color: #f9f5eb; }
`;

const LoyaltyPage: React.FC = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated, getProfile } = useAuth();
	const [loading, setLoading] = useState<boolean>(false);
	const [pointHistory, setPointHistory] =
		useState<PointHistory[]>(MOCK_POINT_HISTORY);
	const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [redeeming, setRedeeming] = useState<boolean>(false);
	const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(
		null
	);
	const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
	const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
	const [redemptionCode, setRedemptionCode] = useState<string>("");
	const [usingMockData, setUsingMockData] = useState<boolean>(true);

	// Get loyalty points info and available rewards
	useEffect(() => {
		const fetchLoyaltyInfo = async () => {
			try {
				setLoading(true);

				// Try to load point history from localStorage
				const pointHistory = getDataWithLocalStorageFallback(
					"pointHistory",
					MOCK_POINT_HISTORY
				);
				setPointHistory(pointHistory);

				// Create mock rewards with availability based on user's points
				const userPoints = user?.loyalty_points || 0;
				const mockRewardsWithAvailability = MOCK_REWARDS.map((reward) => ({
					...reward,
					is_available: userPoints >= reward.points_required,
				}));

				setRewards(mockRewardsWithAvailability);
				setUsingMockData(true);
				setError(null);
			} catch (error) {
				console.error("Error fetching loyalty info:", error);
				// Just use mock data instead of showing error
				setUsingMockData(true);
			} finally {
				setLoading(false);
			}
		};

		if (isAuthenticated) {
			fetchLoyaltyInfo();
		} else {
			navigate("/login");
		}
	}, [isAuthenticated, navigate, user?.loyalty_points]);

	const handleRedeemReward = (reward: LoyaltyReward) => {
		setSelectedReward(reward);
		setConfirmDialogOpen(true);
	};

	const confirmRedemption = async () => {
		if (!selectedReward) return;

		try {
			setRedeeming(true);
			setConfirmDialogOpen(false);

			// Create a redemption code
			const randomCode = Math.random()
				.toString(36)
				.substring(2, 8)
				.toUpperCase();
			setRedemptionCode(`REDEEM-${randomCode}`);

			// Create a new point history entry for the redemption
			const redemptionEntry = {
				order_id: 0, // 0 indicates it's a redemption, not an order
				date: new Date().toISOString(),
				points_earned: 0,
				points_used: selectedReward.points_required,
				redemption_code: `REDEEM-${randomCode}`,
				reward_name: selectedReward.name,
			};

			// Get existing point history
			const existingHistory = getDataWithLocalStorageFallback(
				"pointHistory",
				[]
			);

			// Add new entry at the beginning
			const updatedHistory = [redemptionEntry, ...existingHistory];

			// Save to localStorage and as CSV
			saveToCSVWithLocalStorageFallback(
				updatedHistory,
				"digital-cafe-point-history.csv",
				"pointHistory"
			);

			// Update user's loyalty points in localStorage
			if (user) {
				const updatedUser = {
					...user,
					loyalty_points: user.loyalty_points - selectedReward.points_required,
				};

				// Save updated user to localStorage and CSV
				saveToCSVWithLocalStorageFallback(
					[updatedUser],
					"digital-cafe-user-data.csv",
					"user"
				);

				// Call getProfile to update the context
				await getProfile();
			}

			setSuccessDialogOpen(true);
			toast.success(
				`Successfully redeemed ${selectedReward.name}! CSV files have been downloaded for your records.`
			);
		} catch (error) {
			console.error("Error redeeming reward:", error);
			toast.error("Failed to redeem reward. Please try again.");
		} finally {
			setRedeeming(false);
		}
	};

	const closeSuccessDialog = () => {
		setSuccessDialogOpen(false);
		// Refresh rewards based on new point balance
		const userPoints = user?.loyalty_points || 0;
		const updatedRewards = rewards.map((reward) => ({
			...reward,
			is_available: userPoints >= reward.points_required,
		}));

		setRewards(updatedRewards);
	};

	const getRewardIcon = (rewardName: string) => {
		if (rewardName.toLowerCase().includes("coffee")) return <CoffeeIcon />;
		if (rewardName.toLowerCase().includes("pastry")) return <PastryIcon />;
		if (
			rewardName.toLowerCase().includes("discount") ||
			rewardName.toLowerCase().includes("off")
		)
			return <DiscountIcon />;
		if (rewardName.toLowerCase().includes("breakfast"))
			return <BreakfastIcon />;
		return <StarIcon />;
	};

	// Calculate points needed for next reward
	const getNextRewardInfo = () => {
		if (!user || rewards.length === 0) return null;

		const sortedRewards = [...rewards].sort(
			(a, b) => a.points_required - b.points_required
		);

		for (const reward of sortedRewards) {
			if (!reward.is_available) {
				const pointsNeeded =
					reward.points_required - (user.loyalty_points || 0);
				return { reward, pointsNeeded };
			}
		}

		return null;
	};

	const nextRewardInfo = getNextRewardInfo();

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
				Loyalty Program
			</Typography>
			<Typography
				variant="subtitle1"
				align="center"
				color="text.secondary"
				sx={{ mb: 4 }}>
				Earn points with every purchase and redeem them for free items
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
							Demo Mode: Using sample loyalty data. Some features may be
							limited.
						</Typography>
					</Box>
				</Paper>
			)}

			{/* Points Summary Card */}
			<Paper
				elevation={3}
				sx={{
					p: 4,
					mb: 4,
					bgcolor: "#f9f5eb",
					border: "1px solid #e0d8c0",
					borderRadius: "16px",
					animation: `${pointsHighlight} 3s ease-in-out infinite`,
					mx: { xs: 2, md: 0 }, // Add margin for mobile but remove for desktop
				}}>
				<Grid container alignItems="center" spacing={3}>
					<Grid item xs={12} md={6}>
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: { xs: "center", md: "flex-start" },
							}}>
							<Box
								sx={{
									backgroundColor: "#e09132",
									borderRadius: "50%",
									p: 2,
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									boxShadow: "0 4px 10px rgba(224, 145, 50, 0.3)",
									mr: 3,
									animation: `${pointsPulse} 2s ease-in-out infinite`,
								}}>
								<StarIcon sx={{ fontSize: 40, color: "white" }} />
							</Box>
							<Box>
								<Typography
									variant="h4"
									sx={{
										fontWeight: "bold",
										color: "#5c3d2e",
										textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
									}}>
									{user?.loyalty_points || 0}
								</Typography>
								<Typography variant="h6" color="text.secondary">
									Points Available
								</Typography>
							</Box>
						</Box>
					</Grid>

					{nextRewardInfo && (
						<Grid item xs={12} md={6}>
							<Box
								sx={{
									border: "1px dashed #b85c38",
									p: 2,
									borderRadius: "8px",
									bgcolor: "rgba(255,255,255,0.6)",
								}}>
								<Typography
									variant="body1"
									sx={{ mb: 1, fontWeight: "medium" }}>
									{nextRewardInfo.pointsNeeded > 0 ? (
										<>
											You need{" "}
											<Typography
												component="span"
												color="primary"
												fontWeight="bold">
												{nextRewardInfo.pointsNeeded} more points
											</Typography>{" "}
											to redeem:
										</>
									) : (
										<>You can now redeem:</>
									)}
								</Typography>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									{getRewardIcon(nextRewardInfo.reward.name)}
									<Typography
										variant="body1"
										sx={{ ml: 1, fontWeight: "bold", color: "#b85c38" }}>
										{nextRewardInfo.reward.name}
									</Typography>
								</Box>
							</Box>
						</Grid>
					)}
				</Grid>
			</Paper>

			<Grid container spacing={4} sx={{ px: { xs: 2, md: 0 } }}>
				{/* Rewards Section */}
				<Grid item xs={12} md={8}>
					<Paper sx={{ p: 3 }}>
						<Typography variant="h5" gutterBottom>
							Available Rewards
						</Typography>
						<Divider sx={{ mb: 3 }} />

						<Grid container spacing={3}>
							{rewards.map((reward) => (
								<Grid item key={reward.id} xs={12} sm={6}>
									<Card
										variant={reward.is_available ? "outlined" : "elevation"}
										sx={{
											height: "100%",
											display: "flex",
											flexDirection: "column",
											borderColor: reward.is_available ? "#5c3d2e" : "divider",
											backgroundColor: reward.is_available
												? "#fcf8f3"
												: "#f7f7f7",
											boxShadow: reward.is_available ? 2 : 1,
										}}>
										<CardContent sx={{ flexGrow: 1 }}>
											<Box
												sx={{
													display: "flex",
													mb: 2,
													color: reward.is_available
														? "#5c3d2e"
														: "text.secondary",
												}}>
												{getRewardIcon(reward.name)}
												<Typography variant="h6" sx={{ ml: 1 }}>
													{reward.name}
												</Typography>
											</Box>
											<Typography
												variant="body2"
												color="text.secondary"
												paragraph>
												{reward.description}
											</Typography>
											<Box
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
												}}>
												<Chip
													icon={<StarIcon />}
													label={`${reward.points_required} points`}
													color={reward.is_available ? "primary" : "default"}
													variant={reward.is_available ? "filled" : "outlined"}
												/>
												{!reward.is_available && (
													<Typography variant="body2" color="text.secondary">
														Need{" "}
														{reward.points_required -
															(user?.loyalty_points || 0)}{" "}
														more
													</Typography>
												)}
											</Box>
										</CardContent>
										<CardActions sx={{ justifyContent: "center", pb: 2 }}>
											<Button
												variant="contained"
												onClick={() => handleRedeemReward(reward)}
												disabled={!reward.is_available || redeeming}
												sx={{
													backgroundColor: "#5c3d2e",
													"&:hover": {
														backgroundColor: "#b85c38",
													},
													"&.Mui-disabled": {
														backgroundColor: "action.disabledBackground",
													},
												}}>
												Redeem Reward
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))}
						</Grid>
					</Paper>
				</Grid>

				{/* Points History Section */}
				<Grid item xs={12} md={4}>
					<Paper
						sx={{
							p: 3,
							height: "100%",
							bgcolor: "#fafafa",
							border: "1px solid #e0e0e0",
						}}>
						<Typography variant="h5" gutterBottom>
							Points History
						</Typography>
						<Divider sx={{ mb: 2 }} />

						{pointHistory.length === 0 ? (
							<Typography
								variant="body2"
								color="text.secondary"
								sx={{ py: 2, textAlign: "center" }}>
								No point activity yet. Start earning points by placing orders!
							</Typography>
						) : (
							<List>
								{pointHistory.map((entry, index) => (
									<React.Fragment key={`${entry.order_id}-${index}`}>
										{index > 0 && <Divider component="li" />}
										<ListItem sx={{ py: 1.5 }}>
											<ListItemText
												primary={
													<Box
														sx={{
															display: "flex",
															justifyContent: "space-between",
														}}>
														<Typography variant="body2">
															Order #{entry.order_id}
														</Typography>
														<Typography
															variant="body2"
															color={
																entry.points_earned > 0
																	? "success.main"
																	: entry.points_used > 0
																	? "warning.main"
																	: "inherit"
															}
															sx={{ fontWeight: "bold" }}>
															{entry.points_earned > 0
																? `+${entry.points_earned}`
																: entry.points_used > 0
																? `-${entry.points_used}`
																: "0"}
														</Typography>
													</Box>
												}
												secondary={
													<Typography variant="caption" color="text.secondary">
														{new Date(entry.date).toLocaleDateString()}
													</Typography>
												}
											/>
										</ListItem>
									</React.Fragment>
								))}
							</List>
						)}
					</Paper>
				</Grid>
			</Grid>

			{/* How It Works Section */}
			<Paper
				sx={{
					p: 4,
					mt: 4,
					bgcolor: "#f5f0e4",
					border: "1px solid #e0d8c0",
					mx: { xs: 2, md: 0 }, // Add margin for mobile but remove for desktop
					borderRadius: "16px",
				}}>
				<Typography variant="h5" align="center" gutterBottom>
					How Our Loyalty Program Works
				</Typography>
				<Divider sx={{ mb: 4, borderColor: "#d1c7a3" }} />

				<Stepper alternativeLabel>
					<Step completed>
						<StepLabel StepIconComponent={() => <CoffeeIcon color="primary" />}>
							<Typography variant="body1" sx={{ fontWeight: "medium" }}>
								Purchase Coffee
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Earn 1 point for every $1 spent
							</Typography>
						</StepLabel>
					</Step>
					<Step completed>
						<StepLabel StepIconComponent={() => <StarIcon color="primary" />}>
							<Typography variant="body1" sx={{ fontWeight: "medium" }}>
								Collect Points
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Track points in your account
							</Typography>
						</StepLabel>
					</Step>
					<Step completed>
						<StepLabel StepIconComponent={() => <ArrowIcon color="primary" />}>
							<Typography variant="body1" sx={{ fontWeight: "medium" }}>
								Redeem Rewards
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Use your points for free items
							</Typography>
						</StepLabel>
					</Step>
				</Stepper>
			</Paper>

			{/* Redemption Confirmation Dialog */}
			<Dialog
				open={confirmDialogOpen}
				onClose={() => setConfirmDialogOpen(false)}>
				<DialogTitle>Confirm Redemption</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Are you sure you want to redeem{" "}
						<strong>{selectedReward?.name}</strong> for{" "}
						{selectedReward?.points_required} points?
					</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setConfirmDialogOpen(false)} color="inherit">
						Cancel
					</Button>
					<Button
						onClick={confirmRedemption}
						color="primary"
						variant="contained"
						sx={{
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Confirm
					</Button>
				</DialogActions>
			</Dialog>

			{/* Redemption Success Dialog */}
			<Dialog open={successDialogOpen} onClose={closeSuccessDialog}>
				<DialogTitle>Reward Redeemed!</DialogTitle>
				<DialogContent>
					<Box sx={{ textAlign: "center", py: 2 }}>
						<StarIcon
							color="primary"
							sx={{ fontSize: 60, color: "#e09132", mb: 2 }}
						/>
						<Typography variant="h6" gutterBottom>
							{selectedReward?.name}
						</Typography>
						<Typography variant="body1" paragraph>
							Your reward has been redeemed successfully. Show this code when
							picking up your reward.
						</Typography>
						<Paper
							elevation={3}
							sx={{
								p: 2,
								backgroundColor: "#f9f5eb",
								display: "inline-block",
								mb: 2,
							}}>
							<Typography
								variant="h5"
								sx={{ fontFamily: "monospace", letterSpacing: 1 }}>
								{redemptionCode}
							</Typography>
						</Paper>
					</Box>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={closeSuccessDialog}
						color="primary"
						variant="contained"
						sx={{
							mx: "auto",
							mb: 2,
							backgroundColor: "#5c3d2e",
							"&:hover": {
								backgroundColor: "#b85c38",
							},
						}}>
						Done
					</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
};

export default LoyaltyPage;
