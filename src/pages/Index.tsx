import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useProducts } from '@/hooks/useProducts';
import { useLanguage } from '@/hooks/useLanguage';
import { getCategoriesWithVariants, getCategoryIcon } from '@/utils/categoryVariants';

const Index = () => {
  const { data: products = [], isLoading: productsLoading, isError: productsError } = useProducts();
  const { t } = useLanguage();
  const categories = getCategoriesWithVariants();

  // Enhanced scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const featuredProducts = products.slice(0, 8);

  // Show error state if there's an error
  if (productsError) {
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

  // Show loading only if products are still loading
  if (productsLoading) {
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
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-orange-600 text-white w-full">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Rasa Indonesia 🇮🇩<br />
              <span className="text-yellow-300">di Tanah Sakura 🌸</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed px-4">
              Temukan cita rasa rumah dengan koleksi makanan khas Indonesia terlengkap untuk Anda yang berada di Jepang
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                to="/products"
                className="w-full sm:w-auto bg-white text-red-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg text-center"
              >
                🛒 Belanja Sekarang
              </Link>
              <Link
                to="/how-to-buy"
                className="w-full sm:w-auto border-2 border-white text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-white hover:text-red-600 transition-all duration-200 text-center"
              >
                📋 Cara Pembelian
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Kategori Produk</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Temukan berbagai macam produk makanan Indonesia pilihan terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="bg-white hover:bg-red-50 hover:border-red-200 p-4 sm:p-6 rounded-xl text-center transition-all duration-200 transform hover:scale-105 border border-gray-100 shadow-sm group"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-200">
                  {getCategoryIcon(category)}
                </div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight group-hover:text-red-600 transition-colors">
                  {category}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 bg-white w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Produk Pilihan</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Produk terlaris dan terpopuler dari koleksi kami
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto mb-8 sm:mb-12">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center px-4">
                <Link
                  to="/products"
                  className="inline-flex items-center bg-red-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-full hover:bg-red-700 transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                >
                  Lihat Semua Produk
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products.noProducts')}</h3>
              <p className="text-gray-600">{t('products.comingSoon')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 sm:py-16 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Mengapa Pilih Kami?</h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Komitmen kami untuk memberikan yang terbaik bagi Anda
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">🚚</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Pengiriman Cepat</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Pengiriman ke seluruh Jepang dengan waktu yang terjamin dan kemasan yang aman
              </p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">✅</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Kualitas Terjamin</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Produk berkualitas tinggi dengan rasa autentik Indonesia yang terjaga
              </p>
            </div>
            
            <div className="bg-white p-6 sm:p-8 rounded-xl text-center shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-xl sm:text-2xl">💬</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Layanan 24/7</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Tim customer service yang siap membantu Anda kapan saja melalui WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-red-600 text-white w-full">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Siap Merasakan Cita Rasa Indonesia?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 leading-relaxed px-4">
              Bergabunglah dengan ribuan pelanggan yang sudah mempercayai kami 
              untuk kebutuhan makanan Indonesia di Jepang
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link
                to="/products"
                className="w-full sm:w-auto bg-white text-red-600 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 text-center"
              >
                Mulai Belanja
              </Link>
              <Link
                to="/how-to-buy"
                className="w-full sm:w-auto border-2 border-white text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-full text-base sm:text-lg hover:bg-white hover:text-red-600 transition-all duration-200 text-center"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;