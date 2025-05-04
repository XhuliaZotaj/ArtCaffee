import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import {
	AppBar,
	Box,
	Toolbar,
	IconButton,
	Typography,
	Menu,
	Container,
	Avatar,
	Button,
	Tooltip,
	MenuItem,
	Badge,
	Chip,
} from "@mui/material";
import {
	Menu as MenuIcon,
	ShoppingCart as CartIcon,
	Loyalty as LoyaltyIcon,
} from "@mui/icons-material";
import { keyframes } from "@mui/system";

// Add animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(240, 179, 87, 0.6); }
  50% { box-shadow: 0 0 15px rgba(240, 179, 87, 0.8); }
  100% { box-shadow: 0 0 5px rgba(240, 179, 87, 0.6); }
`;

const Navbar: React.FC = () => {
	const { isAuthenticated, user, logout } = useAuth();
	const { cartCount } = useCart();
	const navigate = useNavigate();

	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};

	const handleMenuClick = (path: string) => {
		navigate(path);
		handleCloseNavMenu();
	};

	const handleUserMenuClick = (action: string) => {
		handleCloseUserMenu();

		if (action === "logout") {
			logout();
			navigate("/");
		} else {
			navigate(`/${action}`);
		}
	};

	const getUserInitials = () => {
		if (!user) return "U";

		const firstInitial = user.first_name ? user.first_name.charAt(0) : "";
		const lastInitial = user.last_name ? user.last_name.charAt(0) : "";

		if (firstInitial && lastInitial) {
			return `${firstInitial}${lastInitial}`;
		} else if (user.username) {
			return user.username.charAt(0).toUpperCase();
		} else {
			return "U";
		}
	};

	const pages = [
		{ title: "Menu", path: "/menu" },
		{ title: "Loyalty", path: "/loyalty" },
		{ title: "Gift Cards", path: "/gift-cards" },
	];

	const userMenuItems = [
		{ title: "Profile", action: "profile" },
		{ title: "My Orders", action: "orders" },
		{ title: "Logout", action: "logout" },
	];

	return (
		<AppBar position="static" sx={{ backgroundColor: "#0A3012" }}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					{/* Desktop Logo */}
					<Box
						component="img"
						src="/icon.png"
						alt="Art Coffee"
						sx={{
							display: { xs: "none", md: "flex" },
							mr: 1,
							height: 40,
							width: 40,
						}}
					/>
					<Typography
						variant="h6"
						noWrap
						component={Link}
						to="/"
						sx={{
							mr: 2,
							display: { xs: "none", md: "flex" },
							fontFamily: "monospace",
							fontWeight: 700,
							letterSpacing: ".3rem",
							color: "inherit",
							textDecoration: "none",
						}}>
						ART COFFEE
					</Typography>

					{/* Mobile Menu */}
					<Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
						<IconButton
							size="large"
							aria-label="navigation menu"
							aria-controls="menu-appbar"
							aria-haspopup="true"
							onClick={handleOpenNavMenu}
							color="inherit">
							<MenuIcon />
						</IconButton>
						<Menu
							id="menu-appbar"
							anchorEl={anchorElNav}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "left",
							}}
							keepMounted
							transformOrigin={{
								vertical: "top",
								horizontal: "left",
							}}
							open={Boolean(anchorElNav)}
							onClose={handleCloseNavMenu}
							sx={{
								display: { xs: "block", md: "none" },
							}}>
							{pages.map((page) => (
								<MenuItem
									key={page.title}
									onClick={() => handleMenuClick(page.path)}>
									<Typography textAlign="center">{page.title}</Typography>
								</MenuItem>
							))}
						</Menu>
					</Box>

					{/* Mobile Logo */}
					<Box
						component="img"
						src="/icon.png"
						alt="Art Coffee"
						sx={{
							display: { xs: "flex", md: "none" },
							mr: 1,
							height: 32,
							width: 32,
						}}
					/>
					<Typography
						variant="h5"
						noWrap
						component={Link}
						to="/"
						sx={{
							mr: 2,
							display: { xs: "flex", md: "none" },
							flexGrow: 1,
							fontFamily: "monospace",
							fontWeight: 700,
							letterSpacing: ".3rem",
							color: "inherit",
							textDecoration: "none",
						}}>
						CAFÉ
					</Typography>

					{/* Mobile Loyalty Points */}
					{isAuthenticated && (
						<Box
							component={Link}
							to="/loyalty"
							sx={{
								display: { xs: "flex", sm: "none" },
								alignItems: "center",
								backgroundColor: "#e09132",
								color: "white",
								px: 1.5,
								py: 0.5,
								borderRadius: 2,
								mr: 1,
								textDecoration: "none",
								border: "1px solid #f0b357",
								animation: `${pulse} 2s ease-in-out infinite`,
								boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
							}}>
							<LoyaltyIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
							<Typography variant="caption" fontWeight="bold">
								{user?.loyalty_points || 0}
							</Typography>
						</Box>
					)}

					{/* Desktop Menu */}
					<Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
						{pages.map((page) => (
							<Button
								key={page.title}
								onClick={() => handleMenuClick(page.path)}
								sx={{ my: 2, color: "white", display: "block" }}>
								{page.title}
							</Button>
						))}
					</Box>

					{/* Cart and Profile */}
					<Box sx={{ flexGrow: 0 }}>
						{isAuthenticated ? (
							<>
								<Box sx={{ display: "flex", alignItems: "center" }}>
									{/* Loyalty Points Chip for desktop */}
									<Chip
										icon={<LoyaltyIcon sx={{ color: "#ffffff" }} />}
										label={
											<Typography
												sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
												{user?.loyalty_points || 0} Points
											</Typography>
										}
										component={Link}
										to="/loyalty"
										clickable
										sx={{
											mr: 2,
											backgroundColor: "#e09132",
											color: "white",
											fontWeight: "bold",
											display: { xs: "none", sm: "flex" },
											boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
											border: "2px solid #f0b357",
											animation: `${pulse} 2s ease-in-out infinite, ${glow} 3s ease-in-out infinite`,
											transition: "all 0.3s ease",
											"&:hover": {
												backgroundColor: "#f0b357",
												transform: "translateY(-2px) scale(1.05)",
												boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
											},
										}}
									/>

									<IconButton
										component={Link}
										to="/cart"
										color="inherit"
										sx={{ mr: 2, position: "relative" }}>
										<Badge
											badgeContent={cartCount}
											color="error"
											sx={{
												"& .MuiBadge-badge": {
													backgroundColor: "#e09132",
													fontWeight: "bold",
												},
											}}>
											<CartIcon />
										</Badge>
									</IconButton>
									<Tooltip title="Open settings">
										<IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
											<Avatar
												sx={{
													bgcolor: "#b85c38",
													width: 40,
													height: 40,
												}}>
												{getUserInitials()}
											</Avatar>
										</IconButton>
									</Tooltip>
								</Box>
								<Menu
									sx={{ mt: "45px" }}
									id="menu-appbar"
									anchorEl={anchorElUser}
									anchorOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									keepMounted
									transformOrigin={{
										vertical: "top",
										horizontal: "right",
									}}
									open={Boolean(anchorElUser)}
									onClose={handleCloseUserMenu}>
									{user && (
										<MenuItem
											component={Link}
											to="/loyalty"
											sx={{
												backgroundColor: "#f8f4e5",
												borderLeft: "4px solid #e09132",
												padding: "12px 16px",
											}}>
											<LoyaltyIcon sx={{ mr: 1, color: "#e09132" }} />
											<Typography textAlign="center" fontWeight="bold">
												{user.loyalty_points} Points
											</Typography>
										</MenuItem>
									)}
									{userMenuItems.map((item) => (
										<MenuItem
											key={item.title}
											onClick={() => handleUserMenuClick(item.action)}>
											<Typography textAlign="center">{item.title}</Typography>
										</MenuItem>
									))}
								</Menu>
							</>
						) : (
							<Box sx={{ display: "flex" }}>
								<Button
									variant="contained"
									component={Link}
									to="/login"
									sx={{
										mr: 1,
										backgroundColor: "#b85c38",
										"&:hover": { backgroundColor: "#e09132" },
									}}>
									Login
								</Button>
								<Button
									variant="outlined"
									component={Link}
									to="/register"
									sx={{
										color: "white",
										borderColor: "white",
										"&:hover": {
											borderColor: "white",
											backgroundColor: "rgba(255, 255, 255, 0.1)",
										},
									}}>
									Register
								</Button>
							</Box>
						)}
					</Box>
				</Toolbar>
			</Container>
		</AppBar>
	);
};

export default Navbar;
