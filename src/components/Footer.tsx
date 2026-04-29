
import MainLogo from '../components/MainLogo/MainLogo'

const Footer = () => {
  return (
    <footer className="bg-pink-50 border-t border-pink-100 py-8 px-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <MainLogo />
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} PinkleBall. All rights reserved.
        </p>
        
      </div>
    </footer>
  );
};

export default Footer;