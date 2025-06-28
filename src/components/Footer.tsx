
import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Footer = () => {
  const { t } = useLanguage();

  const socialMediaLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/817084894699',
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.515z"/>
        </svg>
      ),
      color: 'hover:text-green-400'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/injapan.food',
      icon: Instagram,
      color: 'hover:text-pink-400'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@injapan.food',
      icon: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5.16 20.5a6.34 6.34 0 0 0 10.86-4.43V7.83a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.26z"/>
        </svg>
      ),
      color: 'hover:text-red-400'
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  src="/lovable-uploads/022a8dd4-6c9e-4b02-82a8-703a2cbfb51a.png" 
                  alt="Injapan Food Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Injapan Food</h3>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Menyediakan produk makanan Indonesia berkualitas tinggi untuk komunitas Indonesia di Jepang. 
              Nikmati cita rasa kampung halaman dengan pengiriman ke seluruh Jepang.
            </p>
            
            {/* Social Media Section */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-4">Ikuti Kami</h4>
              <div className="flex space-x-4">
                {socialMediaLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 bg-gray-800 rounded-full text-gray-300 transition-all duration-200 transform hover:scale-110 ${social.color}`}
                      aria-label={`Follow us on ${social.name}`}
                    >
                      <IconComponent />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="mr-3 text-lg">📱</span>
                <span>WhatsApp: +817084894699</span>
              </div>
              <div className="flex items-center text-gray-300 hover:text-white transition-colors">
                <span className="mr-3 text-lg">📧</span>
                <span>Email: info@injapanfood.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6">Menu Utama</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🏠</span>
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/products" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🛍️</span>
                  Produk
                </Link>
              </li>
              <li>
                <Link to="/how-to-buy" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">📋</span>
                  Cara Beli
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center">
                  <span className="mr-2">🛒</span>
                  Keranjang
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6">Kategori Populer</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🍿</span>
                Makanan Ringan
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🌶️</span>
                Bumbu Dapur
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🍜</span>
                Makanan Siap Saji
              </li>
              <li className="hover:text-white transition-colors cursor-pointer">
                <span className="mr-2">🥬</span>
                Sayur & Bahan Segar
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Injapan Food. Semua hak dilindungi undang-undang.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Bantuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
