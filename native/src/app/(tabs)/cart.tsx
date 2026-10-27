import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from "@/context/AuthContext";

export default function CartScreen() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartLoaded,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const { user, loading } = useAuth();

  const isAuthenticated = Boolean(user);

  const handleRemove = (productId: string, name: string) => {
    Alert.alert(
      'Remove Product',
      `Remove "${name}" from your cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(productId),
        },
      ]
    );
  };

  if (!isCartLoaded) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </SafeAreaView>
    );
  }

  const handleCheckout = () => {
    if (cartItems.length === 0 || loading) {
      return;
    }

    if (!isAuthenticated) {
      router.push({
        pathname: "/login",
        params: { redirect: "/checkout" },
      });
      return;
    }

    router.push("/checkout");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        <Text style={styles.itemCount}>
          {cartCount} {cartCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={76} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDescription}>
            Explore our collection and add products to your cart.
          </Text>

          <Pressable
            style={styles.shopButton}
            onPress={() => router.navigate('/explore')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Pressable
            style={styles.clearButton}
            onPress={() =>
              Alert.alert(
                'Clear Cart',
                'Remove all products from your cart?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear Cart',
                    style: 'destructive',
                    onPress: clearCart,
                  },
                ]
              )
            }
          >
            <Text style={styles.clearButtonText}>Clear Cart</Text>
          </Pressable>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.productImage}
                  resizeMode="cover"
                />

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.productPrice}>
                    ₹{item.price.toLocaleString('en-IN')}
                  </Text>

                  <View style={styles.quantityRow}>
                    <Pressable
                      style={styles.quantityButton}
                      onPress={() =>
                        updateQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Ionicons name="remove" size={18} color="#111827" />
                    </Pressable>

                    <Text style={styles.quantityText}>
                      {item.quantity}
                    </Text>

                    <Pressable
                      style={[
                        styles.quantityButton,
                        item.quantity >= item.stock && styles.disabledButton,
                      ]}
                      disabled={item.quantity >= item.stock}
                      onPress={() =>
                        updateQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Ionicons name="add" size={18} color="#111827" />
                    </Pressable>
                  </View>

                  <Text style={styles.subtotal}>
                    Subtotal: ₹
                    {(item.price * item.quantity).toLocaleString('en-IN')}
                  </Text>
                </View>

                <Pressable
                  style={styles.removeButton}
                  onPress={() => handleRemove(item.productId, item.name)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={21}
                    color="#dc2626"
                  />
                </Pressable>
              </View>
            )}
          />

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{cartCount}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total</Text>
              <Text style={styles.totalPrice}>
                ₹{cartTotal.toLocaleString('en-IN')}
              </Text>
            </View>

            <Pressable
              style={[
                styles.checkoutButton,
                cartItems.length === 0 && styles.disabledButton,
              ]}
              onPress={handleCheckout}
              disabled={cartItems.length === 0}
            >
              <Text style={styles.checkoutButtonText}>
                Proceed to Checkout
              </Text>

              <Ionicons
                name="arrow-forward"
                size={20}
                color="#ffffff"
              />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '700',
    color: '#111827',
  },
  itemCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
  },
  emptyDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 23,
  },
  shopButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 24,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  productImage: {
    width: 95,
    height: 115,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.35,
  },
  quantityText: {
    minWidth: 34,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subtotal: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 7,
  },
  removeButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  summary: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 15,
    color: '#111827',
  },
  summaryValueUnused: {
    fontSize: 15,
    color: '#111827',
  },
  totalPrice: {
    fontSize: 23,
    fontWeight: '700',
    color: '#111827',
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  clearButton: {
    alignItems: 'flex-end',
    paddingVertical: 4,
    marginTop: 4,
    marginRight:8
  },
  clearButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
});
