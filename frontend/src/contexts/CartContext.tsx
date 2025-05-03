import React, {
	createContext,
	useState,
	useContext,
	useEffect,
	ReactNode,
} from "react";

interface Product {
	id: number;
	name: string;
	price: number;
	image_url: string;
	category: string;
}

export interface CartItem {
	id?: string; // local ID for cart management
	product_id: number;
	quantity: number;
	customizations: { [key: string]: string };
	notes: string;
	product?: Product;
	total_price?: number;
}

interface CartContextType {
	cartItems: CartItem[];
	cartCount: number;
	addToCart: (item: CartItem) => void;
	removeFromCart: (itemId: string) => void;
	updateQuantity: (itemId: string, change: number) => void;
	clearCart: () => void;
	subtotal: number;
	total: number;
	usePoints: boolean;
	setUsePoints: (use: boolean) => void;
	pointsDiscount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
	children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
	const [cartItems, setCartItems] = useState<CartItem[]>([]);
	const [cartCount, setCartCount] = useState<number>(0);
	const [subtotal, setSubtotal] = useState<number>(0);
	const [total, setTotal] = useState<number>(0);
	const [usePoints, setUsePoints] = useState<boolean>(false);
	const [pointsDiscount, setPointsDiscount] = useState<number>(0);

	// Load cart from localStorage on initial render
	useEffect(() => {
		try {
			const savedCartItems = JSON.parse(
				localStorage.getItem("cartItems") || "[]"
			);
			setCartItems(
				savedCartItems.map((item: CartItem, index: number) => ({
					...item,
					id: `cart-item-${index}`,
				}))
			);
		} catch (error) {
			console.error("Error loading cart from localStorage:", error);
		}
	}, []);

	// Update cart count whenever cart items change
	useEffect(() => {
		setCartCount(cartItems.reduce((total, item) => total + item.quantity, 0));

		// Calculate subtotal
		const newSubtotal = cartItems.reduce(
			(sum, item) => sum + (item.product?.price || 0) * item.quantity,
			0
		);
		setSubtotal(newSubtotal);

		// Update localStorage when cart changes
		const simplifiedItems = cartItems.map((item) => ({
			product_id: item.product_id,
			quantity: item.quantity,
			customizations: item.customizations,
			notes: item.notes,
		}));
		localStorage.setItem("cartItems", JSON.stringify(simplifiedItems));
	}, [cartItems]);

	// Calculate total and points discount
	useEffect(() => {
		// Calculate points discount if applicable
		const userStr = localStorage.getItem("user");
		let discount = 0;

		if (usePoints && userStr) {
			try {
				const user = JSON.parse(userStr);
				// Simple conversion: 10 points = $1 off (max: subtotal)
				const maxPointsToUse = Math.min(
					user.loyalty_points || 0,
					Math.floor(subtotal * 10)
				);
				discount = maxPointsToUse / 10;
			} catch (error) {
				console.error("Error parsing user data:", error);
			}
		}

		setPointsDiscount(discount);
		setTotal(Math.max(0, subtotal - discount));
	}, [subtotal, usePoints]);

	const addToCart = (item: CartItem) => {
		setCartItems((prevItems) => {
			// Check if the same product with the same customizations already exists
			const existingItemIndex = prevItems.findIndex(
				(i) =>
					i.product_id === item.product_id &&
					JSON.stringify(i.customizations) ===
						JSON.stringify(item.customizations)
			);

			if (existingItemIndex >= 0) {
				// Update quantity of existing item
				const updatedItems = [...prevItems];
				updatedItems[existingItemIndex].quantity += item.quantity;
				return updatedItems;
			} else {
				// Add new item
				return [...prevItems, { ...item, id: `cart-item-${Date.now()}` }];
			}
		});
	};

	const removeFromCart = (itemId: string) => {
		setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
	};

	const updateQuantity = (itemId: string, change: number) => {
		setCartItems((prevItems) =>
			prevItems.map((item) => {
				if (item.id === itemId) {
					const newQuantity = Math.max(1, item.quantity + change);
					return {
						...item,
						quantity: newQuantity,
					};
				}
				return item;
			})
		);
	};

	const clearCart = () => {
		setCartItems([]);
		localStorage.removeItem("cartItems");
	};

	return (
		<CartContext.Provider
			value={{
				cartItems,
				cartCount,
				addToCart,
				removeFromCart,
				updateQuantity,
				clearCart,
				subtotal,
				total,
				usePoints,
				setUsePoints,
				pointsDiscount,
			}}>
			{children}
		</CartContext.Provider>
	);
};

export const useCart = (): CartContextType => {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error("useCart must be used within a CartProvider");
	}
	return context;
};
