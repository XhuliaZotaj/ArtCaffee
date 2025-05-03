// CSV Utility functions for saving and loading data

/**
 * Converts an array of objects to CSV string
 */
export const objectsToCSV = (data: any[]): string => {
	if (data.length === 0) return "";

	// Get headers from the first object
	const headers = Object.keys(data[0]);

	// Create CSV header row
	const headerRow = headers.join(",");

	// Create rows for each object
	const rows = data.map((obj) => {
		return headers
			.map((header) => {
				// Handle nested objects by stringifying them
				const value =
					typeof obj[header] === "object" && obj[header] !== null
						? JSON.stringify(obj[header]).replace(/"/g, '""') // Escape double quotes
						: obj[header];

				// Quote strings that contain commas or quotes
				return typeof value === "string"
					? `"${value.replace(/"/g, '""')}"`
					: value;
			})
			.join(",");
	});

	// Combine header and rows
	return [headerRow, ...rows].join("\n");
};

/**
 * Converts CSV string to array of objects
 */
export const csvToObjects = (csv: string): any[] => {
	if (!csv || csv.trim() === "") return [];

	// Split CSV into rows
	const rows = csv.split("\n");
	if (rows.length < 2) return []; // Need at least header row and one data row

	// Get headers from first row
	const headers = rows[0].split(",");

	// Parse each data row
	return rows
		.slice(1)
		.map((row) => {
			// Handle quoted values with commas
			const values: string[] = [];
			let inQuote = false;
			let currentValue = "";

			for (let i = 0; i < row.length; i++) {
				const char = row[i];

				if (char === '"' && (i === 0 || row[i - 1] !== "\\")) {
					inQuote = !inQuote;
				} else if (char === "," && !inQuote) {
					values.push(currentValue);
					currentValue = "";
				} else {
					currentValue += char;
				}
			}

			values.push(currentValue); // Add the last value

			// Create object from headers and values
			const obj: any = {};
			headers.forEach((header, index) => {
				let value = values[index] || "";

				// Remove surrounding quotes if present
				if (value.startsWith('"') && value.endsWith('"')) {
					value = value.substring(1, value.length - 1).replace(/""/g, '"');
				}

				// Try to parse JSON for nested objects
				if (value.startsWith("{") || value.startsWith("[")) {
					try {
						obj[header] = JSON.parse(value);
					} catch (e) {
						obj[header] = value;
					}
				} else if (value === "true") {
					obj[header] = true;
				} else if (value === "false") {
					obj[header] = false;
				} else if (!isNaN(Number(value)) && value !== "") {
					obj[header] = Number(value);
				} else {
					obj[header] = value;
				}
			});

			return obj;
		})
		.filter((obj) => Object.keys(obj).length > 0); // Filter out empty rows
};

/**
 * Save data to a CSV file
 */
export const saveToCSV = (data: any[], filename: string): void => {
	const csvContent = objectsToCSV(data);
	const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);

	// Create a hidden download link
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	link.style.display = "none";

	// Add to document, trigger download, and clean up
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Release the URL object
	setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Trigger a file selection dialog to load a CSV file
 * Returns a promise that resolves with the parsed data
 */
export const loadFromCSV = async (accept = ".csv"): Promise<any[]> => {
	return new Promise((resolve, reject) => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = accept;
		input.style.display = "none";

		input.onchange = (event) => {
			const file = (event.target as HTMLInputElement).files?.[0];
			if (!file) {
				reject(new Error("No file selected"));
				return;
			}

			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const csv = e.target?.result as string;
					const data = csvToObjects(csv);
					resolve(data);
				} catch (err) {
					reject(err);
				}
			};

			reader.onerror = () => {
				reject(new Error("Failed to read file"));
			};

			reader.readAsText(file);
		};

		document.body.appendChild(input);
		input.click();
		document.body.removeChild(input);
	});
};

// For demo purposes, also provide methods that use localStorage as fallback
// This ensures the app still works when user doesn't interact with file dialogs

export const saveToCSVWithLocalStorageFallback = (
	data: any[],
	filename: string,
	storageKey: string
): void => {
	// Save to localStorage as fallback
	localStorage.setItem(storageKey, JSON.stringify(data));

	// Also trigger CSV download
	saveToCSV(data, filename);
};

export const getDataWithLocalStorageFallback = (
	storageKey: string,
	defaultData: any[] = []
): any[] => {
	const storedData = localStorage.getItem(storageKey);
	return storedData ? JSON.parse(storedData) : defaultData;
};
