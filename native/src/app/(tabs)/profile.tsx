import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const Profile = () => {
    const { user, loading, logout } = useAuth();

    if (loading) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <View style={styles.emptyIcon}>
                    <Ionicons
                        name="person-outline"
                        size={42}
                        color="#9CA3AF"
                    />
                </View>

                <Text style={styles.errorTitle}>
                    Welcome to ApnaShop
                </Text>

                <Text style={styles.errorText}>
                    Login to view your profile, track orders, and manage
                    your account.
                </Text>

                <Pressable
                    style={styles.retryButton}
                    onPress={() => router.push('/(auth)/login')}
                >
                    <Text style={styles.retryButtonText}>Login</Text>
                </Pressable>

                <Pressable
                    style={styles.createAccountButton}
                    onPress={() => router.push('/(auth)/register')}
                >
                    <Text style={styles.createAccountButtonText}>
                        Create Account
                    </Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    const fullName = user.name || 'User';

    const initials = fullName
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Page Heading */}
                <View style={styles.pageHeading}>
                    <Text style={styles.pageTitle}>My Profile</Text>

                    <Text style={styles.pageSubtitle}>
                        Manage your ApnaShop account information.
                    </Text>
                </View>

                {/* Profile Header */}
                <View style={styles.card}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {initials}
                            </Text>
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {fullName}
                            </Text>

                            <Text style={styles.profileEmail}>
                                {user.email}
                            </Text>

                            <View style={styles.memberBadge}>
                                <View style={styles.memberDot} />

                                <Text style={styles.memberBadgeText}>
                                    ApnaShop Member
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Account Information */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>
                        Account Information
                    </Text>

                    <View style={styles.detailRow}>
                        <View style={styles.detailIcon}>
                            <Ionicons
                                name="person-outline"
                                size={21}
                                color="#4B5563"
                            />
                        </View>

                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>
                                Full Name
                            </Text>

                            <Text style={styles.detailValue}>
                                {fullName}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.detailRow, styles.lastDetailRow]}>
                        <View style={styles.detailIcon}>
                            <Ionicons
                                name="mail-outline"
                                size={21}
                                color="#4B5563"
                            />
                        </View>

                        <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>
                                Email Address
                            </Text>

                            <Text style={styles.detailValue}>
                                {user.email}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Links */}
                <Text style={styles.quickLinksTitle}>
                    Quick Links
                </Text>

                <Pressable
                    style={({ pressed }) => [
                        styles.quickLinkCard,
                        pressed && styles.pressedCard,
                    ]}
                    onPress={() => router.push('/my-orders' as never)}
                >
                    <View style={styles.quickLinkIcon}>
                        <Ionicons
                            name="cube-outline"
                            size={25}
                            color="#374151"
                        />
                    </View>

                    <View style={styles.quickLinkContent}>
                        <Text style={styles.quickLinkTitle}>
                            My Orders
                        </Text>

                        <Text style={styles.quickLinkSubtitle}>
                            View your order history.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={21}
                        color="#9CA3AF"
                    />
                </Pressable>

                <Pressable
                    style={({ pressed }) => [
                        styles.quickLinkCard,
                        pressed && styles.pressedCard,
                    ]}
                    onPress={() => router.replace('/')}
                >
                    <View style={styles.quickLinkIcon}>
                        <Ionicons
                            name="storefront-outline"
                            size={25}
                            color="#374151"
                        />
                    </View>

                    <View style={styles.quickLinkContent}>
                        <Text style={styles.quickLinkTitle}>
                            Continue Shopping
                        </Text>

                        <Text style={styles.quickLinkSubtitle}>
                            Explore products on ApnaShop.
                        </Text>
                    </View>

                    <Ionicons
                        name="chevron-forward"
                        size={21}
                        color="#9CA3AF"
                    />
                </Pressable>

                {/* Logout */}
                <Pressable
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed && styles.pressedCard,
                    ]}
                    onPress={handleLogout}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={22}
                        color="#DC2626"
                    />

                    <Text style={styles.logoutButtonText}>
                        Logout
                    </Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContent: {
        paddingHorizontal: 18,
        paddingTop: 18,
        paddingBottom: 35,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
    },
    errorTitle: {
        fontSize: 23,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22,
    },
    retryButton: {
        marginTop: 24,
        width: '100%',
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
    createAccountButton: {
        marginTop: 12,
        width: '100%',
        paddingVertical: 13,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#2563EB',
        alignItems: 'center',
    },
    createAccountButtonText: {
        color: '#2563EB',
        fontSize: 15,
        fontWeight: '600',
    },
    pageHeading: {
        marginBottom: 22,
    },
    pageTitle: {
        fontSize: 29,
        fontWeight: '800',
        color: '#111827',
        letterSpacing: -0.6,
    },
    pageSubtitle: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 7,
        lineHeight: 20,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        padding: 19,
        marginBottom: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.035,
        shadowRadius: 8,
        elevation: 2,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    avatar: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 25,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    profileEmail: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 5,
    },
    memberBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#F0FDF4',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginTop: 10,
    },
    memberDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#16A34A',
        marginRight: 6,
    },
    memberBadgeText: {
        color: '#15803D',
        fontSize: 11,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        gap: 13,
    },
    lastDetailRow: {
        borderBottomWidth: 0,
        paddingBottom: 0,
    },
    detailIcon: {
        width: 43,
        height: 43,
        borderRadius: 11,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailContent: {
        flex: 1,
        paddingTop: 2,
    },
    detailLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    detailValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '600',
        marginTop: 5,
        lineHeight: 21,
    },
    quickLinksTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
        marginBottom: 13,
    },
    quickLinkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        gap: 13,
    },
    pressedCard: {
        backgroundColor: '#F3F4F6',
    },
    quickLinkIcon: {
        width: 49,
        height: 49,
        borderRadius: 13,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quickLinkContent: {
        flex: 1,
    },
    quickLinkTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },
    quickLinkSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 5,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 14,
        paddingVertical: 15,
        marginTop: 12,
    },
    logoutButtonText: {
        color: '#DC2626',
        fontSize: 15,
        fontWeight: '700',
    },
});