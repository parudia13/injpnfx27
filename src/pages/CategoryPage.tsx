import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { useCartAnimation } from '@/hooks/useCartAnimation';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FlyingProductAnimation from '@/components/FlyingProductAnimation';
import { Product } from '@/types';
import { getCategoryIcon } from '@/utils/categoryVariants';

interface CategoryPageProps {
  category: string;
}

const CategoryPage = ({ category }: CategoryPageProps) => {
  const { data: products = [], isLoading, isError } = useProducts();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const {
    animatingProduct,
    startPosition,
    targetPosition,
    isAnimating,
    shouldAnimateCart,
    triggerAnimation,
    resetAnimation
  } = useCartAnimation();

  // Filter products by the specified category
  const categoryProducts = products.filter(product => product.category === category);

  // Enhanced scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [category]);

  const handleAddToCart = (product: Product, position: { x: number; y: number }) => {
    // Get cart icon position (approximate)
    const cartPosition = {
      x: window.innerWidth - 100,
      y: 80
    };
    
    triggerAnimation(product, position, cartPosition);
  };

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 mb-4">{t('common.loadingError')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
          >
            {t('common.refresh')}
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">{t('products.loading')}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header shouldAnimateCart={shouldAnimateCart} />
      
      {/* Flying Product Animation */}
      <FlyingProductAnimation
        product={animatingProduct}
        startPosition={startPosition}
        targetPosition={targetPosition}
        isAnimating={isAnimating}
        onComplete={resetAnimation}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">{getCategoryIcon(category)}</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{category}</h1>
          <p className="text-xl text-gray-600">Temukan produk {category.toLowerCase()} favorit Anda</p>
        </div>

        {/* Products Grid */}
        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6 px-4">
            {categoryProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-6">Belum ada produk dalam kategori ini. Silakan coba kategori lain.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90"
            >
              Lihat Semua Produk
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;