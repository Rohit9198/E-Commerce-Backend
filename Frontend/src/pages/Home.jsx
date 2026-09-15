import React, { useEffect } from "react";
import HeroSlider from "../components/Home/HeroSlider";
import CategoryGrid from "../components/Home/CategoryGrid";
import ProductSlider from "../components/Home/ProductSlider";
import FeatureSection from "../components/Home/FeatureSection";
import NewsletterSection from "../components/Home/NewsletterSection";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../store/slices/productSlice";

const Index = () => {
  const dispatch = useDispatch();
  const { topRatedProducts, newProducts, products } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const displayNewProducts =
    newProducts && newProducts.length > 0
      ? newProducts
      : products && products.length > 0
      ? products.slice(0, 8)
      : [];

  const displayTopRated =
    topRatedProducts && topRatedProducts.length > 0
      ? topRatedProducts
      : [];

  return (
    <div className="min-h-screen">
      <HeroSlider />
      <div className="container mx-auto px-4 pt-20">
        <CategoryGrid />
        {displayNewProducts.length > 0 && (
          <ProductSlider title="New Arrivals" products={displayNewProducts} />
        )}
        {displayTopRated.length > 0 && (
          <ProductSlider
            title="Top Rated Products"
            products={displayTopRated}
          />
        )}
        <FeatureSection />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default Index;
