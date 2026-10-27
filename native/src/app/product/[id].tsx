import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';
import { useWishlist } from '@/context/WishlistContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Product = {
    _id: string;
    name: string;
    image: string;
    price: number;
    description?: string;
    category?: string;
    stock?: number;
    rating?: number;
    numReviews?: number;
};

export default function ProductScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();



    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const { cartItems, addToCart } = useCart();
    const { user } = useAuth();

    const {
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
    } = useWishlist();

    const [wishlistLoading, setWishlistLoading] = useState(false);

    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');



    const hideToast = useCallback(() => {
        setToastVisible(false);
    }, []);

    const showToast = useCallback((message: string) => {
        setToastMessage(message);
        setToastVisible(true);
    }, []);

    const isWishlisted = product
        ? isInWishlist(product._id)
        : false;

    const isAdded = cartItems.some(
        (item) => item.productId === product?._id
    );

    const handleWishlist = async (productId: string) => {
        if (!user) {
            router.push({
                pathname: '/(auth)/login',
                params: {
                    redirect: `/product/${productId}`,
                    wishlistProductId: productId,
                },
            });

            return;
        }

        if (wishlistLoading) return;

        const wasWishlisted = isInWishlist(productId);

        setWishlistLoading(true);

        try {
            if (wasWishlisted) {
                await removeFromWishlist(productId);
                showToast('Removed from wishlist');
            } else {
                await addToWishlist(productId);
                showToast('Added to wishlist');
            }
        } catch (err) {
            console.error('Wishlist update failed:', err);

            showToast(
                err instanceof Error
                    ? err.message
                    : 'Could not update wishlist'
            );
        } finally {
            setWishlistLoading(false);
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                if (!API_URL || !id) {
                    throw new Error('Product configuration is missing.');
                }

                const response = await fetch(`${API_URL}/api/products/${id}`);

                if (!response.ok) {
                    throw new Error('Unable to load product details.');
                }

                const data = await response.json();

                setProduct(data.product ?? data);
            } catch (err) {
                console.error('Fetch product failed:', err);
                setError(
                    err instanceof Error ? err.message : 'Something went wrong.'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={styles.center}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.statusText}>Loading product...</Text>
            </SafeAreaView>
        );
    }

    if (error || !product) {
        return (
            <SafeAreaView style={styles.center}>
                <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
                <Text style={styles.errorText}>{error || 'Product not found.'}</Text>

                <Pressable style={styles.primaryButton} onPress={() => router.back()}>
                    <Text style={styles.primaryButtonText}>Go Back</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#111827" />
                    </Pressable>



                    <Text style={styles.headerTitle}>Product Details</Text>
                    <Pressable
                        onPress={() => router.push('/cart')}
                        style={styles.cartButton}
                    >
                        <Ionicons name="cart-outline" size={25} color="#111827" />

                        {cartItems.length > 0 && (
                            <View style={styles.cartBadge}>
                                <Text style={styles.cartBadgeText}>
                                    {cartItems.length}
                                </Text>
                            </View>
                        )}
                    </Pressable>

                </View>

                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="contain"
                    />

                    {/* Wishlist Heart */}
                    <Pressable
                        style={styles.wishlistButton}
                        disabled={wishlistLoading}
                        onPress={() => handleWishlist(product._id)}
                    >
                        <Ionicons
                            name={isWishlisted ? 'heart' : 'heart-outline'}
                            size={22}
                            color={isWishlisted ? '#dc2626' : '#374151'}
                        />
                    </Pressable>

                </View>

                <View style={styles.details}>
                    <Text style={styles.category}>
                        {product.category || 'General'}
                    </Text>

                    <Text style={styles.productName}>{product.name}</Text>

                    <View style={styles.ratingRow}>
                        <Ionicons name="star" size={18} color="#f59e0b" />
                        <Text style={styles.rating}>
                            {product.rating ?? 0}
                        </Text>
                        <Text style={styles.reviews}>
                            ({product.numReviews ?? 0} reviews)
                        </Text>
                    </View>

                    <Text style={styles.price}>
                        ₹{Number(product.price).toLocaleString('en-IN')}
                    </Text>

                    <View style={styles.stockRow}>
                        <View
                            style={[
                                styles.stockDot,
                                { backgroundColor: (product.stock ?? 0) > 0 ? '#16a34a' : '#dc2626' },
                            ]}
                        />
                        <Text
                            style={[
                                styles.stockText,
                                { color: (product.stock ?? 0) > 0 ? '#15803d' : '#dc2626' },
                            ]}
                        >
                            {(product.stock ?? 0) > 0
                                ? `In Stock (${product.stock} available)`
                                : 'Out of Stock'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>
                        {product.description || 'No description available for this product.'}
                    </Text>
                    <Pressable
                        style={[
                            styles.primaryButton,
                            (product.stock ?? 0) <= 0 && styles.disabledButton,
                        ]}
                        disabled={(product.stock ?? 0) <= 0}
                        onPress={() => {
                            addToCart({
                                productId: product._id,
                                name: product.name,
                                price: product.price,
                                image: product.image,
                                stock: product.stock ?? 0,
                            });
                        }}
                    >
                        <Ionicons
                            name={isAdded ? "checkmark-circle-outline" : "cart-outline"}
                            size={20}
                            color="#ffffff"
                        />

                        <Text style={styles.primaryButtonText}>
                            {(product.stock ?? 0) <= 0
                                ? 'Out of Stock'
                                : isAdded
                                    ? 'Added'
                                    : 'Add to Cart'}
                        </Text>
                    </Pressable>


                </View>
            </ScrollView>

            <Toast
                visible={toastVisible}
                message={toastMessage}
                onHide={hideToast}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#ffffff',
    },
    statusText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    errorText: {
        marginTop: 12,
        marginBottom: 20,
        fontSize: 16,
        color: '#dc2626',
        textAlign: 'center',
    },
    header: {
        height: 60,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        width: 42,
        height: 42,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    cartButton: {
        width: 42,
        height: 42,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    imageContainer: {
        height: 320,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    productImage: {
        width: '90%',
        height: '90%',
    },
    featuredBadge: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: '#2563eb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    featuredText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '700',
    },
    details: {
        padding: 20,
    },
    category: {
        fontSize: 13,
        color: '#6b7280',
        textTransform: 'capitalize',
    },
    productName: {
        marginTop: 8,
        fontSize: 25,
        fontWeight: '800',
        color: '#111827',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 6,
    },
    rating: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    reviews: {
        fontSize: 13,
        color: '#6b7280',
    },
    price: {
        marginTop: 18,
        fontSize: 28,
        fontWeight: '800',
        color: '#2563eb',
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    stockDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 22,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },
    description: {
        marginTop: 10,
        fontSize: 15,
        lineHeight: 24,
        color: '#4b5563',
    },
    primaryButton: {
        minHeight: 52,
        marginTop: 24,
        borderRadius: 12,
        backgroundColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    primaryButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        backgroundColor: '#9ca3af',
    },
    cartBadge: {
        position: 'absolute',
        top: -5,
        right: -7,
        backgroundColor: '#000',
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        borderWidth: 1,
        borderColor: '#ffffff',
    },

    cartBadgeText: {
        color: '#ffffff',
        fontSize: 10,
        fontWeight: 'bold',
    },

    wishlistButton: {
        position: "absolute",
        top: 8,
        right: 8,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },
});
