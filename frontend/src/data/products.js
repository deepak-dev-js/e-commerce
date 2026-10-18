import tshirt from "../assets/images/tshirt.jpg";

const products = [
  {
    id: "p1",
    name: "Men's Casual T-Shirt",
    description: "Comfortable cotton t-shirt for everyday wear.",
    price: 499,
    image: tshirt,
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    bestSeller: true,
  },
  {
    id: "p2",
    name: "Women's Summer Dress",
    description: "Lightweight and stylish summer dress.",
    price: 999,
    image: tshirt,
    category: "Women",
    sizes: ["S", "M", "L"],
    bestSeller: false,
  },
  {
    id: "p3",
    name: "Men's Denim Jeans",
    description: "Classic blue denim jeans for casual wear.",
    price: 1299,
    image: tshirt,
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    bestSeller: true,
  },
];

export default products;