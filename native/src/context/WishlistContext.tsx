import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  getWishlist,
  addToWishlist as addToWishlistApi,
  removeFromWishlist as removeFromWishlistApi,
  type WishlistProduct,
} from "@/services/wishlistService";

type WishlistContextType = {
  wishlist: WishlistProduct[];
  wishlistCount: number;
  isWishlistLoaded: boolean;
  isInWishlist: (productId: string) => boolean;
  getWishList: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  const getWishList = useCallback(async () => {
    try {
      const products = await getWishlist();
      setWishlist(products);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
      throw error;
    } finally {
      setIsWishlistLoaded(true);
    }
  }, []);

  useEffect(() => {
    getWishList().catch(() => {
      // The user may not be logged in yet.
    });
  }, [getWishList]);

  const isInWishlist = useCallback(
    (productId: string) =>
      wishlist.some((product) => product._id === productId),
    [wishlist],
  );

  const addToWishlist = useCallback(
    async (productId: string) => {
      const alreadyAdded = wishlist.some(
        (product) => product._id === productId,
      );

      if (alreadyAdded) return;

      // Update immediately for a responsive UI.
      const previousWishlist = wishlist;

      // Fetch the product from the API response.
      try {
        const updatedWishlist = await addToWishlistApi(productId);
        setWishlist(updatedWishlist);
      } catch (error) {
        setWishlist(previousWishlist);
        throw error;
      }
    },
    [wishlist],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const previousWishlist = wishlist;

      // Optimistic update: remove immediately.
      setWishlist((current) =>
        current.filter((product) => product._id !== productId),
      );

      try {
        const updatedWishlist = await removeFromWishlistApi(productId);
        setWishlist(updatedWishlist);
      } catch (error) {
        setWishlist(previousWishlist);
        throw error;
      }
    },
    [wishlist],
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        isWishlistLoaded,
        isInWishlist,
        getWishList,
        addToWishlist,
        removeFromWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}