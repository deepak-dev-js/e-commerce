import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCart } from "@/context/CartContext";

type Product = {
  _id: string;
  name: string;
  description?: string;
  image: string;
  price: number;
  category?: string;
  brand?: string;
  stock: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
};

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { cartItems } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error(
            "EXPO_PUBLIC_API_URL is not configured in native/.env",
          );
        }

        const response = await fetch(`${API_URL}/api/products`);
        console.log(response)

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log(data)

        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => {
        router.push({
          pathname: "/product/[id]",
          params: { id: item._id },
        });
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.productImage}
          resizeMode="cover"
        />

        {item.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Featured</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>

        <Text style={styles.productCategory} numberOfLines={1}>
          {item.category || "General"}
          {item.brand ? ` · ${item.brand}` : ""}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#f59e0b" />
          <Text style={styles.ratingText}>
            {item.rating ?? 0} ({item.numReviews ?? 0})
          </Text>
        </View>

        <Text style={styles.price}>₹{item.price}</Text>

        <Text
          style={[
            styles.stockText,
            item.stock > 0 ? styles.inStock : styles.outOfStock,
          ]}
        >
          {item.stock > 0 ? "In Stock" : "Out of Stock"}
        </Text>

        <View
          style={[styles.addButton, item.stock <= 0 && styles.disabledButton]}
        >
          <Text style={styles.addButtonText}>
            {item.stock > 0 ? "View Product" : "Unavailable"}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>
            Apna<Text style={styles.logoHighlight}>Shop</Text>
          </Text>

          <View style={styles.headerActions}>
            {/* <Pressable
              style={styles.iconButton}
              accessibilityLabel="Search"
              onPress={() => router.push("/explore")}
            >
              <Ionicons name="search-outline" size={24} color="#111827" />
            </Pressable> */}

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

            <Pressable
              style={styles.iconButton}
              accessibilityLabel="Profile"
              onPress={() => router.push("/profile")}
            >
              <Ionicons name="person-outline" size={24} color="#111827" />
            </Pressable>
          </View>
        </View>

        {/* Products */}
        <View style={styles.collectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Latest Collection</Text>
            <Text style={styles.sectionSubtitle}>
              Discover products you'll love.
            </Text>
          </View>

          <Text style={styles.productCount}>{products.length} items</Text>
        </View>

        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.stateText}>Loading products...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <Ionicons name="cloud-offline-outline" size={42} color="#dc2626" />
            <Text style={styles.errorTitle}>Couldn't load products</Text>
            <Text style={styles.stateText}>{error}</Text>
            <Text style={styles.stateText}>
              Check your connection and try again.
            </Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No products found.</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item._id}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productList}
          />
        )}

        <Text style={styles.footer}>Powered by ApnaShop</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  logo: {
    fontSize: 25,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -1,
  },
  logoHighlight: {
    color: "#2563eb",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconButton: {
    width: 30,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 22,
    borderRadius: 16,
    backgroundColor: "#eff6ff",
  },
  bannerEyebrow: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  bannerTitle: {
    fontSize: 29,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  bannerDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 10,
  },
  bannerButton: {
    alignSelf: "flex-start",
    marginTop: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bannerButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
  },
  collectionHeader: {
    marginHorizontal: 16,
    marginTop: 28,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111827",
  },
  sectionSubtitle: {
    marginTop: 5,
    fontSize: 12,
    color: "#64748b",
  },
  productCount: {
    fontSize: 12,
    color: "#64748b",
  },
  productList: {
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  productRow: {
    justifyContent: "space-between",
  },
  productCard: {
    width: "48.5%",
    marginBottom: 18,
    overflow: "hidden",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    position: "relative",
    backgroundColor: "#f8fafc",
  },
  productImage: {
    width: "100%",
    height: 150,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#dcfce7",
  },
  featuredText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803d",
  },
  productInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  productCategory: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 11,
    color: "#64748b",
  },
  price: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 8,
  },
  stockText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },
  inStock: {
    color: "#16a34a",
  },
  outOfStock: {
    color: "#dc2626",
  },
  addButton: {
    marginTop: 10,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  stateContainer: {
    minHeight: 180,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    marginTop: 10,
    textAlign: "center",
    color: "#64748b",
    fontSize: 13,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  footer: {
    marginTop: 20,
    marginBottom: 24,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 12,
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -7,
    backgroundColor: "#000",
    minWidth: 12,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  cartBadgeText: { color: "#ffffff", fontSize: 10, fontWeight: "bold" },
  cartButton: {
    width: 42,
    height: 42,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
