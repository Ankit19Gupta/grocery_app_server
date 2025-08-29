import { getAllCategory } from "../controllers/product/category.js";
import { getAllProductByCategoryId } from "../controllers/product/product.js";

export const categoryRoutes = async (fastify, options) => {
  fastify.get("/categories", getAllCategory);
};

export const productRoutes = async (fastify, options) => {
  fastify.get("/product/:categoryId", getAllProductByCategoryId);
};
