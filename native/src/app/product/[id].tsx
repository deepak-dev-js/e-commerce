import { useCallback, useEffect, useRef, useState } from 'react';
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
    description?: string;
    category?: string;
    rating?: number;
    numReviews?: number;

    options?: {
        name: string;
        values: string[];
    }[];

    variants?: {
        _id: string;
        sku: string;
        price: number;
        stock: number;
        images: string[];
        attributes: Record<string, string>;
    }[];
};

export default function ProductScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();



    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >({});

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageTouchStartX = useRef<number | null>(null);

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

    const selectedVariant = product?.variants?.find((variant) =>
        (product.options ?? []).every(
            (option) =>
                variant.attributes?.[option.name] ===
                selectedAttributes[option.name]
        )
    );

    const variantImages = selectedVariant?.images ?? [];

    const selectedImage =
        variantImages[currentImageIndex] ?? variantImages[0];

    const isAdded = cartItems.some(
        (item) =>
            item.productId === product?._id &&
            item.variantId === selectedVariant?._id
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

                const fetchedProduct: Product = data.product ?? data;

                setProduct(fetchedProduct);

                const defaultAttributes: Record<string, string> = {};

                (fetchedProduct.options ?? []).forEach((option) => {
                    const firstAvailableVariant = fetchedProduct.variants?.find(
                        (variant) =>
                            variant.stock > 0 &&
                            option.values.includes(variant.attributes?.[option.name])
                    );

                    defaultAttributes[option.name] =
                        firstAvailableVariant?.attributes?.[option.name] ??
                        option.values[0] ??
                        '';
                });

                setSelectedAttributes(defaultAttributes);
                setCurrentImageIndex(0);
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

                <View
                    style={styles.imageContainer}
                    onTouchStart={(event) => {
                        imageTouchStartX.current = event.nativeEvent.pageX;
                    }}
                    onTouchEnd={(event) => {
                        const startX = imageTouchStartX.current;
                        const endX = event.nativeEvent.pageX;
                        if (startX === null) return;
                        const difference = startX - endX;

                        if (Math.abs(difference) < 50) return;

                        if (difference > 0 && currentImageIndex < variantImages.length - 1) {
                            setCurrentImageIndex((index) => index + 1);
                        } else if (difference < 0 && currentImageIndex > 0) {
                            setCurrentImageIndex((index) => index - 1);
                        }
                    }}
                >
                    {selectedImage ? (
                        <Image
                            source={{ uri: selectedImage }}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons
                                name="image-outline"
                                size={48}
                                color="#9ca3af"
                            />
                            <Text style={styles.statusText}>No image available</Text>
                        </View>
                    )}

                    {variantImages.length > 1 && (
                        <View style={styles.imagePagination}>
                            {variantImages.map((_, index) => (
                                <Pressable
                                    key={`${selectedVariant?._id}-${index}`}
                                    onPress={() => setCurrentImageIndex(index)}
                                    style={[
                                        styles.imageDot,
                                        currentImageIndex === index &&
                                        styles.activeImageDot,
                                    ]}
                                />
                            ))}
                        </View>
                    )}

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

                    {(product.options ?? []).map((option) => (
                        <View key={option.name} style={styles.optionContainer}>
                            <Text style={styles.optionTitle}>
                                {option.name}: {selectedAttributes[option.name] ?? ''}
                            </Text>

                            <View style={styles.optionValues}>
                                {option.values.map((value) => {
                                    const isSelected =
                                        selectedAttributes[option.name] === value;

                                    return (
                                        <Pressable
                                            key={value}
                                            onPress={() => {
                                                setSelectedAttributes((previous) => ({
                                                    ...previous,
                                                    [option.name]: value,
                                                }));
                                                setCurrentImageIndex(0);
                                            }}
                                            style={[
                                                styles.optionButton,
                                                isSelected && styles.selectedOptionButton,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.optionButtonText,
                                                    isSelected &&
                                                    styles.selectedOptionButtonText,
                                                ]}
                                            >
                                                {value}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>
                    ))}

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
                        {selectedVariant
                            ? `₹${selectedVariant.price.toLocaleString('en-IN')}`
                            : 'Variant unavailable'}
                    </Text>

                    <View style={styles.stockRow}>
                        <View
                            style={[
                                styles.stockDot,
                                {
                                    backgroundColor:
                                        selectedVariant && selectedVariant.stock > 0
                                            ? '#16a34a'
                                            : '#dc2626',
                                },
                            ]}
                        />

                        <Text
                            style={[
                                styles.stockText,
                                {
                                    color:
                                        selectedVariant && selectedVariant.stock > 0
                                            ? '#15803d'
                                            : '#dc2626',
                                },
                            ]}
                        >
                            {selectedVariant
                                ? selectedVariant.stock > 0
                                    ? `In Stock (${selectedVariant.stock} available)`
                                    : 'Out of Stock'
                                : 'This combination is unavailable'}
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
                            (!selectedVariant || selectedVariant.stock <= 0) &&
                            styles.disabledButton,
                        ]}
                        disabled={!selectedVariant || selectedVariant.stock <= 0}
                        onPress={() => {
                            if (!selectedVariant) return;

                            addToCart({
                                productId: product._id,
                                variantId: selectedVariant._id,
                                name: product.name,
                                sku: selectedVariant.sku,
                                price: selectedVariant.price,
                                image: selectedVariant.images[0] || '',
                                images: selectedVariant.images,
                                attributes: selectedVariant.attributes,
                                stock: selectedVariant.stock,
                            });
                        }}
                    >
                        <Ionicons
                            name={isAdded ? "checkmark-circle-outline" : "cart-outline"}
                            size={20}
                            color="#ffffff"
                        />

                        <Text style={styles.primaryButtonText}>
                            {(selectedVariant?.stock ?? 0) <= 0
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
    imagePlaceholder: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },

    imagePagination: {
        position: 'absolute',
        bottom: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },

    imageDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#d1d5db',
    },

    activeImageDot: {
        width: 20,
        backgroundColor: '#2563eb',
    },

    optionContainer: {
        marginTop: 18,
    },

    optionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 10,
    },

    optionValues: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },

    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },

    selectedOptionButton: {
        borderColor: '#2563eb',
        backgroundColor: '#eff6ff',
    },

    optionButtonText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '500',
    },

    selectedOptionButtonText: {
        color: '#2563eb',
        fontWeight: '700',
    },
});
