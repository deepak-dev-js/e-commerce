import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getWishlist, removeFromWishlist } from "@/services/wishlistService";
import { useCart } from "@/context/CartContext";

type Product = {
  _id: string;
  name: string;
  price: number;
  category?: string;
  image?: string;
  images?: string[];
  imageUrl?: string;
  stock?: number;
};

const Wishlist = () => {
  const router = useRouter();
  const { addToCart, isInCart, cartItems } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<string[]>([]);

  const fetchWishlist = async () => {
    try {
      const response = await getWishlist();

      const wishlistProducts = Array.isArray(response)
        ? response
        : (response as { wishlist?: Product[]; products?: Product[] } | null | undefined)
            ?.wishlist ||
          (response as { wishlist?: Product[]; products?: Product[] } | null | undefined)
            ?.products ||
          [];

      setProducts(wishlistProducts);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      Alert.alert("Error", "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchWishlist();
    }, [])
  );

  const handleAddToCart = (product: Product) => {
    if (isInCart(product._id)) {
      router.push("/cart");
      return;
    }

    addToCart({
      ...product,
      productId: product._id,
      image: product.image ?? product.imageUrl ?? product.images?.[0] ?? "",
      stock: product.stock ?? 0,
    });
    Alert.alert("Success", "Product added to cart.");
  };

  const handleRemove = (productId: string) => {
    Alert.alert(
      "Remove from Wishlist",
      "Are you sure you want to remove this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            if (removingIds.includes(productId)) return;

            const previousProducts = products;

            // Update the UI immediately.
            setProducts((current) =>
              current.filter((product) => product._id !== productId)
            );

            setRemovingIds((current) => [...current, productId]);

            try {
              await removeFromWishlist(productId);
            } catch (error) {
              console.error("Failed to remove wishlist product:", error);

              setProducts(previousProducts);
              Alert.alert(
                "Error",
                "Could not remove the product. Please try again."
              );
            } finally {
              setRemovingIds((current) =>
                current.filter((id) => id !== productId)
              );
            }
          },
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const imageUri =
      item.image || item.images?.[0] || item.imageUrl;

    return (
      <View style={styles.card}>
        <Pressable
          style={styles.imageContainer}
          onPress={() =>
            router.push(`/product/${item._id}` as any)
          }
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={36}
                color="#9CA3AF"
              />
            </View>
          )}

          <Pressable
            style={styles.removeButton}
            onPress={() => handleRemove(item._id)}
            disabled={removingIds.includes(item._id)}
            accessibilityLabel="Remove from wishlist"
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#EF4444"
            />
          </Pressable>
        </Pressable>

        <View style={styles.cardContent}>
          <Pressable
            onPress={() =>
              router.push(`/product/${item._id}` as any)
            }
          >
            <Text style={styles.productName} numberOfLines={1}>
              {item.name}
            </Text>
          </Pressable>

          <Text style={styles.category} numberOfLines={1}>
            {item.category || "General"}
          </Text>

          <Text style={styles.price}>
            ₹{Number(item.price || 0).toLocaleString("en-IN")}
          </Text>

          <Pressable
            style={[
              styles.addButton,
              isInCart(item._id) && styles.addedButton,
            ]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons
              name={
                isInCart(item._id)
                  ? "checkmark-circle-outline"
                  : "cart-outline"
              }
              size={18}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              {isInCart(item._id) ? "Go to Cart" : "Add to Cart"}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>
          Loading your wishlist...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color="#111827"
          />
        </Pressable>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>My Wishlist</Text>
          <Text style={styles.subtitle}>
            {products.length}{" "}
            {products.length === 1 ? "product" : "products"} saved
          </Text>
        </View>

        <Ionicons name="heart" size={25} color="#EF4444" />
      </View>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="heart-outline"
              size={42}
              color="#9CA3AF"
            />
          </View>

          <Text style={styles.emptyTitle}>
            Your wishlist is empty
          </Text>

          <Text style={styles.emptyDescription}>
            Save your favourite products by tapping the heart icon.
            They will appear here.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.primaryButtonText}>
              Continue Shopping
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.bottomActions}>
            <Pressable
              style={styles.continueButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Ionicons
                name="arrow-back"
                size={18}
                color="#374151"
              />
              <Text style={styles.continueButtonText}>
                Continue Shopping
              </Text>
            </Pressable>

            {cartItems.length > 0 && (
              <Pressable
                style={styles.cartButton}
                onPress={() => router.push("/cart")}
              >
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.cartButtonText}>
                  Go to Cart ({cartItems.length})
                </Text>
              </Pressable>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

export default Wishlist;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#6B7280",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    height: 155,
    position: "relative",
    backgroundColor: "#F9FAFB",
  },
  productImage: {
    width: "100%",
    height: "100%",
    padding: 8,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  cardContent: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
  },
  category: {
    marginTop: 4,
    fontSize: 12,
    color: "#6B7280",
  },
  price: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  addButton: {
    marginTop: 12,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#111827",
    paddingHorizontal: 6,
  },
  addedButton: {
    backgroundColor: "#374151",
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 42,
    backgroundColor: "#F3F4F6",
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 21,
    fontWeight: "700",
    color: "#1F2937",
  },
  emptyDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#6B7280",
  },
  primaryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 9,
    backgroundColor: "#EF4444",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  bottomActions: {
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  continueButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  cartButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 9,
    backgroundColor: "#111827",
  },
  cartButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});