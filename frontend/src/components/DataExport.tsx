import React, { useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Grid,
	Alert,
	Snackbar,
	Chip,
} from "@mui/material";
import {
	CloudDownload as DownloadIcon,
	CloudUpload as UploadIcon,
	Check as CheckIcon,
	Error as ErrorIcon,
} from "@mui/icons-material";
import {
	saveToCSV,
	loadFromCSV,
	getDataWithLocalStorageFallback,
} from "../utils/csvUtils";
import { useAuth } from "../contexts/AuthContext";

const DataExport: React.FC = () => {
	const { user, getProfile } = useAuth();
	const [open, setOpen] = useState(false);
	const [importSuccess, setImportSuccess] = useState<string | null>(null);
	const [importError, setImportError] = useState<string | null>(null);

	const handleOpenDialog = () => setOpen(true);
	const handleCloseDialog = () => setOpen(false);

	const exportOrders = () => {
		const orders = getDataWithLocalStorageFallback("userOrders", []);
		saveToCSV(orders, "digital-cafe-orders.csv");
	};

	const exportPointHistory = () => {
		const pointHistory = getDataWithLocalStorageFallback("pointHistory", []);
		saveToCSV(pointHistory, "digital-cafe-point-history.csv");
	};

	const exportUserData = () => {
		const userData = user ? [user] : [];
		saveToCSV(userData, "digital-cafe-user-data.csv");
	};

	const exportAllData = () => {
		exportOrders();
		exportPointHistory();
		exportUserData();
	};

	const importOrders = async () => {
		try {
			const data = await loadFromCSV();
			localStorage.setItem("userOrders", JSON.stringify(data));
			setImportSuccess("Orders imported successfully!");
		} catch (error) {
			console.error("Error importing orders:", error);
			setImportError("Failed to import orders. Please check the file format.");
		}
	};

	const importPointHistory = async () => {
		try {
			const data = await loadFromCSV();
			localStorage.setItem("pointHistory", JSON.stringify(data));
			setImportSuccess("Point history imported successfully!");
		} catch (error) {
			console.error("Error importing point history:", error);
			setImportError(
				"Failed to import point history. Please check the file format."
			);
		}
	};

	const importUserData = async () => {
		try {
			const data = await loadFromCSV();
			if (data.length > 0) {
				localStorage.setItem("user", JSON.stringify(data[0]));
				await getProfile(); // Refresh user data in context
				setImportSuccess("User data imported successfully!");
			} else {
				setImportError("No user data found in the file.");
			}
		} catch (error) {
			console.error("Error importing user data:", error);
			setImportError(
				"Failed to import user data. Please check the file format."
			);
		}
	};

	return (
		<>
			<Button
				variant="outlined"
				onClick={handleOpenDialog}
				sx={{
					position: "fixed",
					bottom: 16,
					right: 16,
					zIndex: 1000,
					borderColor: "#5c3d2e",
					color: "#5c3d2e",
					"&:hover": {
						borderColor: "#b85c38",
						backgroundColor: "rgba(92, 61, 46, 0.04)",
					},
				}}>
				CSV Data
			</Button>

			<Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
				<DialogTitle>CSV Data Import/Export</DialogTitle>
				<DialogContent>
					<Box p={2}>
						<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
							Export Data
						</Typography>
						<Typography variant="body2" paragraph>
							Download your data as CSV files for backup or analysis.
						</Typography>

						<Grid container spacing={2} mb={4}>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={exportOrders}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Export Orders
								</Button>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={exportPointHistory}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Export Points History
								</Button>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={exportUserData}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Export User Data
								</Button>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Button
									variant="contained"
									fullWidth
									startIcon={<DownloadIcon />}
									onClick={exportAllData}
									sx={{
										backgroundColor: "#5c3d2e",
										"&:hover": {
											backgroundColor: "#b85c38",
										},
									}}>
									Export All Data
								</Button>
							</Grid>
						</Grid>

						<Typography variant="subtitle1" fontWeight="bold" gutterBottom>
							Import Data
						</Typography>
						<Typography variant="body2" paragraph>
							Import CSV files to restore your data.
						</Typography>

						<Grid container spacing={2}>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<UploadIcon />}
									onClick={importOrders}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Import Orders
								</Button>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<UploadIcon />}
									onClick={importPointHistory}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Import Points History
								</Button>
							</Grid>
							<Grid item xs={12} sm={6}>
								<Button
									variant="outlined"
									fullWidth
									startIcon={<UploadIcon />}
									onClick={importUserData}
									sx={{
										borderColor: "#5c3d2e",
										color: "#5c3d2e",
										"&:hover": {
											borderColor: "#b85c38",
											backgroundColor: "rgba(92, 61, 46, 0.04)",
										},
									}}>
									Import User Data
								</Button>
							</Grid>
						</Grid>

						{importSuccess && (
							<Box mt={3}>
								<Alert
									severity="success"
									icon={<CheckIcon />}
									sx={{ display: "flex", alignItems: "center" }}>
									{importSuccess}
								</Alert>
							</Box>
						)}

						{importError && (
							<Box mt={3}>
								<Alert
									severity="error"
									icon={<ErrorIcon />}
									sx={{ display: "flex", alignItems: "center" }}>
									{importError}
								</Alert>
							</Box>
						)}
					</Box>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseDialog} sx={{ color: "#5c3d2e" }}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default DataExport;
