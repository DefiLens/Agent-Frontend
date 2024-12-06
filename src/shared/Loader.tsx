import loaderAnimation from '../../public/assets/animation/loader.json';
import dynamic from 'next/dynamic';
const LottieComponent = dynamic(() => import('lottie-react'), { ssr: false });
const Loader: React.FC<{ size?: number }> = ({ size }) => {
  return (
    <div className="w-6 h-6 overflow-hidden flex items-center justify-center">
      <LottieComponent
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
        className="border p-0"
        style={{ minWidth: '50px', minHeight: '50px' }}
      />
    </div>
  );
};

export default Loader;
