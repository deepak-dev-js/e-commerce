import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

const CART_STORAGE_KEY = '@apnashop_cart';

export type CartItem = {
    productId: string;
    variantId: string;
    name: string;
    sku: string;
    price: number;
    image: string;
    images: string[];
    attributes: Record<string, string>;
    quantity: number;
    stock: number;
};

type CartContextType = {
    cartItems: CartItem[];
    cartCount: number;
    cartTotal: number;
    isCartLoaded: boolean;
    isInCart: (productId: string, variantId: string) => boolean;
    addToCart: (product: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (productId: string, variantId: string) => void;
    updateQuantity: (
        productId: string,
        variantId: string,
        quantity: number
    ) => void;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartLoaded, setIsCartLoaded] = useState(false);

    useEffect(() => {
        const loadCart = async () => {
            try {
                const savedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);

                if (savedCart) {
                    const parsedCart: unknown = JSON.parse(savedCart);

                    if (Array.isArray(parsedCart)) {
                        setCartItems(parsedCart as CartItem[]);
                    }
                }
            } catch (error) {
                console.error('Failed to load cart:', error);
            } finally {
                setIsCartLoaded(true);
            }
        };

        loadCart();
    }, []);

    useEffect(() => {
        if (!isCartLoaded) return;

        const saveCart = async () => {
            try {
                await AsyncStorage.setItem(
                    CART_STORAGE_KEY,
                    JSON.stringify(cartItems)
                );
            } catch (error) {
                console.error('Failed to save cart:', error);
            }
        };

        saveCart();
    }, [cartItems, isCartLoaded]);

    const isInCart = useCallback(
        (productId: string, variantId: string) =>
            cartItems.some(
                (item) =>
                    item.productId === productId &&
                    item.variantId === variantId
            ),
        [cartItems]
    );

    const addToCart = useCallback(
        (product: Omit<CartItem, 'quantity'>) => {
            setCartItems((currentItems) => {
                const existingItem = currentItems.find(
                    (item) =>
                        item.productId === product.productId &&
                        item.variantId === product.variantId
                );

                if (existingItem) {
                    if (existingItem.quantity >= product.stock) {
                        return currentItems;
                    }

                    return currentItems.map((item) =>
                        item.productId === product.productId &&
                            item.variantId === product.variantId
                            ? {
                                ...item,
                                quantity: Math.min(
                                    item.quantity + 1,
                                    product.stock
                                ),
                            }
                            : item
                    );
                }

                if (product.stock <= 0) {
                    return currentItems;
                }

                return [...currentItems, { ...product, quantity: 1 }];
            });
        },
        []
    );

   const removeFromCart = useCallback(
    (productId: string, variantId: string) => {
        setCartItems((items) =>
            items.filter(
                (item) =>
                    item.productId !== productId ||
                    item.variantId !== variantId
            )
        );
    },
    []
);

  const updateQuantity = useCallback(
    (productId: string, variantId: string, quantity: number) => {
        setCartItems((items) =>
            items.flatMap((item) => {
                if (
                    item.productId !== productId ||
                    item.variantId !== variantId
                ) {
                    return [item];
                }

                if (quantity <= 0) {
                    return [];
                }

                return [
                    {
                        ...item,
                        quantity: Math.min(quantity, item.stock),
                    },
                ];
            })
        );
    },
    []
);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                cartItems,
                cartCount,
                cartTotal,
                isCartLoaded,
                isInCart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }

    return context;
}
